import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  FileText,
  Stethoscope,
  MessageSquare,
  Users,
  Trophy,
  Target,
  TrendingUp,
  Flame,
  Activity,
  ChevronRight,
  Lightbulb,
  Crown,
  Medal,
  Award,
  CheckCircle,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

// Mock data
const currentUser = {
  name: "Dr. Marcel Pita",
  specialty: "Ortopedista",
};

const dashboardMetrics = {
  scriptsCreated: 47,
  scriptsThisWeek: 5,
  consultationsAnalyzed: 23,
  consultationsThisWeek: 3,
  simulationsCompleted: 18,
  simulationsThisWeek: 2,
  averageScore: 76,
  scoreChange: 4,
};

const streakData = {
  currentStreak: 12,
  multiplier: 1.5,
  daysToNextMultiplier: 2,
  nextMultiplier: 2.0,
  progressToNext: 85,
};

const rankingSummary = {
  userPosition: 1,
  userPoints: 2890,
  pointsToNextPosition: 0,
  topThree: [
    { position: 1, name: "Dr. Marcel Pita", points: 2890, initials: "MP" },
    { position: 2, name: "Mohamed Najmeddine", points: 2680, initials: "MN" },
    { position: 3, name: "Alexsandro Orbem", points: 2540, initials: "AO" },
  ],
};

const recentActivity = [
  {
    id: "1",
    type: "script",
    icon: FileText,
    description: "Roteiro criado: Lesão de Joelho",
    time: "há 2 horas",
    points: 5,
  },
  {
    id: "2",
    type: "consultation",
    icon: Stethoscope,
    description: "Consulta analisada: Maria Silva",
    time: "há 4 horas",
    points: 10,
  },
  {
    id: "3",
    type: "simulation",
    icon: MessageSquare,
    description: "Simulação completa: Objeção de preço",
    time: "ontem",
    points: 15,
  },
  {
    id: "4",
    type: "login",
    icon: CheckCircle,
    description: "Login diário",
    time: "hoje",
    points: 2,
  },
];

const recentBadge = {
  name: "Roteirista",
  description: "Criou 10 roteiros",
  icon: FileText,
  date: "Conquistado ontem",
};

const dailyTips = [
  "Pacientes do tipo Realizador respondem melhor a argumentos de resultado e eficiência.",
  "Use o nome do paciente pelo menos 3x durante a consulta para criar rapport.",
  "Grave suas próximas 5 consultas para identificar padrões de melhoria.",
  "O fechamento alternativo aumenta em 40% as chances de conversão.",
  "Sempre termine a consulta com um próximo passo definido.",
];

const modules = [
  {
    id: "scripts",
    name: "Gerador de Roteiros",
    description: "Crie roteiros persuasivos para seus vídeos",
    icon: FileText,
    route: "/roteiros",
  },
  {
    id: "analyzer",
    name: "Analisador de Consultas",
    description: "Grave e analise suas consultas",
    icon: Stethoscope,
    route: "/consultas",
  },
  {
    id: "simulator",
    name: "Simulador de Pacientes",
    description: "Pratique conversas com IA",
    icon: MessageSquare,
    route: "/simulador",
  },
  {
    id: "decoder",
    name: "Decodificador de Pacientes",
    description: "Identifique perfis comportamentais",
    icon: Users,
    route: "/decodificar",
  },
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Bom dia";
  if (hour >= 12 && hour < 18) return "Boa tarde";
  return "Boa noite";
}

export default function Dashboard2() {
  const [showTip, setShowTip] = useState(true);
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    // Set tip based on day of year
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
        86400000
    );
    setTipIndex(dayOfYear % dailyTips.length);
  }, []);

  return (
    <AppLayout>
      <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
        {/* Section 1: Greeting and Streak */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Welcome Card */}
          <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6">
            <h1 className="text-2xl md:text-3xl font-semibold text-foreground mb-2">
              {getGreeting()}, {currentUser.name}
            </h1>
            <p className="text-muted-foreground">
              Pronto para converter mais pacientes hoje?
            </p>
          </div>

          {/* Streak Card */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                <Flame className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-foreground">
                    {streakData.currentStreak}
                  </span>
                  <span className="text-muted-foreground">dias</span>
                  <span className="ml-auto px-2 py-0.5 bg-primary/20 text-primary text-sm font-medium rounded-full">
                    {streakData.multiplier}x
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">de sequência</p>
                <Progress value={streakData.progressToNext} className="h-1.5" />
                <p className="text-xs text-muted-foreground mt-1">
                  Mais {streakData.daysToNextMultiplier} dias para{" "}
                  {streakData.nextMultiplier}x
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Quick Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            icon={FileText}
            value={dashboardMetrics.scriptsCreated}
            label="Roteiros criados"
            change={`+${dashboardMetrics.scriptsThisWeek} esta semana`}
            positive
          />
          <MetricCard
            icon={Stethoscope}
            value={dashboardMetrics.consultationsAnalyzed}
            label="Consultas analisadas"
            change={`+${dashboardMetrics.consultationsThisWeek} esta semana`}
            positive
          />
          <MetricCard
            icon={MessageSquare}
            value={dashboardMetrics.simulationsCompleted}
            label="Simulações completas"
            change={`+${dashboardMetrics.simulationsThisWeek} esta semana`}
            positive
          />
          <MetricCard
            icon={Target}
            value={dashboardMetrics.averageScore}
            label="Score médio"
            change={`+${dashboardMetrics.scoreChange} pts`}
            positive
          />
        </div>

        {/* Section 3: Quick Access Modules */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">
              Ferramentas
            </h2>
            <Link
              to="/roteiros"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              Ver todas <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {modules.map((module) => (
              <Link
                key={module.id}
                to={module.route}
                className="group bg-card border border-border rounded-xl p-5 hover:border-primary/50 hover:scale-[1.02] transition-all duration-200 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full" />
                <module.icon className="w-8 h-8 text-primary mb-4" />
                <h3 className="font-medium text-foreground mb-1">
                  {module.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {module.description}
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* Section 4 & 5: Ranking and Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Ranking Summary */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-foreground">
                  Ranking Semanal
                </h3>
              </div>
              <Link
                to="/ranking"
                className="text-sm text-primary hover:underline"
              >
                Ver completo
              </Link>
            </div>

            {/* User Position */}
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-3xl font-bold text-primary">
                    #{rankingSummary.userPosition}
                  </span>
                  <p className="text-sm text-muted-foreground">Sua posição</p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-semibold text-foreground">
                    {rankingSummary.userPoints} pts
                  </span>
                  {rankingSummary.pointsToNextPosition > 0 && (
                    <p className="text-sm text-muted-foreground">
                      Faltam {rankingSummary.pointsToNextPosition} pts para subir
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Top 3 */}
            <div className="space-y-2">
              {rankingSummary.topThree.map((user, index) => (
                <div
                  key={user.position}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="w-8 h-8 flex items-center justify-center">
                    {index === 0 ? (
                      <Crown className="w-5 h-5 text-yellow-500" />
                    ) : (
                      <Medal
                        className={cn(
                          "w-5 h-5",
                          index === 1 ? "text-gray-400" : "text-amber-700"
                        )}
                      />
                    )}
                  </div>
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary">
                    {user.initials}
                  </div>
                  <span className="flex-1 text-sm text-foreground truncate">
                    {user.name}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {user.points} pts
                  </span>
                </div>
              ))}
            </div>

            <Button variant="outline" className="w-full mt-4" asChild>
              <Link to="/ranking">Ganhar mais pontos</Link>
            </Button>
          </div>

          {/* Recent Activity */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-foreground">
                  Atividade Recente
                </h3>
              </div>
              <button className="text-sm text-primary hover:underline">
                Ver histórico
              </button>
            </div>

            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
                    <activity.icon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">
                      {activity.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.time}
                    </p>
                  </div>
                  <span className="text-sm text-green-500 font-medium">
                    +{activity.points} pts
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section 6: Recent Badge */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Nova Conquista!</h3>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center relative">
              <recentBadge.icon className="w-7 h-7 text-primary" />
              <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-pulse" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-foreground">
                {recentBadge.name}
              </h4>
              <p className="text-sm text-muted-foreground">
                {recentBadge.description}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {recentBadge.date}
              </p>
            </div>
            <Button variant="ghost" size="sm">
              Ver todas conquistas
            </Button>
          </div>
        </div>

        {/* Section 7: Daily Tip */}
        {showTip && (
          <div className="bg-primary/10 border border-primary/20 rounded-xl p-5 relative">
            <button
              onClick={() => setShowTip(false)}
              className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Lightbulb className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-1">
                  Dica do Dia
                </h4>
                <p className="text-sm text-muted-foreground">
                  {dailyTips[tipIndex]}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 text-primary"
                  onClick={() => setShowTip(false)}
                >
                  Entendi
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

interface MetricCardProps {
  icon: React.ElementType;
  value: number;
  label: string;
  change: string;
  positive?: boolean;
}

function MetricCard({
  icon: Icon,
  value,
  label,
  change,
  positive,
}: MetricCardProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <Icon className="w-6 h-6 text-primary mb-3" />
      <p className="text-3xl font-bold text-foreground">{value}</p>
      <p className="text-sm text-muted-foreground mb-2">{label}</p>
      <div className="flex items-center gap-1 text-xs">
        {positive && <TrendingUp className="w-3 h-3 text-green-500" />}
        <span className={positive ? "text-green-500" : "text-muted-foreground"}>
          {change}
        </span>
      </div>
    </div>
  );
}
