import { FastifyPluginAsync } from 'fastify'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import crypto from 'crypto'
import { authenticate } from '../middleware/authenticate.js'

const registerSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().optional(),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

const REFRESH_TOKEN_EXPIRES_DAYS = 30

const authRoutes: FastifyPluginAsync = async (fastify) => {
  // POST /auth/register
  fastify.post('/register', async (request, reply) => {
    const body = registerSchema.parse(request.body)

    const existing = await fastify.prisma.user.findUnique({ where: { email: body.email } })
    if (existing) {
      return reply.status(409).send({ statusCode: 409, error: 'Conflict', message: '此 Email 已被註冊' })
    }

    const passwordHash = await bcrypt.hash(body.password, 12)
    const user = await fastify.prisma.user.create({
      data: { name: body.name, email: body.email, passwordHash, phone: body.phone },
      select: { id: true, name: true, email: true, avatar: true, createdAt: true },
    })

    const accessToken = fastify.jwt.sign({ userId: user.id, email: user.email })
    const refreshToken = await createRefreshToken(fastify, user.id)

    reply.status(201).send({ user, accessToken, refreshToken })
  })

  // POST /auth/login
  fastify.post('/login', async (request, reply) => {
    const body = loginSchema.parse(request.body)

    const user = await fastify.prisma.user.findUnique({ where: { email: body.email } })
    if (!user) {
      return reply.status(401).send({ statusCode: 401, error: 'Unauthorized', message: 'Email 或密碼錯誤' })
    }

    const valid = await bcrypt.compare(body.password, user.passwordHash)
    if (!valid) {
      return reply.status(401).send({ statusCode: 401, error: 'Unauthorized', message: 'Email 或密碼錯誤' })
    }

    const accessToken = fastify.jwt.sign({ userId: user.id, email: user.email })
    const refreshToken = await createRefreshToken(fastify, user.id)

    const { passwordHash: _, ...safeUser } = user
    reply.send({ user: safeUser, accessToken, refreshToken })
  })

  // POST /auth/refresh
  fastify.post('/refresh', async (request, reply) => {
    const { refreshToken } = request.body as { refreshToken: string }
    if (!refreshToken) {
      return reply.status(400).send({ statusCode: 400, error: 'Bad Request', message: '缺少 refreshToken' })
    }

    const stored = await fastify.prisma.refreshToken.findUnique({ where: { token: refreshToken } })
    if (!stored || stored.expiresAt < new Date()) {
      return reply.status(401).send({ statusCode: 401, error: 'Unauthorized', message: 'Token 已過期，請重新登入' })
    }

    const user = await fastify.prisma.user.findUnique({ where: { id: stored.userId } })
    if (!user) {
      return reply.status(401).send({ statusCode: 401, error: 'Unauthorized', message: '使用者不存在' })
    }

    const accessToken = fastify.jwt.sign({ userId: user.id, email: user.email })
    reply.send({ accessToken })
  })

  // POST /auth/logout
  fastify.post('/logout', { preHandler: authenticate }, async (request, reply) => {
    const { refreshToken } = request.body as { refreshToken?: string }
    if (refreshToken) {
      await fastify.prisma.refreshToken.deleteMany({ where: { token: refreshToken } })
    }
    reply.status(204).send()
  })
}

async function createRefreshToken(fastify: any, userId: string): Promise<string> {
  const token = crypto.randomBytes(64).toString('hex')
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRES_DAYS)

  await fastify.prisma.refreshToken.create({ data: { userId, token, expiresAt } })
  return token
}

export default authRoutes
