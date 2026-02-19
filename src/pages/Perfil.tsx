import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  User,
  EnvelopeSimple,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  Medal,
  Trophy,
  FileText,
  VideoCamera,
  Crosshair,
  ChatCircle,
  FloppyDisk,
  Fire,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export default function Perfil() {
  const { user, profile, updateProfile, refreshProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [clinicName, setClinicName] = useState("");
  const [saving, setSaving] = useState(false);

  // Stats from DB
  const [scriptCount, setScriptCount] = useState(0);
  const [videoCount, setVideoCount] = useState(0);
  const [simCount, setSimCount] = useState(0);
  const [patientCount, setPatientCount] = useState(0);
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setSpecialty(profile.specialty || "");
      setPhone(profile.phone || "");
      setCity(profile.city || "");
      setState(profile.state || "");
      setClinicName(profile.clinic_name || "");
    }
  }, [profile]);

  useEffect(() => {
    if (!user) return;
    const fetchStats = async () => {
      const [scripts, videos, sims, patients, acts] = await Promise.all([
        supabase.from("scripts").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("videos").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("simulations").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("patients").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("activity_log").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5),
      ]);
      setScriptCount(scripts.count || 0);
      setVideoCount(videos.count || 0);
      setSimCount(sims.count || 0);
      setPatientCount(patients.count || 0);
      setActivities(acts.data || []);
    };
    fetchStats();
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await updateProfile({ full_name: fullName, specialty, phone, city, state, clinic_name: clinicName });
    setSaving(false);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Perfil atualizado!" });
      setEditing(false);
      refreshProfile();
    }
  };

  const initials = profile?.full_name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "?";

  const stats = [
    { label: "Roteiros criados", value: scriptCount, icon: FileText, color: "text-primary" },
    { label: "Vídeos analisados", value: videoCount, icon: VideoCamera, color: "text-purple-400" },
    { label: "Pacientes decodificados", value: patientCount, icon: Crosshair, color: "text-green-400" },
    { label: "Simulações completadas", value: simCount, icon: ChatCircle, color: "text-yellow-400" },
  ];

  const formatActivityDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <AppLayout>
      <div className="space-y-8 animate-fade-in">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Meu <span className="accent-text">Perfil</span>
          </h1>
          <p className="text-muted-foreground mt-1">Gerencie suas informações e acompanhe seu progresso</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile card */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border/50 rounded-xl p-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
              <div className="relative z-10">
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center mb-4">
                    <span className="text-2xl font-bold text-primary-foreground">{initials}</span>
                  </div>
                  {editing ? (
                    <Input value={fullName} onChange={e => setFullName(e.target.value)} className="text-center bg-secondary border-border mb-2" />
                  ) : (
                    <h2 className="text-xl font-semibold text-foreground">{profile?.full_name || "Usuário"}</h2>
                  )}
                  {editing ? (
                    <Input value={specialty} onChange={e => setSpecialty(e.target.value)} placeholder="Especialidade" className="text-center bg-secondary border-border" />
                  ) : (
                    <p className="text-sm text-muted-foreground">{profile?.specialty || "Sem especialidade"}</p>
                  )}
                  <div className="flex items-center gap-1 mt-2">
                    <Medal weight="fill" className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm text-yellow-400">Nível {profile?.level || 1}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <Fire weight="fill" className="w-4 h-4 text-orange-400" />
                    <span className="text-sm text-orange-400">Streak: {profile?.current_streak || 0} dias</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <EnvelopeSimple weight="regular" className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{user?.email || "—"}</span>
                  </div>
                  {editing ? (
                    <>
                      <div className="flex items-center gap-3">
                        <Phone weight="regular" className="w-4 h-4 text-muted-foreground" />
                        <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Telefone" className="bg-secondary border-border h-8 text-sm" />
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin weight="regular" className="w-4 h-4 text-muted-foreground" />
                        <Input value={city} onChange={e => setCity(e.target.value)} placeholder="Cidade" className="bg-secondary border-border h-8 text-sm flex-1" />
                        <Input value={state} onChange={e => setState(e.target.value)} placeholder="UF" className="bg-secondary border-border h-8 text-sm w-16" />
                      </div>
                      <div className="flex items-center gap-3">
                        <Briefcase weight="regular" className="w-4 h-4 text-muted-foreground" />
                        <Input value={clinicName} onChange={e => setClinicName(e.target.value)} placeholder="Nome da clínica" className="bg-secondary border-border h-8 text-sm" />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-3 text-sm">
                        <Phone weight="regular" className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{profile?.phone || "—"}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <MapPin weight="regular" className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{profile?.city && profile?.state ? `${profile.city}, ${profile.state}` : "—"}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Briefcase weight="regular" className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{profile?.clinic_name || "—"}</span>
                      </div>
                    </>
                  )}
                </div>

                {editing ? (
                  <div className="flex gap-2 mt-6">
                    <Button variant="outline" className="flex-1" onClick={() => setEditing(false)}>Cancelar</Button>
                    <Button className="flex-1 gap-2" onClick={handleSave} disabled={saving}>
                      <FloppyDisk weight="bold" className="w-4 h-4" />
                      {saving ? "Salvando..." : "Salvar"}
                    </Button>
                  </div>
                ) : (
                  <Button variant="outline" className="w-full mt-6 gap-2" onClick={() => setEditing(true)}>
                    Editar Perfil
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Stats and activity */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((stat) => (
                <div key={stat.label} className="bg-card border border-border/50 rounded-xl p-4">
                  <stat.icon weight="duotone" className={cn("w-5 h-5 mb-2", stat.color)} />
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="bg-card border border-border/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Pontuação</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <Trophy weight="fill" className="w-6 h-6 text-primary mx-auto mb-1" />
                  <p className="text-2xl font-bold text-foreground">{profile?.points || 0}</p>
                  <p className="text-xs text-muted-foreground">Pontos</p>
                </div>
                <div>
                  <Fire weight="fill" className="w-6 h-6 text-orange-400 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-foreground">{profile?.current_streak || 0}</p>
                  <p className="text-xs text-muted-foreground">Streak atual</p>
                </div>
                <div>
                  <Medal weight="fill" className="w-6 h-6 text-yellow-400 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-foreground">{profile?.best_streak || 0}</p>
                  <p className="text-xs text-muted-foreground">Melhor streak</p>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Atividade Recente</h3>
              {activities.length === 0 ? (
                <p className="text-muted-foreground text-sm">Nenhuma atividade registrada ainda.</p>
              ) : (
                <div className="space-y-3">
                  {activities.map((a) => (
                    <div key={a.id} className="flex items-center justify-between py-3 border-b border-border/30 last:border-0">
                      <span className="text-foreground text-sm">{a.description}</span>
                      <span className="text-sm text-muted-foreground">{formatActivityDate(a.created_at)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
