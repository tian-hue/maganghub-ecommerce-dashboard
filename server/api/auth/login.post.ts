import { z } from "zod";
import { prisma } from "~/server/utils/prisma";
import { createSession, deleteAllUserSessions } from "~/server/utils/session";
import { setSessionCookie, verifyPassword } from "~/server/utils/auth";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid login data.",
    });
  }

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Invalid email or password.",
    });
  }

  const valid = await verifyPassword(password, user.password);
  if (!valid) {
    throw createError({
      statusCode: 401,
      statusMessage: "Invalid email or password.",
    });
  }

  await deleteAllUserSessions(user.id);
  const { token, expiresAt } = await createSession(user.id);
  setSessionCookie(event, token, expiresAt);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
});
