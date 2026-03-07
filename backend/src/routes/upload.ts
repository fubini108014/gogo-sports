import { FastifyPluginAsync } from 'fastify'
import { authenticate } from '../middleware/authenticate.js'
import { pipeline } from 'stream/promises'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

const UPLOADS_DIR = path.join(process.cwd(), 'uploads')

const uploadRoutes: FastifyPluginAsync = async (fastify) => {
  // POST /upload — upload a single image file, returns { url }
  fastify.post('/', { preHandler: authenticate }, async (request, reply) => {
    const data = await request.file()
    if (!data) {
      return reply.status(400).send({ statusCode: 400, error: 'Bad Request', message: '未收到檔案' })
    }

    // Only allow image types
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedMimes.includes(data.mimetype)) {
      return reply.status(400).send({ statusCode: 400, error: 'Bad Request', message: '只支援 jpg/png/gif/webp 格式' })
    }

    const ext = path.extname(data.filename) || '.' + data.mimetype.split('/')[1]
    const filename = crypto.randomUUID() + ext
    const filepath = path.join(UPLOADS_DIR, filename)

    await pipeline(data.file, fs.createWriteStream(filepath))

    const baseUrl = process.env.BASE_URL ?? 'http://localhost:3000'
    reply.send({ url: `${baseUrl}/uploads/${filename}` })
  })
}

export default uploadRoutes
