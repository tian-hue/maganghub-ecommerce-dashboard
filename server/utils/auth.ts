import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { PrismaClient, Role } from "@prisma/client";
import { H3Event, createError, getCookie, setCookie, deleteCookie } from "h3";

const SESSION_COOKIE = "mh_session";

export function getSessionCookie(event: H3Event) {
  return getCookie(event, SESSION_COOKIE);
}

export function setSessionCookie(
  event: H3Event,
  token: string,
  expiresAt: Date,
) {
  setCookie(event, SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    path: "/",
  });
}

export function clearSessionCookie(event: H3Event) {
  deleteCookie(event, SESSION_COOKIE, { path: "/" });
}

export function generateSessionToken() {
  return crypto.randomBytes(32).toString("hex");
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function isAdminRole(role: string | null | undefined) {
  return role === Role.ADMIN;
}

export function getAuthError(status: number, message: string) {
  return createError({ statusCode: status, statusMessage: message });
}
