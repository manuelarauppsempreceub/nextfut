import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const DEFAULT_JWT_SECRET = "nextfut-dev-secret-change-me";

export function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

export async function hashPassword(password) {
  return bcrypt.hash(String(password || ""), 10);
}

export async function verifyPassword(password, passwordHash) {
  return bcrypt.compare(String(password || ""), passwordHash);
}

export function signUserToken(user) {
  const secret = process.env.JWT_SECRET || DEFAULT_JWT_SECRET;

  return jwt.sign(
    {
      sub: user.id,
      role: user.role,
      status: user.status,
      athleteId: user.athleteId || null
    },
    secret,
    {
      expiresIn: "8h"
    }
  );
}

export function verifyUserToken(token) {
  const secret = process.env.JWT_SECRET || DEFAULT_JWT_SECRET;
  return jwt.verify(token, secret);
}

export function publicUser(user) {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    athleteId: user.athleteId || null,
    scoutName: user.scoutName || null,
    scoutEmail: user.scoutEmail || null,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}