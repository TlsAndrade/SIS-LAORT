"use client";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { resetPassword } from "@/actions/password.actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function NewPasswordPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();

  const [pass, setPass] = useState("");
  const [msg, setMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = await resetPassword(token, pass);
    if (r.error) setMsg(r.error);
    else router.push("/"); // volta ao login
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <form onSubmit={handleSubmit} className="space-y-4 w-80">
        <h1 className="text-xl font-bold">Nova senha</h1>
        <Input
          type="password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          placeholder="••••••••"
          required
        />
        <Button className="w-full">Definir senha</Button>
        {msg && <p className="text-sm text-red-500 text-center">{msg}</p>}
      </form>
    </div>
  );
}
