import { prisma } from "~/server/utils/prisma";
import { requireAuth } from "~/server/utils/rbac";
import { z } from "zod";

const querySchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export default defineEventHandler(async (event) => {
  await requireAuth(event);
  const query = await getQuery(event);
  const parsed = querySchema.safeParse(query);

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid product query.",
    });
  }

  const { search, category, page, limit } = parsed.data;
  const where = {
    isActive: true,
    ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
    ...(category ? { categoryId: category } : {}),
  };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products: products.map((product) => ({
      ...product,
      price: Number(product.price),
      categoryName: product.category.name,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
});
