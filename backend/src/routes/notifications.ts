import { FastifyPluginAsync } from 'fastify'
import { authenticate } from '../middleware/authenticate.js'

const notificationRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('preHandler', authenticate)

  // GET /notifications
  fastify.get('/', async (request, reply) => {
    const { userId } = request.user
    const q = request.query as Record<string, string>
    const page = Math.max(1, parseInt(q.page ?? '1'))
    const limit = Math.min(50, parseInt(q.limit ?? '20'))
    const skip = (page - 1) * limit

    const where: any = { userId }
    if (q.isRead === 'true') where.isRead = true
    if (q.isRead === 'false') where.isRead = false

    const [data, total, unreadCount] = await Promise.all([
      fastify.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      fastify.prisma.notification.count({ where }),
      fastify.prisma.notification.count({ where: { userId, isRead: false } }),
    ])

    reply.send({
      unreadCount,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  })

  // PATCH /notifications/:id/read
  fastify.patch('/:id/read', async (request, reply) => {
    const { userId } = request.user
    const { id } = request.params as { id: string }

    const notif = await fastify.prisma.notification.findUnique({ where: { id } })
    if (!notif || notif.userId !== userId) {
      return reply.status(404).send({ statusCode: 404, error: 'Not Found', message: '通知不存在' })
    }

    await fastify.prisma.notification.update({ where: { id }, data: { isRead: true } })
    reply.send({ success: true })
  })

  // PATCH /notifications/read-all  (全部已讀)
  fastify.patch('/read-all', async (request, reply) => {
    const { userId } = request.user
    await fastify.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    })
    reply.send({ success: true })
  })

  // DELETE /notifications/:id
  fastify.delete('/:id', async (request, reply) => {
    const { userId } = request.user
    const { id } = request.params as { id: string }

    const notif = await fastify.prisma.notification.findUnique({ where: { id } })
    if (!notif || notif.userId !== userId) {
      return reply.status(404).send({ statusCode: 404, error: 'Not Found', message: '通知不存在' })
    }

    await fastify.prisma.notification.delete({ where: { id } })
    reply.status(204).send()
  })
}

export default notificationRoutes
