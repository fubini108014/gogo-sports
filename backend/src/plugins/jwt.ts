import fp from 'fastify-plugin'
import { FastifyPluginAsync } from 'fastify'
import fastifyJwt from '@fastify/jwt'

const jwtPlugin: FastifyPluginAsync = fp(async (fastify) => {
  fastify.register(fastifyJwt, {
    secret: process.env.JWT_SECRET!,
    sign: { expiresIn: '15m' },
  })
})

export default jwtPlugin
