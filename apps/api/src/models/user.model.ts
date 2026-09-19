import { model, Schema, type InferSchemaType } from 'mongoose'

export const userRoles = ['admin', 'editor'] as const

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: userRoles, default: 'editor', index: true },
    isActive: { type: Boolean, default: true, index: true },
    lastLoginAt: { type: Date },
  },
  { timestamps: true },
)

export type User = InferSchemaType<typeof userSchema>
export const UserModel = model('User', userSchema)
