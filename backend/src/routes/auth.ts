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

const lineSchema = z.object({
  idToken: z.string(),
})

const REFRESH_TOKEN_EXPIRES_DAYS = 30

/**
 * Helper to check if user has filled mandatory fields for activities.
 */
function checkProfileComplete(user: any): boolean {
  return !!(user.name && user.phone)
}

async function buildAuthResponse(fastify: any, user: any) {
  const { passwordHash: _, ...safeUser } = user
  const accessToken = fastify.jwt.sign({ userId: safeUser.id, email: safeUser.email })
  const refreshToken = await createRefreshToken(fastify, safeUser.id)
  return { user: { ...safeUser, isProfileComplete: checkProfileComplete(safeUser) }, accessToken, refreshToken }
}

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
    })

    reply.status(201).send(await buildAuthResponse(fastify, user))
  })

  // POST /auth/login
  fastify.post('/login', async (request, reply) => {
    const body = loginSchema.parse(request.body)

    const user = await fastify.prisma.user.findUnique({ where: { email: body.email } })
    if (!user || !user.passwordHash) {
      return reply.status(401).send({ statusCode: 401, error: 'Unauthorized', message: 'Email 或密碼錯誤' })
    }

    const valid = await bcrypt.compare(body.password, user.passwordHash)
    if (!valid) {
      return reply.status(401).send({ statusCode: 401, error: 'Unauthorized', message: 'Email 或密碼錯誤' })
    }

    reply.send(await buildAuthResponse(fastify, user))
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

  // GET /auth/me
  fastify.get('/me', { preHandler: authenticate }, async (request, reply) => {
    const { userId } = request.user
    const user = await fastify.prisma.user.findUnique({ where: { id: userId } })
    if (!user) return reply.status(404).send({ statusCode: 404, error: 'Not Found', message: '使用者不存在' })

    const { passwordHash: _, ...safeUser } = user
    reply.send({ ...safeUser, isProfileComplete: checkProfileComplete(safeUser) })
  })

  // POST /auth/line
  fastify.post('/line', async (request, reply) => {
    const { idToken } = lineSchema.parse(request.body)

    const channelId = process.env.LINE_CHANNEL_ID
    if (!channelId) {
      return reply.status(503).send({ statusCode: 503, error: 'Service Unavailable', message: 'LINE 登入尚未設定' })
    }

    const verifyRes = await fetch('https://api.line.me/oauth2/v2.1/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ id_token: idToken, client_id: channelId }),
    })

    if (!verifyRes.ok) {
      return reply.status(401).send({ statusCode: 401, error: 'Unauthorized', message: 'LINE token 驗證失敗' })
    }

    const profile = await verifyRes.json() as { sub: string; name?: string; picture?: string }
    const { sub: lineUserId, name: displayName = 'LINE 用戶', picture } = profile

    let user = await fastify.prisma.user.findUnique({ where: { lineUserId } })
    if (!user) {
      user = await fastify.prisma.user.create({
        data: { lineUserId, name: displayName, email: `line_${lineUserId}@line.local`, avatar: picture },
      })
    } else if (!user.avatar && picture) {
      user = await fastify.prisma.user.update({ where: { id: user.id }, data: { avatar: picture } })
    }

    reply.send(await buildAuthResponse(fastify, user))
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
