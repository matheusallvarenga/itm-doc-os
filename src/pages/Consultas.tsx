import { useState } from "react";
import {
  Stethoscope,
  MagnifyingGlass,
  UserPlus,
  CaretRight,
  Microphone,
  Play,
  Pause,
  Stop,
  ArrowLeft,
  Lightbulb,
  ClockCounterClockwise,
  PencilSimple,
  FloppyDisk,
  Trash,
  Brain,
  TrendUp,
  TrendDown,
  Calendar,
  ChartLineUp,
  Sparkle,
  ChatCircle,
  Target,
  WarningCircle,
  CheckCircle,
  User,
  Phone,
  EnvelopeSimple,
  Note,
} from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { AppLayout } from "@/components/layout/AppLayout";
import { toast } from "@/hooks/use-toast";

interface Patient {
  id: string;
  name: string;
  initials: string;
  email?: string;
  phone?: string;
  notes?: string;
  lastConsultation: string;
  totalConsultations: number;
  averageScore: number;
}

interface ConsultationHistory {
  id: string;
  date: string;
  duration: string;
  score: number;
  enneagramType: number;
  enneagramName: string;
  strengths: string[];
  improvements: string[];
  aiInsight: string;
}

const mockPatients: Patient[] = [
  {
    id: "1",
    name: "Maria Silva",
    initials: "MS",
    email: "maria.silva@email.com",
    phone: "(11) 99999-1234",
    notes: "Paciente ansiosa, prefere explicações detalhadas.",
    lastConsultation: "há 2 dias",
    totalConsultations: 5,
    averageScore: 78,
  },
  {
    id: "2",
    name: "João Santos",
    initials: "JS",
    email: "joao.santos@email.com",
    phone: "(11) 98888-5678",
    notes: "Interessado em lentes de contato.",
    lastConsultation: "há 5 dias",
    totalConsultations: 3,
    averageScore: 65,
  },
  {
    id: "3",
    name: "Ana Costa",
    initials: "AC",
    email: "ana.costa@email.com",
    phone: "(11) 97777-9012",
    notes: "Retorno de clareamento.",
    lastConsultation: "há 1 semana",
    totalConsultations: 8,
    averageScore: 82,
  },
  {
    id: "4",
    name: "Carlos Oliveira",
    initials: "CO",
    email: "carlos.oliveira@email.com",
    phone: "(11) 96666-3456",
    notes: "",
    lastConsultation: "há 3 dias",
    totalConsultations: 2,
    averageScore: 71,
  },
];

const mockConsultationHistory: ConsultationHistory[] = [
  {
    id: "c1",
    date: "05/12/2024",
    duration: "23:45",
    score: 85,
    enneagramType: 6,
    enneagramName: "O Leal",
    strengths: [
      "Excelente rapport inicial",
      "Escuta ativa demonstrada",
      "Explicações claras sobre o procedimento",
    ],
    improvements: [
      "Poderia ter explorado mais as objeções",
      "Faltou confirmar entendimento",
    ],
    aiInsight:
      "A paciente demonstrou perfil típico do Tipo 6 (Leal) - busca segurança e confiança. Você construiu bem o rapport, mas poderia ter oferecido mais garantias e provas sociais para acelerar a decisão. Sugestão: na próxima consulta, mencione casos de sucesso similares.",
  },
  {
    id: "c2",
    date: "28/11/2024",
    duration: "18:32",
    score: 72,
    enneagramType: 6,
    enneagramName: "O Leal",
    strengths: ["Boa apresentação do procedimento", "Tom de voz adequado"],
    improvements: [
      "Consulta muito curta",
      "Não explorou dúvidas da paciente",
      "Fechamento prematuro",
    ],
    aiInsight:
      "Consulta abaixo do potencial. A paciente saiu com dúvidas não resolvidas. Recomendo dedicar mais tempo para entender as preocupações específicas antes de apresentar soluções.",
  },
  {
    id: "c3",
    date: "15/11/2024",
    duration: "31:20",
    score: 91,
    enneagramType: 6,
    enneagramName: "O Leal",
    strengths: [
      "Excelente condução",
      "Perguntas abertas eficazes",
      "Fechamento natural",
      "Uso de provas sociais",
    ],
    improvements: ["Poderia ter sido mais conciso em alguns momentos"],
    aiInsight:
      "Consulta exemplar! Você identificou corretamente as necessidades da paciente e conduziu com maestria. O uso de casos similares foi decisivo para o fechamento. Continue aplicando essa abordagem.",
  },
];

type ViewState = "list" | "recording" | "edit" | "history";

export default function Consultas() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [viewState, setViewState] = useState<ViewState>("list");
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [expandedConsultation, setExpandedConsultation] = useState<string | null>(null);

  // Edit form state
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editNotes, setEditNotes] = useState("");

  const filteredPatients = mockPatients.filter((patient) =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handlePatientClick = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowPatientModal(true);
  };

  const handleStartRecording = () => {
    setShowPatientModal(false);
    setViewState("recording");
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

  const handleViewHistory = () => {
    setShowPatientModal(false);
    setViewState("history");
  };

  const handleSavePatient = () => {
    toast({
      title: "Paciente atualizado",
      description: "As informações foram salvas com sucesso.",
    });
    setViewState("list");
  };

  const handleToggleRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      setIsPaused(false);
      const interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
      (window as any).recordingInterval = interval;
    } else if (isPaused) {
      setIsPaused(false);
      const interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
      (window as any).recordingInterval = interval;
    } else {
      setIsPaused(true);
      clearInterval((window as any).recordingInterval);
    }
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    setIsPaused(false);
    clearInterval((window as any).recordingInterval);
    setViewState("list");
    setRecordingTime(0);
  };

  const handleBackToList = () => {
    if (isRecording) {
      handleStopRecording();
    }
    setViewState("list");
    setSelectedPatient(null);
    setRecordingTime(0);
    setExpandedConsultation(null);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-green-500/20 border-green-500/30";
    if (score >= 60) return "bg-yellow-500/20 border-yellow-500/30";
    return "bg-red-500/20 border-red-500/30";
  };

  // Edit Patient View
  if (viewState === "edit" && selectedPatient) {
    return (
      <AppLayout>
        <div className="min-h-full bg-background p-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={handleBackToList}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft weight="bold" className="w-5 h-5" />
              <span>Voltar</span>
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-foreground">
                Editar Paciente
              </h1>
            </div>
          </div>

          {/* Edit Form */}
          <div className="max-w-xl mx-auto space-y-6">
            {/* Avatar */}
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center text-primary text-2xl font-semibold">
                {selectedPatient.initials}
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <User weight="regular" className="w-4 h-4" />
                  Nome completo
                </label>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="bg-card border-border focus:border-primary"
                  placeholder="Nome do paciente"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <EnvelopeSimple weight="regular" className="w-4 h-4" />
                  E-mail
                </label>
                <Input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="bg-card border-border focus:border-primary"
                  placeholder="email@exemplo.com"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Phone weight="regular" className="w-4 h-4" />
                  Telefone
                </label>
                <Input
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="bg-card border-border focus:border-primary"
                  placeholder="(00) 00000-0000"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Note weight="regular" className="w-4 h-4" />
                  Observações
                </label>
                <Textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="bg-card border-border focus:border-primary min-h-[120px]"
                  placeholder="Anotações sobre o paciente..."
                />
              </div>
            </div>

            {/* Stats (read-only) */}
            <div className="bg-card border border-border rounded-xl p-4">
              <p className="text-sm text-muted-foreground mb-3">Estatísticas</p>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-semibold text-foreground">
                    {selectedPatient.totalConsultations}
                  </p>
                  <p className="text-xs text-muted-foreground">Consultas</p>
                </div>
                <div>
                  <p className={cn("text-2xl font-semibold", getScoreColor(selectedPatient.averageScore))}>
                    {selectedPatient.averageScore}
                  </p>
                  <p className="text-xs text-muted-foreground">Score médio</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold text-foreground">
                    {selectedPatient.lastConsultation}
                  </p>
                  <p className="text-xs text-muted-foreground">Última</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 gap-2 text-destructive hover:text-destructive"
              >
                <Trash weight="regular" className="w-5 h-5" />
                Excluir
              </Button>
              <Button onClick={handleSavePatient} className="flex-1 gap-2">
                <FloppyDisk weight="bold" className="w-5 h-5" />
                Salvar
              </Button>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  // History View
  if (viewState === "history" && selectedPatient) {
    return (
      <AppLayout>
        <div className="min-h-full bg-background p-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={handleBackToList}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft weight="bold" className="w-5 h-5" />
              <span>Voltar</span>
            </button>
          </div>

          {/* Patient Info */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xl font-semibold">
              {selectedPatient.initials}
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">
                {selectedPatient.name}
              </h1>
              <p className="text-muted-foreground text-sm">
                Histórico de Consultas e Análises
              </p>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <ChatCircle weight="duotone" className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-semibold text-foreground">
                {selectedPatient.totalConsultations}
              </p>
              <p className="text-xs text-muted-foreground">Consultas</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <ChartLineUp weight="duotone" className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className={cn("text-2xl font-semibold", getScoreColor(selectedPatient.averageScore))}>
                {selectedPatient.averageScore}
              </p>
              <p className="text-xs text-muted-foreground">Score Médio</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <TrendUp weight="duotone" className="w-6 h-6 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-semibold text-green-500">+12%</p>
              <p className="text-xs text-muted-foreground">Evolução</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <Target weight="duotone" className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-semibold text-foreground">6</p>
              <p className="text-xs text-muted-foreground">Tipo Eneagrama</p>
            </div>
          </div>

          {/* AI Insight Card */}
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-5 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Brain weight="duotone" className="w-6 h-6 text-primary" />
              <h3 className="text-foreground font-medium">Insight Geral da IA</h3>
              <Sparkle weight="fill" className="w-4 h-4 text-primary ml-auto" />
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Com base nas {selectedPatient.totalConsultations} consultas analisadas, identificamos que {selectedPatient.name} apresenta perfil 
              consistente do <span className="text-primary font-medium">Tipo 6 (O Leal)</span> do Eneagrama. 
              Suas consultas mais bem-sucedidas incluem elementos de <span className="text-foreground">segurança e provas sociais</span>. 
              Recomendamos focar em construir confiança gradual e oferecer garantias claras sobre os procedimentos.
            </p>
          </div>

          {/* Consultation History List */}
          <div className="space-y-4">
            <h3 className="text-foreground font-medium flex items-center gap-2">
              <ClockCounterClockwise weight="regular" className="w-5 h-5 text-muted-foreground" />
              Histórico de Consultas
            </h3>

            {mockConsultationHistory.map((consultation) => (
              <div
                key={consultation.id}
                className="bg-card border border-border rounded-xl overflow-hidden"
              >
                {/* Consultation Header */}
                <button
                  onClick={() =>
                    setExpandedConsultation(
                      expandedConsultation === consultation.id ? null : consultation.id
                    )
                  }
                  className="w-full p-4 flex items-center gap-4 hover:bg-secondary/30 transition-colors"
                >
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar weight="regular" className="w-4 h-4" />
                    <span className="text-sm">{consultation.date}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {consultation.duration}
                  </div>
                  <div className="flex-1" />
                  <div
                    className={cn(
                      "px-3 py-1 rounded-full text-sm font-medium border",
                      getScoreBg(consultation.score),
                      getScoreColor(consultation.score)
                    )}
                  >
                    Score: {consultation.score}
                  </div>
                  <CaretRight
                    weight="bold"
                    className={cn(
                      "w-5 h-5 text-muted-foreground transition-transform",
                      expandedConsultation === consultation.id && "rotate-90"
                    )}
                  />
                </button>

                {/* Expanded Content */}
                {expandedConsultation === consultation.id && (
                  <div className="px-4 pb-4 space-y-4 border-t border-border pt-4">
                    {/* Enneagram Badge */}
                    <div className="flex items-center gap-2">
                      <div className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium">
                        Tipo {consultation.enneagramType}: {consultation.enneagramName}
                      </div>
                    </div>

                    {/* Strengths */}
                    <div>
                      <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                        <CheckCircle weight="fill" className="w-4 h-4 text-green-500" />
                        O que você fez bem
                      </p>
                      <ul className="space-y-1">
                        {consultation.strengths.map((strength, idx) => (
                          <li
                            key={idx}
                            className="text-sm text-foreground flex items-center gap-2"
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Improvements */}
                    <div>
                      <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                        <WarningCircle weight="fill" className="w-4 h-4 text-yellow-500" />
                        Oportunidades de melhoria
                      </p>
                      <ul className="space-y-1">
                        {consultation.improvements.map((improvement, idx) => (
                          <li
                            key={idx}
                            className="text-sm text-foreground flex items-center gap-2"
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                            {improvement}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* AI Insight */}
                    <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Brain weight="duotone" className="w-5 h-5 text-primary" />
                        <span className="text-sm font-medium text-foreground">
                          Análise da IA
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {consultation.aiInsight}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* New Consultation Button */}
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 sm:static sm:translate-x-0 sm:mt-6">
            <Button
              onClick={() => {
                setViewState("recording");
              }}
              size="lg"
              className="gap-2 shadow-lg"
            >
              <Microphone weight="bold" className="w-5 h-5" />
              Nova Consulta
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Recording View
  if (viewState === "recording" && selectedPatient) {
    return (
      <AppLayout>
        <div className="min-h-full bg-background p-6">
          {/* Recording Header */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={handleBackToList}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft weight="bold" className="w-5 h-5" />
              <span>Voltar</span>
            </button>
            <div className="text-center">
              <p className="text-foreground font-medium">{selectedPatient.name}</p>
            </div>
            <div className="text-primary font-mono text-lg">
              {formatTime(recordingTime)}
            </div>
          </div>

          {/* Recording Interface */}
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
            {!isRecording ? (
              <>
                {/* Initial State */}
                <button
                  onClick={handleToggleRecording}
                  className="w-32 h-32 rounded-full border-2 border-primary flex items-center justify-center hover:bg-primary/10 transition-all duration-300 group"
                >
                  <Microphone weight="duotone" className="w-12 h-12 text-primary group-hover:scale-110 transition-transform" />
                </button>
                <div className="text-center">
                  <p className="text-foreground text-lg mb-2">
                    Toque para iniciar a gravação
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Posicione o dispositivo próximo à conversa
                  </p>
                </div>

                {/* Tips Card */}
                <div className="w-full max-w-md bg-primary/10 rounded-xl p-4 border border-primary/20">
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb weight="duotone" className="w-5 h-5 text-primary" />
                    <span className="text-foreground font-medium">
                      Dicas para uma boa gravação:
                    </span>
                  </div>
                  <ul className="space-y-2 text-muted-foreground text-sm">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      Ambiente silencioso
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      Dispositivo próximo
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      Fale naturalmente
                    </li>
                  </ul>
                </div>
              </>
            ) : (
              <>
                {/* Recording State */}
                <div className="relative">
                  <div
                    className={cn(
                      "w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300",
                      isPaused
                        ? "border-2 border-yellow-500"
                        : "border-2 border-red-500 animate-pulse"
                    )}
                  >
                    <Microphone
                      weight="duotone"
                      className={cn(
                        "w-12 h-12",
                        isPaused ? "text-yellow-500" : "text-red-500"
                      )}
                    />
                  </div>
                  {!isPaused && (
                    <div className="absolute inset-0 rounded-full border-2 border-red-500/30 animate-ping" />
                  )}
                </div>

                {/* Waveform Animation */}
                {!isPaused && (
                  <div className="flex items-center gap-1 h-10">
                    {Array.from({ length: 20 }).map((_, i) => (
                      <div
                        key={i}
                        className="w-1 bg-primary rounded-full animate-pulse"
                        style={{
                          height: `${Math.random() * 30 + 10}px`,
                          animationDelay: `${i * 0.05}s`,
                        }}
                      />
                    ))}
                  </div>
                )}

                {/* Timer */}
                <div className="text-5xl font-mono text-foreground">
                  {formatTime(recordingTime)}
                </div>

                <p
                  className={cn(
                    "text-sm",
                    isPaused ? "text-yellow-500" : "text-red-500"
                  )}
                >
                  {isPaused ? "Gravação pausada" : "Gravando..."}
                </p>

                {/* Recording Controls */}
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleToggleRecording}
                    className="gap-2"
                  >
                    {isPaused ? (
                      <>
                        <Play weight="bold" className="w-5 h-5" />
                        Continuar
                      </>
                    ) : (
                      <>
                        <Pause weight="bold" className="w-5 h-5" />
                        Pausar
                      </>
                    )}
                  </Button>
                  <Button
                    variant="destructive"
                    size="lg"
                    onClick={handleStopRecording}
                    className="gap-2"
                  >
                    <Stop weight="bold" className="w-5 h-5" />
                    Finalizar
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </AppLayout>
    );
  }

  // List View (default)
  return (
    <AppLayout>
      <div className="min-h-full bg-background p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Stethoscope weight="duotone" className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-semibold text-foreground">
              Analisar Consulta
            </h1>
          </div>
          <p className="text-muted-foreground">
            Selecione um paciente para iniciar
          </p>
        </div>

        {/* Search and Add */}
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <MagnifyingGlass weight="light" className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Buscar paciente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card border-border focus:border-primary"
            />
          </div>
          <Button variant="outline" className="gap-2">
            <UserPlus weight="bold" className="w-5 h-5" />
            <span className="hidden sm:inline">Adicionar Paciente</span>
          </Button>
        </div>

        {/* Patient List */}
        <div className="space-y-3">
          {filteredPatients.map((patient) => (
            <button
              key={patient.id}
              onClick={() => handlePatientClick(patient)}
              className="w-full bg-card border border-border rounded-xl p-4 flex items-center gap-4 hover:border-primary/30 transition-all duration-200 group"
            >
              {/* Avatar */}
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                {patient.initials}
              </div>

              {/* Info */}
              <div className="flex-1 text-left">
                <p className="text-foreground font-medium">{patient.name}</p>
                <p className="text-muted-foreground text-sm">
                  Última consulta: {patient.lastConsultation}
                </p>
              </div>

              {/* Stats */}
              <div className="text-right hidden sm:block">
                <p className="text-foreground text-sm">
                  {patient.totalConsultations} consultas
                </p>
                <p className="text-muted-foreground text-sm">
                  Score médio: {patient.averageScore}
                </p>
              </div>

              {/* Chevron */}
              <CaretRight weight="bold" className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </button>
          ))}

          {filteredPatients.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p>Nenhum paciente encontrado</p>
            </div>
          )}
        </div>

        {/* Patient Options Modal */}
        <Dialog open={showPatientModal} onOpenChange={setShowPatientModal}>
          <DialogContent className="bg-card border-border max-w-sm">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                  {selectedPatient?.initials}
                </div>
                <span className="text-foreground">{selectedPatient?.name}</span>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3 mt-4">
              <Button
                onClick={handleStartRecording}
                className="w-full gap-2 justify-start"
                size="lg"
              >
                <Microphone weight="bold" className="w-5 h-5" />
                Analisar Nova Consulta
              </Button>
              <Button
                variant="outline"
                className="w-full gap-2 justify-start"
                size="lg"
                onClick={handleViewHistory}
              >
                <ClockCounterClockwise weight="regular" className="w-5 h-5" />
                Ver Histórico
              </Button>
              <Button
                variant="ghost"
                className="w-full gap-2 justify-start text-muted-foreground"
                size="lg"
                onClick={handleEditPatient}
              >
                <PencilSimple weight="regular" className="w-5 h-5" />
                Editar Paciente
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
