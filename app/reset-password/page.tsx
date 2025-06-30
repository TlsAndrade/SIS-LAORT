"use client";

import { useState } from "react";
import { generateTempPassword } from "@/actions/forgot-password.actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function TempPasswordPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");
  const [temp, setTemp] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("Gerando...");
    const r = await generateTempPassword(email, name);
    if (r.error) {
      setMsg(r.error);
      setTemp(null);
    } else {
      setMsg(r.success!);
      setTemp(r.tempPassword!);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <form onSubmit={handleSubmit} className="space-y-4 w-80">
        <h1 className="text-xl font-bold">Recuperar senha</h1>

        <Input
          placeholder="Email cadastrado"
          value={email}
          type="email"
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Input
          placeholder="Nome completo cadastrado"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <Button className="w-full">Gerar senha temporária</Button>

        {msg && <p className="text-sm text-center">{msg}</p>}
        {temp && (
          <div className="p-3 border rounded-md mt-2 text-center">
            <p className="text-sm">Sua senha temporária:</p>
            <p className="font-mono font-bold text-lg">{temp}</p>
            <p className="text-xs mt-1">
              Use-a para entrar e troque imediatamente.
            </p>
          </div>
        )}
      </form>
    </div>
  );
}
