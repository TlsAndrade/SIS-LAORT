import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const deleted = await prisma.user.deleteMany();
  console.log(`🗑️  Apagados ${deleted.count} usuários`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
