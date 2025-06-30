// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // → email e senha que você vai usar no login
  const email = "admin@sistema.com";
  const passwordPlain = "admin123";

  // gera hash (bcrypt, 10 rounds)
  const passwordHash = await bcrypt.hash(passwordPlain, 10);

  // cria ou atualiza o usuário
  await prisma.user.upsert({
    where: { email },
    update: { password: passwordHash, role: "ADMIN" },
    create: {
      email,
      fullName: "Administrador",
      password: passwordHash,
      role: "ADMIN",
    },
  });

  console.log("✅ Admin criado/atualizado:", email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
