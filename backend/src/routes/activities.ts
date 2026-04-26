import { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'
import { Prisma, PrimarySport, ApprovalMode, RegistrationStatus } from '@prisma/client'
import { authenticate } from '../middleware/authenticate.js'

const createActivitySchema = z.object({
  clubId: z.string().optional(),
  title: z.string().min(2).max(100),
  primarySport: z.nativeEnum(PrimarySport),
  date: z.string(), // ISO date string
  time: z.string(),
  location: z.string(),
  city: z.string(),
  price: z.number().int().min(0),
  mode: z.enum(['LIMITED', 'OPEN']),
  approvalMode: z.nativeEnum(ApprovalMode).default(ApprovalMode.AUTO),
  maxParticipants: z.number().int().positive().optional(),
  minCancelHours: z.number().int().min(0).default(24),
  groups: z.array(z.string()).optional(),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'PRO']),
  description: z.string(),
  tags: z.array(z.string()),
  lat: z.number().optional(),
  lng: z.number().optional(),
})

const activityRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /activities (Public)
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

    const where: Prisma.ActivityWhereInput = {}

    if (q.search) {
      where.OR = [
        { title: { contains: q.search, mode: 'insensitive' } },
        { location: { contains: q.search, mode: 'insensitive' } },
        { host: { name: { contains: q.search, mode: 'insensitive' } } },
        { tags: { has: q.search } },
      ]
    }
    if (q.cities && q.cities !== '全台灣') {
      where.city = { in: q.cities.split(',') }
    }
    if (q.date) {
      const d = new Date(q.date)
      const next = new Date(d)
      next.setDate(next.getDate() + 1)
      where.date = { gte: d, lt: next }
    }
    if (q.sport) where.primarySport = q.sport as PrimarySport
    if (q.clubId) where.clubId = q.clubId
    
    // Status filter
    if (q.status) where.status = q.status as any
    else where.status = 'OPEN'

    const [activities, total] = await Promise.all([
      fastify.prisma.activity.findMany({
        where,
        include: { 
          club: { select: { id: true, name: true, logo: true } },
          host: { select: { id: true, name: true, avatar: true, globalXP: true, sportXP: true } }
        },
        orderBy: { date: 'asc' },
        skip,
        take: limit,
      }),
      fastify.prisma.activity.count({ where }),
    ])

    let registeredMap = new Map<string, RegistrationStatus>()
    if (userId) {
      const regs = await fastify.prisma.registration.findMany({
        where: { userId, activityId: { in: activities.map((a) => a.id) } },
        select: { activityId: true, status: true },
      })
      regs.forEach(r => registeredMap.set(r.activityId, r.status))
    }

    const data = activities.map((a) => ({
      ...a,
      isRegistered: registeredMap.has(a.id),
      myRegistrationStatus: registeredMap.get(a.id) || null,
      spotsLeft: a.maxParticipants != null ? a.maxParticipants - a.currentAppCount : null,
    }))

    reply.send({ data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } })
  })

  // GET /activities/suggestions?q=keyword  (Autocomplete)
  fastify.get('/suggestions', async (request, reply) => {
    const { q = '' } = request.query as Record<string, string>
    const keyword = q.trim()
    if (!keyword || keyword.length < 1) return reply.send({ data: [] })

    // Collect unique titles, locations, and tags that match
    const activities = await fastify.prisma.activity.findMany({
      where: {
        status: 'OPEN',
        OR: [
          { title: { contains: keyword, mode: 'insensitive' } },
          { location: { contains: keyword, mode: 'insensitive' } },
          { city: { contains: keyword, mode: 'insensitive' } },
        ],
      },
      select: { title: true, location: true, city: true, tags: true },
      take: 30,
    })

    const seen = new Set<string>()
    const suggestions: { type: 'title' | 'location' | 'tag'; value: string }[] = []

    for (const a of activities) {
      if (!seen.has(a.title) && a.title.toLowerCase().includes(keyword.toLowerCase())) {
        seen.add(a.title)
        suggestions.push({ type: 'title', value: a.title })
      }
      const loc = `${a.city} ${a.location}`.trim()
      if (!seen.has(loc) && loc.toLowerCase().includes(keyword.toLowerCase())) {
        seen.add(loc)
        suggestions.push({ type: 'location', value: loc })
      }
      for (const tag of a.tags) {
        if (!seen.has(tag) && tag.toLowerCase().includes(keyword.toLowerCase())) {
          seen.add(tag)
          suggestions.push({ type: 'tag', value: tag })
        }
      }
      if (suggestions.length >= 8) break
    }

    reply.send({ data: suggestions.slice(0, 8) })
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
      include: { 
        club: { select: { id: true, name: true, logo: true } },
        host: { select: { id: true, name: true, avatar: true, bio: true, globalXP: true, sportXP: true } }
      },
    })

    if (!activity) return reply.status(404).send({ statusCode: 404, error: 'Not Found', message: '活動不存在' })

    let myRegistration = null
    let myRating: number | null = null
    if (userId) {
      myRegistration = await fastify.prisma.registration.findUnique({
        where: { userId_activityId: { userId, activityId: id } },
      })
      if (activity.status === 'ENDED') {
        const r = await fastify.prisma.activityRating.findUnique({
          where: { activityId_userId: { activityId: id, userId } },
        })
        myRating = r?.score ?? null
      }
    }

    const canRate =
      activity.status === 'ENDED' &&
      !!myRegistration &&
      ['APPROVED', 'ABSENT'].includes(myRegistration.status)

    reply.send({
      ...activity,
      isRegistered: !!myRegistration && myRegistration.status !== 'CANCELLED',
      myRegistration,
      myRating,
      canRate,
      spotsLeft: activity.maxParticipants != null ? activity.maxParticipants - activity.currentAppCount : null,
    })
  })

  // POST /activities (Login Required)
  fastify.post('/', { preHandler: authenticate }, async (request, reply) => {
    const { userId } = request.user
    const body = createActivitySchema.parse(request.body)

    // If clubId is provided, check if user is admin
    if (body.clubId) {
      const isAdmin = await fastify.prisma.clubAdmin.findUnique({
        where: { userId_clubId: { userId, clubId: body.clubId } },
      })
      if (!isAdmin) {
        return reply.status(403).send({ statusCode: 403, error: 'Forbidden', message: '只有社團管理員可以代表社團建立活動' })
      }
    }

    const activity = await fastify.prisma.activity.create({
      data: {
        ...body,
        hostId: userId,
        date: new Date(body.date),
        groups: body.groups ?? []
      } as Prisma.ActivityUncheckedCreateInput,
      include: { 
        club: { select: { id: true, name: true, logo: true } },
        host: { select: { id: true, name: true, avatar: true } }
      },
    })

    reply.status(201).send(activity)
  })

  // PATCH /activities/:id (Host only)
  fastify.patch('/:id', { preHandler: authenticate }, async (request, reply) => {
    const { userId } = request.user
    const { id } = request.params as { id: string }
    const body = createActivitySchema.partial().parse(request.body)

    const activity = await fastify.prisma.activity.findUnique({ where: { id } })
    if (!activity) return reply.status(404).send({ statusCode: 404, error: 'Not Found', message: '活動不存在' })

    if (activity.hostId !== userId) {
      return reply.status(403).send({ statusCode: 403, error: 'Forbidden', message: '只有主揪可以修改活動' })
    }

    const updated = await fastify.prisma.activity.update({
      where: { id },
      data: { ...body, date: body.date ? new Date(body.date) : undefined },
    })
    reply.send(updated)
  })

  // DELETE /activities/:id (Host only)
  fastify.delete('/:id', { preHandler: authenticate }, async (request, reply) => {
    const { userId } = request.user
    const { id } = request.params as { id: string }

    const activity = await fastify.prisma.activity.findUnique({ where: { id } })
    if (!activity) return reply.status(404).send({ statusCode: 404, error: 'Not Found', message: '活動不存在' })

    if (activity.hostId !== userId) {
      return reply.status(403).send({ statusCode: 403, error: 'Forbidden', message: '只有主揪可以刪除活動' })
    }

    await fastify.prisma.activity.delete({ where: { id } })
    reply.status(204).send()
  })

  // ─── Registration Flow ───────────────────────────────────────────────

  // POST /activities/:id/register
  fastify.post('/:id/register', { preHandler: authenticate }, async (request, reply) => {
    const { userId } = request.user
    const { id: activityId } = request.params as { id: string }
    const regData = z.object({
      group: z.string().optional(),
      contactMethod: z.string().min(1),
      realName: z.string().min(1),
      transportation: z.string().optional(),
    }).parse(request.body)

    const activity = await fastify.prisma.activity.findUnique({ where: { id: activityId } })
    if (!activity) return reply.status(404).send({ statusCode: 404, error: 'Not Found', message: '活動不存在' })
    if (activity.status !== 'OPEN') {
      return reply.status(400).send({ statusCode: 400, error: 'Bad Request', message: '活動未開放報名' })
    }

    // Initial status based on approvalMode
    let status: RegistrationStatus = activity.approvalMode === ApprovalMode.AUTO 
      ? RegistrationStatus.APPROVED 
      : RegistrationStatus.PENDING

    // Capacity Check for AUTO/LIMITED
    if (status === RegistrationStatus.APPROVED && activity.mode === 'LIMITED' && activity.maxParticipants != null) {
      if (activity.currentAppCount >= activity.maxParticipants) {
        status = RegistrationStatus.WAITLISTED
      }
    }

    try {
      const registration = await fastify.prisma.$transaction(async (tx) => {
        const reg = await tx.registration.create({
          data: {
            userId,
            activityId,
            status,
            ...regData
          } as Prisma.RegistrationUncheckedCreateInput,
        })
        
        // Only increment count if APPROVED
        if (status === RegistrationStatus.APPROVED) {
          await tx.activity.update({
            where: { id: activityId },
            data: { currentAppCount: { increment: 1 } },
          })
        }
        return reg
      })

      reply.status(201).send(registration)
    } catch (err: any) {
      if (err.code === 'P2002') {
        return reply.status(409).send({ statusCode: 409, error: 'Conflict', message: '您已報名過此活動' })
      }
      throw err
    }
  })

  // GET /activities/:id/participants (Host/Admin only)
  fastify.get('/:id/participants', { preHandler: authenticate }, async (request, reply) => {
    const { userId } = request.user
    const { id: activityId } = request.params as { id: string }

    const activity = await fastify.prisma.activity.findUnique({ where: { id: activityId } })
    if (!activity) return reply.status(404).send({ statusCode: 404, error: 'Not Found', message: '活動不存在' })

    // Must be host or club admin
    const isHost = activity.hostId === userId
    let isClubAdmin = false
    if (activity.clubId) {
      const admin = await fastify.prisma.clubAdmin.findUnique({
        where: { userId_clubId: { userId, clubId: activity.clubId } },
      })
      isClubAdmin = !!admin
    }

    if (!isHost && !isClubAdmin) {
      return reply.status(403).send({ statusCode: 403, error: 'Forbidden', message: '無查看報名者權限' })
    }

    const registrations = await fastify.prisma.registration.findMany({
      where: { activityId },
      include: { user: { select: { id: true, name: true, avatar: true, globalXP: true, sportXP: true } } },
      orderBy: { createdAt: 'asc' },
    })

    reply.send({
      total: registrations.length,
      data: registrations
    })
  })

  // DELETE /activities/:id/register (Cancel Registration)
  fastify.delete('/:id/register', { preHandler: authenticate }, async (request, reply) => {
    const { userId } = request.user
    const { id: activityId } = request.params as { id: string }

    const reg = await fastify.prisma.registration.findUnique({
      where: { userId_activityId: { userId, activityId } },
      include: { activity: true }
    })
    
    if (!reg || reg.status === 'CANCELLED') {
      return reply.status(404).send({ statusCode: 404, error: 'Not Found', message: '找不到報名記錄' })
    }

    // Check cancellation deadline
    const now = new Date()
    const deadline = new Date(reg.activity.date)
    deadline.setHours(deadline.getHours() - reg.activity.minCancelHours)
    
    if (now > deadline) {
      return reply.status(400).send({ 
        statusCode: 400, 
        error: 'Bad Request', 
        message: `已過取消期限 (活動前 ${reg.activity.minCancelHours} 小時)` 
      })
    }

    const wasApproved = reg.status === 'APPROVED'

    await fastify.prisma.$transaction(async (tx) => {
      // 1. Mark as cancelled
      await tx.registration.update({
        where: { id: reg.id },
        data: { status: RegistrationStatus.CANCELLED },
      })

      // 2. If it was approved, decrement count and try auto-promotion
      if (wasApproved) {
        await tx.activity.update({
          where: { id: activityId },
          data: { currentAppCount: { decrement: 1 } },
        })

        // 3. Auto-promotion logic
        const nextInQueue = await tx.registration.findFirst({
          where: { activityId, status: RegistrationStatus.WAITLISTED },
          orderBy: { createdAt: 'asc' }
        })

        if (nextInQueue) {
          await tx.registration.update({
            where: { id: nextInQueue.id },
            data: { status: RegistrationStatus.APPROVED }
          })
          await tx.activity.update({
            where: { id: activityId },
            data: { currentAppCount: { increment: 1 } }
          })
        }
      }
    })

    reply.status(204).send()
  })

  // PATCH /activities/:id/registrations/:regId (Host/Admin Approval)
  fastify.patch('/:id/registrations/:regId', { preHandler: authenticate }, async (request, reply) => {
    const { userId } = request.user
    const { id: activityId, regId } = request.params as { id: string, regId: string }
    const { status } = z.object({ 
      status: z.enum(['APPROVED', 'REJECTED', 'WAITLISTED']) 
    }).parse(request.body)

    const activity = await fastify.prisma.activity.findUnique({ where: { id: activityId } })
    if (!activity) return reply.status(404).send({ statusCode: 404, error: 'Not Found', message: '活動不存在' })

    const isHost = activity.hostId === userId
    let isClubAdmin = false
    if (activity.clubId) {
      const admin = await fastify.prisma.clubAdmin.findUnique({
        where: { userId_clubId: { userId, clubId: activity.clubId } },
      })
      isClubAdmin = !!admin
    }
    if (!isHost && !isClubAdmin) {
      return reply.status(403).send({ statusCode: 403, error: 'Forbidden', message: '無權限審核報名' })
    }

    const targetReg = await fastify.prisma.registration.findUnique({ where: { id: regId } })
    if (!targetReg || targetReg.activityId !== activityId) {
      return reply.status(404).send({ statusCode: 404, error: 'Not Found', message: '找不到此報名記錄' })
    }

    try {
      const result = await fastify.prisma.$transaction(async (tx) => {
        const currentStatus = targetReg.status
        const newStatus = status as RegistrationStatus

        if (currentStatus === newStatus) return targetReg

        // Moving TO approved
        if (newStatus === RegistrationStatus.APPROVED) {
          if (activity.mode === 'LIMITED' && activity.maxParticipants != null) {
            const freshActivity = await tx.activity.findUnique({ where: { id: activityId } })
            if (freshActivity!.currentAppCount >= freshActivity!.maxParticipants!) {
              throw new Error('CAPACITY_FULL')
            }
          }
          await tx.activity.update({
            where: { id: activityId },
            data: { currentAppCount: { increment: 1 } }
          })
        }

        // Moving FROM approved
        if (currentStatus === RegistrationStatus.APPROVED) {
          await tx.activity.update({
            where: { id: activityId },
            data: { currentAppCount: { decrement: 1 } }
          })
          
          // Promotion logic
          if (newStatus !== RegistrationStatus.APPROVED) {
            const nextInQueue = await tx.registration.findFirst({
              where: { activityId, status: RegistrationStatus.WAITLISTED, NOT: { id: regId } },
              orderBy: { createdAt: 'asc' }
            })
            if (nextInQueue) {
              await tx.registration.update({ where: { id: nextInQueue.id }, data: { status: RegistrationStatus.APPROVED } })
              await tx.activity.update({ where: { id: activityId }, data: { currentAppCount: { increment: 1 } } })
            }
          }
        }

        return await tx.registration.update({
          where: { id: regId },
          data: { status: newStatus }
        })
      })
      reply.send(result)
    } catch (err: any) {
      if (err.message === 'CAPACITY_FULL') {
        return reply.status(400).send({ statusCode: 400, error: 'Bad Request', message: '名額已滿，無法審核通過' })
      }
      throw err
    }
  })

  // ── GET /activities/:id/my-rating ───────────────────────────────
  fastify.get('/:id/my-rating', { preHandler: authenticate }, async (request, reply) => {
    const { userId } = request.user
    const { id: activityId } = request.params as { id: string }

    const rating = await fastify.prisma.activityRating.findUnique({
      where: { activityId_userId: { activityId, userId } },
    })

    reply.send({ score: rating?.score ?? null, comment: rating?.comment ?? null })
  })

  // ── POST /activities/:id/rate ────────────────────────────────────
  // Eligible: activity must be ENDED, user must have APPROVED or ABSENT registration
  fastify.post('/:id/rate', { preHandler: authenticate }, async (request, reply) => {
    const { userId } = request.user
    const { id: activityId } = request.params as { id: string }
    const { score, comment } = z.object({
      score: z.number().int().min(1).max(5),
      comment: z.string().max(200).optional(),
    }).parse(request.body)

    const activity = await fastify.prisma.activity.findUnique({ where: { id: activityId } })
    if (!activity) return reply.status(404).send({ message: '活動不存在' })
    if (activity.status !== 'ENDED') return reply.status(400).send({ message: '只能對已結束的活動評分' })

    const reg = await fastify.prisma.registration.findUnique({
      where: { userId_activityId: { userId, activityId } },
    })
    if (!reg || !['APPROVED', 'ABSENT'].includes(reg.status)) {
      return reply.status(403).send({ message: '只有參與者可以評分' })
    }

    // Upsert rating
    await fastify.prisma.activityRating.upsert({
      where: { activityId_userId: { activityId, userId } },
      create: { activityId, userId, score, comment },
      update: { score, comment },
    })

    // Recalculate Club.rating if this activity belongs to a club
    if (activity.clubId) {
      const agg = await fastify.prisma.activityRating.aggregate({
        where: { activity: { clubId: activity.clubId } },
        _avg: { score: true },
        _count: { score: true },
      })
      if (agg._count.score > 0) {
        await fastify.prisma.club.update({
          where: { id: activity.clubId },
          data: { rating: Math.round((agg._avg.score ?? 0) * 10) / 10 },
        })
      }
    }

    reply.status(201).send({ ok: true })
  })

  // ── POST /activities/:id/broadcast ──────────────────────────────
  // Host-only: send a one-way notification to all APPROVED + PENDING participants
  fastify.post('/:id/broadcast', { preHandler: authenticate }, async (request, reply) => {
    const { userId } = request.user
    const { id: activityId } = request.params as { id: string }
    const { message } = z.object({
      message: z.string().min(1).max(200),
    }).parse(request.body)

    const activity = await fastify.prisma.activity.findUnique({ where: { id: activityId } })
    if (!activity) return reply.status(404).send({ message: '活動不存在' })
    if (activity.hostId !== userId) return reply.status(403).send({ message: '只有主揪可以發送廣播通知' })

    const registrations = await fastify.prisma.registration.findMany({
      where: {
        activityId,
        status: { in: ['APPROVED', 'PENDING'] },
        userId: { not: userId },
      },
      select: { userId: true },
    })

    if (registrations.length > 0) {
      await fastify.prisma.notification.createMany({
        data: registrations.map(reg => ({
          userId: reg.userId,
          type: 'BROADCAST' as const,
          title: `【${activity.title}】主揪通知`,
          content: message,
          linkId: activityId,
          linkType: 'ACTIVITY',
        })),
      })
    }

    reply.send({ sent: registrations.length })
  })
}

export default activityRoutes
