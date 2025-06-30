"use server";

import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function generateTempPassword(email: string, fullName: string) {
  const user = await prisma.user.findFirst({
    where: {
      email,
      fullName,
    },
  });

  if (!user) {
    return { error: "Email e nome não conferem." };
  }

  // senha temporária de 6 caracteres hexadecimais
  const temp = crypto.randomBytes(3).toString("hex"); // ex: "a3f9c2"
  const hash = await bcrypt.hash(temp, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: { password: hash },
  });

  return {
    success: "Senha temporária gerada!",
    tempPassword: temp,
  };
}
