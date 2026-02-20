import { useState, useEffect, useRef } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  ChatCircle, Play, Clock, Star, Question, CurrencyDollar, Users, Shield, UserMinus, Lightning,
  ArrowLeft, PaperPlaneTilt, FileText, User, Crosshair, Lightbulb, ThumbsUp, Warning, WarningCircle,
  CheckCircle, X, TrendUp, Quotes, BookmarkSimple, ArrowsClockwise, CaretDown, CaretUp, CircleNotch,
} from "@phosphor-icons/react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

type Difficulty = "easy" | "medium" | "hard";
type SimulationResult = "closed" | "thinking" | "lost";

interface Scenario {
  id: string; title: string; description: string; difficulty: Difficulty; duration: number; icon: any; profile: string;
}

interface ChatMessage {
  id: string; sender: "patient" | "doctor"; content: string; timestamp: Date;
}

interface KeyMoment {
  type: "positive" | "objection" | "opportunity" | "error"; description: string; excerpt: string;
}

interface SimulationFeedback {
  score: number; strengths: string[]; improvements: string[]; keyMoments: KeyMoment[]; recommendations: string[]; suggestedPhrase: string;
}

const scenarios: Scenario[] = [
  { id: "indeciso", title: "O Indeciso", description: "O paciente demonstra interesse mas hesita em fechar", difficulty: "easy", duration: 5, icon: Question, profile: "indeciso" },
  { id: "preco", title: "Objeção de Preço", description: "O paciente acha caro e quer desconto", difficulty: "medium", duration: 7, icon: CurrencyDollar, profile: "pesquisador" },
  { id: "concorrente", title: "Comparação com Concorrente", description: "Outro médico faz mais barato", difficulty: "hard", duration: 8, icon: Users, profile: "desconfiado" },
  { id: "desconfiado", title: "O Desconfiado", description: "Duvida dos resultados e quer garantias", difficulty: "medium", duration: 6, icon: Shield, profile: "desconfiado" },
  { id: "simpatico", title: "O Simpático que Some", description: "Concorda com tudo mas depois não retorna", difficulty: "hard", duration: 7, icon: UserMinus, profile: "simpatico" },
  { id: "apressado", title: "O Apressado", description: "Quer resultado rápido, sem paciência para explicações", difficulty: "medium", duration: 5, icon: Lightning, profile: "apressado" },
];

const scenarioContexts: Record<string, any> = {
  indeciso: { patient: { name: "Marina", age: 38, procedure: "Lentes de contato dental", situation: "Veio por indicação. Interesse mas não decide.", referral: "Indicação de amiga" }, profile: { howTheyThink: ["Muda de ideia toda hora.", "Medo de se arrepender.", "Precisa de segurança."] }, objectives: ["Criar rapport", "Dar clareza", "Ajudá-la a decidir"], tip: "Pergunte: 'O que te faria se sentir segura pra decidir?'", initialMessage: "Oi doutor, tudo bem? A Carla me indicou, ela fez as lentes com você e ficou linda! Tô pensando em fazer também, mas ainda tô em dúvida..." },
  preco: { patient: { name: "Roberto", age: 45, procedure: "Implante dental", situation: "Pesquisou muito. Sabe o valor médio.", referral: "Google" }, profile: { howTheyThink: ["Compara preços.", "Quer desconto.", "Valoriza custo-benefício."] }, objectives: ["Mostrar valor agregado", "Evitar guerra de preços", "Apresentar diferenciais"], tip: "Justifique o VALOR, não o preço.", initialMessage: "Boa tarde, doutor. O seu preço tá um pouco acima da média. Tem como fazer um desconto?" },
  concorrente: { patient: { name: "Fernanda", age: 32, procedure: "Harmonização facial", situation: "Consultou outro que cobrou menos.", referral: "Redes sociais" }, profile: { howTheyThink: ["Insegura sobre qual escolher.", "Usa concorrente como moeda de troca.", "Quer ser convencida."] }, objectives: ["Entender o que o concorrente ofereceu", "Destacar diferenciais", "Mostrar autoridade"], tip: "Pergunte: 'O que te fez vir aqui se já tinha opção?'", initialMessage: "Oi, vi seu trabalho no Instagram. Mas outro médico cobrou bem menos. Por que o seu é mais caro?" },
  desconfiado: { patient: { name: "Carlos", age: 50, procedure: "Prótese dentária", situation: "Experiência ruim anterior. Desconfia de promessas.", referral: "Indicação familiar" }, profile: { howTheyThink: ["Já foi enganado.", "Questiona tudo.", "Precisa de segurança."] }, objectives: ["Construir confiança", "Mostrar provas", "Não prometer demais"], tip: "Dizer 'depende' é melhor que prometer demais.", initialMessage: "Doutor, vou ser direto. Já fui enganado por outro dentista. Como me garante que o resultado vai ser bom?" },
  simpatico: { patient: { name: "Juliana", age: 28, procedure: "Clareamento dental", situation: "Super simpática, mas some depois.", referral: "Instagram" }, profile: { howTheyThink: ["Não gosta de conflito.", "Diz sim mas não se compromete.", "Precisa de empurrão gentil."] }, objectives: ["Identificar interesse real", "Criar compromisso", "Agendar antes de sair"], tip: "Pergunte: 'O que pode te impedir de fazer?'", initialMessage: "Ai que lindo seu consultório! Amei tudo! O clareamento parece ser exatamente o que eu preciso! Como funciona?" },
  apressado: { patient: { name: "André", age: 42, procedure: "Extração de siso", situation: "Executivo sem tempo.", referral: "Convênio" }, profile: { howTheyThink: ["Tempo é dinheiro.", "Quer informações diretas.", "Irrita com explicações longas."] }, objectives: ["Ser objetivo", "Mostrar eficiência", "Resolver rápido"], tip: "Comece com: 'Vou ser direto com você.'", initialMessage: "Doutor, tenho reunião em 40 minutos. Preciso resolver esse siso. Quanto tempo e quanto custa?" },
};

const difficultyConfig: Record<Difficulty, { label: string; class: string }> = {
  easy: { label: "Fácil", class: "bg-green-500/15 text-green-400" },
  medium: { label: "Médio", class: "bg-yellow-500/15 text-yellow-400" },
  hard: { label: "Difícil", class: "bg-red-500/15 text-red-400" },
};

export default function Simulador() {
  const { user } = useAuth();
  const [viewState, setViewState] = useState<"list" | "preparation" | "chat" | "feedback">("list");
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [timer, setTimer] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [contextExpanded, setContextExpanded] = useState(true);
  const [feedback, setFeedback] = useState<SimulationFeedback | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [feedbackResult, setFeedbackResult] = useState<SimulationResult>("thinking");
  const [recentSimulations, setRecentSimulations] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, avgScore: 0 });
  const chatRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load recent simulations
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase.from("simulations").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5);
      if (data) {
        setRecentSimulations(data);
        const scores = data.filter(s => s.score).map(s => s.score!);
        setStats({ total: data.length, avgScore: scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0 });
      }
    };
    load();
  }, [user, viewState]);

  useEffect(() => {
    if (viewState === "chat") { timerRef.current = setInterval(() => setTimer(p => p + 1), 1000); }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [viewState]);

  useEffect(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight; }, [messages]);

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  const handleStartScenario = (scenario: Scenario) => { setSelectedScenario(scenario); setViewState("preparation"); };

  const handleBeginSimulation = () => {
    if (!selectedScenario) return;
    const ctx = scenarioContexts[selectedScenario.id];
    setMessages([{ id: "1", sender: "patient", content: ctx.initialMessage, timestamp: new Date() }]);
    setTimer(0);
    setViewState("chat");
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !selectedScenario || isTyping) return;
    const doctorMsg: ChatMessage = { id: Date.now().toString(), sender: "doctor", content: inputValue.trim(), timestamp: new Date() };
    const newMessages = [...messages, doctorMsg];
    setMessages(newMessages);
    setInputValue("");
    setIsTyping(true);

    try {
      const ctx = scenarioContexts[selectedScenario.id];
      const { data, error } = await supabase.functions.invoke("simulate-consultation", {
        body: {
          action: "chat",
          messages: newMessages.map(m => ({ sender: m.sender, content: m.content })),
          scenario: { title: selectedScenario.title, description: selectedScenario.description, patientName: ctx.patient.name, patientAge: ctx.patient.age, procedure: ctx.patient.procedure, situation: ctx.patient.situation, profile: ctx.profile.howTheyThink.join(" ") },
        },
      });
      if (error) throw error;
      const patientMsg: ChatMessage = { id: (Date.now() + 1).toString(), sender: "patient", content: data.content || "Hmm, entendo...", timestamp: new Date() };
      setMessages(prev => [...prev, patientMsg]);
    } catch (e: any) {
      toast({ title: "Erro na IA", description: e.message || "Tente novamente", variant: "destructive" });
    } finally {
      setIsTyping(false);
    }
  };

  const handleEndSimulation = async (result: SimulationResult) => {
    if (!selectedScenario || !user) return;
    setShowEndModal(false);
    setIsAnalyzing(true);
    setFeedbackResult(result);

    try {
      const ctx = scenarioContexts[selectedScenario.id];
      const { data, error } = await supabase.functions.invoke("simulate-consultation", {
        body: {
          action: "feedback",
          messages: messages.map(m => ({ sender: m.sender, content: m.content })),
          scenario: { title: selectedScenario.title, description: selectedScenario.description, patientName: ctx.patient.name, patientAge: ctx.patient.age, procedure: ctx.patient.procedure, situation: ctx.patient.situation, profile: ctx.profile.howTheyThink.join(" ") },
        },
      });
      if (error) throw error;

      const fb = data.feedback as SimulationFeedback;
      setFeedback(fb);

      // Save to DB
      await supabase.from("simulations").insert({
        user_id: user.id,
        scenario_id: selectedScenario.id,
        scenario_title: selectedScenario.title,
        score: fb.score,
        result,
        messages: messages.map(m => ({ sender: m.sender, content: m.content })) as any,
        feedback: fb as any,
      });

      // Log activity
      await supabase.from("activity_log").insert({ user_id: user.id, type: "simulacao", description: `Simulação: ${selectedScenario.title} - Score: ${fb.score}`, points: Math.floor(fb.score / 10) });

    } catch (e: any) {
      toast({ title: "Erro na análise", description: e.message || "Tente novamente", variant: "destructive" });
      setFeedback({ score: 0, strengths: [], improvements: [], keyMoments: [], recommendations: ["Tente novamente"], suggestedPhrase: "" });
    } finally {
      setIsAnalyzing(false);
      setViewState("feedback");
    }
  };

  const handleBackToList = () => {
    setViewState("list"); setSelectedScenario(null); setMessages([]); setTimer(0); setFeedback(null);
  };

  // List View
  if (viewState === "list") {
    return (
      <AppLayout>
        <div className="space-y-8 animate-fade-in">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Simulador de <span className="text-primary italic">Consulta</span></h1>
            <p className="text-muted-foreground mt-1">Pratique cenários reais com IA e aprenda a conduzir consultas</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card border border-border/50 rounded-xl p-5">
              <div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-primary/10"><Play weight="bold" className="w-5 h-5 text-primary" /></div>
                <div><p className="text-2xl font-bold text-foreground">{stats.total}</p><p className="text-sm text-muted-foreground">Simulações</p></div></div>
            </div>
            <div className="bg-card border border-border/50 rounded-xl p-5">
              <div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-green-500/10"><Star weight="fill" className="w-5 h-5 text-green-400" /></div>
                <div><p className="text-2xl font-bold text-foreground">{stats.avgScore}%</p><p className="text-sm text-muted-foreground">Score médio</p></div></div>
            </div>
            <div className="bg-card border border-border/50 rounded-xl p-5">
              <div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-yellow-500/10"><Clock weight="regular" className="w-5 h-5 text-yellow-400" /></div>
                <div><p className="text-2xl font-bold text-foreground">IA Real</p><p className="text-sm text-muted-foreground">Respostas dinâmicas</p></div></div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">Escolha um Cenário</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {scenarios.map((scenario) => {
                const Icon = scenario.icon;
                return (
                  <div key={scenario.id} className="bg-card border border-border/50 rounded-xl p-6 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200 cursor-pointer group" onClick={() => handleStartScenario(scenario)}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors"><Icon weight="duotone" className="w-6 h-6 text-primary" /></div>
                      <span className={cn("text-xs px-2 py-1 rounded-full font-medium", difficultyConfig[scenario.difficulty].class)}>{difficultyConfig[scenario.difficulty].label}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{scenario.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{scenario.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground"><Clock weight="light" className="w-3 h-3" />{scenario.duration} min</div>
                      <Button size="sm" className="gap-2"><Play weight="bold" className="w-3 h-3" />Iniciar</Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {recentSimulations.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4">Simulações Recentes</h2>
              <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead><tr className="border-b border-border/50"><th className="text-left text-sm font-medium text-muted-foreground p-4">Cenário</th><th className="text-left text-sm font-medium text-muted-foreground p-4">Score</th><th className="text-left text-sm font-medium text-muted-foreground p-4">Data</th></tr></thead>
                  <tbody>
                    {recentSimulations.map((sim) => (
                      <tr key={sim.id} className="border-b border-border/30 last:border-0">
                        <td className="p-4"><div className="flex items-center gap-3"><ChatCircle weight="duotone" className="w-4 h-4 text-primary" /><span className="text-foreground">{sim.scenario_title}</span></div></td>
                        <td className="p-4"><div className="flex items-center gap-2"><div className="w-16 h-2 bg-secondary rounded-full overflow-hidden"><div className={cn("h-full rounded-full", (sim.score || 0) >= 80 ? "bg-green-500" : (sim.score || 0) >= 60 ? "bg-yellow-500" : "bg-red-500")} style={{ width: `${sim.score || 0}%` }} /></div><span className="text-sm text-foreground">{sim.score || 0}%</span></div></td>
                        <td className="p-4 text-sm text-muted-foreground">{new Date(sim.created_at).toLocaleDateString("pt-BR")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </AppLayout>
    );
  }

  // Preparation
  if (viewState === "preparation" && selectedScenario) {
    const ctx = scenarioContexts[selectedScenario.id];
    return (
      <AppLayout>
        <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={handleBackToList}><ArrowLeft weight="bold" className="w-5 h-5" /></Button>
            <div className="flex items-center gap-3"><h1 className="text-xl font-semibold text-foreground">{selectedScenario.title}</h1>
              <span className={cn("text-xs px-2 py-1 rounded-full font-medium", difficultyConfig[selectedScenario.difficulty].class)}>{difficultyConfig[selectedScenario.difficulty].label}</span></div>
          </div>
          <div className="bg-card border border-border/50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4"><div className="p-2 rounded-lg bg-primary/10"><FileText weight="duotone" className="w-5 h-5 text-primary" /></div><h2 className="text-lg font-semibold text-foreground">Contexto</h2></div>
            <div className="space-y-2 text-muted-foreground">
              <p><span className="text-foreground font-medium">Paciente:</span> {ctx.patient.name}, {ctx.patient.age} anos</p>
              <p><span className="text-foreground font-medium">Procedimento:</span> {ctx.patient.procedure}</p>
              <p><span className="text-foreground font-medium">Situação:</span> {ctx.patient.situation}</p>
            </div>
          </div>
          <div className="bg-card border border-border/50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4"><div className="p-2 rounded-lg bg-primary/10"><User weight="duotone" className="w-5 h-5 text-primary" /></div><h2 className="text-lg font-semibold text-foreground">Como esse paciente pensa</h2></div>
            <ul className="space-y-2">{ctx.profile.howTheyThink.map((t: string, i: number) => <li key={i} className="flex items-start gap-2 text-muted-foreground"><span className="text-primary mt-1">•</span>{t}</li>)}</ul>
          </div>
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
            <div className="flex items-start gap-3"><div className="p-2 rounded-lg bg-primary/10"><Lightbulb weight="duotone" className="w-5 h-5 text-primary" /></div>
              <div><h3 className="font-semibold text-foreground mb-1">Dica Rápida</h3><p className="text-muted-foreground">{ctx.tip}</p></div></div>
          </div>
          <Button className="w-full h-12 text-base gap-2" onClick={handleBeginSimulation}><Play weight="bold" className="w-5 h-5" />Começar Simulação</Button>
        </div>
      </AppLayout>
    );
  }

  // Chat
  if (viewState === "chat" && selectedScenario) {
    const ctx = scenarioContexts[selectedScenario.id];
    return (
      <AppLayout>
        <div className="h-[calc(100vh-8rem)] flex flex-col animate-fade-in">
          <div className="flex items-center justify-between pb-4 border-b border-border/50">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => setShowEndModal(true)}><ArrowLeft weight="bold" className="w-5 h-5" /></Button>
              <span className={cn("text-xs px-2 py-1 rounded-full font-medium", difficultyConfig[selectedScenario.difficulty].class)}>{selectedScenario.title}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-3 py-1 rounded-md bg-secondary text-muted-foreground text-sm font-mono">{formatTime(timer)}</div>
              <Button variant="outline" size="sm" className="text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => setShowEndModal(true)}>Encerrar</Button>
            </div>
          </div>
          <div className="py-3 border-b border-border/30">
            <button className="flex items-center justify-between w-full text-left" onClick={() => setContextExpanded(!contextExpanded)}>
              <span className="text-sm text-muted-foreground">{ctx.patient.name}, {ctx.patient.age} anos • {ctx.patient.procedure}</span>
              {contextExpanded ? <CaretUp weight="bold" className="w-4 h-4 text-muted-foreground" /> : <CaretDown weight="bold" className="w-4 h-4 text-muted-foreground" />}
            </button>
            {contextExpanded && <div className="mt-3 p-3 rounded-lg bg-secondary/50 text-sm text-muted-foreground"><p><strong className="text-foreground">Dica:</strong> {ctx.tip}</p></div>}
          </div>
          <div ref={chatRef} className="flex-1 overflow-y-auto py-4 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={cn("flex", msg.sender === "doctor" ? "justify-end" : "justify-start")}>
                <div className={cn("max-w-[80%] px-4 py-3", msg.sender === "doctor" ? "bg-primary text-primary-foreground rounded-[12px_12px_4px_12px]" : "bg-secondary text-foreground rounded-[12px_12px_12px_4px]")}>{msg.content}</div>
              </div>
            ))}
            {isTyping && <div className="flex justify-start"><div className="bg-secondary text-muted-foreground rounded-[12px_12px_12px_4px] px-4 py-3"><div className="flex items-center gap-1"><div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" /><div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} /><div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} /></div></div></div>}
          </div>
          <div className="pt-4 border-t border-border/50">
            <div className="flex gap-2">
              <textarea className="flex-1 min-h-[48px] max-h-[120px] px-4 py-3 bg-secondary border border-border/50 rounded-lg text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="Digite sua resposta..." value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }} />
              <Button className="h-12 w-12" onClick={handleSendMessage} disabled={!inputValue.trim() || isTyping}><PaperPlaneTilt weight="bold" className="w-5 h-5" /></Button>
            </div>
          </div>
        </div>

        <Dialog open={showEndModal} onOpenChange={setShowEndModal}>
          <DialogContent className="bg-card border-border"><DialogHeader><DialogTitle>Como você quer encerrar?</DialogTitle></DialogHeader>
            <div className="space-y-3 pt-4">
              <button className="w-full p-4 rounded-lg border border-green-500/30 bg-green-500/10 hover:bg-green-500/20 transition-colors flex items-center gap-3" onClick={() => handleEndSimulation("closed")}><CheckCircle weight="fill" className="w-5 h-5 text-green-400" /><span className="text-foreground">Consegui fechar</span></button>
              <button className="w-full p-4 rounded-lg border border-yellow-500/30 bg-yellow-500/10 hover:bg-yellow-500/20 transition-colors flex items-center gap-3" onClick={() => handleEndSimulation("thinking")}><Clock weight="regular" className="w-5 h-5 text-yellow-400" /><span className="text-foreground">Paciente vai pensar</span></button>
              <button className="w-full p-4 rounded-lg border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 transition-colors flex items-center gap-3" onClick={() => handleEndSimulation("lost")}><X weight="bold" className="w-5 h-5 text-red-400" /><span className="text-foreground">Não consegui fechar</span></button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isAnalyzing}><DialogContent className="bg-card border-border"><div className="flex flex-col items-center py-8"><CircleNotch weight="bold" className="w-12 h-12 text-primary animate-spin mb-4" /><p className="text-foreground font-medium">Analisando com IA...</p><p className="text-sm text-muted-foreground mt-1">Isso pode levar alguns segundos</p></div></DialogContent></Dialog>
      </AppLayout>
    );
  }

  // Feedback
  if (viewState === "feedback" && feedback && selectedScenario) {
    const resultConfig = {
      closed: { icon: CheckCircle, text: "Paciente fechou!", color: "text-green-400", bg: "bg-green-500/10" },
      thinking: { icon: Clock, text: "Paciente vai pensar", color: "text-yellow-400", bg: "bg-yellow-500/10" },
      lost: { icon: X, text: "Paciente não fechou", color: "text-red-400", bg: "bg-red-500/10" },
    };
    const result = resultConfig[feedbackResult];
    const ResultIcon = result.icon;

    return (
      <AppLayout>
        <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-foreground">Análise da Simulação</h1>
            <Button variant="outline" onClick={handleBackToList}>Nova Simulação</Button>
          </div>
          <div className="bg-card border border-border/50 rounded-xl p-8 text-center">
            <div className="relative inline-flex items-center justify-center mb-4">
              <svg className="w-32 h-32 transform -rotate-90"><circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="none" className="text-secondary" /><circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="none" strokeDasharray={`${(feedback.score / 100) * 352} 352`} strokeLinecap="round" className={feedback.score >= 70 ? "text-green-500" : feedback.score >= 50 ? "text-yellow-500" : "text-red-500"} /></svg>
              <span className="absolute text-4xl font-bold text-foreground">{feedback.score}</span>
            </div>
            <p className="text-lg text-muted-foreground mb-4">{feedback.score >= 80 ? "Excelente!" : feedback.score >= 70 ? "Bom!" : feedback.score >= 50 ? "Pode melhorar" : "Precisa praticar"}</p>
            <div className={cn("inline-flex items-center gap-2 px-4 py-2 rounded-full", result.bg)}><ResultIcon weight="fill" className={cn("w-5 h-5", result.color)} /><span className={result.color}>{result.text}</span></div>
          </div>
          {feedback.strengths.length > 0 && (
            <div className="bg-card border border-border/50 rounded-xl p-6 border-l-4 border-l-green-500">
              <div className="flex items-center gap-3 mb-4"><ThumbsUp weight="duotone" className="w-5 h-5 text-green-400" /><h2 className="text-lg font-semibold text-foreground">O que você fez bem</h2></div>
              <ul className="space-y-2">{feedback.strengths.map((s, i) => <li key={i} className="flex items-start gap-2 text-muted-foreground"><CheckCircle weight="fill" className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />{s}</li>)}</ul>
            </div>
          )}
          {feedback.improvements.length > 0 && (
            <div className="bg-card border border-border/50 rounded-xl p-6 border-l-4 border-l-yellow-500">
              <div className="flex items-center gap-3 mb-4"><Warning weight="duotone" className="w-5 h-5 text-yellow-400" /><h2 className="text-lg font-semibold text-foreground">Melhorias</h2></div>
              <ul className="space-y-2">{feedback.improvements.map((s, i) => <li key={i} className="flex items-start gap-2 text-muted-foreground"><WarningCircle weight="fill" className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />{s}</li>)}</ul>
            </div>
          )}
          {feedback.keyMoments.length > 0 && (
            <div className="bg-card border border-border/50 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4"><TrendUp weight="duotone" className="w-5 h-5 text-primary" /><h2 className="text-lg font-semibold text-foreground">Momentos-Chave</h2></div>
              <div className="space-y-3">{feedback.keyMoments.map((m, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
                  <div className={cn("w-3 h-3 rounded-full mt-1.5 flex-shrink-0", m.type === "positive" ? "bg-green-500" : m.type === "objection" ? "bg-yellow-500" : m.type === "opportunity" ? "bg-primary" : "bg-red-500")} />
                  <div><span className="text-sm text-foreground font-medium">{m.description}</span><p className="text-sm text-muted-foreground mt-1 italic">"{m.excerpt}"</p></div>
                </div>
              ))}</div>
            </div>
          )}
          {feedback.recommendations.length > 0 && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4"><Lightbulb weight="duotone" className="w-5 h-5 text-primary" /><h2 className="text-lg font-semibold text-foreground">O que fazer diferente</h2></div>
              <ul className="space-y-2">{feedback.recommendations.map((r, i) => <li key={i} className="flex items-start gap-2 text-muted-foreground"><span className="text-primary">•</span>{r}</li>)}</ul>
            </div>
          )}
          {feedback.suggestedPhrase && (
            <div className="bg-card border border-border/50 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4"><Quotes weight="duotone" className="w-5 h-5 text-primary" /><h2 className="text-lg font-semibold text-foreground">Frase que Funcionaria</h2></div>
              <p className="text-muted-foreground italic leading-relaxed">"{feedback.suggestedPhrase}"</p>
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" className="flex-1 gap-2" onClick={() => { setMessages([]); setTimer(0); handleBeginSimulation(); }}><ArrowsClockwise weight="bold" className="w-4 h-4" />Refazer</Button>
            <Button className="flex-1 gap-2" onClick={handleBackToList}><Play weight="bold" className="w-4 h-4" />Outro cenário</Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return null;
}
