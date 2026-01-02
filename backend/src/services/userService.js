import prisma from "../config/db";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 12;

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

export async function createUser({ email, password, name }) {
  const hashed = await bcrypt.hash(password, SALT_ROUNDS);
  return prisma.user.create({
    data: { email: normalizeEmail(email), password: hashed, name },
    select: {
      id: true,
      email: true,
      name: name || email.split("@")[0],
      avatarUrl: true,
      createdAt: true,
    },
  });
}

export async function findUserByEmail(email) {
  return prisma.user.findUnique({ where: { email: normalizeEmail(email) } });
}

export async function findUserById(id) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      avatarUrl: true,
      createdAt: true,
    },
  });
}

export async function verifyPassword(user, plain) {
  if (!user?.password) return false;
  return bcrypt.compare(plain, user.password);
}

export async function setAvatarUrl(userId, url) {
  return prisma.user.update({
    where: { id: userId },
    data: { avatarUrl: url },
  });
}
