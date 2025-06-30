/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * NextAuth v5 + Prisma – Auth Route (App Router)
 */
import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

interface UserWithRole {
  id: string;
  role: "ADMIN" | "LIGANTE";
}

const authOptions = {
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        const { email, password } = credentials as {
          email: string;
          password: string;
        };

        if (!email || !password)
          throw new Error("Email e senha são obrigatórios.");

        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
        });
        if (!user || !user.password) throw new Error("Credenciais inválidas.");

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) throw new Error("Credenciais inválidas.");

        return {
          id: user.id,
          email: user.email,
          name: user.fullName,
          role: user.role,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const safe = user as UserWithRole;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        token.id = (safe as any).id;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        token.role = (safe as any).role;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session.user as any).role = token.role as string;
      }
      return session;
    },

    async redirect({ baseUrl }) {
      // URL absoluta para evitar erro "cannot be parsed as a URL"
      return `${baseUrl}/dashboard`;
    },
  },

  pages: { signIn: "/" },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
} satisfies NextAuthConfig;

/* ------------------------------------------------------------------ */
/*  Export HTTP handlers required by the App Router                    */
/* ------------------------------------------------------------------ */
const { handlers } = NextAuth(authOptions);
export const { GET, POST } = handlers;
