import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { VideoCamera, Upload, Link, Play, Clock, TrendUp, Star, ChartBar } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const recentVideos = [
  { 
    id: 1, 
    title: "Explicando Botox", 
    score: 78, 
    duration: "1:45",
    date: "Há 2 dias",
    thumbnail: "🎬"
  },
  { 
    id: 2, 
    title: "Depoimento de Paciente", 
    score: 92, 
    duration: "2:30",
    date: "Há 5 dias",
    thumbnail: "🎬"
  },
  { 
    id: 3, 
    title: "Antes e Depois Harmonização", 
    score: 65, 
    duration: "0:58",
    date: "Há 1 semana",
    thumbnail: "🎬"
  },
];

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

export default function Videos() {
  return (
    <AppLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Analisar <span className="accent-text">Vídeo</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Receba feedback detalhado sobre seus vídeos e melhore sua comunicação
          </p>
        </div>

        {/* Upload section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-card border border-border/50 rounded-xl p-8 relative overflow-hidden group cursor-pointer card-hover">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="p-4 rounded-2xl bg-primary/10 mb-4 glow-primary-sm">
                <Upload weight="duotone" className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Fazer Upload
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Arraste um vídeo ou clique para selecionar
              </p>
              <p className="text-xs text-muted-foreground">
                MP4, MOV até 100MB
              </p>
            </div>
          </div>

          <div className="bg-card border border-border/50 rounded-xl p-8 relative overflow-hidden group cursor-pointer card-hover">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="p-4 rounded-2xl bg-cyan-500/10 mb-4">
                <Link weight="duotone" className="w-10 h-10 text-cyan-400" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Colar Link
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Instagram, YouTube ou TikTok
              </p>
              <div className="w-full">
                <input 
                  type="text" 
                  placeholder="Cole o link do vídeo aqui..."
                  className="w-full bg-secondary border border-border rounded-lg px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card border border-border/50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <VideoCamera weight="duotone" className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xl font-bold text-foreground">8</p>
                <p className="text-xs text-muted-foreground">Vídeos analisados</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border/50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <Star weight="fill" className="w-5 h-5 text-yellow-400" />
              <div>
                <p className="text-xl font-bold text-foreground">78%</p>
                <p className="text-xs text-muted-foreground">Score médio</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border/50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <TrendUp weight="bold" className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-xl font-bold text-foreground">+12%</p>
                <p className="text-xs text-muted-foreground">Melhoria</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border/50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <ChartBar weight="duotone" className="w-5 h-5 text-purple-400" />
              <div>
                <p className="text-xl font-bold text-foreground">Gancho</p>
                <p className="text-xs text-muted-foreground">Ponto forte</p>
              </div>
            </div>
          </div>
        </div>

        {/* Criteria info */}
        <div className="bg-secondary/30 border border-border/30 rounded-xl p-6">
          <h3 className="font-medium text-foreground mb-4">
            10 Critérios de <span className="accent-text">Análise</span>
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {analysisCriteria.map((criteria) => (
              <div key={criteria.name} className="flex items-center gap-2 text-sm">
                <span className="text-primary font-bold">{criteria.weight}%</span>
                <span className="text-muted-foreground">{criteria.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent videos */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">
              Vídeos Analisados
            </h2>
            <Button variant="ghost" className="text-primary text-sm">
              Ver todos
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentVideos.map((video) => (
              <div
                key={video.id}
                className="bg-card border border-border/50 rounded-xl overflow-hidden card-hover cursor-pointer"
              >
                {/* Thumbnail */}
                <div className="aspect-video bg-secondary flex items-center justify-center relative group">
                  <span className="text-4xl">{video.thumbnail}</span>
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="p-3 rounded-full bg-primary/20 backdrop-blur-sm">
                      <Play weight="fill" className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-0.5 rounded text-xs text-white">
                    {video.duration}
                  </div>
                </div>
                
                {/* Info */}
                <div className="p-4">
                  <h4 className="font-medium text-foreground mb-2">{video.title}</h4>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-2 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full rounded-full",
                            video.score >= 80 ? "bg-green-500" : video.score >= 60 ? "bg-yellow-500" : "bg-red-500"
                          )}
                          style={{ width: `${video.score}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-foreground">{video.score}%</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock weight="light" className="w-3 h-3" />
                      {video.date}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
