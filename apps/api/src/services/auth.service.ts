import bcrypt from 'bcryptjs'
import jwt, { type SignOptions } from 'jsonwebtoken'
import { UserModel } from '../models/user.model.js'

type AuthPayload = { sub: string; role: string; email: string }
export const refreshCookieName = 'bluestock_refresh_token'

export function createAccessToken(user: { id: string; role: string; email: string }) {
  const payload: AuthPayload = { sub: user.id, role: user.role, email: user.email }
  const options: SignOptions = {
    expiresIn: (process.env.JWT_ACCESS_EXPIRES ?? '15m') as SignOptions['expiresIn'],
  }
  return jwt.sign(payload, accessSecret(), options)
}

function accessSecret() {
  const secret = process.env.JWT_ACCESS_SECRET
  if (!secret) throw new Error('JWT_ACCESS_SECRET is not configured.')
  return secret
}

export async function authenticateUser(email: string, password: string) {
  const user = await UserModel.findOne({ email: email.toLowerCase().trim() })
    .select('+passwordHash')
    .exec()
  if (!user || !user.isActive || !(await bcrypt.compare(password, user.passwordHash)))
    return undefined

  user.lastLoginAt = new Date()
  await user.save()
  const accessToken = createAccessToken({
    id: String(user._id),
    role: user.role,
    email: user.email,
  })
  return {
    accessToken,
    user: { id: String(user._id), name: user.name, email: user.email, role: user.role },
  }
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, accessSecret()) as AuthPayload
}

function refreshSecret() {
  const secret = process.env.JWT_REFRESH_SECRET
  if (!secret) throw new Error('JWT_REFRESH_SECRET is not configured.')
  return secret
}

export function createRefreshToken(payload: AuthPayload) {
  return jwt.sign(payload, refreshSecret(), {
    expiresIn: (process.env.JWT_REFRESH_EXPIRES ?? '7d') as SignOptions['expiresIn'],
  })
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, refreshSecret()) as AuthPayload
}

export function refreshCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/api/v1/auth',
  }
}
