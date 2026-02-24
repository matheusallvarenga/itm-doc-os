import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  FileText,
  VideoCamera,
  ChatCircle,
  Stethoscope,
  Crosshair,
  Trophy,
  ChartBar,
  Clock,
} from "@phosphor-icons/react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AdminStats {
  totalUsers: number;
  totalScripts: number;
  totalVideos: number;
  totalSimulations: number;
  totalConsultations: number;
  totalPatients: number;
  averageScore: number;
}

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  specialty: string;
  points: number;
  level: number;
  current_streak: number;
  best_streak: number;
  avatar_url: string | null;
  created_at: string;
}

interface ActivityItem {
  id: string;
  user_id: string;
  type: string;
  points: number;
  description: string;
  created_at: string;
}

export default function Admin() {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        const { data, error: fnError } = await supabase.functions.invoke("admin-stats");
        if (fnError) throw fnError;
        setStats(data.stats);
        setUsers(data.users);
        setActivity(data.recentActivity);
      } catch (e: any) {
        setError(e.message || "Acesso negado");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-destructive">{error}</p>
        </div>
      </AppLayout>
    );
  }

  const statCards = [
    { title: "Usuários", value: stats?.totalUsers || 0, icon: Users },
    { title: "Roteiros", value: stats?.totalScripts || 0, icon: FileText },
    { title: "Vídeos", value: stats?.totalVideos || 0, icon: VideoCamera },
    { title: "Simulações", value: stats?.totalSimulations || 0, icon: ChatCircle },
    { title: "Consultas", value: stats?.totalConsultations || 0, icon: Stethoscope },
    { title: "Pacientes", value: stats?.totalPatients || 0, icon: Crosshair },
    { title: "Score Médio", value: stats?.averageScore || 0, icon: ChartBar },
  ];

  const typeLabels: Record<string, string> = {
    script: "Roteiro",
    simulation: "Simulação",
    consultation: "Consulta",
    video: "Vídeo",
    decode: "Decodificação",
    funnel: "Funil",
  };

  return (
    <AppLayout>
      <div className="space-y-8 animate-fade-in">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Painel <span className="accent-text">Administrativo</span>
          </h1>
          <p className="text-muted-foreground mt-1">Visão global da plataforma</p>
        </div>

        {/* Global Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
          {statCards.map((s) => (
            <Card key={s.title} className="card-hover">
              <CardContent className="p-4 text-center">
                <s.icon weight="duotone" className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.title}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users weight="duotone" className="w-5 h-5 text-primary" />
                Alunos ({users.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-[400px] overflow-y-auto">
              {users.map((u) => {
                const initials = u.full_name
                  ? u.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
                  : "?";
                return (
                  <div key={u.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                    <Avatar className="w-9 h-9">
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{u.full_name || "Sem nome"}</p>
                      <p className="text-xs text-muted-foreground">{u.specialty || "Sem especialidade"}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="flex items-center gap-1">
                        <Trophy weight="fill" className="w-3.5 h-3.5 text-primary" />
                        <span className="text-sm font-medium text-foreground">{u.points}</span>
                      </div>
                      <Badge variant="secondary" className="text-[10px]">Nv. {u.level}</Badge>
                    </div>
                  </div>
                );
              })}
              {users.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">Nenhum aluno cadastrado</p>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock weight="duotone" className="w-5 h-5 text-primary" />
                Atividade Recente (Global)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-[400px] overflow-y-auto">
              {activity.map((a) => (
                <div key={a.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/30 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">{a.description}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="outline" className="text-[10px]">{typeLabels[a.type] || a.type}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(a.created_at), "dd/MM HH:mm", { locale: ptBR })}
                      </span>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-primary">+{a.points}</span>
                </div>
              ))}
              {activity.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">Nenhuma atividade registrada</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
