import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI as string

// For development, use a mock database if MONGODB_URI is not set
if (!MONGODB_URI && process.env.NODE_ENV !== 'production') {
  console.warn(
    'No MONGODB_URI found in .env.local, using mock data only'
  )
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */

// Define the mongoose cache type
interface MongooseCache {
  conn: mongoose.Connection | null;
  promise: Promise<mongoose.Mongoose> | null;
}

// Add mongoose to the NodeJS global type
declare global {
  var mongoose: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null }

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

export async function connectDB(): Promise<mongoose.Connection | null> {
  // If we're in a serverless function and no MongoDB URI is set,
  // return null to allow fallback to mock data
  if (!MONGODB_URI) {
    console.warn('No MongoDB URI found, returning null connection');
    return null;
  }
  
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      // In serverless environments, it's better to reduce the pool size
      // The default is 5
      maxPoolSize: 5,
    }

    console.log('Connecting to MongoDB...');
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('Connected to MongoDB');
      return mongoose
    })
  }
  
  try {
    const instance = await cached.promise
    cached.conn = instance.connection
    return cached.conn
  } catch (e) {
    cached.promise = null
    console.error('Error connecting to MongoDB:', e);
    return null
  }
}

export function formatObjectId(id: string) {
  return new mongoose.Types.ObjectId(id)
}

export function isValidObjectId(id: string) {
  return mongoose.Types.ObjectId.isValid(id)
}

// Create a mock database that can be used when MongoDB is not available
export class MockDB {
  private static collections: Record<string, any[]> = {};
  
  static collection(name: string): any[] {
    if (!this.collections[name]) {
      this.collections[name] = [];
    }
    return this.collections[name];
  }
  
  static reset() {
    this.collections = {};
  }
}
