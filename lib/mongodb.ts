import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

type MongooseCache = { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
const globalForMongoose = globalThis as typeof globalThis & { mongooseCache?: MongooseCache };
const cache = globalForMongoose.mongooseCache || { conn: null, promise: null };
globalForMongoose.mongooseCache = cache;

/** Reuses one connection promise so model calls never buffer behind parallel connects. */
export async function connectToDatabase() {
  if (!MONGODB_URI) throw new Error("MONGODB_URI is missing");
  if (cache.conn && mongoose.connection.readyState === 1) return cache.conn.connection;

  if (!cache.promise) {
    mongoose.set("bufferCommands", false);
    cache.promise = mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 8_000,
      connectTimeoutMS: 8_000,
      maxPoolSize: 10,
    });
  }

  try {
    cache.conn = await cache.promise;
    return cache.conn.connection;
  } catch (error) {
    cache.promise = null;
    cache.conn = null;
    throw error;
  }
}
