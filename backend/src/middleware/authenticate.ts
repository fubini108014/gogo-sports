import { FastifyRequest, FastifyReply } from 'fastify'

export interface JwtPayload {
  userId: string
  email: string
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: JwtPayload
    user: JwtPayload
  }
}

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify()
  } catch {
    reply.status(401).send({ statusCode: 401, error: 'Unauthorized', message: '請先登入' })
  }
}
