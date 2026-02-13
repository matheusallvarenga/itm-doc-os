import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { InstagramLogo, Link, Users, Heart, ChatCircle, TrendUp, Eye, ChartBar } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const stats = [
  { label: "Seguidores", value: "12.4K", change: "+234", icon: Users, color: "text-primary" },
  { label: "Curtidas (7d)", value: "3.2K", change: "+18%", icon: Heart, color: "text-red-400" },
  { label: "Comentários (7d)", value: "156", change: "+12%", icon: ChatCircle, color: "text-yellow-400" },
  { label: "Alcance (7d)", value: "45K", change: "+25%", icon: Eye, color: "text-green-400" },
];

const recentPosts = [
  { 
    id: 1, 
    type: "Reels",
    likes: 1234,
    comments: 45,
    reach: 15000,
    engagement: 8.2,
    status: "Alto desempenho",
    date: "Há 2 dias"
  },
  { 
    id: 2, 
    type: "Carrossel",
    likes: 890,
    comments: 32,
    reach: 8500,
    engagement: 5.1,
    status: "Bom",
    date: "Há 4 dias"
  },
  { 
    id: 3, 
    type: "Foto",
    likes: 456,
    comments: 12,
    reach: 4200,
    engagement: 3.8,
    status: "Abaixo da média",
    date: "Há 6 dias"
  },
];

const statusColors: Record<string, string> = {
  "Alto desempenho": "bg-green-500/20 text-green-400",
  "Bom": "bg-yellow-500/20 text-yellow-400",
  "Abaixo da média": "bg-red-500/20 text-red-400",
};

export default function InstagramPage() {
  const isConnected = false;

  return (
    <AppLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Meu <span className="accent-text">Instagram</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Analise suas métricas e descubra o que está funcionando
          </p>
        </div>

        {!isConnected ? (
          /* Connect section */
          <div className="bg-card border border-border/50 rounded-xl p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-primary/10" />
            
            <div className="relative z-10 flex flex-col items-center text-center max-w-md mx-auto">
              <div className="p-5 rounded-3xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 mb-6">
                <InstagramLogo weight="duotone" className="w-16 h-16 text-pink-400" />
              </div>
              
              <h2 className="text-2xl font-semibold text-foreground mb-3">
                Conecte seu Instagram
              </h2>
              <p className="text-muted-foreground mb-6">
                Vincule sua conta Business do Instagram para receber análises automáticas 
                dos seus posts e métricas de crescimento.
              </p>
              
              <Button size="lg" className="gap-2 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600">
                <Link weight="bold" className="w-4 h-4" />
                Conectar Instagram Business
              </Button>
              
              <p className="text-xs text-muted-foreground mt-4">
                Requer conta Instagram Business ou Creator
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((stat) => (
                <div key={stat.label} className="bg-card border border-border/50 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <stat.icon weight="duotone" className={cn("w-5 h-5", stat.color)} />
                    <span className="text-xs text-green-400">{stat.change}</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Performance chart placeholder */}
            <div className="bg-card border border-border/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-foreground">
                  Desempenho Semanal
                </h2>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">7 dias</Button>
                  <Button variant="ghost" size="sm">30 dias</Button>
                  <Button variant="ghost" size="sm">90 dias</Button>
                </div>
              </div>
              
              <div className="h-64 flex items-center justify-center border border-dashed border-border rounded-lg">
                <div className="text-center">
                  <ChartBar weight="duotone" className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Gráfico de desempenho</p>
                </div>
              </div>
            </div>

            {/* Recent posts */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">
                  Posts Recentes
                </h2>
                <Button variant="ghost" className="text-primary text-sm">
                  Ver todos
                </Button>
              </div>

              <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left text-sm font-medium text-muted-foreground p-4">Post</th>
                      <th className="text-left text-sm font-medium text-muted-foreground p-4">Curtidas</th>
                      <th className="text-left text-sm font-medium text-muted-foreground p-4">Comentários</th>
                      <th className="text-left text-sm font-medium text-muted-foreground p-4">Alcance</th>
                      <th className="text-left text-sm font-medium text-muted-foreground p-4">Engajamento</th>
                      <th className="text-left text-sm font-medium text-muted-foreground p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentPosts.map((post) => (
                      <tr key={post.id} className="border-b border-border/30 last:border-0 hover:bg-secondary/30 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-xs text-muted-foreground">
                              📷
                            </div>
                            <div>
                              <span className="text-foreground">{post.type}</span>
                              <p className="text-xs text-muted-foreground">{post.date}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1">
                            <Heart weight="fill" className="w-3 h-3 text-red-400" />
                            <span className="text-foreground">{post.likes.toLocaleString()}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1">
                            <ChatCircle weight="duotone" className="w-3 h-3 text-primary" />
                            <span className="text-foreground">{post.comments}</span>
                          </div>
                        </td>
                        <td className="p-4 text-foreground">{post.reach.toLocaleString()}</td>
                        <td className="p-4">
                          <span className="text-foreground">{post.engagement}%</span>
                        </td>
                        <td className="p-4">
                          <span className={cn("text-xs px-2 py-1 rounded-full", statusColors[post.status])}>
                            {post.status}
                          </span>
                        </td>
                      </tr>
                    ))}
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
