import cors from 'cors'
import express from 'express'
import { buildRoutes } from './routes/index.ts'
import { errorMiddleware } from './middlewares/error.middleware.ts'

export function buildApp() {
  const app = express()

  app.use(cors())
  app.use(express.json({ limit: '1mb' }))

  app.use('/api', buildRoutes())

  app.use(errorMiddleware)

  return app
}
