import { prisma } from "~/server/utils/prisma";
import { requireAuth } from "~/server/utils/rbac";

export default defineEventHandler(async (event) => {
  await requireAuth(event);
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });
  return { categories };
});
