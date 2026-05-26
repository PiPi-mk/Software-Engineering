import { Router } from 'express'
import { ok } from '../utils/response'

export function buildRoutes() {
  const r = Router()

  r.get('/health', (_req, res) => {
    res.json(ok({ status: 'ok' }))
  })

  return r
}
