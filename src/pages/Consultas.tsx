import { useState, useEffect } from "react";
import {
  Stethoscope, MagnifyingGlass, UserPlus, CaretRight, Microphone, Play, Pause, Stop,
  ArrowLeft, Lightbulb, ClockCounterClockwise, PencilSimple, FloppyDisk, Trash, Brain,
  TrendUp, Calendar, ChartLineUp, Sparkle, ChatCircle, Target, WarningCircle, CheckCircle,
  User, Phone, EnvelopeSimple, Note, CircleNotch,
} from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { AppLayout } from "@/components/layout/AppLayout";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface PatientRow {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  notes: string | null;
  enneagram_type: number | null;
  enneagram_name: string | null;
  created_at: string;
  updated_at: string;
}

interface ConsultationRow {
  id: string;
  patient_id: string;
  score: number | null;
  duration: string | null;
  enneagram_type: number | null;
  enneagram_name: string | null;
  strengths: string[] | null;
  improvements: string[] | null;
  ai_insight: string | null;
  created_at: string;
}

type ViewState = "list" | "edit" | "history" | "add";

export default function Consultas() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState<PatientRow[]>([]);
  const [consultations, setConsultations] = useState<ConsultationRow[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<PatientRow | null>(null);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [viewState, setViewState] = useState<ViewState>("list");
  const [expandedConsultation, setExpandedConsultation] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editNotes, setEditNotes] = useState("");

  const fetchPatients = async () => {
    if (!user) return;
    const { data } = await supabase.from("patients").select("*").eq("user_id", user.id).order("updated_at", { ascending: false });
    if (data) setPatients(data);
    setLoading(false);
  };

  const fetchConsultations = async (patientId: string) => {
    if (!user) return;
    const { data } = await supabase.from("consultations").select("*").eq("user_id", user.id).eq("patient_id", patientId).order("created_at", { ascending: false });
    if (data) setConsultations(data);
  };

  useEffect(() => { fetchPatients(); }, [user]);

  const handlePatientClick = (patient: PatientRow) => {
    setSelectedPatient(patient);
    setShowPatientModal(true);
  };

  const handleEditPatient = () => {
    if (selectedPatient) {
      setEditName(selectedPatient.name);
      setEditEmail(selectedPatient.email || "");
      setEditPhone(selectedPatient.phone || "");
      setEditNotes(selectedPatient.notes || "");
      setShowPatientModal(false);
      setViewState("edit");
    }
  };

  const handleViewHistory = async () => {
    if (selectedPatient) {
      await fetchConsultations(selectedPatient.id);
      setShowPatientModal(false);
      setViewState("history");
    }
  };

  const handleSavePatient = async () => {
    if (!selectedPatient || !user) return;
    setSaving(true);
    const { error } = await supabase.from("patients").update({ name: editName, email: editEmail || null, phone: editPhone || null, notes: editNotes || null }).eq("id", selectedPatient.id);
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else { toast({ title: "Paciente atualizado!" }); await fetchPatients(); }
    setSaving(false);
    setViewState("list");
  };

  const handleDeletePatient = async () => {
    if (!selectedPatient) return;
    const { error } = await supabase.from("patients").delete().eq("id", selectedPatient.id);
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else { toast({ title: "Paciente excluído" }); await fetchPatients(); }
    setViewState("list");
    setSelectedPatient(null);
  };

  const handleAddPatient = async () => {
    if (!user || !editName.trim()) return;
    setSaving(true);
    const { error } = await supabase.from("patients").insert({ user_id: user.id, name: editName, email: editEmail || null, phone: editPhone || null, notes: editNotes || null });
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else { toast({ title: "Paciente adicionado!" }); await fetchPatients(); }
    setSaving(false);
    setViewState("list");
  };

  const handleBackToList = () => {
    setViewState("list");
    setSelectedPatient(null);
    setExpandedConsultation(null);
  };

  const getScoreColor = (score: number) => score >= 80 ? "text-green-500" : score >= 60 ? "text-yellow-500" : "text-red-500";
  const getScoreBg = (score: number) => score >= 80 ? "bg-green-500/20 border-green-500/30" : score >= 60 ? "bg-yellow-500/20 border-yellow-500/30" : "bg-red-500/20 border-red-500/30";

  const filteredPatients = patients.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const getInitials = (name: string) => name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  if (loading) return <AppLayout><div className="flex items-center justify-center min-h-[60vh]"><CircleNotch weight="bold" className="w-8 h-8 text-primary animate-spin" /></div></AppLayout>;

  // Add/Edit Patient View
  if ((viewState === "edit" || viewState === "add") && (selectedPatient || viewState === "add")) {
    return (
      <AppLayout>
        <div className="min-h-full bg-background p-6">
          <div className="flex items-center gap-4 mb-8">
            <button onClick={handleBackToList} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft weight="bold" className="w-5 h-5" /><span>Voltar</span>
            </button>
            <h1 className="text-xl font-semibold text-foreground">{viewState === "add" ? "Novo Paciente" : "Editar Paciente"}</h1>
          </div>
          <div className="max-w-xl mx-auto space-y-6">
            <div className="space-y-4">
              <div><label className="flex items-center gap-2 text-sm text-muted-foreground mb-2"><User weight="regular" className="w-4 h-4" />Nome completo</label>
                <Input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Nome do paciente" /></div>
              <div><label className="flex items-center gap-2 text-sm text-muted-foreground mb-2"><EnvelopeSimple weight="regular" className="w-4 h-4" />E-mail</label>
                <Input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} placeholder="email@exemplo.com" /></div>
              <div><label className="flex items-center gap-2 text-sm text-muted-foreground mb-2"><Phone weight="regular" className="w-4 h-4" />Telefone</label>
                <Input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder="(00) 00000-0000" /></div>
              <div><label className="flex items-center gap-2 text-sm text-muted-foreground mb-2"><Note weight="regular" className="w-4 h-4" />Observações</label>
                <Textarea value={editNotes} onChange={(e) => setEditNotes(e.target.value)} placeholder="Anotações..." className="min-h-[120px]" /></div>
            </div>
            <div className="flex gap-3">
              {viewState === "edit" && (
                <Button variant="outline" className="flex-1 gap-2 text-destructive hover:text-destructive" onClick={handleDeletePatient}>
                  <Trash weight="regular" className="w-5 h-5" />Excluir
                </Button>
              )}
              <Button onClick={viewState === "add" ? handleAddPatient : handleSavePatient} className="flex-1 gap-2" disabled={saving}>
                {saving ? <CircleNotch weight="bold" className="w-5 h-5 animate-spin" /> : <FloppyDisk weight="bold" className="w-5 h-5" />}
                {saving ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  // History View
  if (viewState === "history" && selectedPatient) {
    const patientConsultations = consultations;
    const avgScore = patientConsultations.length > 0 ? Math.round(patientConsultations.reduce((sum, c) => sum + (c.score || 0), 0) / patientConsultations.length) : 0;

    return (
      <AppLayout>
        <div className="min-h-full bg-background p-6">
          <div className="flex items-center gap-4 mb-6">
            <button onClick={handleBackToList} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft weight="bold" className="w-5 h-5" /><span>Voltar</span>
            </button>
          </div>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xl font-semibold">{getInitials(selectedPatient.name)}</div>
            <div><h1 className="text-xl font-semibold text-foreground">{selectedPatient.name}</h1><p className="text-muted-foreground text-sm">Histórico de Consultas</p></div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <ChatCircle weight="duotone" className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-semibold text-foreground">{patientConsultations.length}</p>
              <p className="text-xs text-muted-foreground">Consultas</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <ChartLineUp weight="duotone" className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className={cn("text-2xl font-semibold", getScoreColor(avgScore))}>{avgScore}</p>
              <p className="text-xs text-muted-foreground">Score Médio</p>
            </div>
            {selectedPatient.enneagram_type && (
              <div className="bg-card border border-border rounded-xl p-4 text-center">
                <Target weight="duotone" className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-2xl font-semibold text-foreground">{selectedPatient.enneagram_type}</p>
                <p className="text-xs text-muted-foreground">{selectedPatient.enneagram_name || "Eneagrama"}</p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-foreground font-medium flex items-center gap-2">
              <ClockCounterClockwise weight="regular" className="w-5 h-5 text-muted-foreground" />Histórico
            </h3>
            {patientConsultations.length === 0 && <p className="text-muted-foreground text-center py-8">Nenhuma consulta registrada</p>}
            {patientConsultations.map((c) => (
              <div key={c.id} className="bg-card border border-border rounded-xl overflow-hidden">
                <button onClick={() => setExpandedConsultation(expandedConsultation === c.id ? null : c.id)} className="w-full p-4 flex items-center gap-4 hover:bg-secondary/30 transition-colors">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar weight="regular" className="w-4 h-4" />
                    <span className="text-sm">{new Date(c.created_at).toLocaleDateString("pt-BR")}</span>
                  </div>
                  {c.duration && <div className="text-sm text-muted-foreground">{c.duration}</div>}
                  <div className="flex-1" />
                  {c.score && <div className={cn("px-3 py-1 rounded-full text-sm font-medium border", getScoreBg(c.score), getScoreColor(c.score))}>Score: {c.score}</div>}
                  <CaretRight weight="bold" className={cn("w-5 h-5 text-muted-foreground transition-transform", expandedConsultation === c.id && "rotate-90")} />
                </button>
                {expandedConsultation === c.id && (
                  <div className="px-4 pb-4 space-y-4 border-t border-border pt-4">
                    {c.enneagram_type && <div className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium inline-block">Tipo {c.enneagram_type}: {c.enneagram_name}</div>}
                    {c.strengths && c.strengths.length > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2"><CheckCircle weight="fill" className="w-4 h-4 text-green-500" />Pontos fortes</p>
                        <ul className="space-y-1">{c.strengths.map((s, i) => <li key={i} className="text-sm text-foreground flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-green-500" />{s}</li>)}</ul>
                      </div>
                    )}
                    {c.improvements && c.improvements.length > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2"><WarningCircle weight="fill" className="w-4 h-4 text-yellow-500" />Melhorias</p>
                        <ul className="space-y-1">{c.improvements.map((s, i) => <li key={i} className="text-sm text-foreground flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />{s}</li>)}</ul>
                      </div>
                    )}
                    {c.ai_insight && (
                      <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
                        <div className="flex items-center gap-2 mb-2"><Brain weight="duotone" className="w-5 h-5 text-primary" /><span className="text-sm font-medium text-foreground">Análise da IA</span></div>
                        <p className="text-sm text-muted-foreground leading-relaxed">{c.ai_insight}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  // List View
  return (
    <AppLayout>
      <div className="min-h-full bg-background p-6">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Stethoscope weight="duotone" className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-semibold text-foreground">Analisar Consulta</h1>
          </div>
          <p className="text-muted-foreground">Selecione um paciente para ver histórico ou editar</p>
        </div>

        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <MagnifyingGlass weight="light" className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input placeholder="Buscar paciente..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
          </div>
          <Button variant="outline" className="gap-2" onClick={() => { setEditName(""); setEditEmail(""); setEditPhone(""); setEditNotes(""); setViewState("add"); }}>
            <UserPlus weight="bold" className="w-5 h-5" />
            <span className="hidden sm:inline">Adicionar</span>
          </Button>
        </div>

        <div className="space-y-3">
          {filteredPatients.map((patient) => (
            <button key={patient.id} onClick={() => handlePatientClick(patient)} className="w-full bg-card border border-border rounded-xl p-4 flex items-center gap-4 hover:border-primary/30 transition-all duration-200 group">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">{getInitials(patient.name)}</div>
              <div className="flex-1 text-left">
                <p className="text-foreground font-medium">{patient.name}</p>
                <p className="text-muted-foreground text-sm">{patient.enneagram_type ? `Tipo ${patient.enneagram_type} - ${patient.enneagram_name}` : "Sem diagnóstico"}</p>
              </div>
              <CaretRight weight="bold" className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </button>
          ))}
          {filteredPatients.length === 0 && <div className="text-center py-12 text-muted-foreground"><p>Nenhum paciente encontrado</p></div>}
        </div>

        <Dialog open={showPatientModal} onOpenChange={setShowPatientModal}>
          <DialogContent className="bg-card border-border max-w-sm">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">{selectedPatient ? getInitials(selectedPatient.name) : ""}</div>
                <span className="text-foreground">{selectedPatient?.name}</span>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 mt-4">
              <Button variant="outline" className="w-full gap-2 justify-start" size="lg" onClick={handleViewHistory}>
                <ClockCounterClockwise weight="regular" className="w-5 h-5" />Ver Histórico
              </Button>
              <Button variant="ghost" className="w-full gap-2 justify-start text-muted-foreground" size="lg" onClick={handleEditPatient}>
                <PencilSimple weight="regular" className="w-5 h-5" />Editar Paciente
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
