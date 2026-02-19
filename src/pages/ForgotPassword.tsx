import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TriangleLogo } from "@/components/TriangleLogo";
import { toast } from "@/hooks/use-toast";
import { EnvelopeSimple, ArrowLeft } from "@phosphor-icons/react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      setSent(true);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-glow" />
      <div className="relative z-10 w-full max-w-md space-y-8">
        <div className="flex flex-col items-center gap-4">
          <TriangleLogo size="lg" animate />
          <h1 className="text-2xl font-semibold text-foreground">Recuperar Senha</h1>
        </div>

        <div className="bg-card border border-border/50 rounded-xl p-8 space-y-6">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
                <EnvelopeSimple weight="duotone" className="w-8 h-8 text-primary" />
              </div>
              <p className="text-muted-foreground text-sm">
                Enviamos instruções de recuperação para <strong className="text-foreground">{email}</strong>.
              </p>
              <Link to="/login"><Button variant="outline">Voltar para Login</Button></Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <p className="text-muted-foreground text-sm">Informe seu email para receber um link de redefinição.</p>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-muted-foreground text-sm">Email</Label>
                <Input id="email" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-secondary border-border" required />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Enviando..." : "Enviar link de recuperação"}
              </Button>
              <Link to="/login" className="flex items-center gap-2 justify-center text-sm text-primary hover:underline">
                <ArrowLeft weight="bold" className="w-4 h-4" /> Voltar para Login
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
