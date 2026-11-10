import type { H3Event } from "h3";
import { getSessionUser } from "./session";
import { getAuthError } from "./auth";

export async function getCurrentUser(event: H3Event) {
  return getSessionUser(event);
}

export async function requireAuth(event: H3Event) {
  const user = await getCurrentUser(event);
  if (!user) {
    throw getAuthError(401, "Unauthorized");
  }
  return user;
}

export async function requireAdmin(event: H3Event) {
  const user = await requireAuth(event);

  if (user.role !== "ADMIN") {
    throw getAuthError(403, "Forbidden");
  }

  return user;
}
