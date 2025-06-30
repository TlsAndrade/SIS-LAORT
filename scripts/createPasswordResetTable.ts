import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // 1) cria tabela, se ainda não existir
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "PasswordResetToken" (
      id         text primary key default gen_random_uuid(),
      token      text unique not null,
      "userId"   text not null references "User"(id) on delete cascade,
      "expiresAt" timestamptz not null,
      "createdAt" timestamptz not null default now()
    );
  `);

  // 2) índice para busca por token
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "PasswordResetToken_token_idx"
      ON "PasswordResetToken"(token);
  `);

  // 3) índice para limpar tokens expirados
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "PasswordResetToken_expires_idx"
      ON "PasswordResetToken"("expiresAt");
  `);

  console.log("✅ Tabela PasswordResetToken criada (ou já existia)");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
