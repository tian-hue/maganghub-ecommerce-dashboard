import { prisma } from "~/server/utils/prisma";
import { requireAuth } from "~/server/utils/rbac";

export default defineEventHandler(async (event) => {
  await requireAuth(event);
  const id = getRouterParam(event, "id");
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!order) {
    throw createError({ statusCode: 404, statusMessage: "Order not found." });
  }

  return {
    ...order,
    total: Number(order.total),
    items: order.items.map((item) => ({
      ...item,
      unitPrice: Number(item.unitPrice),
      subtotal: Number(item.subtotal),
    })),
  };
});
