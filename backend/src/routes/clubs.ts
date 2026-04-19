import { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'
import { Prisma } from '@prisma/client'
import { randomBytes } from 'crypto'
import { authenticate } from '../middleware/authenticate.js'

const createClubSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().min(10),
  tags: z.array(z.string()),
  city: z.string().optional(),
  logo: z.string().url().optional(),
})

const clubRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /clubs  (公開)
  fastify.get('/', async (request, reply) => {
    const q = request.query as Record<string, string>
    const page = Math.max(1, parseInt(q.page ?? '1'))
    const limit = Math.min(50, parseInt(q.limit ?? '12'))
    const skip = (page - 1) * limit

    let userId: string | undefined
    try {
      await request.jwtVerify()
      userId = request.user.userId
    } catch {}

    const where: Prisma.ClubWhereInput = {}
    if (q.search) {
      where.OR = [
        { name: { contains: q.search, mode: 'insensitive' } },
        { description: { contains: q.search, mode: 'insensitive' } },
      ]
    }
    if (q.tags) where.tags = { hasSome: q.tags.split(',') }
    if (q.city) where.city = q.city

    const sortBy = q.sortBy ?? 'membersCount'
    const orderBy: Prisma.ClubOrderByWithRelationInput =
      sortBy === 'rating' ? { rating: 'desc' } : { members: { _count: 'desc' } }

    const [clubs, total] = await Promise.all([
      fastify.prisma.club.findMany({ where, orderBy, skip, take: limit }),
      fastify.prisma.club.count({ where }),
    ])

    let joinedSet = new Set<string>()
    if (userId) {
      const memberships = await fastify.prisma.clubMember.findMany({
        where: { userId, clubId: { in: clubs.map((c) => c.id) } },
        select: { clubId: true },
      })
      joinedSet = new Set(memberships.map((m) => m.clubId))
    }

    // 補上 membersCount（由實際 DB 統計）
    const data = await Promise.all(
      clubs.map(async (c) => {
        const membersCount = await fastify.prisma.clubMember.count({ where: { clubId: c.id } })
        return { ...c, membersCount, isJoined: joinedSet.has(c.id) }
      })
    )

    reply.send({ data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } })
  })

  // GET /clubs/:id
  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string }

    let userId: string | undefined
    try {
      await request.jwtVerify()
      userId = request.user.userId
    } catch {}

    const club = await fastify.prisma.club.findUnique({ where: { id } })
    if (!club) return reply.status(404).send({ statusCode: 404, error: 'Not Found', message: '社團不存在' })

    const [membersCount, isJoined, isAdmin, adminIds] = await Promise.all([
      fastify.prisma.clubMember.count({ where: { clubId: id } }),
      userId ? fastify.prisma.clubMember.findUnique({ where: { userId_clubId: { userId, clubId: id } } }) : null,
      userId ? fastify.prisma.clubAdmin.findUnique({ where: { userId_clubId: { userId, clubId: id } } }) : null,
      fastify.prisma.clubAdmin.findMany({ where: { clubId: id }, select: { userId: true } }),
    ])

    reply.send({
      ...club,
      membersCount,
      isJoined: !!isJoined,
      isAdmin: !!isAdmin,
      adminIds: adminIds.map((a) => a.userId),
    })
  })

  // POST /clubs  (需登入)
  fastify.post('/', { preHandler: authenticate }, async (request, reply) => {
    const { userId } = request.user
    const body = createClubSchema.parse(request.body)

    const club = await fastify.prisma.$transaction(async (tx) => {
      const newClub = await tx.club.create({ data: body as Prisma.ClubUncheckedCreateInput })
      // 建立者自動成為管理員 + 成員
      await tx.clubAdmin.create({ data: { userId, clubId: newClub.id } })
      await tx.clubMember.create({ data: { userId, clubId: newClub.id } })
      return newClub
    })

    reply.status(201).send({ ...club, membersCount: 1, isJoined: true, isAdmin: true })
  })

  // PATCH /clubs/:id  (需為管理員)
  fastify.patch('/:id', { preHandler: authenticate }, async (request, reply) => {
    const { userId } = request.user
    const { id } = request.params as { id: string }
    const body = createClubSchema.partial().parse(request.body)

    const isAdmin = await fastify.prisma.clubAdmin.findUnique({
      where: { userId_clubId: { userId, clubId: id } },
    })
    if (!isAdmin) return reply.status(403).send({ statusCode: 403, error: 'Forbidden', message: '只有管理員可以編輯社團' })

    const updated = await fastify.prisma.club.update({ where: { id }, data: body })
    reply.send(updated)
  })

  // POST /clubs/:id/join
  fastify.post('/:id/join', { preHandler: authenticate }, async (request, reply) => {
    const { userId } = request.user
    const { id: clubId } = request.params as { id: string }

    const club = await fastify.prisma.club.findUnique({ where: { id: clubId } })
    if (!club) return reply.status(404).send({ statusCode: 404, error: 'Not Found', message: '社團不存在' })

    try {
      await fastify.prisma.clubMember.create({ data: { userId, clubId } })
    } catch (err: any) {
      if (err.code === 'P2002') {
        return reply.status(409).send({ statusCode: 409, error: 'Conflict', message: '您已加入此社團' })
      }
      throw err
    }

    const membersCount = await fastify.prisma.clubMember.count({ where: { clubId } })
    reply.send({ message: '成功加入社團', membersCount })
  })

  // DELETE /clubs/:id/join  (退出社團)
  fastify.delete('/:id/join', { preHandler: authenticate }, async (request, reply) => {
    const { userId } = request.user
    const { id: clubId } = request.params as { id: string }

    const membership = await fastify.prisma.clubMember.findUnique({
      where: { userId_clubId: { userId, clubId } },
    })
    if (!membership) return reply.status(404).send({ statusCode: 404, error: 'Not Found', message: '您尚未加入此社團' })

    // 管理員不能直接退出（需先移除管理員身份）
    const isAdmin = await fastify.prisma.clubAdmin.findUnique({
      where: { userId_clubId: { userId, clubId } },
    })
    if (isAdmin) {
      return reply.status(400).send({ statusCode: 400, error: 'Bad Request', message: '請先移除管理員身份再退出社團' })
    }

    await fastify.prisma.clubMember.delete({ where: { userId_clubId: { userId, clubId } } })
    const membersCount = await fastify.prisma.clubMember.count({ where: { clubId } })
    reply.send({ message: '已退出社團', membersCount })
  })

  // DELETE /clubs/:id/members/:memberId  (管理員移除成員)
  fastify.delete('/:id/members/:memberId', { preHandler: authenticate }, async (request, reply) => {
    const { userId } = request.user
    const { id: clubId, memberId } = request.params as { id: string; memberId: string }

    const isAdmin = await fastify.prisma.clubAdmin.findUnique({
      where: { userId_clubId: { userId, clubId } },
    })
    if (!isAdmin) return reply.status(403).send({ statusCode: 403, error: 'Forbidden', message: '只有管理員可以移除成員' })

    if (memberId === userId) {
      return reply.status(400).send({ statusCode: 400, error: 'Bad Request', message: '不能移除自己' })
    }

    const membership = await fastify.prisma.clubMember.findUnique({
      where: { userId_clubId: { userId: memberId, clubId } },
    })
    if (!membership) return reply.status(404).send({ statusCode: 404, error: 'Not Found', message: '成員不存在' })

    await fastify.prisma.clubMember.delete({ where: { userId_clubId: { userId: memberId, clubId } } })
    reply.status(204).send()
  })

  // POST /clubs/:id/invite-links  (需為管理員)
  fastify.post('/:id/invite-links', { preHandler: authenticate }, async (request, reply) => {
    const { userId } = request.user
    const { id: clubId } = request.params as { id: string }
    const body = z.object({ expiresInDays: z.number().int().min(1).max(30).default(7) }).parse(request.body ?? {})

    const club = await fastify.prisma.club.findUnique({ where: { id: clubId } })
    if (!club) return reply.status(404).send({ statusCode: 404, error: 'Not Found', message: '社團不存在' })

    const isAdmin = await fastify.prisma.clubAdmin.findUnique({
      where: { userId_clubId: { userId, clubId } },
    })
    if (!isAdmin) return reply.status(403).send({ statusCode: 403, error: 'Forbidden', message: '只有管理員可以建立邀請連結' })

    const token = randomBytes(20).toString('hex')
    const expiresAt = new Date(Date.now() + body.expiresInDays * 24 * 60 * 60 * 1000)

    const link = await fastify.prisma.clubInviteLink.create({
      data: { clubId, token, expiresAt },
    })

    reply.status(201).send(link)
  })

  // GET /clubs/:id/invite-links  (需為管理員)
  fastify.get('/:id/invite-links', { preHandler: authenticate }, async (request, reply) => {
    const { userId } = request.user
    const { id: clubId } = request.params as { id: string }

    const club = await fastify.prisma.club.findUnique({ where: { id: clubId } })
    if (!club) return reply.status(404).send({ statusCode: 404, error: 'Not Found', message: '社團不存在' })

    const isAdmin = await fastify.prisma.clubAdmin.findUnique({
      where: { userId_clubId: { userId, clubId } },
    })
    if (!isAdmin) return reply.status(403).send({ statusCode: 403, error: 'Forbidden', message: '只有管理員可以查看邀請連結' })

    const links = await fastify.prisma.clubInviteLink.findMany({
      where: { clubId, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    })

    reply.send({ data: links })
  })

  // POST /clubs/join-by-token/:token  (需登入)
  fastify.post('/join-by-token/:token', { preHandler: authenticate }, async (request, reply) => {
    const { userId } = request.user
    const { token } = request.params as { token: string }

    const link = await fastify.prisma.clubInviteLink.findUnique({ where: { token } })
    if (!link) return reply.status(404).send({ statusCode: 404, error: 'Not Found', message: '邀請連結不存在' })
    if (link.expiresAt < new Date()) return reply.status(410).send({ statusCode: 410, error: 'Gone', message: '邀請連結已過期' })

    const { clubId } = link

    const club = await fastify.prisma.club.findUnique({ where: { id: clubId } })
    if (!club) return reply.status(404).send({ statusCode: 404, error: 'Not Found', message: '社團不存在' })

    try {
      await fastify.prisma.clubMember.create({ data: { userId, clubId } })
    } catch (err: any) {
      if (err.code === 'P2002') {
        return reply.status(409).send({ statusCode: 409, error: 'Conflict', message: '您已加入此社團' })
      }
      throw err
    }

    const membersCount = await fastify.prisma.clubMember.count({ where: { clubId } })
    reply.send({ message: '成功加入社團', club: { ...club, membersCount } })
  })

  // GET /clubs/:id/activities
  fastify.get('/:id/activities', async (request, reply) => {
    const { id: clubId } = request.params as { id: string }
    const q = request.query as Record<string, string>
    const page = Math.max(1, parseInt(q.page ?? '1'))
    const limit = Math.min(50, parseInt(q.limit ?? '10'))
    const skip = (page - 1) * limit

    const where: Prisma.ActivityWhereInput = { clubId }
    if (q.status) where.status = q.status as any

    const [data, total] = await Promise.all([
      fastify.prisma.activity.findMany({ where, orderBy: { date: 'asc' }, skip, take: limit }),
      fastify.prisma.activity.count({ where }),
    ])

    reply.send({ data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } })
  })

  // GET /clubs/:id/members  (需為管理員)
  fastify.get('/:id/members', { preHandler: authenticate }, async (request, reply) => {
    const { userId } = request.user
    const { id: clubId } = request.params as { id: string }

    const isAdmin = await fastify.prisma.clubAdmin.findUnique({
      where: { userId_clubId: { userId, clubId } },
    })
    if (!isAdmin) return reply.status(403).send({ statusCode: 403, error: 'Forbidden', message: '只有管理員可以查看成員' })

    const members = await fastify.prisma.clubMember.findMany({
      where: { clubId },
      include: { user: { select: { id: true, name: true, avatar: true, email: true } } },
      orderBy: { joinedAt: 'asc' },
    })

    reply.send({
      total: members.length,
      data: members.map((m) => ({ ...m.user, joinedAt: m.joinedAt })),
    })
  })
}

export default clubRoutes
