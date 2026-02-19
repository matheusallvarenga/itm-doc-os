import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TriangleLogo } from "@/components/TriangleLogo";
import { toast } from "@/hooks/use-toast";
import { Eye, EyeSlash, EnvelopeSimple, Lock, User } from "@phosphor-icons/react";

export default function Signup() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({ title: "Senha muito curta", description: "A senha deve ter pelo menos 6 caracteres.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await signUp(email, password, fullName);
    setLoading(false);

    if (error) {
      toast({ title: "Erro ao criar conta", description: error.message, variant: "destructive" });
    } else {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-glow" />
        <div className="relative z-10 w-full max-w-md text-center space-y-6">
          <TriangleLogo size="lg" animate />
          <div className="bg-card border border-border/50 rounded-xl p-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
              <EnvelopeSimple weight="duotone" className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">Verifique seu email</h2>
            <p className="text-muted-foreground text-sm">
              Enviamos um link de confirmação para <strong className="text-foreground">{email}</strong>. 
              Clique no link para ativar sua conta.
            </p>
            <Link to="/login">
              <Button variant="outline" className="mt-4">Voltar para Login</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-glow" />

      <div className="relative z-10 w-full max-w-md space-y-8">
        <div className="flex flex-col items-center gap-4">
          <TriangleLogo size="lg" animate />
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-foreground tracking-wide">
              CÓDIGO DE <span className="text-primary">PODER</span>
            </h1>
            <p className="text-muted-foreground text-sm mt-2">Crie sua conta e comece agora</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-card border border-border/50 rounded-xl p-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-muted-foreground text-sm">Nome completo</Label>
            <div className="relative">
              <User weight="light" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input id="name" placeholder="Dr. João Silva" value={fullName} onChange={(e) => setFullName(e.target.value)} className="pl-10 bg-secondary border-border" required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-muted-foreground text-sm">Email</Label>
            <div className="relative">
              <EnvelopeSimple weight="light" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input id="email" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10 bg-secondary border-border" required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-muted-foreground text-sm">Senha</Label>
            <div className="relative">
              <Lock weight="light" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input id="password" type={showPassword ? "text" : "password"} placeholder="Mínimo 6 caracteres" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 pr-10 bg-secondary border-border" required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPassword ? <EyeSlash weight="light" className="w-4 h-4" /> : <Eye weight="light" className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full glow-primary-sm" disabled={loading}>
            {loading ? "Criando conta..." : "Criar conta"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Já tem uma conta?{" "}
            <Link to="/login" className="text-primary hover:underline font-medium">Entrar</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
