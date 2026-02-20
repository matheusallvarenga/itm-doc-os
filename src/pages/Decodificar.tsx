import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Crosshair, ArrowRight, Clock, User, ArrowLeft, CheckCircle, CircleNotch, Brain, Lightbulb, WarningCircle, Quotes } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

const enneagramTypes: Record<number, { name: string; color: string }> = {
  1: { name: "Perfeccionista", color: "bg-red-500/20 text-red-400 border-red-500/30" },
  2: { name: "Doador", color: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
  3: { name: "Realizador", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  4: { name: "Individualista", color: "bg-green-500/20 text-green-400 border-green-500/30" },
  5: { name: "Investigador", color: "bg-teal-500/20 text-teal-400 border-teal-500/30" },
  6: { name: "Lealista", color: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" },
  7: { name: "Entusiasta", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  8: { name: "Desafiador", color: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30" },
  9: { name: "Pacificador", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
};

const questions = [
  { id: 1, question: "Como o paciente se comporta na sala de espera?", options: ["Quieto e observador", "Conversando com todos", "Impaciente, olhando o relógio", "Lendo algo ou no celular"] },
  { id: 2, question: "Como ele reage quando você explica o procedimento?", options: ["Faz muitas perguntas detalhadas", "Concorda rapidamente", "Mostra preocupação com resultados", "Quer saber o preço logo"] },
  { id: 3, question: "Qual a principal preocupação dele?", options: ["Segurança e garantias", "Preço e custo-benefício", "Resultado estético", "Tempo de recuperação"] },
  { id: 4, question: "Como ele toma decisões?", options: ["Precisa consultar alguém", "Decide sozinho mas demora", "Decide rápido", "Pesquisa muito antes"] },
  { id: 5, question: "Como ele lida com objeções?", options: ["Fica desconfiado", "Aceita suas explicações", "Tenta negociar", "Fica em silêncio"] },
];

interface DecodResult {
  enneagramType: number;
  enneagramName: string;
  confidence: number;
  description: string;
  howTheyThink: string[];
  communicationTips: string[];
  phrasesToUse: string[];
  phrasesToAvoid: string[];
  closingStrategy: string;
}

type ViewState = "main" | "quiz" | "result";

export default function Decodificar() {
  const { user, profile } = useAuth();
  const [viewState, setViewState] = useState<ViewState>("main");
  const [patientName, setPatientName] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ question: string; answer: string }[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<DecodResult | null>(null);
  const [recentPatients, setRecentPatients] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase.from("patients").select("*").eq("user_id", user.id).not("enneagram_type", "is", null).order("updated_at", { ascending: false }).limit(5);
      if (data) setRecentPatients(data);
    };
    load();
  }, [user, viewState]);

  const handleStartQuiz = () => {
    if (!patientName.trim()) { toast({ title: "Digite o nome do paciente" }); return; }
    setCurrentQuestion(0);
    setAnswers([]);
    setViewState("quiz");
  };

  const handleAnswer = async (answer: string) => {
    const newAnswers = [...answers, { question: questions[currentQuestion].question, answer }];
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // All questions answered, call AI
      setAnalyzing(true);
      try {
        const { data, error } = await supabase.functions.invoke("decode-patient", {
          body: { answers: newAnswers, patientName, specialty: profile?.specialty || "" },
        });
        if (error) throw error;
        const res = data.result as DecodResult;
        setResult(res);

        // Save/update patient
        if (user) {
          const { data: existing } = await supabase.from("patients").select("id").eq("user_id", user.id).ilike("name", patientName).maybeSingle();
          if (existing) {
            await supabase.from("patients").update({ enneagram_type: res.enneagramType, enneagram_name: res.enneagramName }).eq("id", existing.id);
          } else {
            await supabase.from("patients").insert({ user_id: user.id, name: patientName, enneagram_type: res.enneagramType, enneagram_name: res.enneagramName });
          }
          await supabase.from("activity_log").insert({ user_id: user.id, type: "decodificar", description: `Decodificou: ${patientName} - Tipo ${res.enneagramType}`, points: 5 });
        }
        setViewState("result");
      } catch (e: any) {
        toast({ title: "Erro na análise", description: e.message, variant: "destructive" });
      } finally {
        setAnalyzing(false);
      }
    }
  };

  const handleReset = () => {
    setViewState("main"); setPatientName(""); setResult(null); setAnswers([]); setCurrentQuestion(0);
  };

  // Quiz View
  if (viewState === "quiz") {
    if (analyzing) {
      return (
        <AppLayout>
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <CircleNotch weight="bold" className="w-12 h-12 text-primary animate-spin mb-4" />
            <p className="text-foreground font-medium">Analisando perfil de {patientName}...</p>
            <p className="text-sm text-muted-foreground mt-1">A IA está identificando o tipo de Eneagrama</p>
          </div>
        </AppLayout>
      );
    }
    const q = questions[currentQuestion];
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={handleReset}><ArrowLeft weight="bold" className="w-5 h-5" /></Button>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Paciente: <span className="text-foreground font-medium">{patientName}</span></p>
              <p className="text-xs text-muted-foreground">Pergunta {currentQuestion + 1} de {questions.length}</p>
            </div>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }} />
          </div>
          <div className="bg-card border border-border/50 rounded-xl p-8">
            <h2 className="text-xl font-semibold text-foreground mb-6">{q.question}</h2>
            <div className="space-y-3">
              {q.options.map((opt, i) => (
                <button key={i} onClick={() => handleAnswer(opt)} className="w-full p-4 text-left rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-foreground">{opt}</button>
              ))}
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Result View
  if (viewState === "result" && result) {
    return (
      <AppLayout>
        <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-foreground">Resultado: {patientName}</h1>
            <Button variant="outline" onClick={handleReset}>Nova Análise</Button>
          </div>
          <div className="bg-card border border-border/50 rounded-xl p-8 text-center">
            <div className={cn("inline-flex items-center justify-center w-24 h-24 rounded-2xl border-2 text-5xl font-bold mb-4", enneagramTypes[result.enneagramType]?.color || "bg-primary/20 text-primary border-primary/30")}>{result.enneagramType}</div>
            <h2 className="text-2xl font-bold text-foreground">{result.enneagramName}</h2>
            <p className="text-sm text-muted-foreground mt-1">Confiança: {result.confidence}%</p>
            <p className="text-muted-foreground mt-4 max-w-lg mx-auto">{result.description}</p>
          </div>
          <div className="bg-card border border-border/50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4"><Brain weight="duotone" className="w-5 h-5 text-primary" /><h2 className="text-lg font-semibold text-foreground">Como esse paciente pensa</h2></div>
            <ul className="space-y-2">{result.howTheyThink.map((t, i) => <li key={i} className="flex items-start gap-2 text-muted-foreground"><span className="text-primary">•</span>{t}</li>)}</ul>
          </div>
          <div className="bg-card border border-border/50 rounded-xl p-6 border-l-4 border-l-green-500">
            <div className="flex items-center gap-3 mb-4"><Lightbulb weight="duotone" className="w-5 h-5 text-green-400" /><h2 className="text-lg font-semibold text-foreground">Dicas de Comunicação</h2></div>
            <ul className="space-y-2">{result.communicationTips.map((t, i) => <li key={i} className="flex items-start gap-2 text-muted-foreground"><CheckCircle weight="fill" className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />{t}</li>)}</ul>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-3"><Quotes weight="duotone" className="w-5 h-5 text-green-400" /><h3 className="font-semibold text-foreground">Use essas frases</h3></div>
              <ul className="space-y-2">{result.phrasesToUse.map((p, i) => <li key={i} className="text-sm text-muted-foreground italic">"{p}"</li>)}</ul>
            </div>
            <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-3"><WarningCircle weight="duotone" className="w-5 h-5 text-red-400" /><h3 className="font-semibold text-foreground">Evite essas frases</h3></div>
              <ul className="space-y-2">{result.phrasesToAvoid.map((p, i) => <li key={i} className="text-sm text-muted-foreground italic">"{p}"</li>)}</ul>
            </div>
          </div>
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3"><Crosshair weight="duotone" className="w-5 h-5 text-primary" /><h3 className="font-semibold text-foreground">Estratégia de Fechamento</h3></div>
            <p className="text-muted-foreground">{result.closingStrategy}</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Main View
  return (
    <AppLayout>
      <div className="space-y-8 animate-fade-in">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Decodificar <span className="accent-text">Paciente</span></h1>
          <p className="text-muted-foreground mt-1">Descubra o tipo de Eneagrama do seu paciente e saiba como conduzi-lo</p>
        </div>

        <div className="bg-card border border-border/50 rounded-xl p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
            <div className="p-4 rounded-2xl bg-primary/10 glow-primary-sm"><Crosshair weight="duotone" className="w-12 h-12 text-primary" /></div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-xl font-semibold text-foreground mb-2">Novo Diagnóstico de Eneagrama</h2>
              <p className="text-muted-foreground max-w-lg">Responda perguntas sobre comportamentos observados e receba orientações personalizadas via IA.</p>
              <div className="mt-4 flex gap-3 items-center justify-center md:justify-start">
                <Input placeholder="Nome do paciente" value={patientName} onChange={(e) => setPatientName(e.target.value)} className="max-w-xs" />
                <Button size="lg" className="gap-2" onClick={handleStartQuiz}>
                  Iniciar <ArrowRight weight="bold" className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Os 9 Tipos do Eneagrama</h2>
          <div className="grid grid-cols-3 md:grid-cols-9 gap-2">
            {Object.entries(enneagramTypes).map(([code, { name, color }]) => (
              <div key={code} className={cn("flex flex-col items-center justify-center p-3 rounded-lg border transition-all hover:scale-105 cursor-pointer", color)}>
                <span className="text-2xl font-bold">{code}</span>
                <span className="text-[10px] text-center mt-1 opacity-80">{name}</span>
              </div>
            ))}
          </div>
        </div>

        {recentPatients.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">Pacientes Decodificados</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recentPatients.map((patient) => (
                <div key={patient.id} className="bg-card border border-border/50 rounded-xl p-5 card-hover cursor-pointer">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-secondary"><User weight="light" className="w-5 h-5 text-muted-foreground" /></div>
                      <div>
                        <p className="font-medium text-foreground">{patient.name}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground"><Clock weight="light" className="w-3 h-3" />{new Date(patient.updated_at).toLocaleDateString("pt-BR")}</div>
                      </div>
                    </div>
                    {patient.enneagram_type && (
                      <div className={cn("w-10 h-10 rounded-lg border flex items-center justify-center font-bold text-lg", enneagramTypes[patient.enneagram_type]?.color || "")}>{patient.enneagram_type}</div>
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground">Tipo: <span className="text-foreground">{patient.enneagram_name}</span></span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-secondary/30 border border-border/30 rounded-xl p-6">
          <h3 className="font-medium text-foreground mb-3">O que é o <span className="accent-text">Eneagrama</span>?</h3>
          <p className="text-sm text-muted-foreground mb-4">O Eneagrama é um sistema de 9 tipos de personalidade que revela padrões de comportamento, motivações e medos centrais.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
            <div className="flex gap-3"><span className="text-primary font-bold">1.</span><p>Observe comportamentos e responda perguntas</p></div>
            <div className="flex gap-3"><span className="text-primary font-bold">2.</span><p>A IA identifica o tipo (1 a 9)</p></div>
            <div className="flex gap-3"><span className="text-primary font-bold">3.</span><p>Receba scripts e frases personalizadas</p></div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
