import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { User, Mail, Phone, MapPin, Briefcase, Calendar, Award, Trophy, FileText, Video, Target, Edit2 } from "lucide-react";
import { cn } from "@/lib/utils";

const stats = [
  { label: "Roteiros criados", value: 24, icon: FileText, color: "text-primary" },
  { label: "Vídeos analisados", value: 8, icon: Video, color: "text-purple-400" },
  { label: "Pacientes decodificados", value: 15, icon: Target, color: "text-green-400" },
  { label: "Simulações completadas", value: 12, icon: Trophy, color: "text-yellow-400" },
];

const badges = [
  { id: 1, name: "Primeiro Roteiro", icon: "🎬", earned: true },
  { id: 2, name: "Streak de 7 dias", icon: "🔥", earned: true },
  { id: 3, name: "Top 10 Ranking", icon: "🏆", earned: true },
  { id: 4, name: "Mestre do Eneagrama", icon: "🎯", earned: false },
  { id: 5, name: "Comunicador Expert", icon: "⭐", earned: false },
  { id: 6, name: "100 Roteiros", icon: "💎", earned: false },
];

const activityHistory = [
  { action: "Criou roteiro de Reels", date: "Hoje, 14:30" },
  { action: "Analisou vídeo sobre Botox", date: "Hoje, 10:15" },
  { action: "Completou simulação 'Paciente Indeciso'", date: "Ontem, 16:45" },
  { action: "Decodificou paciente (Tipo 7)", date: "Ontem, 09:20" },
];

export default function Perfil() {
  return (
    <AppLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Meu <span className="accent-text">Perfil</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie suas informações e acompanhe seu progresso
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile card */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border/50 rounded-xl p-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
              
              <div className="relative z-10">
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center mb-4">
                    <User className="w-12 h-12 text-primary-foreground" />
                  </div>
                  <h2 className="text-xl font-semibold text-foreground">Dr. Marcel Pita</h2>
                  <p className="text-sm text-muted-foreground">Ortopedista</p>
                  <div className="flex items-center gap-1 mt-2">
                    <Award className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm text-yellow-400">Nível 5</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">marcel.pita@clinica.com</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">(11) 99999-9999</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">São Paulo, SP</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Briefcase className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Clínica Ortopédica Pita</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Membro desde Mar 2024</span>
                  </div>
                </div>

                <Button variant="outline" className="w-full mt-6 gap-2">
                  <Edit2 className="w-4 h-4" />
                  Editar Perfil
                </Button>
              </div>
            </div>
          </div>

          {/* Stats and activity */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((stat) => (
                <div key={stat.label} className="bg-card border border-border/50 rounded-xl p-4">
                  <stat.icon className={cn("w-5 h-5 mb-2", stat.color)} />
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Badges */}
            <div className="bg-card border border-border/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Conquistas</h3>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                {badges.map((badge) => (
                  <div 
                    key={badge.id}
                    className={cn(
                      "flex flex-col items-center text-center p-3 rounded-lg transition-all",
                      badge.earned 
                        ? "bg-primary/10 border border-primary/30" 
                        : "bg-secondary/50 opacity-50"
                    )}
                  >
                    <span className="text-2xl mb-1">{badge.icon}</span>
                    <span className="text-xs text-muted-foreground">{badge.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent activity */}
            <div className="bg-card border border-border/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Atividade Recente</h3>
                <Button variant="ghost" className="text-primary text-sm">
                  Ver tudo
                </Button>
              </div>
              
              <div className="space-y-3">
                {activityHistory.map((activity, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between py-3 border-b border-border/30 last:border-0"
                  >
                    <span className="text-foreground">{activity.action}</span>
                    <span className="text-sm text-muted-foreground">{activity.date}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Mentorship info */}
            <div className="bg-secondary/30 border border-border/30 rounded-xl p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Award className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Travessia 2 - Turma 08</h3>
                  <p className="text-sm text-muted-foreground">
                    Mentoria iniciada em Março de 2024 • 85% do conteúdo completado
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
