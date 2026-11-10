import { clearSessionCookie, getSessionCookie } from "~/server/utils/auth";
import { deleteSessionByToken } from "~/server/utils/session";

export default defineEventHandler(async (event) => {
  const token = getSessionCookie(event);

  if (token) {
    await deleteSessionByToken(token);
  }

  clearSessionCookie(event);

  return { success: true };
});
