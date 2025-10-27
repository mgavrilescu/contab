import { PrismaClient } from "@/lib/generated/prisma-client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create 5 users
  await prisma.user.createMany({
    data: [
      { email: "alice@example.com", name: "Alice" },
      { email: "bob@example.com", name: "Bob" },
      { email: "charlie@example.com", name: "Charlie" },
      { email: "diana@example.com", name: "Diana" },
      { email: "edward@example.com", name: "Edward" },
    ],
    skipDuplicates: true,
  });

  // Find all users to get their IDs

  const existing = await prisma.user.findUnique({ where: { email: "demo@example.com" } });
  if (!existing) {
    await prisma.user.create({
      data: {
        email: "demo@example.com",
        name: "Demo",
        password: await hash("demo1234", 10),
      },
    });
  }

  // Create 15 posts distributed among users

  // Ensure an admin account exists (env-configurable)
  const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin123!";
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: 'Admin',
      rol: 'ADMIN',
      password: await hash(adminPassword, 10),
    },
    create: {
      email: adminEmail,
      name: 'Admin',
      rol: 'ADMIN',
      password: await hash(adminPassword, 10),
    },
  });

  console.log("Seeding completed.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });