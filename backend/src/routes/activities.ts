import { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'
import { Prisma } from '@prisma/client'
import { authenticate } from '../middleware/authenticate.js'

const createActivitySchema = z.object({
  clubId: z.string(),
  title: z.string().min(2).max(100),
  date: z.string(), // ISO date string
  time: z.string(),
  location: z.string(),
  city: z.string(),
  price: z.number().int().min(0),
  mode: z.enum(['LIMITED', 'OPEN']),
  maxParticipants: z.number().int().positive().optional(),
  groups: z.array(z.string()).optional(),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'PRO']),
  description: z.string(),
  tags: z.array(z.string()),
  lat: z.number().optional(),
  lng: z.number().optional(),
})

const activityRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /activities  (公開，不需登入)
  fastify.get('/', async (request, reply) => {
    const q = request.query as Record<string, string>
    const page = Math.max(1, parseInt(q.page ?? '1'))
    const limit = Math.min(50, parseInt(q.limit ?? '12'))
    const skip = (page - 1) * limit

    // 取得目前登入使用者 (可選)
    let userId: string | undefined
    try {
      await request.jwtVerify()
      userId = request.user.userId
    } catch {}

    // 建立 where 條件
    const where: Prisma.ActivityWhereInput = {}

    if (q.search) {
      where.OR = [
        { title: { contains: q.search, mode: 'insensitive' } },
        { location: { contains: q.search, mode: 'insensitive' } },
        { tags: { has: q.search } },
      ]
    }
    if (q.cities && q.cities !== '全台灣') {
      where.city = { in: q.cities.split(',') }
    }
    if (q.startDate && q.endDate) {
      const start = new Date(q.startDate)
      const end = new Date(q.endDate)
      // Ensure the end date covers the entire day
      end.setHours(23, 59, 59, 999)
      where.date = { gte: start, lte: end }
    } else if (q.date) {
      const d = new Date(q.date)
      const next = new Date(d)
      next.setDate(next.getDate() + 1)
      where.date = { gte: d, lt: next }
    }
    if (q.minPrice) where.price = { ...((where.price as object) ?? {}), gte: parseInt(q.minPrice) }
    if (q.maxPrice) where.price = { ...((where.price as object) ?? {}), lte: parseInt(q.maxPrice) }
    if (q.levels) where.level = { in: q.levels.split(',') as any }
    if (q.status) where.status = q.status as any
    else where.status = 'OPEN'
    if (q.mode) where.mode = q.mode as any
    if (q.tags) where.tags = { hasSome: q.tags.split(',') }
    if (q.clubId) where.clubId = q.clubId

    if (q.isNearlyFull === 'true') {
      where.AND = [
        { maxParticipants: { not: null } },
        // 已報名超過 80% 視為快額滿
      ]
    }

    const sortBy = q.sortBy ?? 'date'
    const sortOrder = (q.sortOrder ?? 'asc') as 'asc' | 'desc'
    const orderBy: Prisma.ActivityOrderByWithRelationInput =
      sortBy === 'price' ? { price: sortOrder }
      : sortBy === 'participants' ? { currentAppCount: sortOrder }
      : { date: sortOrder }

    const [activities, total] = await Promise.all([
      fastify.prisma.activity.findMany({
        where,
        include: { club: { select: { id: true, name: true, logo: true } } },
        orderBy,
        skip,
        take: limit,
      }),
      fastify.prisma.activity.count({ where }),
    ])

    // 若有登入，查詢哪些活動已報名
    let registeredSet = new Set<string>()
    if (userId) {
      const regs = await fastify.prisma.registration.findMany({
        where: { userId, activityId: { in: activities.map((a) => a.id) }, status: 'CONFIRMED' },
        select: { activityId: true },
      })
      registeredSet = new Set(regs.map((r) => r.activityId))
    }

    const data = activities.map((a) => ({
      ...a,
      isRegistered: registeredSet.has(a.id),
      spotsLeft: a.maxParticipants != null
        ? a.maxParticipants - (a.currentInternalCount + a.currentAppCount)
        : null,
    }))

    reply.send({ data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } })
  })

  // GET /activities/:id
  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string }

    let userId: string | undefined
    try {
      await request.jwtVerify()
      userId = request.user.userId
    } catch {}

    const activity = await fastify.prisma.activity.findUnique({
      where: { id },
      include: { club: { select: { id: true, name: true, logo: true, membersCount: true } } },
    })

    if (!activity) return reply.status(404).send({ statusCode: 404, error: 'Not Found', message: '活動不存在' })

    let isRegistered = false
    if (userId) {
      const reg = await fastify.prisma.registration.findUnique({
        where: { userId_activityId: { userId, activityId: id } },
      })
      isRegistered = reg?.status === 'CONFIRMED'
    }

    reply.send({
      ...activity,
      isRegistered,
      spotsLeft: activity.maxParticipants != null
        ? activity.maxParticipants - (activity.currentInternalCount + activity.currentAppCount)
        : null,
    })
  })

  // POST /activities  (需登入 + 為社團管理員)
  fastify.post('/', { preHandler: authenticate }, async (request, reply) => {
    const { userId } = request.user
    const body = createActivitySchema.parse(request.body)

    const isAdmin = await fastify.prisma.clubAdmin.findUnique({
      where: { userId_clubId: { userId, clubId: body.clubId } },
    })
    if (!isAdmin) {
      return reply.status(403).send({ statusCode: 403, error: 'Forbidden', message: '只有社團管理員可以建立活動' })
    }

    const activity = await fastify.prisma.activity.create({
      data: { ...body, date: new Date(body.date), groups: body.groups ?? [] },
      include: { club: { select: { id: true, name: true, logo: true } } },
    })

    reply.status(201).send(activity)
  })

  // PATCH /activities/:id
  fastify.patch('/:id', { preHandler: authenticate }, async (request, reply) => {
    const { userId } = request.user
    const { id } = request.params as { id: string }
    const body = createActivitySchema.partial().parse(request.body)

    const activity = await fastify.prisma.activity.findUnique({ where: { id } })
    if (!activity) return reply.status(404).send({ statusCode: 404, error: 'Not Found', message: '活動不存在' })

    const isAdmin = await fastify.prisma.clubAdmin.findUnique({
      where: { userId_clubId: { userId, clubId: activity.clubId } },
    })
    if (!isAdmin) return reply.status(403).send({ statusCode: 403, error: 'Forbidden', message: '無編輯權限' })

    const updated = await fastify.prisma.activity.update({
      where: { id },
      data: { ...body, date: body.date ? new Date(body.date) : undefined },
    })
    reply.send(updated)
  })

  // DELETE /activities/:id
  fastify.delete('/:id', { preHandler: authenticate }, async (request, reply) => {
    const { userId } = request.user
    const { id } = request.params as { id: string }

    const activity = await fastify.prisma.activity.findUnique({ where: { id } })
    if (!activity) return reply.status(404).send({ statusCode: 404, error: 'Not Found', message: '活動不存在' })

    const isAdmin = await fastify.prisma.clubAdmin.findUnique({
      where: { userId_clubId: { userId, clubId: activity.clubId } },
    })
    if (!isAdmin) return reply.status(403).send({ statusCode: 403, error: 'Forbidden', message: '無刪除權限' })

    await fastify.prisma.activity.delete({ where: { id } })
    reply.status(204).send()
  })

  // ─── 報名相關 ───────────────────────────────────────────────

  // POST /activities/:id/register
  fastify.post('/:id/register', { preHandler: authenticate }, async (request, reply) => {
    const { userId } = request.user
    const { id: activityId } = request.params as { id: string }
    const { group } = (request.body as { group?: string }) ?? {}

    const activity = await fastify.prisma.activity.findUnique({ where: { id: activityId } })
    if (!activity) return reply.status(404).send({ statusCode: 404, error: 'Not Found', message: '活動不存在' })
    if (activity.status !== 'OPEN') {
      return reply.status(400).send({ statusCode: 400, error: 'Bad Request', message: '活動未開放報名' })
    }

    // 檢查額滿（LIMITED 模式）
    if (activity.mode === 'LIMITED' && activity.maxParticipants != null) {
      const total = activity.currentInternalCount + activity.currentAppCount
      if (total >= activity.maxParticipants) {
        return reply.status(400).send({ statusCode: 400, error: 'Bad Request', message: '活動已額滿' })
      }
    }

    // 建立報名（若已存在則 409）
    try {
      const registration = await fastify.prisma.$transaction(async (tx) => {
        const reg = await tx.registration.create({
          data: { userId, activityId, group: group ?? null },
        })
        await tx.activity.update({
          where: { id: activityId },
          data: { currentAppCount: { increment: 1 } },
        })
        return reg
      })

      reply.status(201).send(registration)
    } catch (err: any) {
      if (err.code === 'P2002') {
        return reply.status(409).send({ statusCode: 409, error: 'Conflict', message: '您已報名此活動' })
      }
      throw err
    }
  })

  // DELETE /activities/:id/register  (取消報名)
  fastify.delete('/:id/register', { preHandler: authenticate }, async (request, reply) => {
    const { userId } = request.user
    const { id: activityId } = request.params as { id: string }

    const reg = await fastify.prisma.registration.findUnique({
      where: { userId_activityId: { userId, activityId } },
    })
    if (!reg || reg.status === 'CANCELLED') {
      return reply.status(404).send({ statusCode: 404, error: 'Not Found', message: '找不到報名記錄' })
    }

    await fastify.prisma.$transaction([
      fastify.prisma.registration.update({
        where: { userId_activityId: { userId, activityId } },
        data: { status: 'CANCELLED' },
      }),
      fastify.prisma.activity.update({
        where: { id: activityId },
        data: { currentAppCount: { decrement: 1 } },
      }),
    ])

    reply.status(204).send()
  })

  // GET /activities/:id/participants  (管理員才能看)
  fastify.get('/:id/participants', { preHandler: authenticate }, async (request, reply) => {
    const { userId } = request.user
    const { id: activityId } = request.params as { id: string }

    const activity = await fastify.prisma.activity.findUnique({ where: { id: activityId } })
    if (!activity) return reply.status(404).send({ statusCode: 404, error: 'Not Found', message: '活動不存在' })

    const isAdmin = await fastify.prisma.clubAdmin.findUnique({
      where: { userId_clubId: { userId, clubId: activity.clubId } },
    })
    if (!isAdmin) return reply.status(403).send({ statusCode: 403, error: 'Forbidden', message: '無查看報名者權限' })

    const registrations = await fastify.prisma.registration.findMany({
      where: { activityId, status: 'CONFIRMED' },
      include: { user: { select: { id: true, name: true, avatar: true } } },
      orderBy: { createdAt: 'asc' },
    })

    reply.send({
      total: registrations.length,
      data: registrations.map((r) => ({
        userId: r.userId,
        name: r.user.name,
        avatar: r.user.avatar,
        group: r.group,
        registeredAt: r.createdAt,
      })),
    })
  })
}

export default activityRoutes
