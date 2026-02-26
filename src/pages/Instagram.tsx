import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  InstagramLogo,
  Link as LinkIcon,
  Users,
  Heart,
  ChatCircle,
  Eye,
  ChartBar,
  SignOut,
  SpinnerGap,
  Warning,
  Image,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface IGProfile {
  id: string;
  username: string;
  account_type: string;
  media_count: number;
  followers_count?: number;
}

interface IGPost {
  id: string;
  caption?: string;
  media_type: string;
  timestamp: string;
  like_count?: number;
  comments_count?: number;
  permalink: string;
}

export default function InstagramPage() {
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [expired, setExpired] = useState(false);
  const [igProfile, setIgProfile] = useState<IGProfile | null>(null);
  const [posts, setPosts] = useState<IGPost[]>([]);
  const [tokenInput, setTokenInput] = useState("");
  const [igUserIdInput, setIgUserIdInput] = useState("");
  const [showManualConnect, setShowManualConnect] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const { data } = await supabase.functions.invoke("instagram-connect", {
        body: { action: "get_status" },
      });
      if (data?.connected && !data?.expired) {
        setConnected(true);
        setExpired(false);
        setIgProfile(data.profile || null);
        setPosts(data.posts || []);
      } else if (data?.connected && data?.expired) {
        setConnected(true);
        setExpired(true);
      } else {
        setConnected(false);
      }
    } catch {
      setConnected(false);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleManualConnect = async () => {
    if (!tokenInput || !igUserIdInput) {
      toast({ title: "Preencha todos os campos", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke("instagram-connect", {
        body: {
          action: "save_token",
          access_token: tokenInput,
          ig_user_id: igUserIdInput,
          username: "",
        },
      });
      if (error) throw error;
      toast({ title: "Instagram conectado com sucesso!" });
      setTokenInput("");
      setIgUserIdInput("");
      setShowManualConnect(false);
      fetchStatus();
    } catch (err: any) {
      toast({ title: "Erro ao conectar", description: err.message, variant: "destructive" });
    }
    setSaving(false);
  };

  const handleDisconnect = async () => {
    const { error } = await supabase.functions.invoke("instagram-connect", {
      body: { action: "disconnect" },
    });
    if (!error) {
      setConnected(false);
      setIgProfile(null);
      setPosts([]);
      toast({ title: "Instagram desconectado" });
    }
  };

  const totalLikes = posts.reduce((sum, p) => sum + (p.like_count || 0), 0);
  const totalComments = posts.reduce((sum, p) => sum + (p.comments_count || 0), 0);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
    if (diffDays === 0) return "Hoje";
    if (diffDays === 1) return "Ontem";
    return `Há ${diffDays} dias`;
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-20">
          <SpinnerGap size={32} className="text-primary animate-spin" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-8 animate-fade-in">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Meu <span className="accent-text">Instagram</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Analise suas métricas e descubra o que está funcionando
          </p>
        </div>

        {!connected ? (
          <div className="bg-card border border-border/50 rounded-xl p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-primary/10" />
            <div className="relative z-10 flex flex-col items-center text-center max-w-lg mx-auto">
              <div className="p-5 rounded-3xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 mb-6">
                <InstagramLogo weight="duotone" className="w-16 h-16 text-pink-400" />
              </div>
              <h2 className="text-2xl font-semibold text-foreground mb-3">Conecte seu Instagram</h2>
              <p className="text-muted-foreground mb-6">
                Vincule sua conta Instagram Business para receber análises automáticas dos seus posts e métricas de crescimento.
              </p>

              {!showManualConnect ? (
                <>
                  <Button
                    size="lg"
                    className="gap-2 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                    onClick={() => setShowManualConnect(true)}
                  >
                    <LinkIcon weight="bold" className="w-4 h-4" />
                    Conectar Instagram Business
                  </Button>
                  <p className="text-xs text-muted-foreground mt-4">
                    Requer conta Instagram Business ou Creator e um token de acesso do Meta for Developers
                  </p>
                </>
              ) : (
                <div className="w-full space-y-4 text-left">
                  <div className="bg-secondary/50 border border-border/50 rounded-lg p-4 text-sm text-muted-foreground">
                    <h4 className="font-medium text-foreground mb-2">Como obter o token:</h4>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Acesse <strong>developers.facebook.com</strong> e crie um App</li>
                      <li>Adicione o produto "Instagram Basic Display" ou "Instagram Graph API"</li>
                      <li>Gere um token de acesso de longa duração</li>
                      <li>Copie o Instagram User ID e o token abaixo</li>
                    </ol>
                  </div>
                  <Input
                    placeholder="Instagram User ID (ex: 17841405793187218)"
                    value={igUserIdInput}
                    onChange={(e) => setIgUserIdInput(e.target.value)}
                    className="bg-secondary border-border"
                  />
                  <Input
                    placeholder="Access Token"
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    className="bg-secondary border-border"
                    type="password"
                  />
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setShowManualConnect(false)} className="flex-1">
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleManualConnect}
                      disabled={saving}
                      className="flex-1 gap-2 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                    >
                      {saving ? <SpinnerGap className="w-4 h-4 animate-spin" /> : <LinkIcon weight="bold" className="w-4 h-4" />}
                      Conectar
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : expired ? (
          <div className="bg-card border border-border/50 rounded-xl p-12 text-center">
            <Warning weight="duotone" className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Token expirado</h2>
            <p className="text-muted-foreground mb-6">Seu token de acesso do Instagram expirou. Reconecte com um novo token.</p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={handleDisconnect}>Desconectar</Button>
              <Button onClick={() => { setConnected(false); setExpired(false); setShowManualConnect(true); }}>
                Reconectar
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Connected header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <InstagramLogo weight="duotone" className="w-6 h-6 text-pink-400" />
                <span className="text-foreground font-medium">@{igProfile?.username || "conectado"}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">Conectado</span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleDisconnect} className="text-muted-foreground gap-1">
                <SignOut className="w-4 h-4" />
                Desconectar
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Posts", value: igProfile?.media_count || 0, icon: Image, color: "text-primary" },
                { label: "Seguidores", value: igProfile?.followers_count || "N/A", icon: Users, color: "text-blue-400" },
                { label: "Curtidas (últimos)", value: totalLikes, icon: Heart, color: "text-red-400" },
                { label: "Comentários (últimos)", value: totalComments, icon: ChatCircle, color: "text-yellow-400" },
              ].map((stat) => (
                <div key={stat.label} className="bg-card border border-border/50 rounded-xl p-5">
                  <stat.icon weight="duotone" className={cn("w-5 h-5 mb-3", stat.color)} />
                  <p className="text-2xl font-bold text-foreground">{typeof stat.value === "number" ? stat.value.toLocaleString() : stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Recent posts */}
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4">Posts Recentes</h2>
              <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left text-sm font-medium text-muted-foreground p-4">Post</th>
                      <th className="text-left text-sm font-medium text-muted-foreground p-4">Curtidas</th>
                      <th className="text-left text-sm font-medium text-muted-foreground p-4">Comentários</th>
                      <th className="text-left text-sm font-medium text-muted-foreground p-4">Tipo</th>
                      <th className="text-left text-sm font-medium text-muted-foreground p-4">Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {posts.map((post) => (
                      <tr key={post.id} className="border-b border-border/30 last:border-0 hover:bg-secondary/30 transition-colors">
                        <td className="p-4">
                          <a href={post.permalink} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm truncate max-w-[200px] block">
                            {post.caption?.slice(0, 50) || "Sem legenda"}
                          </a>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1">
                            <Heart weight="fill" className="w-3 h-3 text-red-400" />
                            <span className="text-foreground">{(post.like_count || 0).toLocaleString()}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1">
                            <ChatCircle weight="duotone" className="w-3 h-3 text-primary" />
                            <span className="text-foreground">{post.comments_count || 0}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="text-xs px-2 py-1 rounded-full bg-secondary text-muted-foreground">
                            {post.media_type === "VIDEO" ? "Reels/Vídeo" : post.media_type === "CAROUSEL_ALBUM" ? "Carrossel" : "Foto"}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">{formatDate(post.timestamp)}</td>
                      </tr>
                    ))}
                    {posts.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-muted-foreground">Nenhum post encontrado</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Info section */}
        <div className="bg-secondary/30 border border-border/30 rounded-xl p-6">
          <h3 className="font-medium text-foreground mb-3">
            Por que conectar o <span className="accent-text">Instagram</span>?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
            <div className="flex gap-3">
              <span className="text-primary font-bold">1.</span>
              <p>Veja quais tipos de conteúdo geram mais engajamento</p>
            </div>
            <div className="flex gap-3">
              <span className="text-primary font-bold">2.</span>
              <p>Receba insights personalizados baseados nos seus dados</p>
            </div>
            <div className="flex gap-3">
              <span className="text-primary font-bold">3.</span>
              <p>Compare seu crescimento semana a semana</p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
