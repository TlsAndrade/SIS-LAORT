"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, redirect } from "next/navigation";
import { useSession, signOut } from "next-auth/react"; // Importa o hook para obter a sessão
import {
  Home,
  Calendar,
  UserCheck,
  Folder,
  User,
  Power,
  Shield,
} from "lucide-react";

// Itens de navegação padrão
const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/dashboard/calendario", label: "Calendário", icon: Calendar },
  { href: "/dashboard/presenca", label: "Presença", icon: UserCheck },
  { href: "/dashboard/materiais", label: "Materiais", icon: Folder },
  { href: "/dashboard/perfil", label: "Perfil", icon: User },
];

// Item de menu apenas para administradores
const adminNavItem = {
  href: "/dashboard/gerenciamento",
  label: "Gerenciamento",
  icon: Shield,
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Obtém os dados da sessão e o status do lado do cliente
  const { data: session, status } = useSession();
  const pathname = usePathname();

  // Enquanto a sessão está a ser carregada, mostra uma mensagem
  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-950 text-white">
        Carregando...
      </div>
    );
  }

  // Se o utilizador não estiver autenticado, redireciona para a página de login
  if (status === "unauthenticated") {
    redirect("/");
    return null; // Retorna null enquanto o redirecionamento ocorre
  }

  const user = session?.user;
  const isAdmin = user?.role === "ADMIN";

  return (
    <div className="flex h-screen bg-gray-950 text-gray-300">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-[#0B0F19] p-6 flex flex-col justify-between">
        <div>
          {/* Logo e Título */}
          <div className="flex items-center gap-3 mb-12">
            <Image
              src="/logo.jpeg"
              alt="Logo LAORT"
              width={40}
              height={40}
              className="rounded-full"
            />
            <div>
              <h1 className="font-bold text-white text-lg">Sistema LAORT</h1>
              <p className="text-xs text-gray-400">
                {isAdmin ? "Administração" : "Visualização"}
              </p>
            </div>
          </div>

          {/* Navegação */}
          <nav className="flex flex-col gap-3">
            {isAdmin && (
              <Link
                key={adminNavItem.label}
                href={adminNavItem.href}
                className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                  pathname === adminNavItem.href
                    ? "bg-blue-600 text-white"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <adminNavItem.icon className="h-5 w-5" />
                <span>{adminNavItem.label}</span>
              </Link>
            )}
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Perfil do Utilizador e Logout */}
        <div className="border-t border-gray-800 pt-6">
          <div className="flex items-center gap-3 mb-4">
            <Image
              src={user?.image || "/logo.jpeg"}
              alt="Avatar do utilizador"
              width={40}
              height={40}
              className="rounded-full"
            />
            <span className="font-medium text-white">
              {user?.name || "Utilizador"}
            </span>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white"
          >
            <Power className="h-5 w-5" />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-1 overflow-y-auto bg-[#111827]">{children}</main>
    </div>
  );
}
