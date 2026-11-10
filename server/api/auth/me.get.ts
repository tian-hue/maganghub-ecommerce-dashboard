import { getSessionUser } from "~/server/utils/session";

export default defineEventHandler(async (event) => {
  const user = await getSessionUser(event);

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
});
