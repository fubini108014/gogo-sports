import { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'
import { Prisma } from '@prisma/client'
import { authenticate } from '../middleware/authenticate.js'

const createPostSchema = z.object({
  type: z.enum(['ANNOUNCEMENT', 'SHARE', 'PHOTO']),
  content: z.string().min(1).max(2000),
  images: z.array(z.string()).optional(),
})

const postRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /clubs/:clubId/posts
  fastify.get('/:clubId/posts', async (request, reply) => {
    const { clubId } = request.params as { clubId: string }
    const q = request.query as Record<string, string>
    const page = Math.max(1, parseInt(q.page ?? '1'))
    const limit = Math.min(50, parseInt(q.limit ?? '10'))
    const skip = (page - 1) * limit

    let userId: string | undefined
    try {
      await request.jwtVerify()
      userId = request.user.userId
    } catch {}

    const where: any = { clubId }
    if (q.type) where.type = q.type

    const [posts, total] = await Promise.all([
      fastify.prisma.post.findMany({
        where,
        include: {
          author: { select: { id: true, name: true, avatar: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      fastify.prisma.post.count({ where }),
    ])

    // 查詢目前使用者是否按讚
    let likedSet = new Set<string>()
    if (userId) {
      const likes = await fastify.prisma.postLike.findMany({
        where: { userId, postId: { in: posts.map((p) => p.id) } },
        select: { postId: true },
      })
      likedSet = new Set(likes.map((l) => l.postId))
    }

    // 查詢 isAdmin (貼文作者的社團身份)
    const adminIds = await fastify.prisma.clubAdmin.findMany({
      where: { clubId },
      select: { userId: true },
    })
    const adminSet = new Set(adminIds.map((a) => a.userId))

    const data = posts.map((p) => ({
      ...p,
      author: { ...p.author, isAdmin: adminSet.has(p.authorId) },
      isLiked: likedSet.has(p.id),
    }))

    reply.send({ data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } })
  })

  // POST /clubs/:clubId/posts  (需為社團成員)
  fastify.post('/:clubId/posts', { preHandler: authenticate }, async (request, reply) => {
    const { userId } = request.user
    const { clubId } = request.params as { clubId: string }
    const body = createPostSchema.parse(request.body)

    const isMember = await fastify.prisma.clubMember.findUnique({
      where: { userId_clubId: { userId, clubId } },
    })
    if (!isMember) return reply.status(403).send({ statusCode: 403, error: 'Forbidden', message: '只有社團成員可以發文' })

    const post = await fastify.prisma.post.create({
      data: { clubId, authorId: userId, ...body, images: body.images ?? [] } as Prisma.PostUncheckedCreateInput,
      include: { author: { select: { id: true, name: true, avatar: true } } },
    })

    const isAdmin = await fastify.prisma.clubAdmin.findUnique({
      where: { userId_clubId: { userId, clubId } },
    })

    reply.status(201).send({
      ...post,
      author: { ...post.author, isAdmin: !!isAdmin },
      isLiked: false,
    })
  })

  // PATCH /clubs/:clubId/posts/:postId
  fastify.patch('/:clubId/posts/:postId', { preHandler: authenticate }, async (request, reply) => {
    const { userId } = request.user
    const { clubId, postId } = request.params as { clubId: string; postId: string }
    const body = createPostSchema.pick({ content: true }).parse(request.body)

    const post = await fastify.prisma.post.findUnique({ where: { id: postId } })
    if (!post || post.clubId !== clubId) return reply.status(404).send({ statusCode: 404, error: 'Not Found', message: '貼文不存在' })

    const isAdmin = await fastify.prisma.clubAdmin.findUnique({ where: { userId_clubId: { userId, clubId } } })
    if (post.authorId !== userId && !isAdmin) {
      return reply.status(403).send({ statusCode: 403, error: 'Forbidden', message: '無編輯權限' })
    }

    const updated = await fastify.prisma.post.update({
      where: { id: postId },
      data: { content: body.content },
      include: { author: { select: { id: true, name: true, avatar: true } } },
    })

    reply.send({ ...updated, author: { ...updated.author, isAdmin: !!isAdmin } })
  })

  // DELETE /clubs/:clubId/posts/:postId
  fastify.delete('/:clubId/posts/:postId', { preHandler: authenticate }, async (request, reply) => {
    const { userId } = request.user
    const { clubId, postId } = request.params as { clubId: string; postId: string }

    const post = await fastify.prisma.post.findUnique({ where: { id: postId } })
    if (!post || post.clubId !== clubId) return reply.status(404).send({ statusCode: 404, error: 'Not Found', message: '貼文不存在' })

    const isAdmin = await fastify.prisma.clubAdmin.findUnique({ where: { userId_clubId: { userId, clubId } } })
    if (post.authorId !== userId && !isAdmin) {
      return reply.status(403).send({ statusCode: 403, error: 'Forbidden', message: '無刪除權限' })
    }

    await fastify.prisma.post.delete({ where: { id: postId } })
    reply.status(204).send()
  })

  // POST /clubs/:clubId/posts/:postId/like  (toggle 按讚)
  fastify.post('/:clubId/posts/:postId/like', { preHandler: authenticate }, async (request, reply) => {
    const { userId } = request.user
    const { postId } = request.params as { clubId: string; postId: string }

    const existing = await fastify.prisma.postLike.findUnique({
      where: { userId_postId: { userId, postId } },
    })

    if (existing) {
      // 取消按讚
      await fastify.prisma.$transaction([
        fastify.prisma.postLike.delete({ where: { userId_postId: { userId, postId } } }),
        fastify.prisma.post.update({ where: { id: postId }, data: { likes: { decrement: 1 } } }),
      ])
      const post = await fastify.prisma.post.findUnique({ where: { id: postId }, select: { likes: true } })
      reply.send({ isLiked: false, likes: post!.likes })
    } else {
      // 按讚
      await fastify.prisma.$transaction([
        fastify.prisma.postLike.create({ data: { userId, postId } }),
        fastify.prisma.post.update({ where: { id: postId }, data: { likes: { increment: 1 } } }),
      ])
      const post = await fastify.prisma.post.findUnique({ where: { id: postId }, select: { likes: true } })
      reply.send({ isLiked: true, likes: post!.likes })
    }
  })

  // GET /clubs/:clubId/posts/:postId/comments  (top-level only, replies nested)
  fastify.get('/:clubId/posts/:postId/comments', async (request, reply) => {
    const { postId } = request.params as { clubId: string; postId: string }
    const q = request.query as Record<string, string>
    const page = Math.max(1, parseInt(q.page ?? '1'))
    const limit = Math.min(50, parseInt(q.limit ?? '20'))
    const skip = (page - 1) * limit

    const [data, total] = await Promise.all([
      fastify.prisma.comment.findMany({
        where: { postId, parentId: null },
        include: {
          author: { select: { id: true, name: true, avatar: true } },
          replies: {
            include: { author: { select: { id: true, name: true, avatar: true } } },
            orderBy: { createdAt: 'asc' },
          },
        },
        orderBy: { createdAt: 'asc' },
        skip,
        take: limit,
      }),
      fastify.prisma.comment.count({ where: { postId, parentId: null } }),
    ])

    reply.send({ data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } })
  })

  // POST /clubs/:clubId/posts/:postId/comments  (需為社團成員; 可帶 parentId 表示回覆)
  fastify.post('/:clubId/posts/:postId/comments', { preHandler: authenticate }, async (request, reply) => {
    const { userId } = request.user
    const { clubId, postId } = request.params as { clubId: string; postId: string }
    const { content, parentId } = request.body as { content: string; parentId?: string }

    if (!content || content.trim().length === 0) {
      return reply.status(400).send({ statusCode: 400, error: 'Bad Request', message: '留言內容不可為空' })
    }

    const isMember = await fastify.prisma.clubMember.findUnique({
      where: { userId_clubId: { userId, clubId } },
    })
    if (!isMember) return reply.status(403).send({ statusCode: 403, error: 'Forbidden', message: '只有社團成員可以留言' })

    // Validate parentId belongs to the same post
    if (parentId) {
      const parent = await fastify.prisma.comment.findUnique({ where: { id: parentId } })
      if (!parent || parent.postId !== postId) {
        return reply.status(400).send({ statusCode: 400, error: 'Bad Request', message: '無效的回覆目標' })
      }
    }

    const comment = await fastify.prisma.$transaction(async (tx) => {
      const c = await tx.comment.create({
        data: { postId, authorId: userId, content: content.trim(), parentId: parentId ?? null },
        include: { author: { select: { id: true, name: true, avatar: true } } },
      })
      // Only increment post comment count for top-level comments
      if (!parentId) {
        await tx.post.update({ where: { id: postId }, data: { comments: { increment: 1 } } })
      }
      return c
    })

    reply.status(201).send(comment)
  })

  // DELETE /clubs/:clubId/posts/:postId/comments/:commentId
  fastify.delete('/:clubId/posts/:postId/comments/:commentId', { preHandler: authenticate }, async (request, reply) => {
    const { userId } = request.user
    const { clubId, postId, commentId } = request.params as { clubId: string; postId: string; commentId: string }

    const comment = await fastify.prisma.comment.findUnique({ where: { id: commentId } })
    if (!comment || comment.postId !== postId) {
      return reply.status(404).send({ statusCode: 404, error: 'Not Found', message: '留言不存在' })
    }

    const isAdmin = await fastify.prisma.clubAdmin.findUnique({ where: { userId_clubId: { userId, clubId } } })
    if (comment.authorId !== userId && !isAdmin) {
      return reply.status(403).send({ statusCode: 403, error: 'Forbidden', message: '無刪除權限' })
    }

    await fastify.prisma.$transaction(async (tx) => {
      await tx.comment.delete({ where: { id: commentId } })
      if (!comment.parentId) {
        await tx.post.update({ where: { id: postId }, data: { comments: { decrement: 1 } } })
      }
    })

    reply.status(204).send()
  })
}

export default postRoutes
