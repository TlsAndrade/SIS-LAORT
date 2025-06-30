"use server";

import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { Resend } from "resend";

const prisma = new PrismaClient();

const resend =
  process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.startsWith("re_")
    ? new Resend(process.env.RESEND_API_KEY)
    : null;

const EXP_MINUTES = 30;
const APP_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

/* ────────────────────────────────────────────────
   1. Envia link de redefinição
   ──────────────────────────────────────────────── */
export async function sendResetLink(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { error: "E-mail não encontrado." };

  const token = crypto.randomBytes(24).toString("hex");

  await prisma.passwordResetToken.create({
    data: {
      token,
      userId: user.id,
      expiresAt: new Date(Date.now() + EXP_MINUTES * 60_000),
    },
  });

  const resetUrl = `${APP_BASE_URL}/reset-password/${token}`;

  if (resend) {
    await resend.emails.send({
      from: "Sistema LAORT <onboarding@resend.dev>", // troque se tiver domínio verificado
      to: email,
      subject: "Recuperação de senha",
      html: `
        <p>Olá,</p>
        <p>Clique no link abaixo para redefinir a sua senha
        (válido por ${EXP_MINUTES} minutos):</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>Se não foi você, ignore este e-mail.</p>
      `,
    });
  } else {
    console.log(`🔗 link de reset: ${resetUrl}`);
  }

  return { success: "Se o e-mail existir, enviamos um link de redefinição." };
}

/* ────────────────────────────────────────────────
   2. Define nova senha a partir do token
   ──────────────────────────────────────────────── */
export async function resetPassword(token: string, newPassword: string) {
  const entry = await prisma.passwordResetToken.findUnique({
    where: { token },
  });
  if (!entry || entry.expiresAt < new Date()) {
    return { error: "Token inválido ou expirado." };
  }

  const hash = await bcrypt.hash(newPassword, 10);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: entry.userId },
      data: { password: hash },
    }),
    prisma.passwordResetToken.delete({ where: { id: entry.id } }),
  ]);

  return { success: "Senha alterada com sucesso!" };
}
