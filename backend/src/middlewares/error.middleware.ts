import type { NextFunction, Request, Response } from 'express'
import { fail } from '../utils/response.ts'

export function errorMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  res.status(500).json(fail('internal error', 50001))
}
