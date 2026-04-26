import { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'
import { authenticate } from '../middleware/authenticate.js'

const updateProfileSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  bio: z.string().max(200).optional(),
  phone: z.string().optional(),
  avatar: z.string().url().optional(),
})

const userRoutes: FastifyPluginAsync = async (fastify) => {
  // 所有 /users 路由都需要登入
  fastify.addHook('preHandler', authenticate)

  // GET /users/me
  fastify.get('/me', async (request, reply) => {
    const { userId } = request.user

    const user = await fastify.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        bio: true,
        createdAt: true,
        clubAdminRoles: { select: { clubId: true } },
        clubMemberships: { select: { clubId: true } },
        registrations: {
          where: { status: 'APPROVED' },
          select: { activityId: true },
        },
      },
    })

    if (!user) return reply.status(404).send({ statusCode: 404, error: 'Not Found', message: '使用者不存在' })

    reply.send({
      ...user,
      isClubAdmin: user.clubAdminRoles.length > 0,
      managedClubIds: user.clubAdminRoles.map((r) => r.clubId),
      joinedClubIds: user.clubMemberships.map((m) => m.clubId),
      registeredActivityIds: user.registrations.map((r) => r.activityId),
      clubAdminRoles: undefined,
      clubMemberships: undefined,
      registrations: undefined,
    })
  })

  // PATCH /users/me
  fastify.patch('/me', async (request, reply) => {
    const { userId } = request.user
    const body = updateProfileSchema.parse(request.body)

    const user = await fastify.prisma.user.update({
      where: { id: userId },
      data: body,
      select: { id: true, name: true, email: true, phone: true, avatar: true, bio: true },
    })

    reply.send(user)
  })

  // GET /users/me/activities  (已報名的活動)
  fastify.get('/me/activities', async (request, reply) => {
    const { userId } = request.user
    const { status = 'upcoming', page = '1', limit = '10' } = request.query as Record<string, string>

    const pageNum = Math.max(1, parseInt(page))
    const limitNum = Math.min(50, parseInt(limit))
    const skip = (pageNum - 1) * limitNum

    const now = new Date()
    const dateFilter = status === 'past' ? { lt: now } : { gte: now }

    const [data, total] = await Promise.all([
      fastify.prisma.activity.findMany({
        where: {
          registrations: { some: { userId, status: 'APPROVED' } },
          date: dateFilter,
        },
        include: { club: { select: { id: true, name: true, logo: true } } },
        orderBy: { date: status === 'past' ? 'desc' : 'asc' },
        skip,
        take: limitNum,
      }),
      fastify.prisma.activity.count({
        where: {
          registrations: { some: { userId, status: 'APPROVED' } },
          date: dateFilter,
        },
      }),
    ])

    reply.send({
      data,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    })
  })

  // GET /users/me/explore-tags
  fastify.get('/me/explore-tags', async (request, reply) => {
    const { userId } = request.user

    const user = await fastify.prisma.user.findUnique({
      where: { id: userId },
      select: { exploreTags: true },
    })

    if (!user) return reply.status(404).send({ statusCode: 404, error: 'Not Found', message: '使用者不存在' })

    reply.send(user.exploreTags)
  })

  // PUT /users/me/explore-tags
  fastify.put('/me/explore-tags', async (request, reply) => {
    const { userId } = request.user
    const tags = request.body

    if (!Array.isArray(tags)) {
      return reply.status(400).send({ statusCode: 400, error: 'Bad Request', message: '格式錯誤，需為陣列' })
    }

    const user = await fastify.prisma.user.update({
      where: { id: userId },
      data: { exploreTags: tags },
      select: { exploreTags: true },
    })

    reply.send(user.exploreTags)
  })

  // GET /users/me/clubs  (已加入的社團)
  fastify.get('/me/clubs', async (request, reply) => {
    const { userId } = request.user

    const memberships = await fastify.prisma.clubMember.findMany({
      where: { userId },
      include: { club: true },
      orderBy: { joinedAt: 'desc' },
    })

    reply.send({ data: memberships.map((m) => m.club) })
  })
}

export default userRoutes
