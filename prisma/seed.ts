import { PrismaClient, Role, OrderStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const ADMIN_EMAIL = "admin@example.com";
const STAFF_EMAIL = "staff@example.com";

async function main() {
  const adminPassword = await bcrypt.hash("AdminDemo123!", 10);
  const staffPassword = await bcrypt.hash("StaffDemo123!", 10);

  const admin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: { name: "Admin User", password: adminPassword, role: Role.ADMIN },
    create: {
      name: "Admin User",
      email: ADMIN_EMAIL,
      password: adminPassword,
      role: Role.ADMIN,
    },
  });

  const staff = await prisma.user.upsert({
    where: { email: STAFF_EMAIL },
    update: { name: "Staff User", password: staffPassword, role: Role.STAFF },
    create: {
      name: "Staff User",
      email: STAFF_EMAIL,
      password: staffPassword,
      role: Role.STAFF,
    },
  });

  const categories = ["Electronics", "Fashion", "Home & Living"];

  const createdCategories = await Promise.all(
    categories.map((name) =>
      prisma.category.upsert({
        where: { name },
        update: {},
        create: { name },
      }),
    ),
  );

  const categoryMap = Object.fromEntries(
    createdCategories.map((cat) => [cat.name, cat]),
  );
  const productsSeed = [
    {
      name: "Smartphone X12",
      description: "Flagship Android smartphone with AI camera.",
      category: "Electronics",
      price: 7499000,
      stock: 18,
    },
    {
      name: "Wireless Earbuds Pro",
      description: "Noise-canceling earbuds with fast charging.",
      category: "Electronics",
      price: 1999000,
      stock: 3,
    },
    {
      name: "Mechanical Keyboard",
      description: "Compact gaming keyboard with RGB lighting.",
      category: "Electronics",
      price: 1299000,
      stock: 12,
    },
    {
      name: "4K Smart TV 55",
      description: "Ultra HD display with voice assistant support.",
      category: "Electronics",
      price: 6999000,
      stock: 7,
    },
    {
      name: "Classic Denim Jacket",
      description: "Premium casual jacket for everyday use.",
      category: "Fashion",
      price: 899000,
      stock: 9,
    },
    {
      name: "Urban Canvas Tote",
      description: "Stylish tote bag with laptop compartment.",
      category: "Fashion",
      price: 429000,
      stock: 14,
    },
    {
      name: "Running Sneakers",
      description: "Lightweight performance sneakers in urban style.",
      category: "Fashion",
      price: 1099000,
      stock: 4,
    },
    {
      name: "Minimalist Desk Lamp",
      description: "Adjustable LED lamp for cozy workspaces.",
      category: "Home & Living",
      price: 399000,
      stock: 16,
    },
    {
      name: "Bamboo Storage Basket",
      description: "Eco-friendly storage basket for home organization.",
      category: "Home & Living",
      price: 259000,
      stock: 2,
    },
    {
      name: "Aroma Diffuser",
      description: "Silicone diffuser with soothing mood lighting.",
      category: "Home & Living",
      price: 549000,
      stock: 11,
    },
  ];

  const createdProducts = await Promise.all(
    productsSeed.map(async ({ name, description, category, price, stock }) => {
      const id = `seed-${category}-${name}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      return prisma.product.upsert({
        where: { id },
        update: {
          name,
          description,
          categoryId: categoryMap[category].id,
          price: price.toString(),
          stock,
          isActive: true,
        },
        create: {
          id,
          name,
          description,
          categoryId: categoryMap[category].id,
          price: price.toString(),
          stock,
          isActive: true,
        },
      });
    }),
  );

  const orderData = [
    {
      orderNumber: "INV-1001",
      customerName: "Rizky Pratama",
      customerEmail: "rizky@gmail.com",
      total: 7499000,
      status: OrderStatus.pending,
      orderDate: new Date("2026-10-01T09:30:00Z"),
      items: [
        {
          productNameSnapshot: "Smartphone X12",
          quantity: 1,
          unitPrice: 7499000,
          subtotal: 7499000,
        },
      ],
    },
    {
      orderNumber: "INV-1002",
      customerName: "Nadia Salsabila",
      customerEmail: "nadia@gmail.com",
      total: 1299000,
      status: OrderStatus.processing,
      orderDate: new Date("2026-10-03T11:15:00Z"),
      items: [
        {
          productNameSnapshot: "Mechanical Keyboard",
          quantity: 1,
          unitPrice: 1299000,
          subtotal: 1299000,
        },
      ],
    },
    {
      orderNumber: "INV-1003",
      customerName: "Dimas Putra",
      customerEmail: "dimas@gmail.com",
      total: 2548000,
      status: OrderStatus.completed,
      orderDate: new Date("2026-10-05T14:00:00Z"),
      items: [
        {
          productNameSnapshot: "Wireless Earbuds Pro",
          quantity: 1,
          unitPrice: 1999000,
          subtotal: 1999000,
        },
        {
          productNameSnapshot: "Aroma Diffuser",
          quantity: 1,
          unitPrice: 549000,
          subtotal: 549000,
        },
      ],
    },
    {
      orderNumber: "INV-1004",
      customerName: "Sinta Wijaya",
      customerEmail: "sinta@gmail.com",
      total: 429000,
      status: OrderStatus.completed,
      orderDate: new Date("2026-10-07T08:45:00Z"),
      items: [
        {
          productNameSnapshot: "Urban Canvas Tote",
          quantity: 1,
          unitPrice: 429000,
          subtotal: 429000,
        },
      ],
    },
    {
      orderNumber: "INV-1005",
      customerName: "Fajar Nugroho",
      customerEmail: "fajar@gmail.com",
      total: 1498000,
      status: OrderStatus.processing,
      orderDate: new Date("2026-10-08T10:00:00Z"),
      items: [
        {
          productNameSnapshot: "Running Sneakers",
          quantity: 1,
          unitPrice: 1099000,
          subtotal: 1099000,
        },
        {
          productNameSnapshot: "Minimalist Desk Lamp",
          quantity: 1,
          unitPrice: 399000,
          subtotal: 399000,
        },
      ],
    },
    {
      orderNumber: "INV-1006",
      customerName: "Lina Hartati",
      customerEmail: "lina@gmail.com",
      total: 899000,
      status: OrderStatus.cancelled,
      orderDate: new Date("2026-10-09T12:30:00Z"),
      items: [
        {
          productNameSnapshot: "Classic Denim Jacket",
          quantity: 1,
          unitPrice: 899000,
          subtotal: 899000,
        },
      ],
    },
    {
      orderNumber: "INV-1007",
      customerName: "Arif Rahman",
      customerEmail: "arif@gmail.com",
      total: 6999000,
      status: OrderStatus.completed,
      orderDate: new Date("2026-10-10T16:20:00Z"),
      items: [
        {
          productNameSnapshot: "4K Smart TV 55",
          quantity: 1,
          unitPrice: 6999000,
          subtotal: 6999000,
        },
      ],
    },
    {
      orderNumber: "INV-1008",
      customerName: "Citra Ayu",
      customerEmail: "citra@gmail.com",
      total: 658000,
      status: OrderStatus.pending,
      orderDate: new Date("2026-10-12T09:00:00Z"),
      items: [
        {
          productNameSnapshot: "Bamboo Storage Basket",
          quantity: 1,
          unitPrice: 259000,
          subtotal: 259000,
        },
        {
          productNameSnapshot: "Minimalist Desk Lamp",
          quantity: 1,
          unitPrice: 399000,
          subtotal: 399000,
        },
      ],
    },
  ];

  for (const order of orderData) {
    await prisma.order.upsert({
      where: { orderNumber: order.orderNumber },
      update: {},
      create: {
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        total: order.total.toString(),
        status: order.status,
        orderDate: order.orderDate,
        items: {
          create: order.items.map((item) => ({
            productNameSnapshot: item.productNameSnapshot,
            quantity: item.quantity,
            unitPrice: item.unitPrice.toString(),
            subtotal: item.subtotal.toString(),
            productId:
              createdProducts.find(
                (prod) => prod.name === item.productNameSnapshot,
              )?.id ?? null,
          })),
        },
      },
    });
  }

  console.log("Seed data created successfully.");
  console.log("Demo users:", { admin: admin.email, staff: staff.email });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
