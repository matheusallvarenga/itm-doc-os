import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { ModuleCard } from "@/components/dashboard/ModuleCard";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { WeeklyProgress } from "@/components/dashboard/WeeklyProgress";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  FileText,
  Crosshair,
  ChatCircle,
  VideoCamera,
  ChartBar,
  Trophy,
  Lightning,
} from "@phosphor-icons/react";

const modules = [
  { title: "Gerador de Roteiros", description: "Crie roteiros de alta conversão para seus vídeos de forma automática", icon: FileText, href: "/roteiros", accentWord: "alta conversão" },
  { title: "Decodificar Paciente", description: "Descubra o código do seu paciente e saiba exatamente como conduzi-lo", icon: Crosshair, href: "/decodificar", accentWord: "código" },
  { title: "Simulador de Consulta", description: "Treine suas habilidades de comunicação com pacientes virtuais", icon: ChatCircle, href: "/simulador", accentWord: "comunicação" },
  { title: "Analisar Vídeo", description: "Receba feedback detalhado e melhore sua performance em vídeos", icon: VideoCamera, href: "/videos", accentWord: "performance" },
  { title: "Meu Instagram", description: "Acompanhe suas métricas e entenda o que gera mais engajamento", icon: ChartBar, href: "/instagram", accentWord: "engajamento" },
  { title: "Ranking", description: "Veja sua posição e conquiste o topo do ranking semanal", icon: Trophy, href: "/ranking", accentWord: "topo" },
];

export default function Index() {
  const { user, profile } = useAuth();
  const firstName = profile?.full_name?.split(" ").slice(0, 2).join(" ") || "Usuário";

  const [scriptCount, setScriptCount] = useState(0);
  const [videoCount, setVideoCount] = useState(0);
  const [simCount, setSimCount] = useState(0);
  const [consultCount, setConsultCount] = useState(0);
  const [patientCount, setPatientCount] = useState(0);
  const [avgScore, setAvgScore] = useState(0);

  useEffect(() => {
    if (!user) return;
    const fetchMetrics = async () => {
      const [s, v, sim, con, pat, vScores, simScores, conScores] = await Promise.all([
        supabase.from("scripts").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("videos").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("simulations").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("consultations").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("patients").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("videos").select("score").eq("user_id", user.id).not("score", "is", null),
        supabase.from("simulations").select("score").eq("user_id", user.id).not("score", "is", null),
        supabase.from("consultations").select("score").eq("user_id", user.id).not("score", "is", null),
      ]);
      setScriptCount(s.count || 0);
      setVideoCount(v.count || 0);
      setSimCount(sim.count || 0);
      setConsultCount(con.count || 0);
      setPatientCount(pat.count || 0);
      const allScores = [
        ...(vScores.data || []).map(x => x.score as number),
        ...(simScores.data || []).map(x => x.score as number),
        ...(conScores.data || []).map(x => x.score as number),
      ];
      setAvgScore(allScores.length > 0 ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) : 0);
    };
    fetchMetrics();
  }, [user]);

  const stats = [
    { title: "Roteiros Criados", value: scriptCount, subtitle: "Total", icon: FileText },
    { title: "Vídeos Analisados", value: videoCount, subtitle: "Total", icon: VideoCamera },
    { title: "Simulações", value: simCount, subtitle: `${consultCount} consultas · ${patientCount} pacientes`, icon: ChatCircle },
    { title: "Score Médio", value: avgScore > 0 ? `${avgScore}%` : "—", subtitle: `Streak: ${profile?.current_streak || 0} dias`, icon: Trophy },
  ];

  return (
    <AppLayout>
      <div className="space-y-8 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-foreground">
              Olá, <span className="accent-text">{firstName}</span>
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div key={stat.title} className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
              <StatCard {...stat} />
            </div>
          ))}
        </div>

        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Módulos</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {modules.map((module, index) => (
              <div key={module.title} className="animate-fade-in-up" style={{ animationDelay: `${(index + 4) * 100}ms` }}>
                <ModuleCard {...module} />
              </div>
            ))}
          </div>
        </div>

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
