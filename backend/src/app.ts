import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import rateLimit from '@fastify/rate-limit'
import { ZodError } from 'zod'

import prismaPlugin from './plugins/prisma.js'
import jwtPlugin from './plugins/jwt.js'

import authRoutes from './routes/auth.js'
import userRoutes from './routes/users.js'
import activityRoutes from './routes/activities.js'
import clubRoutes from './routes/clubs.js'
import postRoutes from './routes/posts.js'
import notificationRoutes from './routes/notifications.js'

export function buildApp() {
  const app = Fastify({
    logger: {
      level: process.env.NODE_ENV === 'production' ? 'warn' : 'info',
    },
  })

  // Security & CORS
  app.register(helmet, {
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
  app.register(cors, {
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
    credentials: true,
  })
  app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  })

  // Plugins
  app.register(prismaPlugin)
  app.register(jwtPlugin)

  // Routes (all prefixed with /v1)
  app.register(authRoutes, { prefix: '/v1/auth' })
  app.register(userRoutes, { prefix: '/v1/users' })
  app.register(activityRoutes, { prefix: '/v1/activities' })
  app.register(clubRoutes, { prefix: '/v1/clubs' })
  app.register(postRoutes, { prefix: '/v1/clubs' })
  app.register(notificationRoutes, { prefix: '/v1/notifications' })

  // Health check
  app.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }))

  // Global error handler
  app.setErrorHandler((error, _request, reply) => {
    // Zod validation errors → 400
    if (error instanceof ZodError) {
      const message = error.issues.map(i => `${i.path.join('.') || 'field'}: ${i.message}`).join('; ')
      return reply.status(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message,
      })
    }
    const statusCode = error.statusCode ?? 500
    if (statusCode >= 500) app.log.error(error)
    reply.status(statusCode).send({
      statusCode,
      error: error.name ?? 'Internal Server Error',
      message: error.message ?? '伺服器發生錯誤',
    })
  })

  return app
}
