import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const ACCESS_TTL = process.env.JWT_ACCESS_TTL || "15m";
const REFRESH_TTL = process.env.JWT_REFRESH_TTL || "7d";

export function signAccessToken(payload) {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET || "dev_access_secret", {
    expiresIn: ACCESS_TTL,
  });
}

export function signRefreshToken(payload) {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET || "dev_refresh_secret", {
    expiresIn: REFRESH_TTL,
  });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET || "dev_access_secret");
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET || "dev_refresh_secret");
}

export async function hashToken(token) {
  const saltRounds = Number(process.env.BCRYPT_ROUNDS || 10);
  return bcrypt.hash(token, saltRounds);
}

export async function compareToken(token, hash) {
  return bcrypt.compare(token, hash || "");
}


