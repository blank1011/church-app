import mongoose from 'mongoose'

async function connectDB() {
  // 1. Check the variable ONLY when this function runs, not when the file loads
  const MONGODB_URI = process.env.MONGODB_URI

  if (!MONGODB_URI) {
    throw new Error('Please define MONGODB_URI in .env.local')
  }

  // 2. Setup caching
  let cached = global.mongoose

  if (!cached) {
    cached = global.mongoose = { conn: null, promise: null }
  }

  if (cached.conn) return cached.conn

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    }
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => mongoose)
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.conn
}

export default connectDB