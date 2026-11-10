import { z } from "zod";
import { prisma } from "~/server/utils/prisma";
import { requireAdmin } from "~/server/utils/rbac";

const productSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional().default(""),
  categoryId: z.string().min(1),
  price: z.coerce.number().positive(),
  stock: z.coerce.number().int().nonnegative(),
});

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const id = getRouterParam(event, "id");
  const body = await readBody(event);
  const parsed = productSchema.safeParse(body);

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid product update.",
    });
  }

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) {
    throw createError({ statusCode: 404, statusMessage: "Product not found." });
  }

  const updated = await prisma.product.update({
    where: { id },
    data: {
      name: parsed.data.name,
      description: parsed.data.description,
      categoryId: parsed.data.categoryId,
      price: parsed.data.price.toString(),
      stock: parsed.data.stock,
    },
    include: { category: true },
  });

  return {
    ...updated,
    price: Number(updated.price),
    categoryName: updated.category.name,
  };
});
