"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation"; // Importa o router para redirecionamento
import { signIn } from "next-auth/react"; // Importa a função de login do NextAuth
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { handleRegister as registerUserAction } from "@/actions/auth.actions";

export default function AuthenticationPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [isDiretoria, setIsDiretoria] = useState(false);

  // Esta função continua a mesma, para o registo
  const handleRegister = async () => {
    const formData = new FormData();
    formData.append("fullName", fullName);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("role", isDiretoria ? "DIRETORIA" : "LIGANTE");
    formData.append("adminPassword", adminPassword);

    const result = await registerUserAction(formData);

    if (result?.error) {
      alert(`Erro: ${result.error}`);
    } else if (result?.success) {
      alert(result.success);
    }
  };

  // CORREÇÃO: Esta é a nova função de login
  const handleLogin = async () => {
    try {
      // Usamos a função signIn do Auth.js para iniciar o processo de login
      const result = await signIn("credentials", {
        redirect: false, // Dizemos para não redirecionar automaticamente
        email: email,
        password: password,
      });

      if (result?.error) {
        // Se o login falhar (senha errada, etc.), o NextAuth retorna um erro
        alert("Erro: Email ou senha inválidos.");
      } else if (result?.ok) {
        // Se o login for bem-sucedido, redirecionamos manualmente para o dashboard
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Erro inesperado no login:", error);
      alert("Ocorreu um erro inesperado. Tente novamente.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="flex flex-col items-center w-full max-w-md">
        <Image
          src="/logo.jpeg"
          alt="Logo da LAORT"
          width={180}
          height={180}
          className="mb-4 rounded-full"
        />
        <h1 className="text-3xl font-bold text-foreground">SISTEMA LAORT</h1>
        <p className="text-muted-foreground text-center mb-6">
          Acesso ao sistema da Liga Académica de Ortopedia e Traumatologia
        </p>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Entrar</TabsTrigger>
            <TabsTrigger value="register">Cadastrar</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Bem-vindo de volta!</CardTitle>
                <CardDescription>
                  Aceda ao sistema com o seu email e senha.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Senha</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="******"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button onClick={handleLogin} className="w-full">
                  Entrar
                </Button>
                <a
                  href="#"
                  className="block mt-2 text-center text-xs text-muted-foreground hover:underline"
                >
                  Esqueceu a sua senha?
                </a>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle>Crie a sua Conta</CardTitle>
                <CardDescription>
                  Preencha os campos para se registar no sistema.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-fullname">Nome Completo</Label>
                  <Input
                    id="register-fullname"
                    placeholder="O seu nome completo"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password">Crie uma Senha</Label>
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="******"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tipo de Conta</Label>
                  <Tabs
                    defaultValue="ligante"
                    onValueChange={(value) =>
                      setIsDiretoria(value === "diretoria")
                    }
                    className="w-full"
                  >
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="ligante">Ligante</TabsTrigger>
                      <TabsTrigger value="diretoria">Diretoria</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
                {isDiretoria && (
                  <div className="space-y-2 p-4 border border-slate-700 rounded-md">
                    <Label htmlFor="admin-password">Senha de Diretoria</Label>
                    <Input
                      id="admin-password"
                      type="password"
                      placeholder="Digite a senha para criar conta de admin"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      required
                    />
                    <p className="text-xs text-muted-foreground pt-1">
                      Precisa da senha especial para criar uma conta de
                      Diretoria.
                    </p>
                  </div>
                )}
                <Button onClick={handleRegister} className="w-full">
                  Registar
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
