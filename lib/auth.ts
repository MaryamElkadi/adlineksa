import jwt from "jsonwebtoken";
import { randomUUID } from "node:crypto";

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET is missing or shorter than 32 characters");
  }
  return secret;
}

export function createToken(payload: {
  id: string;
  role: string;
  sessionVersion: number;
}) {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: "7d",
    jwtid: randomUUID(),
  });
}

export function verifyToken(token: string) {
  const decoded = jwt.verify(token, getJwtSecret());
  if (
    typeof decoded !== "object" ||
    decoded === null ||
    typeof decoded.id !== "string" ||
    typeof decoded.role !== "string" ||
    (decoded.sessionVersion !== undefined &&
      (!Number.isSafeInteger(decoded.sessionVersion) || decoded.sessionVersion < 0)) ||
    (decoded.jti !== undefined && typeof decoded.jti !== "string")
  ) {
    throw new Error("Invalid authentication token");
  }

  return {
    id: decoded.id,
    role: decoded.role,
    sessionVersion: decoded.sessionVersion ?? 0,
    jti: decoded.jti,
    exp: decoded.exp,
  };
}
