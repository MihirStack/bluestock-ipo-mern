import { Router } from 'express'
import { UserModel } from '../models/user.model.js'
import {
  authenticateUser,
  createAccessToken,
  createRefreshToken,
  refreshCookieName,
  refreshCookieOptions,
  verifyRefreshToken,
} from '../services/auth.service.js'
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth.middleware.js'

const authRouter = Router()

authRouter.post('/login', async (request, response, next) => {
  try {
    const { email, password } = request.body as { email?: string; password?: string }
    if (!email || !password) {
      response.status(400).json({ success: false, message: 'Email and password are required' })
      return
    }

    const result = await authenticateUser(email, password)
    if (!result) {
      response.status(401).json({ success: false, message: 'Invalid email or password' })
      return
    }
    const refreshToken = createRefreshToken({
      sub: result.user.id,
      role: result.user.role,
      email: result.user.email,
    })
    response.cookie(refreshCookieName, refreshToken, refreshCookieOptions())
    response.json({ success: true, data: result })
  } catch (error) {
    next(error)
  }
})

authRouter.post('/refresh', async (request, response, next) => {
  try {
    const token = request.cookies?.[refreshCookieName] as string | undefined
    if (!token) {
      response.status(401).json({ success: false, message: 'Refresh session not found' })
      return
    }
    const payload = verifyRefreshToken(token)
    const user = await UserModel.findById(payload.sub).lean().exec()
    if (!user || !user.isActive) {
      response.status(401).json({ success: false, message: 'User account is unavailable' })
      return
    }
    const userData = { id: String(user._id), name: user.name, email: user.email, role: user.role }
    response.json({
      success: true,
      data: { accessToken: createAccessToken(userData), user: userData },
    })
  } catch (error) {
    next(error)
  }
})

authRouter.post('/logout', (request, response) => {
  response.clearCookie(refreshCookieName, refreshCookieOptions())
  response.json({ success: true, message: 'Logged out successfully' })
})

authRouter.get('/me', requireAuth, async (request: AuthenticatedRequest, response, next) => {
  try {
    const user = await UserModel.findById(request.auth?.userId)
      .select('-passwordHash')
      .lean()
      .exec()
    if (!user || !user.isActive) {
      response.status(401).json({ success: false, message: 'User account is unavailable' })
      return
    }
    response.json({ success: true, data: user })
  } catch (error) {
    next(error)
  }
})

export default authRouter
