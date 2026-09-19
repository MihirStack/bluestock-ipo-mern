import type { NextFunction, Request, Response } from 'express'
import { verifyAccessToken } from '../services/auth.service.js'

export type AuthenticatedRequest = Request & {
  auth?: { userId: string; role: string; email: string }
}

export function requireAuth(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  const header = request.header('authorization')
  const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined
  if (!token) {
    response.status(401).json({ success: false, message: 'Authentication required' })
    return
  }

  try {
    const payload = verifyAccessToken(token)
    request.auth = { userId: payload.sub, role: payload.role, email: payload.email }
    next()
  } catch {
    response.status(401).json({ success: false, message: 'Invalid or expired access token' })
  }
}
