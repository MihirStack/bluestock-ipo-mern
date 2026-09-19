import mongoose from 'mongoose'

export async function connectDatabase() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.log('MONGODB_URI is not configured; using deterministic seed data.')
    return
  }

  await mongoose.connect(uri)
  console.log('MongoDB connected')
}

export async function disconnectDatabase() {
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect()
}
