import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://placeholder:27017/placeholder'

interface MongooseCache {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

declare global {
  var mongooseCache: MongooseCache | undefined
}

let cached = globalThis.mongooseCache || { conn: null, promise: null }

globalThis.mongooseCache = cached

export async function connectDB() {
  // Skip actual connection if URI is the placeholder
  if (MONGODB_URI.includes('placeholder')) {
    console.warn('Using placeholder MongoDB connection - data will not be saved');
    return mongoose;
  }

  if (cached.conn) return cached.conn

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI)
  }

  cached.conn = await cached.promise
  return cached.conn
}
