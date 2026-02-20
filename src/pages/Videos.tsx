import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VideoCamera, Upload, Link, Play, Clock, TrendUp, Star, ChartBar, CircleNotch, ArrowLeft, CheckCircle, WarningCircle, Lightbulb } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

const analysisCriteria = [
  { name: "Gancho inicial", weight: 15 },
  { name: "Clareza da mensagem", weight: 15 },
  { name: "Linguagem corporal", weight: 10 },
  { name: "Tom de voz", weight: 10 },
  { name: "Call to action", weight: 15 },
  { name: "Enquadramento", weight: 10 },
  { name: "Iluminação", weight: 5 },
  { name: "Áudio", weight: 5 },
  { name: "Duração ideal", weight: 5 },
  { name: "Storytelling", weight: 10 },
];

interface VideoRow {
  id: string; title: string; url: string | null; score: number | null; duration: string | null; analysis: any; created_at: string;
}

interface VideoAnalysis {
  score: number;
  strengths: string[];
  improvements: string[];
  criteriaScores: { name: string; score: number; comment: string }[];
  recommendation: string;
}

export default function Videos() {
  const { user } = useAuth();
  const [videos, setVideos] = useState<VideoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [videoUrl, setVideoUrl] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<VideoRow | null>(null);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase.from("videos").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      if (data) setVideos(data);
      setLoading(false);
    };
    load();
  }, [user, analyzing]);

  const handleAnalyzeUrl = async () => {
    if (!videoUrl.trim() || !user) { toast({ title: "Cole um link de vídeo" }); return; }
    const title = videoTitle.trim() || `Vídeo ${videos.length + 1}`;
    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-video", {
        body: { videoUrl, title },
      });
      if (error) throw error;
      const analysis = data.analysis as VideoAnalysis;

      await supabase.from("videos").insert({ user_id: user.id, title, url: videoUrl, score: analysis.score, analysis: analysis as any });
      await supabase.from("activity_log").insert({ user_id: user.id, type: "video", description: `Analisou: ${title} - Score: ${analysis.score}`, points: 5 });

      toast({ title: "Vídeo analisado!", description: `Score: ${analysis.score}%` });
      setVideoUrl("");
      setVideoTitle("");
    } catch (e: any) {
      toast({ title: "Erro na análise", description: e.message, variant: "destructive" });
    } finally {
      setAnalyzing(false);
    }
  };

  const totalVideos = videos.length;
  const avgScore = totalVideos > 0 ? Math.round(videos.reduce((sum, v) => sum + (v.score || 0), 0) / totalVideos) : 0;

  if (selectedVideo) {
    const analysis = selectedVideo.analysis as VideoAnalysis | null;
    return (
      <AppLayout>
        <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setSelectedVideo(null)}><ArrowLeft weight="bold" className="w-5 h-5" /></Button>
            <h1 className="text-xl font-semibold text-foreground">{selectedVideo.title}</h1>
          </div>
          {analysis && (
            <>
              <div className="bg-card border border-border/50 rounded-xl p-8 text-center">
                <p className="text-6xl font-bold text-primary mb-2">{analysis.score}%</p>
                <p className="text-muted-foreground">{analysis.score >= 80 ? "Excelente!" : analysis.score >= 60 ? "Bom, pode melhorar" : "Precisa de ajustes"}</p>
              </div>
              {analysis.criteriaScores && (
                <div className="bg-card border border-border/50 rounded-xl p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-4">Critérios de Análise</h2>
                  <div className="space-y-3">
                    {analysis.criteriaScores.map((c, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground w-40">{c.name}</span>
                        <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden"><div className={cn("h-full rounded-full", c.score >= 80 ? "bg-green-500" : c.score >= 60 ? "bg-yellow-500" : "bg-red-500")} style={{ width: `${c.score}%` }} /></div>
                        <span className="text-sm font-medium w-10 text-right">{c.score}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {analysis.strengths?.length > 0 && (
                <div className="bg-card border border-border/50 rounded-xl p-6 border-l-4 border-l-green-500">
                  <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2"><CheckCircle weight="fill" className="w-5 h-5 text-green-400" />Pontos Fortes</h2>
                  <ul className="space-y-2">{analysis.strengths.map((s, i) => <li key={i} className="text-sm text-muted-foreground flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5" />{s}</li>)}</ul>
                </div>
              )}
              {analysis.improvements?.length > 0 && (
                <div className="bg-card border border-border/50 rounded-xl p-6 border-l-4 border-l-yellow-500">
                  <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2"><WarningCircle weight="fill" className="w-5 h-5 text-yellow-400" />Melhorias</h2>
                  <ul className="space-y-2">{analysis.improvements.map((s, i) => <li key={i} className="text-sm text-muted-foreground flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-1.5" />{s}</li>)}</ul>
                </div>
              )}
              {analysis.recommendation && (
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-3"><Lightbulb weight="duotone" className="w-5 h-5 text-primary" /><h3 className="font-semibold text-foreground">Recomendação</h3></div>
                  <p className="text-muted-foreground">{analysis.recommendation}</p>
                </div>
              )}
            </>
          )}
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-8 animate-fade-in">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Analisar <span className="accent-text">Vídeo</span></h1>
          <p className="text-muted-foreground mt-1">Receba feedback detalhado com IA sobre seus vídeos</p>
        </div>

        <div className="bg-card border border-border/50 rounded-xl p-8">
          <div className="flex flex-col items-center text-center">
            <div className="p-4 rounded-2xl bg-primary/10 mb-4"><Link weight="duotone" className="w-10 h-10 text-primary" /></div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Analisar por Link</h3>
            <div className="w-full max-w-md space-y-3">
              <Input placeholder="Título do vídeo (opcional)" value={videoTitle} onChange={(e) => setVideoTitle(e.target.value)} />
              <Input placeholder="Cole o link do vídeo (Instagram, YouTube, TikTok)" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} />
              <Button className="w-full gap-2" onClick={handleAnalyzeUrl} disabled={analyzing}>
                {analyzing ? <CircleNotch weight="bold" className="w-5 h-5 animate-spin" /> : <Play weight="bold" className="w-5 h-5" />}
                {analyzing ? "Analisando..." : "Analisar Vídeo"}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card border border-border/50 rounded-xl p-4">
            <div className="flex items-center gap-3"><VideoCamera weight="duotone" className="w-5 h-5 text-primary" /><div><p className="text-xl font-bold text-foreground">{totalVideos}</p><p className="text-xs text-muted-foreground">Vídeos analisados</p></div></div>
          </div>
          <div className="bg-card border border-border/50 rounded-xl p-4">
            <div className="flex items-center gap-3"><Star weight="fill" className="w-5 h-5 text-yellow-400" /><div><p className="text-xl font-bold text-foreground">{avgScore}%</p><p className="text-xs text-muted-foreground">Score médio</p></div></div>
          </div>
          <div className="bg-card border border-border/50 rounded-xl p-4">
            <div className="flex items-center gap-3"><ChartBar weight="duotone" className="w-5 h-5 text-purple-400" /><div><p className="text-xl font-bold text-foreground">IA Real</p><p className="text-xs text-muted-foreground">Análise inteligente</p></div></div>
          </div>
        </div>

        <div className="bg-secondary/30 border border-border/30 rounded-xl p-6">
          <h3 className="font-medium text-foreground mb-4">10 Critérios de <span className="accent-text">Análise</span></h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {analysisCriteria.map((c) => (
              <div key={c.name} className="flex items-center gap-2 text-sm"><span className="text-primary font-bold">{c.weight}%</span><span className="text-muted-foreground">{c.name}</span></div>
            ))}
          </div>
        </div>

        {videos.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">Vídeos Analisados</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {videos.map((video) => (
                <div key={video.id} onClick={() => setSelectedVideo(video)} className="bg-card border border-border/50 rounded-xl overflow-hidden card-hover cursor-pointer">
                  <div className="aspect-video bg-secondary flex items-center justify-center relative group">
                    <span className="text-4xl">🎬</span>
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="p-3 rounded-full bg-primary/20 backdrop-blur-sm"><Play weight="fill" className="w-6 h-6 text-primary" /></div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h4 className="font-medium text-foreground mb-2">{video.title}</h4>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-2 bg-secondary rounded-full overflow-hidden"><div className={cn("h-full rounded-full", (video.score || 0) >= 80 ? "bg-green-500" : (video.score || 0) >= 60 ? "bg-yellow-500" : "bg-red-500")} style={{ width: `${video.score || 0}%` }} /></div>
                        <span className="text-sm font-medium text-foreground">{video.score || 0}%</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground"><Clock weight="light" className="w-3 h-3" />{new Date(video.created_at).toLocaleDateString("pt-BR")}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
