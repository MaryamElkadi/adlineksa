import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

export async function connectToDatabase() {
  try {
    console.log("Mongo URI exists:", !!MONGODB_URI);

    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI is missing");
    }

    if (mongoose.connection.readyState === 1) {
      return mongoose.connection;
    }

    await mongoose.connect(MONGODB_URI);

    console.log("Connected successfully");

    return mongoose.connection;
  } catch (err) {
    console.error("MongoDB connection failed:", err);
    throw err;
  }
}