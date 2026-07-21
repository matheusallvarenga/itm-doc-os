import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { TriangleLogo } from "@/components/TriangleLogo";

// Local typed wrapper — the supabase.auth.oauth namespace is in beta and its
// types may lag; keep this thin so we don't fight typings.
type OAuthClient = {
  getAuthorizationDetails: (id: string) => Promise<{
    data: {
      redirect_url?: string;
      redirect_to?: string;
      client?: { name?: string; client_uri?: string };
    } | null;
    error: { message: string } | null;
  }>;
  approveAuthorization: (id: string) => Promise<{
    data: { redirect_url?: string; redirect_to?: string } | null;
    error: { message: string } | null;
  }>;
  denyAuthorization: (id: string) => Promise<{
    data: { redirect_url?: string; redirect_to?: string } | null;
    error: { message: string } | null;
  }>;
};

const oauth = (supabase.auth as unknown as { oauth: OAuthClient }).oauth;

export default function OAuthConsent() {
  const [params] = useSearchParams();
  const authorizationId = params.get("authorization_id") ?? "";
  const [details, setDetails] = useState<{
    client?: { name?: string; client_uri?: string };
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!authorizationId) {
        setError("Missing authorization_id");
        return;
      }
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        // Preserve the FULL consent URL so auth returns the user back here.
        const next = window.location.pathname + window.location.search;
        window.location.href = "/login?next=" + encodeURIComponent(next);
        return;
      }
      const { data, error } = await oauth.getAuthorizationDetails(authorizationId);
      if (!active) return;
      if (error) {
        setError(error.message);
        return;
      }
      const immediate = data?.redirect_url ?? data?.redirect_to;
      if (immediate && !data?.client) {
        window.location.href = immediate;
        return;
      }
      setDetails(data);
    })();
    return () => {
      active = false;
    };
  }, [authorizationId]);

  async function decide(approve: boolean) {
    setBusy(true);
    const { data, error } = approve
      ? await oauth.approveAuthorization(authorizationId)
      : await oauth.denyAuthorization(authorizationId);
    if (error) {
      setBusy(false);
      setError(error.message);
      return;
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      setError("No redirect returned by the authorization server.");
      return;
    }
    window.location.href = target;
  }

  const clientName = details?.client?.name ?? "an app";

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-card border border-border/50 rounded-xl p-8 text-center space-y-4">
          <TriangleLogo size="lg" />
          <h1 className="text-xl font-semibold text-foreground">
            Não foi possível carregar esta autorização
          </h1>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm">Carregando autorização…</p>
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
          </div>
        </div>

        <div className="bg-card border border-border/50 rounded-xl p-8 space-y-6">
          <div className="space-y-2 text-center">
            <h2 className="text-xl font-semibold text-foreground">
              Conectar <span className="text-primary">{clientName}</span> à sua conta
            </h2>
            <p className="text-sm text-muted-foreground">
              Isso permite que {clientName} use este app agindo em seu nome —
              acessando seus roteiros, pacientes, simulações e demais dados
              protegidos por autenticação.
            </p>
          </div>

          <div className="rounded-lg bg-secondary/50 border border-border/50 p-4 text-xs text-muted-foreground space-y-1">
            <p className="text-foreground font-medium">O que este app poderá fazer:</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>Ler seu perfil e estatísticas</li>
              <li>Ler seus roteiros, pacientes e atividade recente</li>
              <li>Criar novos roteiros na sua biblioteca</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              disabled={busy}
              onClick={() => decide(false)}
            >
              Recusar
            </Button>
            <Button
              type="button"
              className="flex-1 glow-primary-sm"
              disabled={busy}
              onClick={() => decide(true)}
            >
              {busy ? "Autorizando…" : "Autorizar"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
