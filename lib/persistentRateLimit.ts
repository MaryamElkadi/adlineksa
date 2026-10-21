import { createHash } from "node:crypto";
import mongoose from "mongoose";

import { connectToDatabase } from "@/lib/mongodb";

let indexPromise: Promise<string> | null = null;

export async function persistentRateLimit(
  key: string,
  limit: number,
  windowMs: number,
) {
  await connectToDatabase();

  const collection = mongoose.connection.collection<{
    _id: string;
    count: number;
    expiresAt: Date;
  }>("api_rate_limits");
  if (!indexPromise) {
    indexPromise = collection
      .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })
      .catch((error: unknown) => {
        indexPromise = null;
        throw error;
      });
  }
  await indexPromise;

  const now = Date.now();
  const window = Math.floor(now / windowMs);
  const windowEnd = (window + 1) * windowMs;
  const bucketId = createHash("sha256")
    .update(`${key}:${window}`)
    .digest("hex");

  try {
    await collection.updateOne(
      { _id: bucketId },
      {
        $inc: { count: 1 },
        $setOnInsert: { expiresAt: new Date(windowEnd + windowMs) },
      },
      { upsert: true },
    );
  } catch (error) {
    if (
      typeof error !== "object" ||
      error === null ||
      !("code" in error) ||
      error.code !== 11000
    ) {
      throw error;
    }

    await collection.updateOne({ _id: bucketId }, { $inc: { count: 1 } });
  }

  const bucket = await collection.findOne<{ count: number }>({ _id: bucketId });
  if (!bucket) {
    throw new Error("Could not read the persistent rate-limit bucket");
  }

  return {
    ok: bucket.count <= limit,
    retryAfter: Math.max(1, Math.ceil((windowEnd - now) / 1000)),
  };
}
