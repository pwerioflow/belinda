import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Mail, Lock, Heart, UserCheck } from "lucide-react";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      return await apiRequest("POST", "/api/login", credentials);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      setLocation("/");
      toast({
        title: "Bem-vindo!",
        description: "Login realizado com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro no login",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const guestLoginMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/guest-login");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      setLocation("/");
      toast({
        title: "Bem-vindo, visitante!",
        description: "Você entrou como convidado!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      loginMutation.mutate({ email, password });
    }
  };

  const handleGuestLogin = () => {
    guestLoginMutation.mutate();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-5">
      <div className="w-full max-w-md mx-auto">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <div className="soft-blue w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Heart className="text-white w-8 h-8" aria-hidden="true" />
          </div>
          <h1 className="text-child-xl font-bold text-gray-800 mb-2">Mundo Divertido</h1>
          <p className="text-child-lg text-gray-600">Diversão e aprendizado!</p>
        </div>

        {/* Login Form */}
        <Card className="rounded-3xl shadow-xl">
          <CardContent className="p-8">
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <Label htmlFor="email" className="block text-child-lg font-semibold mb-3 text-gray-700">
                  <Mail className="inline w-5 h-5 mr-2 text-blue-400" aria-hidden="true" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-large w-full px-4"
                  placeholder="Digite seu email"
                  aria-label="Campo de email"
                />
              </div>

              <div>
                <Label htmlFor="password" className="block text-child-lg font-semibold mb-3 text-gray-700">
                  <Lock className="inline w-5 h-5 mr-2 text-blue-400" aria-hidden="true" />
                  Senha
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-large w-full px-4"
                  placeholder="Digite sua senha"
                  aria-label="Campo de senha"
                />
              </div>

              <Button
                type="submit"
                disabled={loginMutation.isPending || !email || !password}
                className="button-large w-full soft-blue text-white font-bold hover:bg-blue-400"
                aria-label="Botão para entrar no aplicativo"
              >
                {loginMutation.isPending ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <UserCheck className="w-5 h-5 mr-2" aria-hidden="true" />
                )}
                Entrar
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Button
                variant="ghost"
                onClick={handleGuestLogin}
                disabled={guestLoginMutation.isPending}
                className="text-child-lg text-gray-600 hover:text-blue-400 underline font-semibold"
                aria-label="Entrar como visitante sem fazer login"
              >
                {guestLoginMutation.isPending ? (
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <UserCheck className="w-5 h-5 mr-2" aria-hidden="true" />
                )}
                Entrar como convidado
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
