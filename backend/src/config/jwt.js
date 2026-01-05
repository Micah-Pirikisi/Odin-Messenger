import jwt from "jsonwebtoken";
import crypto from "crypto";

const SECRET = process.env.JWT_SECRET;
const ACCESS_EXPIRES = process.env.ACCESS_TOKEN_EXPIRES_IN || "15m";
const REFRESH_EXPIRES_DAYS = parseInt(
  process.env.REFRESH_TOKEN_EXPIRES_IN_DAYS || "30",
  10
);

if (!SECRET) {
  throw new Error("JWT_SECRET is not set");
}

export function signAccessToken(payload) {
  return jwt.sign(payload, SECRET, {
    expiresIn: ACCESS_EXPIRES,
  });
}

export function verifyAccessToken(token) {
  try {
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
}

export function createRefreshTokenString() {
  return crypto.randomBytes(64).toString("hex");
}

export function refreshExpiresAt() {
  const d = new Date();
  d.setDate(d.getDate() + REFRESH_EXPIRES_DAYS);
  return d;
}
