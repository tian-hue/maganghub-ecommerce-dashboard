import { z } from "zod";
import { prisma } from "~/server/utils/prisma";
import { requireAuth } from "~/server/utils/rbac";

const querySchema = z.object({
  status: z
    .enum(["pending", "processing", "completed", "cancelled"])
    .optional(),
});

export default defineEventHandler(async (event) => {
  await requireAuth(event);
  const query = await getQuery(event);
  const parsed = querySchema.safeParse(query);

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid order query.",
    });
  }

  const orders = await prisma.order.findMany({
    where: parsed.data.status ? { status: parsed.data.status } : undefined,
    include: { items: true },
    orderBy: { orderDate: "desc" },
  });

  return {
    orders: orders.map((order) => ({
      ...order,
      total: Number(order.total),
    })),
  };
});
