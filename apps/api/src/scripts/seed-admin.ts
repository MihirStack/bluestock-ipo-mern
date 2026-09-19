import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { connectDatabase, disconnectDatabase } from '../config/database.js'
import { UserModel } from '../models/user.model.js'

async function seedAdmin() {
  const { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME = 'Bluestock Admin' } = process.env
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD)
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD are required.')
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is required to seed an admin.')

  await connectDatabase()
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12)
  await UserModel.findOneAndUpdate(
    { email: ADMIN_EMAIL.toLowerCase().trim() },
    { name: ADMIN_NAME, email: ADMIN_EMAIL, passwordHash, role: 'admin', isActive: true },
    { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
  ).exec()
  console.log(`Admin user ${ADMIN_EMAIL.toLowerCase().trim()} is ready.`)
}

seedAdmin()
  .catch((error: unknown) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(disconnectDatabase)
