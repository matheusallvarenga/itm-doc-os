import { AppLayout } from "@/components/layout/AppLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { ModuleCard } from "@/components/dashboard/ModuleCard";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { WeeklyProgress } from "@/components/dashboard/WeeklyProgress";
import {
  FileText,
  Crosshair,
  ChatCircle,
  VideoCamera,
  ChartBar,
  Trophy,
  Flame,
  Lightning,
} from "@phosphor-icons/react";

const stats = [
  {
    title: "Roteiros Criados",
    value: 24,
    subtitle: "Este mês",
    icon: FileText,
    trend: { value: 12, isPositive: true },
  },
  {
    title: "Vídeos Analisados",
    value: 8,
    subtitle: "Nota média: 7.8",
    icon: VideoCamera,
    trend: { value: 25, isPositive: true },
  },
  {
    title: "Streak Atual",
    value: "7 dias",
    subtitle: "Melhor: 14 dias",
    icon: Flame,
  },
  {
    title: "Pontuação",
    value: 1250,
    subtitle: "#12 no ranking",
    icon: Trophy,
    trend: { value: 8, isPositive: true },
  },
];

const modules = [
  {
    title: "Gerador de Roteiros",
    description: "Crie roteiros de alta conversão para seus vídeos de forma automática",
    icon: FileText,
    href: "/roteiros",
    accentWord: "alta conversão",
  },
  {
    title: "Decodificar Paciente",
    description: "Descubra o código do seu paciente e saiba exatamente como conduzi-lo",
    icon: Crosshair,
    href: "/decodificar",
    accentWord: "código",
  },
  {
    title: "Simulador de Consulta",
    description: "Treine suas habilidades de comunicação com pacientes virtuais",
    icon: ChatCircle,
    href: "/simulador",
    accentWord: "comunicação",
  },
  {
    title: "Analisar Vídeo",
    description: "Receba feedback detalhado e melhore sua performance em vídeos",
    icon: VideoCamera,
    href: "/videos",
    accentWord: "performance",
  },
  {
    title: "Meu Instagram",
    description: "Acompanhe suas métricas e entenda o que gera mais engajamento",
    icon: ChartBar,
    href: "/instagram",
    accentWord: "engajamento",
  },
  {
    title: "Ranking",
    description: "Veja sua posição e conquiste o topo do ranking semanal",
    icon: Trophy,
    href: "/ranking",
    accentWord: "topo",
  },
];

export default function Index() {
  return (
    <AppLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Welcome section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-foreground">
              Olá, <span className="accent-text">Dr. Carlos</span>
            </h1>
            <p className="text-muted-foreground mt-1">
              Bem-vindo ao seu painel de <span className="accent-text">poder</span>
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg border border-primary/20">
            <Lightning weight="bold" className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-foreground">
              Turma <span className="text-primary">Travessia 2</span>
            </span>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div
              key={stat.title}
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <StatCard {...stat} />
            </div>
          ))}
        </div>

        {/* Modules grid */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Módulos
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {modules.map((module, index) => (
              <div
                key={module.title}
                className="animate-fade-in-up"
                style={{ animationDelay: `${(index + 4) * 100}ms` }}
              >
                <ModuleCard {...module} />
              </div>
            ))}
          </div>
        </div>

        {/* Bottom section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="animate-fade-in-up" style={{ animationDelay: "1000ms" }}>
            <WeeklyProgress />
          </div>
          <div className="animate-fade-in-up" style={{ animationDelay: "1100ms" }}>
            <RecentActivity />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
