import { FastifyPluginAsync } from 'fastify'
import { authenticate } from '../middleware/authenticate.js'

const messageRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('preHandler', authenticate)

  // ── GET /messages ───────────────────────────────────────────────
  // List all conversations for the current user
  fastify.get('/', async (request, reply) => {
    const { userId } = request.user

    const participations = await fastify.prisma.conversationParticipant.findMany({
      where: { userId },
      include: {
        conversation: {
          include: {
            participants: {
              include: {
                user: { select: { id: true, name: true, avatar: true } },
              },
            },
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1,
              include: {
                sender: { select: { id: true, name: true } },
              },
            },
          },
        },
      },
      orderBy: {
        conversation: { updatedAt: 'desc' },
      },
    })

    const data = participations.map(({ conversation, lastReadAt }) => {
      const lastMsg = conversation.messages[0] ?? null
      const otherParticipants = conversation.participants.filter(p => p.userId !== userId)

      // Unread count: messages after lastReadAt
      const unreadPromise = lastReadAt
        ? null
        : 0 // resolved below via separate query if needed

      // For DM, use the other person's name/avatar; for group use conversation.name/avatar
      const displayName = conversation.isGroup
        ? (conversation.name ?? 'Group')
        : (otherParticipants[0]?.user.name ?? 'Unknown')
      const displayAvatar = conversation.isGroup
        ? (conversation.avatar ?? null)
        : (otherParticipants[0]?.user.avatar ?? null)

      return {
        id: conversation.id,
        isGroup: conversation.isGroup,
        name: displayName,
        avatar: displayAvatar,
        lastMsg: lastMsg
          ? {
              senderId: lastMsg.senderId,
              senderName: lastMsg.sender.name,
              content: lastMsg.content,
              createdAt: lastMsg.createdAt,
            }
          : null,
        updatedAt: conversation.updatedAt,
        lastReadAt,
        participants: conversation.participants.map(p => ({
          userId: p.userId,
          name: p.user.name,
          avatar: p.user.avatar,
        })),
      }
    })

    // Compute unread counts in one batch
    const unreadCounts = await Promise.all(
      participations.map(({ conversation, lastReadAt }) =>
        fastify.prisma.message.count({
          where: {
            conversationId: conversation.id,
            senderId: { not: userId },
            ...(lastReadAt ? { createdAt: { gt: lastReadAt } } : {}),
          },
        })
      )
    )

    const result = data.map((conv, i) => ({ ...conv, unread: unreadCounts[i] }))
    reply.send({ data: result })
  })

  // ── POST /messages ──────────────────────────────────────────────
  // Start a new conversation (DM or group)
  fastify.post('/', async (request, reply) => {
    const { userId } = request.user
    const body = request.body as {
      participantIds: string[]
      isGroup?: boolean
      name?: string
      firstMessage?: string
    }

    const { participantIds, isGroup = false, name, firstMessage } = body

    if (!participantIds?.length) {
      return reply.status(400).send({ message: '至少需要一個對象' })
    }

    // For DMs, check if conversation already exists
    if (!isGroup && participantIds.length === 1) {
      const targetId = participantIds[0]
      const existing = await fastify.prisma.conversation.findFirst({
        where: {
          isGroup: false,
          participants: {
            every: {
              userId: { in: [userId, targetId] },
            },
          },
          AND: [
            { participants: { some: { userId } } },
            { participants: { some: { userId: targetId } } },
          ],
        },
        include: { participants: true },
      })

      if (existing && existing.participants.length === 2) {
        return reply.send({ id: existing.id, isNew: false })
      }
    }

    const allIds = Array.from(new Set([userId, ...participantIds]))

    const conversation = await fastify.prisma.conversation.create({
      data: {
        isGroup,
        name: isGroup ? name : undefined,
        participants: {
          create: allIds.map(uid => ({ userId: uid })),
        },
        ...(firstMessage
          ? {
              messages: {
                create: {
                  senderId: userId,
                  content: firstMessage,
                },
              },
            }
          : {}),
      },
    })

    // Bump updatedAt
    await fastify.prisma.conversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() },
    })

    reply.status(201).send({ id: conversation.id, isNew: true })
  })

  // ── GET /messages/:id ───────────────────────────────────────────
  // Get messages in a conversation (paginated, newest first)
  fastify.get('/:id', async (request, reply) => {
    const { userId } = request.user
    const { id } = request.params as { id: string }
    const q = request.query as Record<string, string>
    const limit = Math.min(50, parseInt(q.limit ?? '30'))
    const before = q.before // ISO date cursor

    // Verify access
    const participant = await fastify.prisma.conversationParticipant.findUnique({
      where: { conversationId_userId: { conversationId: id, userId } },
    })
    if (!participant) {
      return reply.status(403).send({ message: '無此對話存取權限' })
    }

    const messages = await fastify.prisma.message.findMany({
      where: {
        conversationId: id,
        ...(before ? { createdAt: { lt: new Date(before) } } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
        replyTo: {
          select: {
            id: true,
            content: true,
            sender: { select: { id: true, name: true } },
          },
        },
      },
    })

    // Mark as read
    await fastify.prisma.conversationParticipant.update({
      where: { conversationId_userId: { conversationId: id, userId } },
      data: { lastReadAt: new Date() },
    })

    reply.send({
      data: messages.reverse(), // return oldest-first for the client
      hasMore: messages.length === limit,
    })
  })

  // ── POST /messages/:id ──────────────────────────────────────────
  // Send a message in a conversation
  fastify.post('/:id', async (request, reply) => {
    const { userId } = request.user
    const { id } = request.params as { id: string }
    const body = request.body as { content: string; replyToId?: string }

    if (!body.content?.trim()) {
      return reply.status(400).send({ message: '訊息不得為空' })
    }

    // Verify access
    const participant = await fastify.prisma.conversationParticipant.findUnique({
      where: { conversationId_userId: { conversationId: id, userId } },
    })
    if (!participant) {
      return reply.status(403).send({ message: '無此對話存取權限' })
    }

    const message = await fastify.prisma.message.create({
      data: {
        conversationId: id,
        senderId: userId,
        content: body.content.trim(),
        replyToId: body.replyToId ?? null,
      },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
        replyTo: {
          select: {
            id: true,
            content: true,
            sender: { select: { id: true, name: true } },
          },
        },
      },
    })

    // Bump conversation updatedAt so it floats to top
    await fastify.prisma.conversation.update({
      where: { id },
      data: { updatedAt: new Date() },
    })

    reply.status(201).send(message)
  })
}

export default messageRoutes
