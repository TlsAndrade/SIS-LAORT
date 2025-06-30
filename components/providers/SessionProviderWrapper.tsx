"use client"; // ← importantíssimo!  Torna o componente client-only

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

/**
 * Envolve a árvore React no SessionProvider do NextAuth
 * Deve rodar apenas no Client para evitar erros de hidratação.
 */
export default function SessionProviderWrapper({
  children,
}: {
  children: ReactNode;
}) {
  return <SessionProvider>{children}</SessionProvider>;
}
