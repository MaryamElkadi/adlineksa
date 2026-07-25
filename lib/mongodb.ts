// MongoDB connection helper using Mongoose
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/adline";

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

/**
 * Connect to MongoDB using Mongoose. This function is idempotent and can be called from any API route or server component.
 */
export async function connectToDatabase() {
  if (mongoose.connection.readyState >= 1) {
    // Already connected or connecting
    return mongoose.connection;
  }

  await mongoose.connect(MONGODB_URI, {
    // useNewUrlParser, useUnifiedTopology are enabled by default in newer mongoose versions
    // You can add additional options here if needed
  });

  console.log("🔗 Connected to MongoDB");
  return mongoose.connection;
}

export const db = mongoose.connection;
