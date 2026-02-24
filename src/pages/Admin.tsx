import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  PencilSimple,
  UserMinus,
  Trash,
  Check,
} from "@phosphor-icons/react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

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
  is_active: boolean;
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

  // Edit dialog state
  const [editUser, setEditUser] = useState<UserProfile | null>(null);
  const [editName, setEditName] = useState("");
  const [editSpecialty, setEditSpecialty] = useState("");
  const [saving, setSaving] = useState(false);

  // Delete dialog state
  const [deleteUser, setDeleteUser] = useState<UserProfile | null>(null);

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

  useEffect(() => {
    if (!user) return;
    fetchData();
  }, [user]);

  const handleEdit = (u: UserProfile) => {
    setEditUser(u);
    setEditName(u.full_name);
    setEditSpecialty(u.specialty);
  };

  const handleSaveEdit = async () => {
    if (!editUser) return;
    setSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-stats?action=update_profile", {
        body: { user_id: editUser.user_id, full_name: editName, specialty: editSpecialty },
      });
      if (error) throw error;
      toast.success("Perfil atualizado");
      setEditUser(null);
      fetchData();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (u: UserProfile) => {
    try {
      await supabase.functions.invoke("admin-stats?action=toggle_active", {
        body: { user_id: u.user_id, is_active: !u.is_active },
      });
      toast.success(u.is_active ? "Aluno desativado" : "Aluno reativado");
      fetchData();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleDelete = async () => {
    if (!deleteUser) return;
    try {
      await supabase.functions.invoke("admin-stats?action=delete_user", {
        body: { user_id: deleteUser.user_id },
      });
      toast.success("Aluno excluído");
      setDeleteUser(null);
      fetchData();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

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
            <CardContent className="space-y-3 max-h-[500px] overflow-y-auto">
              {users.map((u) => {
                const initials = u.full_name
                  ? u.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
                  : "?";
                return (
                  <div key={u.id} className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${u.is_active ? "bg-secondary/30 hover:bg-secondary/50" : "bg-destructive/10 opacity-60"}`}>
                    <Avatar className="w-9 h-9">
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{u.full_name || "Sem nome"}</p>
                      <p className="text-xs text-muted-foreground">{u.specialty || "Sem especialidade"}</p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <div className="text-right mr-2">
                        <div className="flex items-center gap-1">
                          <Trophy weight="fill" className="w-3.5 h-3.5 text-primary" />
                          <span className="text-sm font-medium text-foreground">{u.points}</span>
                        </div>
                        <Badge variant="secondary" className="text-[10px]">Nv. {u.level}</Badge>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(u)}>
                        <PencilSimple className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleToggleActive(u)}>
                        {u.is_active ? <UserMinus className="w-4 h-4 text-orange-500" /> : <Check className="w-4 h-4 text-green-500" />}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDeleteUser(u)}>
                        <Trash className="w-4 h-4 text-destructive" />
                      </Button>
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
            <CardContent className="space-y-3 max-h-[500px] overflow-y-auto">
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

      {/* Edit Dialog */}
      <Dialog open={!!editUser} onOpenChange={() => setEditUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Aluno</DialogTitle>
            <DialogDescription>Altere os dados do aluno abaixo.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-foreground">Nome</label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Especialidade</label>
              <Input value={editSpecialty} onChange={(e) => setEditSpecialty(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUser(null)}>Cancelar</Button>
            <Button onClick={handleSaveEdit} disabled={saving}>
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteUser} onOpenChange={() => setDeleteUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Aluno</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir <strong>{deleteUser?.full_name}</strong>? Esta ação não pode ser desfeita e todos os dados do aluno serão perdidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
