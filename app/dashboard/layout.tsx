import DashboardLayout from "@/components/layout/DashboardLayout";
import React from "react";

// Este layout agora é muito simples.
// A sua única função é "envolver" as páginas do dashboard com o nosso componente de layout principal.
export default function Layout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
