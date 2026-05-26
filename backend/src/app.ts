import cors from 'cors'
import express from 'express'
import { buildRoutes } from './routes'
import { errorMiddleware } from './middlewares/error.middleware'

export function buildApp() {
  const app = express()

  app.use(cors())
  app.use(express.json({ limit: '1mb' }))

  app.use('/api', buildRoutes())

  app.use(errorMiddleware)

  return app
}

