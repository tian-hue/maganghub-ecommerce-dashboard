import crypto from "node:crypto";
import { prisma } from "./prisma";
import { getSessionCookie } from "./auth";
import type { H3Event } from "h3";

export async function createSession(userId: string) {
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);

  await prisma.session.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
    },
  });

  return { token, expiresAt };
}

export async function getSessionUser(event: H3Event) {
  const token = getSessionCookie(event);
  if (!token) return null;

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const session = await prisma.session.findFirst({
    where: {
      tokenHash,
      expiresAt: { gt: new Date() },
    },
    include: { user: true },
  });

  if (!session) return null;

  return session.user;
}

export async function deleteSessionByToken(token: string) {
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  await prisma.session.deleteMany({
    where: { tokenHash },
  });
}

export async function deleteAllUserSessions(userId: string) {
  await prisma.session.deleteMany({
    where: { userId },
  });
}
