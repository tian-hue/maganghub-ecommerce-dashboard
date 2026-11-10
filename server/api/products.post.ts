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
  const body = await readBody(event);
  const parsed = productSchema.safeParse(body);

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid product data.",
    });
  }

  const product = await prisma.product.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description,
      categoryId: parsed.data.categoryId,
      price: parsed.data.price.toString(),
      stock: parsed.data.stock,
      isActive: true,
    },
    include: { category: true },
  });

  return {
    ...product,
    price: Number(product.price),
    categoryName: product.category.name,
  };
});
