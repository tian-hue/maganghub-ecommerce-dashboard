import { z } from "zod";
import { prisma } from "~/server/utils/prisma";
import { requireAdmin } from "~/server/utils/rbac";

const statusSchema = z.object({
  status: z.enum(["pending", "processing", "completed", "cancelled"]),
});

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const id = getRouterParam(event, "id");
  const body = await readBody(event);
  const parsed = statusSchema.safeParse(body);

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid order status.",
    });
  }

  const order = await prisma.order.update({
    where: { id },
    data: { status: parsed.data.status },
  });

  return { success: true, order };
});
