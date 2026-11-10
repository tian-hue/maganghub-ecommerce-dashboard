import { prisma } from "~/server/utils/prisma";
import { requireAuth } from "~/server/utils/rbac";

export default defineEventHandler(async (event) => {
  await requireAuth(event);
  const id = getRouterParam(event, "id");
  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true },
  });

  if (!product || !product.isActive) {
    throw createError({ statusCode: 404, statusMessage: "Product not found." });
  }

  return {
    ...product,
    price: Number(product.price),
    categoryName: product.category.name,
  };
});
