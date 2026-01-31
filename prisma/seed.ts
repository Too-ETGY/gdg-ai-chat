import "dotenv/config";
import { PrismaClient, Gender, UserRole } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

// pw: agentlead123 

async function main() {
  await prisma.user.upsert({
    where: { email: "agentlead@example.com" },
    update: {},
    create: {
      email: "agentlead@example.com",
      name: "Agent Lead",
      passwordHash:
        "$2a$10$zYH6dY7zU4EJ5lE9QeRr9u6PZk8Z4m1B8Vx5lH9yX2bQyZ9E5X1Km",
      role: UserRole.LEAD_AGENT,
      birthDate: new Date("2005-10-19"),
      gender: Gender.MALE,
    },
  });

  console.log("✅ Agent Lead seeded");
}

await main();
await prisma.$disconnect();
