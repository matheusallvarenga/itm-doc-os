import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, FileText, Copy, DotsThreeVertical, Sparkle, VideoCamera, InstagramLogo, Megaphone, Trash, X, CircleNotch } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Script {
  id: string;
  title: string;
  type: string;
  content: string | null;
  status: string;
  created_at: string;
}

const templatesBySpecialty: Record<string, { title: string; description: string; icon: any }[]> = {
  "Ortopedia": [
    { title: "Dor que você ignora", description: "Fale sobre sintomas que pacientes subestimam", icon: Sparkle },
    { title: "Mitos sobre cirurgia", description: "Desfaça medos comuns sobre procedimentos", icon: VideoCamera },
    { title: "Exercícios que pioram", description: "Alerte sobre práticas que lesionam", icon: InstagramLogo },
    { title: "Quando procurar ajuda", description: "Sinais de alerta que não podem esperar", icon: Megaphone },
  ],
  "default": [
    { title: "Mitos da sua área", description: "Desfaça mitos comuns da sua especialidade", icon: Sparkle },
    { title: "Caso de sucesso", description: "Compartilhe um resultado impressionante", icon: VideoCamera },
    { title: "Dica rápida", description: "Uma dica prática para o dia a dia", icon: InstagramLogo },
    { title: "Quando procurar ajuda", description: "Sinais de alerta que não podem esperar", icon: Megaphone },
  ],
};

const typeIcons: Record<string, { icon: any; color: string }> = {
  "Reels": { icon: VideoCamera, color: "text-pink-400 bg-pink-500/10" },
  "Stories": { icon: InstagramLogo, color: "text-purple-400 bg-purple-500/10" },
  "Anúncio": { icon: Megaphone, color: "text-yellow-400 bg-yellow-500/10" },
};

export default function Roteiros() {
  const { user, profile } = useAuth();
  const [scripts, setScripts] = useState<Script[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Todos");
  const [showCreate, setShowCreate] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [newTopic, setNewTopic] = useState("");
  const [newType, setNewType] = useState("Reels");
  const [viewScript, setViewScript] = useState<Script | null>(null);

  const specialty = profile?.specialty || "default";
  const templates = templatesBySpecialty[specialty] || templatesBySpecialty["default"];

  const fetchScripts = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("scripts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (!error && data) setScripts(data);
    setLoading(false);
  };

  useEffect(() => { fetchScripts(); }, [user]);

  const handleGenerate = async (topic: string, type: string) => {
    if (!user || !topic.trim()) return;
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-script", {
        body: { topic, type, specialty: profile?.specialty || "" },
      });
      if (error) throw error;

      const { error: insertError } = await supabase.from("scripts").insert({
        user_id: user.id,
        title: `${type}: ${topic}`,
        type,
        content: data.content,
        status: "completo",
      });
      if (insertError) throw insertError;

      toast({ title: "Roteiro criado!", description: "Seu roteiro foi gerado com sucesso." });
      setShowCreate(false);
      setNewTopic("");
      fetchScripts();
    } catch (e: any) {
      toast({ title: "Erro ao gerar", description: e.message, variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from("scripts").delete().eq("id", id);
    setScripts(scripts.filter(s => s.id !== id));
    toast({ title: "Roteiro excluído" });
  };

  const handleCopy = (content: string | null) => {
    if (content) {
      navigator.clipboard.writeText(content);
      toast({ title: "Copiado!" });
    }
  };

  const filteredScripts = filter === "Todos" ? scripts : scripts.filter(s => s.type === filter);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return "Agora";
    if (hours < 24) return `Há ${hours}h`;
    const days = Math.floor(hours / 24);
    if (days === 1) return "Ontem";
    return `Há ${days} dias`;
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              Gerador de <span className="accent-text">Roteiros</span>
            </h1>
            <p className="text-muted-foreground mt-1">
              Roteiros personalizados para <span className="text-primary">{profile?.specialty || "sua especialidade"}</span>
            </p>
          </div>
          <Button className="gap-2 glow-primary-sm" onClick={() => setShowCreate(true)}>
            <Plus weight="bold" className="w-4 h-4" />
            Criar Roteiro
          </Button>
        </div>

        {/* Quick templates */}
        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-3">
            Sugestões para {profile?.specialty || "você"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {templates.map((template, index) => (
              <div
                key={index}
                className="bg-card border border-border/50 rounded-xl p-4 card-hover cursor-pointer group"
                onClick={() => { setNewTopic(template.title); setShowCreate(true); }}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <template.icon weight="duotone" className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-foreground truncate">{template.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{template.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          {["Todos", "Reels", "Stories", "Anúncio"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                filter === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground hover:text-foreground border border-border/50"
              )}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Scripts list */}
        {loading ? (
          <div className="flex justify-center py-12">
            <CircleNotch weight="bold" className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : filteredScripts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <FileText weight="duotone" className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Nenhum roteiro ainda. Crie seu primeiro!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredScripts.map((script) => {
              const typeStyle = typeIcons[script.type] || typeIcons["Reels"];
              return (
                <div
                  key={script.id}
                  className="bg-card border border-border/50 rounded-xl p-5 card-hover flex items-center justify-between cursor-pointer"
                  onClick={() => setViewScript(script)}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn("p-3 rounded-lg", typeStyle.color)}>
                      <typeStyle.icon weight="duotone" className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">{script.title}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-muted-foreground">{script.type}</span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">{formatDate(script.created_at)}</span>
                        <span className={cn("text-xs px-2 py-0.5 rounded-full", script.status === "completo" ? "badge-success" : "badge-pending")}>
                          {script.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary" onClick={() => handleCopy(script.content)}>
                      <Copy weight="regular" className="w-4 h-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-muted-foreground">
                          <DotsThreeVertical weight="bold" className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleCopy(script.content)}>
                          <Copy weight="regular" className="w-4 h-4 mr-2" /> Copiar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(script.id)} className="text-destructive">
                          <Trash weight="regular" className="w-4 h-4 mr-2" /> Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-secondary/30 border border-border/30 rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <FileText weight="duotone" className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{scripts.length}</p>
                <p className="text-sm text-muted-foreground">Roteiros criados</p>
              </div>
            </div>
          </div>
          <div className="bg-secondary/30 border border-border/30 rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-pink-500/10">
                <VideoCamera weight="duotone" className="w-5 h-5 text-pink-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{scripts.filter(s => s.type === "Reels").length}</p>
                <p className="text-sm text-muted-foreground">Reels gerados</p>
              </div>
            </div>
          </div>
          <div className="bg-secondary/30 border border-border/30 rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Sparkle weight="duotone" className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{scripts.filter(s => s.status === "completo").length}</p>
                <p className="text-sm text-muted-foreground">Completos</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Novo Roteiro</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Tipo</label>
              <div className="flex gap-2">
                {["Reels", "Stories", "Anúncio"].map(t => (
                  <button
                    key={t}
                    onClick={() => setNewType(t)}
                    className={cn("px-4 py-2 text-sm rounded-lg border transition-colors", newType === t ? "bg-primary text-primary-foreground border-primary" : "bg-secondary border-border text-muted-foreground")}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Tema / Assunto</label>
              <Input
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                placeholder="Ex: Dor no joelho ao subir escadas"
                className="bg-secondary border-border"
              />
            </div>
            <Button
              className="w-full gap-2"
              disabled={generating || !newTopic.trim()}
              onClick={() => handleGenerate(newTopic, newType)}
            >
              {generating ? (
                <>
                  <CircleNotch weight="bold" className="w-4 h-4 animate-spin" />
                  Gerando com IA...
                </>
              ) : (
                <>
                  <Sparkle weight="bold" className="w-4 h-4" />
                  Gerar Roteiro
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Script Dialog */}
      <Dialog open={!!viewScript} onOpenChange={() => setViewScript(null)}>
        <DialogContent className="bg-card border-border max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{viewScript?.title}</DialogTitle>
          </DialogHeader>
          <div className="prose prose-sm prose-invert max-w-none">
            <pre className="whitespace-pre-wrap text-sm text-foreground bg-secondary/50 p-4 rounded-lg">
              {viewScript?.content || "Sem conteúdo"}
            </pre>
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1 gap-2" onClick={() => handleCopy(viewScript?.content || "")}>
              <Copy weight="regular" className="w-4 h-4" /> Copiar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
