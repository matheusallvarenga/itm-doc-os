import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  FileText,
  Stethoscope,
  MessageSquare,
  Users,
  Trophy,
  Target,
  Flame,
  Activity,
  ChevronRight,
  Lightbulb,
  CheckCircle,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const dailyTips = [
  "Pacientes do tipo Realizador respondem melhor a argumentos de resultado e eficiência.",
  "Use o nome do paciente pelo menos 3x durante a consulta para criar rapport.",
  "Grave suas próximas 5 consultas para identificar padrões de melhoria.",
  "O fechamento alternativo aumenta em 40% as chances de conversão.",
  "Sempre termine a consulta com um próximo passo definido.",
];

const modules = [
  { id: "scripts", name: "Gerador de Roteiros", description: "Crie roteiros persuasivos para seus vídeos", icon: FileText, route: "/roteiros" },
  { id: "analyzer", name: "Analisador de Consultas", description: "Grave e analise suas consultas", icon: Stethoscope, route: "/consultas" },
  { id: "simulator", name: "Simulador de Pacientes", description: "Pratique conversas com IA", icon: MessageSquare, route: "/simulador" },
  { id: "decoder", name: "Decodificador de Pacientes", description: "Identifique perfis comportamentais", icon: Users, route: "/decodificar" },
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Bom dia";
  if (hour >= 12 && hour < 18) return "Boa tarde";
  return "Boa noite";
}

export default function Dashboard2() {
  const { user, profile } = useAuth();
  const [showTip, setShowTip] = useState(true);
  const [tipIndex, setTipIndex] = useState(0);
  const [metrics, setMetrics] = useState({ scripts: 0, videos: 0, simulations: 0, consultations: 0, avgScore: 0 });
  const [recentAct, setRecentAct] = useState<any[]>([]);

  useEffect(() => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    setTipIndex(dayOfYear % dailyTips.length);
  }, []);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [s, v, sim, con, vS, simS, conS, act] = await Promise.all([
        supabase.from("scripts").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("videos").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("simulations").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("consultations").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("videos").select("score").eq("user_id", user.id).not("score", "is", null),
        supabase.from("simulations").select("score").eq("user_id", user.id).not("score", "is", null),
        supabase.from("consultations").select("score").eq("user_id", user.id).not("score", "is", null),
        supabase.from("activity_log").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5),
      ]);
      const allScores = [
        ...(vS.data || []).map(x => x.score as number),
        ...(simS.data || []).map(x => x.score as number),
        ...(conS.data || []).map(x => x.score as number),
      ];
      setMetrics({
        scripts: s.count || 0,
        videos: v.count || 0,
        simulations: sim.count || 0,
        consultations: con.count || 0,
        avgScore: allScores.length ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) : 0,
      });
      setRecentAct(act.data || []);
    };
    load();
  }, [user]);

  const userName = profile?.full_name || "Usuário";

  return (
    <AppLayout>
      <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
        {/* Section 1: Greeting and Streak */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6">
            <h1 className="text-2xl md:text-3xl font-semibold text-foreground mb-2">
              {getGreeting()}, {userName}
            </h1>
            <p className="text-muted-foreground">
              Pronto para converter mais pacientes hoje?
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-destructive/80 to-destructive flex items-center justify-center">
                <Flame className="w-7 h-7 text-destructive-foreground" />
              </div>
              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-foreground">
                    {profile?.current_streak || 0}
                  </span>
                  <span className="text-muted-foreground">dias</span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">de sequência</p>
                <p className="text-xs text-muted-foreground">
                  Melhor: {profile?.best_streak || 0} dias
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Quick Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard icon={FileText} value={metrics.scripts} label="Roteiros criados" />
          <MetricCard icon={Stethoscope} value={metrics.consultations} label="Consultas analisadas" />
          <MetricCard icon={MessageSquare} value={metrics.simulations} label="Simulações completas" />
          <MetricCard icon={Target} value={metrics.avgScore} label="Score médio" />
        </div>

        {/* Section 3: Quick Access Modules */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Ferramentas</h2>
            <Link to="/roteiros" className="text-sm text-primary hover:underline flex items-center gap-1">
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
                <h3 className="font-medium text-foreground mb-1">{module.name}</h3>
                <p className="text-sm text-muted-foreground">{module.description}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Section 4: Ranking + Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-foreground">Seu Ranking</h3>
              </div>
              <Link to="/ranking" className="text-sm text-primary hover:underline">Ver completo</Link>
            </div>
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xl font-semibold text-foreground">
                    {profile?.points || 0} pts
                  </span>
                  <p className="text-sm text-muted-foreground">Nível {profile?.level || 1}</p>
                </div>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-4" asChild>
              <Link to="/ranking">Ganhar mais pontos</Link>
            </Button>
          </div>

          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Atividade Recente</h3>
            </div>
            <div className="space-y-3">
              {recentAct.map((a: any) => (
                <div key={a.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">{a.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(a.created_at), "dd/MM HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                  <span className="text-sm text-primary font-medium">+{a.points}</span>
                </div>
              ))}
              {recentAct.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">Nenhuma atividade ainda</p>
              )}
            </div>
          </div>
        </div>

        {/* Daily Tip */}
        {showTip && (
          <div className="bg-primary/10 border border-primary/20 rounded-xl p-5 relative">
            <button onClick={() => setShowTip(false)} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Lightbulb className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-1">Dica do Dia</h4>
                <p className="text-sm text-muted-foreground">{dailyTips[tipIndex]}</p>
                <Button variant="ghost" size="sm" className="mt-2 text-primary" onClick={() => setShowTip(false)}>
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
}

function MetricCard({ icon: Icon, value, label }: MetricCardProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <Icon className="w-6 h-6 text-primary mb-3" />
      <p className="text-3xl font-bold text-foreground">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
