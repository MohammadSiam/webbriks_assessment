import "dotenv/config";
import bcrypt from "bcrypt";
import { generateKeyBetween } from "fractional-indexing";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const owner = await prisma.user.upsert({
    where: { email: "owner@webbriks.local" },
    update: {},
    create: {
      email: "owner@webbriks.local",
      name: "Board Owner",
      passwordHash,
    },
  });

  const member = await prisma.user.upsert({
    where: { email: "member@webbriks.local" },
    update: {},
    create: {
      email: "member@webbriks.local",
      name: "Board Member",
      passwordHash,
    },
  });

  const board = await prisma.board.create({
    data: {
      title: "Demo Kanban Board",
      description: "Seeded board for local development and manual testing",
      ownerId: owner.id,
      members: {
        create: { userId: member.id, role: "EDITOR" },
      },
    },
  });

  const columnTitles = ["To Do", "In Progress", "Done"];
  let columnPosition: string | null = null;

  for (const title of columnTitles) {
    columnPosition = generateKeyBetween(columnPosition, null);
    await prisma.column.create({
      data: { boardId: board.id, title, position: columnPosition },
    });
  }

  console.log("Seeded:", { owner: owner.email, member: member.email, board: board.title });
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
