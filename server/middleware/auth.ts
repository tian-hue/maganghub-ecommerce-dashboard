import { getSessionUser } from "~/server/utils/session";

export default defineEventHandler(async (event) => {
  const url = getRequestURL(event).pathname;
  if (url.startsWith("/api/auth") || url === "/login" || url.startsWith("/_")) {
    return;
  }

  const user = await getSessionUser(event);
  if (!user && url.startsWith("/api/")) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }
});
