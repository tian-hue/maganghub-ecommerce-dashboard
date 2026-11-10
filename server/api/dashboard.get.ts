import { prisma } from "~/server/utils/prisma";
import { requireAuth } from "~/server/utils/rbac";

export default defineEventHandler(async (event) => {
  await requireAuth(event);

  const [
    totalProducts,
    totalOrders,
    revenueResult,
    lowStockProducts,
    recentOrders,
  ] = await Promise.all([
    prisma.product.count({ where: { isActive: true } }),
    prisma.order.count(),
    prisma.order.aggregate({
      where: { status: "completed" },
      _sum: { total: true },
    }),
    prisma.product.count({ where: { isActive: true, stock: { lt: 5 } } }),
    prisma.order.findMany({
      orderBy: { orderDate: "desc" },
      take: 5,
      include: { items: true },
    }),
  ]);

  return {
    stats: {
      totalProducts,
      totalOrders,
      totalRevenue: Number(revenueResult._sum.total ?? 0),
      lowStockProducts,
    },
    recentOrders: recentOrders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      orderDate: order.orderDate,
      total: Number(order.total),
      status: order.status,
    })),
  };
});
