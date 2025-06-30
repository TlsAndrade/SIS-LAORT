"use server";

import { prisma } from "@/lib/db"; // <-- USA A INSTÂNCIA ÚNICA
import bcrypt from "bcryptjs";

// A linha 'const prisma = new PrismaClient()' foi removida daqui.

export async function handleRegister(formData: FormData) {
  const fullName = formData.get("fullName") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const roleFromForm = formData.get("role") as "LIGANTE" | "DIRETORIA";
  const adminPassword = formData.get("adminPassword") as string;

  if (!fullName || !email || !password) {
    return { error: "Todos os campos são obrigatórios." };
  }

  if (
    roleFromForm === "DIRETORIA" &&
    adminPassword !== process.env.ADMIN_CREATION_CODE
  ) {
    return { error: "Senha de administrador inválida." };
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (existingUser) {
    return { error: "Este email já está registado." };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const roleToSave = roleFromForm === "DIRETORIA" ? "ADMIN" : "LIGANTE";
    await prisma.user.create({
      data: {
        fullName: fullName,
        email: email.toLowerCase(),
        role: roleToSave,
        password: hashedPassword,
      },
    });
    return { success: "Utilizador registado com sucesso!" };
  } catch (error) {
    return { error: "Não foi possível criar o utilizador." };
  }
}

export async function handleLogin(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email e senha são obrigatórios." };
  }

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user || !user.password) {
    return { error: "Email ou senha inválidos." };
  }

  const passwordsMatch = await bcrypt.compare(password, user.password);

  if (!passwordsMatch) {
    return { error: "Email ou senha inválidos." };
  }

  return {
    success: "Login realizado com sucesso!",
    user: { fullName: user.fullName, role: user.role },
  };
}
