import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error('Please define MONGODB_URI in .env.local')
}

interface MongooseGlobal {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

declare global {
  var mongooseGlobal: MongooseGlobal | undefined
}

let cached = global.mongooseGlobal || {
  conn: null,
  promise: null
}

global.mongooseGlobal = cached

export async function connectDB() {
  if (cached.conn) return cached.conn

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI!).then((mongoose) => mongoose)
  }

  cached.conn = await cached.promise
  return cached.conn
}
