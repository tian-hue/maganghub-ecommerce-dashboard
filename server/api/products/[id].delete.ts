import { prisma } from "~/server/utils/prisma";
import { requireAdmin } from "~/server/utils/rbac";

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const id = getRouterParam(event, "id");
  const product = await prisma.product.findUnique({ where: { id } });

  if (!product) {
    throw createError({ statusCode: 404, statusMessage: "Product not found." });
  }

  await prisma.product.update({
    where: { id },
    data: { isActive: false },
  });

  return { success: true };
});
