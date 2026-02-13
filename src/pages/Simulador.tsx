import { useState, useEffect, useRef } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  ChatCircle,
  Play,
  Clock,
  Star,
  Question,
  CurrencyDollar,
  Users,
  Shield,
  UserMinus,
  Lightning,
  ArrowLeft,
  PaperPlaneTilt,
  FileText,
  User,
  Crosshair,
  Lightbulb,
  ThumbsUp,
  Warning,
  WarningCircle,
  CheckCircle,
  X,
  TrendUp,
  Quotes,
  BookmarkSimple,
  ArrowsClockwise,
  CaretDown,
  CaretUp,
  CircleNotch,
} from "@phosphor-icons/react";

// Types
type Difficulty = "easy" | "medium" | "hard";
type SimulationResult = "closed" | "thinking" | "lost";

interface Scenario {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  duration: number;
  icon: any;
  profile: string;
}

interface ChatMessage {
  id: string;
  sender: "patient" | "doctor";
  content: string;
  timestamp: Date;
}

interface KeyMoment {
  timestamp: number;
  type: "positive" | "objection" | "opportunity" | "error";
  description: string;
  excerpt: string;
}

interface SimulationFeedback {
  score: number;
  result: SimulationResult;
  strengths: string[];
  improvements: string[];
  keyMoments: KeyMoment[];
  recommendations: string[];
  suggestedPhrase: string;
}

// Mock Data
const scenarios: Scenario[] = [
  {
    id: "indeciso",
    title: "O Indeciso",
    description: "O paciente demonstra interesse mas hesita em fechar o procedimento",
    difficulty: "easy",
    duration: 5,
    icon: Question,
    profile: "indeciso",
  },
  {
    id: "preco",
    title: "Objeção de Preço",
    description: "O paciente acha o procedimento caro e quer desconto",
    difficulty: "medium",
    duration: 7,
    icon: CurrencyDollar,
    profile: "pesquisador",
  },
  {
    id: "concorrente",
    title: "Comparação com Concorrente",
    description: "O paciente menciona que outro médico faz mais barato",
    difficulty: "hard",
    duration: 8,
    icon: Users,
    profile: "desconfiado",
  },
  {
    id: "desconfiado",
    title: "O Desconfiado",
    description: "O paciente duvida dos resultados e quer garantias",
    difficulty: "medium",
    duration: 6,
    icon: Shield,
    profile: "desconfiado",
  },
  {
    id: "simpatico",
    title: "O Simpático que Some",
    description: "Concorda com tudo na consulta, mas depois não retorna",
    difficulty: "hard",
    duration: 7,
    icon: UserMinus,
    profile: "simpatico",
  },
  {
    id: "apressado",
    title: "O Apressado",
    description: "Quer resultado rápido e não tem paciência para explicações",
    difficulty: "medium",
    duration: 5,
    icon: Lightning,
    profile: "apressado",
  },
];

const scenarioContexts: Record<string, any> = {
  indeciso: {
    patient: {
      name: "Marina",
      age: 38,
      procedure: "Lentes de contato dental",
      situation: "Veio por indicação de uma amiga. Demonstra interesse mas não consegue tomar a decisão.",
      referral: "Indicação de amiga",
    },
    profile: {
      howTheyThink: [
        "Não sabe o que quer. Muda de ideia toda hora.",
        "Tem medo de se arrepender da decisão.",
        "Precisa de segurança e clareza para decidir.",
      ],
    },
    objectives: [
      "Criar rapport e entender o que ela realmente quer",
      "Dar clareza sobre o procedimento",
      "Ajudá-la a tomar uma decisão (fechar ou não)",
    ],
    tip: "Com o Indeciso, não pressione. Pergunte: 'O que te faria se sentir segura pra decidir?'",
    initialMessage: "Oi doutor, tudo bem? A Carla me indicou, ela fez as lentes com você e ficou linda! Tô pensando em fazer também, mas ainda tô em dúvida se é pra mim...",
  },
  preco: {
    patient: {
      name: "Roberto",
      age: 45,
      procedure: "Implante dental",
      situation: "Pesquisou muito antes de vir. Já sabe o valor médio do mercado.",
      referral: "Pesquisa no Google",
    },
    profile: {
      howTheyThink: [
        "Compara preços obsessivamente.",
        "Acredita que pode conseguir desconto.",
        "Valoriza custo-benefício acima de tudo.",
      ],
    },
    objectives: [
      "Mostrar o valor agregado do seu serviço",
      "Evitar entrar em guerra de preços",
      "Apresentar diferenciais que justificam o investimento",
    ],
    tip: "Não justifique o preço, justifique o VALOR. Mostre o que está incluso e o que ele perderia indo para o mais barato.",
    initialMessage: "Boa tarde, doutor. Olha, eu já pesquisei bastante e vi que o preço de implante varia muito. O seu tá um pouco acima da média que encontrei. Tem como fazer um desconto?",
  },
  concorrente: {
    patient: {
      name: "Fernanda",
      age: 32,
      procedure: "Harmonização facial",
      situation: "Consultou outro profissional que cobrou menos. Veio comparar.",
      referral: "Redes sociais",
    },
    profile: {
      howTheyThink: [
        "Está insegura sobre qual profissional escolher.",
        "Usa o concorrente como moeda de troca.",
        "No fundo, quer ser convencida.",
      ],
    },
    objectives: [
      "Entender o que o concorrente ofereceu",
      "Destacar seus diferenciais sem desmerecer o outro",
      "Mostrar segurança e autoridade",
    ],
    tip: "Nunca fale mal do concorrente. Pergunte: 'O que te fez vir aqui se já tinha uma opção?'",
    initialMessage: "Oi, vim te conhecer porque vi seu trabalho no Instagram. Mas já consultei com outro médico que cobrou bem menos. Por que o seu é mais caro?",
  },
  desconfiado: {
    patient: {
      name: "Carlos",
      age: 50,
      procedure: "Prótese dentária",
      situation: "Teve experiência ruim com outro dentista. Desconfia de promessas.",
      referral: "Indicação familiar",
    },
    profile: {
      howTheyThink: [
        "Já foi enganado antes.",
        "Questiona tudo e quer provas.",
        "Precisa de muita segurança para confiar.",
      ],
    },
    objectives: [
      "Construir confiança gradualmente",
      "Mostrar provas e casos reais",
      "Não prometer demais",
    ],
    tip: "Seja honesto sobre limitações. Dizer 'depende' é melhor que prometer demais.",
    initialMessage: "Olha doutor, vou ser direto. Já fui enganado por outro dentista que prometeu mundos e fundos. Como você me garante que o resultado vai ser bom?",
  },
  simpatico: {
    patient: {
      name: "Juliana",
      age: 28,
      procedure: "Clareamento dental",
      situation: "Super simpática e animada na consulta. Histórico de sumir depois.",
      referral: "Promoção no Instagram",
    },
    profile: {
      howTheyThink: [
        "Não gosta de conflito.",
        "Diz sim para tudo, mas não se compromete de verdade.",
        "Precisa de um 'empurrão' gentil.",
      ],
    },
    objectives: [
      "Identificar se o interesse é real",
      "Criar compromisso concreto",
      "Agendar algo antes dela sair",
    ],
    tip: "Pergunte: 'O que pode te impedir de fazer?' antes que ela vá embora sorrindo.",
    initialMessage: "Ai que lindo seu consultório, doutor! Amei tudo! O clareamento parece ser exatamente o que eu preciso! Que demais! Como funciona?",
  },
  apressado: {
    patient: {
      name: "André",
      age: 42,
      procedure: "Extração de siso",
      situation: "Executivo sem tempo. Quer resolver rápido e ir embora.",
      referral: "Convênio",
    },
    profile: {
      howTheyThink: [
        "Tempo é dinheiro.",
        "Quer informações diretas e objetivas.",
        "Se irrita com explicações longas.",
      ],
    },
    objectives: [
      "Ser objetivo e direto",
      "Mostrar eficiência",
      "Resolver rapidamente sem parecer apressado",
    ],
    tip: "Comece com: 'Vou ser direto com você.' Isso gera rapport imediato com esse perfil.",
    initialMessage: "Doutor, tenho uma reunião em 40 minutos. Preciso resolver esse siso que tá me incomodando. Quanto tempo leva e quanto custa? Vamos direto ao ponto.",
  },
};

const recentSimulations = [
  { id: "sim_001", scenarioId: "indeciso", scenarioTitle: "O Indeciso", score: 85, result: "closed" as SimulationResult, date: "Hoje" },
  { id: "sim_002", scenarioId: "preco", scenarioTitle: "Objeção de Preço", score: 72, result: "thinking" as SimulationResult, date: "Ontem" },
  { id: "sim_003", scenarioId: "concorrente", scenarioTitle: "Comparação com Concorrente", score: 90, result: "closed" as SimulationResult, date: "Há 3 dias" },
];

const difficultyConfig: Record<Difficulty, { label: string; class: string }> = {
  easy: { label: "Fácil", class: "bg-green-500/15 text-green-400" },
  medium: { label: "Médio", class: "bg-yellow-500/15 text-yellow-400" },
  hard: { label: "Difícil", class: "bg-red-500/15 text-red-400" },
};

// Mock AI responses for each scenario
const mockPatientResponses: Record<string, string[]> = {
  indeciso: [
    "É que... eu fico com medo de não gostar do resultado, sabe? E se ficar artificial?",
    "Hmm, entendo... Mas será que no meu caso fica bom? Meus dentes são bem diferentes da Carla.",
    "É verdade... Você tem razão. Mas e se eu me arrepender depois?",
    "Nossa, você me deixou mais tranquila agora. Acho que faz sentido...",
    "Tá, e como funciona? Preciso fazer muitas sessões?",
  ],
  preco: [
    "Olha, eu entendo que você tem qualidade e tal, mas o outro dentista também parecia bom e cobrava 30% menos.",
    "Tá, mas não tem como fazer em 3x no cartão e dar um descontinho?",
    "Hmm... e se eu fizer mais de um procedimento, aí tem desconto?",
    "É, faz sentido o que você tá falando. Deixa eu pensar melhor...",
  ],
  concorrente: [
    "Ah, vim porque minha amiga disse que você é melhor. Mas o outro médico também tinha boas avaliações...",
    "Ele usava um produto diferente, disse que era premium também. Como sei qual é melhor?",
    "Entendi... e em quanto tempo vejo resultado? O outro disse que seria imediato.",
    "É, você me passou mais confiança. Acho que vou fazer com você mesmo.",
  ],
  desconfiado: [
    "Tá, mas você fala isso porque quer vender. Todo dentista fala que faz o melhor trabalho.",
    "E se der problema depois? Você dá garantia?",
    "Hmm... posso ver fotos de pacientes reais? Antes e depois?",
    "É... você parece ser honesto. Gostei que não ficou prometendo milagre.",
  ],
  simpatico: [
    "Ai que máximo! Adorei! E dói muito? Tenho um pouquinho de medo, mas tô super empolgada!",
    "Que incrível! Quanto tempo demora? Quero fazer logo! Estou muito animada!",
    "Perfeito! Vou falar com meu marido e já volto pra agendar, tá? Super obrigada!",
    "Ai, deixa eu ver minha agenda e te retorno! Prometo que não demoro!",
  ],
  apressado: [
    "Ok, entendi. E pode fazer hoje ou só semana que vem?",
    "Certo. Pago agora, mas precisa ser rápido.",
    "Tá, agenda aí. Mas me manda confirmação por WhatsApp que eu esqueço.",
    "Fechado. Vamos fazer.",
  ],
};

// Main Component
export default function Simulador() {
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
  const [responseIndex, setResponseIndex] = useState(0);
  const chatRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Timer effect
  useEffect(() => {
    if (viewState === "chat") {
      timerRef.current = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [viewState]);

  // Auto-scroll chat
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStartScenario = (scenario: Scenario) => {
    setSelectedScenario(scenario);
    setViewState("preparation");
  };

  const handleBeginSimulation = () => {
    if (!selectedScenario) return;
    const context = scenarioContexts[selectedScenario.id];
    setMessages([
      {
        id: "1",
        sender: "patient",
        content: context.initialMessage,
        timestamp: new Date(),
      },
    ]);
    setTimer(0);
    setResponseIndex(0);
    setViewState("chat");
  };

  const handleSendMessage = () => {
    if (!inputValue.trim() || !selectedScenario) return;

    const doctorMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: "doctor",
      content: inputValue.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, doctorMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate patient response
    setTimeout(() => {
      const responses = mockPatientResponses[selectedScenario.id] || [];
      const response = responses[responseIndex % responses.length] || "Hmm, entendo...";
      
      const patientMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "patient",
        content: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, patientMessage]);
      setResponseIndex((prev) => prev + 1);
      setIsTyping(false);
    }, 1500 + Math.random() * 1500);
  };

  const handleEndSimulation = (result: SimulationResult) => {
    setShowEndModal(false);
    setIsAnalyzing(true);

    // Simulate analysis
    setTimeout(() => {
      const mockFeedback: SimulationFeedback = {
        score: result === "closed" ? 85 : result === "thinking" ? 72 : 55,
        result,
        strengths: [
          "Fez perguntas abertas para entender o paciente",
          "Não pressionou a decisão",
          "Mostrou empatia com as dúvidas",
        ],
        improvements: [
          "Poderia ter explorado mais o que causava a dúvida",
          "Faltou apresentar casos semelhantes",
          "O fechamento foi hesitante",
        ],
        keyMoments: [
          {
            timestamp: Math.floor(timer * 0.3),
            type: "positive",
            description: "Paciente mostrou interesse",
            excerpt: "Ah, ficou muito bonito...",
          },
          {
            timestamp: Math.floor(timer * 0.6),
            type: "objection",
            description: "Objeção sobre resultado",
            excerpt: "Mas será que em mim fica bom?",
          },
          {
            timestamp: Math.floor(timer * 0.8),
            type: "opportunity",
            description: "Momento ideal para fechar",
            excerpt: "Você me deixou mais tranquila...",
          },
        ],
        recommendations: [
          "Pergunte: 'O que te faria se sentir segura?'",
          "Mostre fotos de casos parecidos",
          "Use: 'Faz sentido pra você?' em vez de 'Quer fazer?'",
          "Dê espaço: 'Fica à vontade pra pensar.'",
        ],
        suggestedPhrase: `${scenarioContexts[selectedScenario?.id || "indeciso"]?.patient?.name}, pelo que você me contou, parece que a maior dúvida é sobre o resultado, certo? Posso te mostrar alguns casos parecidos com o seu pra você ver como fica. Assim você decide com mais clareza.`,
      };
      setFeedback(mockFeedback);
      setIsAnalyzing(false);
      setViewState("feedback");
    }, 2500);
  };

  const handleBackToList = () => {
    setViewState("list");
    setSelectedScenario(null);
    setMessages([]);
    setTimer(0);
    setFeedback(null);
    setResponseIndex(0);
  };

  // Render: Scenario List
  if (viewState === "list") {
    return (
      <AppLayout>
        <div className="space-y-8 animate-fade-in">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              Simulador de <span className="text-primary italic">Consulta</span>
            </h1>
            <p className="text-muted-foreground mt-1">
              Pratique cenários reais e aprenda a conduzir consultas com maestria
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card border border-border/50 rounded-xl p-5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Play weight="bold" className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">12</p>
                  <p className="text-sm text-muted-foreground">Simulações feitas</p>
                </div>
              </div>
            </div>
            <div className="bg-card border border-border/50 rounded-xl p-5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Star weight="fill" className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">82%</p>
                  <p className="text-sm text-muted-foreground">Score médio</p>
                </div>
              </div>
            </div>
            <div className="bg-card border border-border/50 rounded-xl p-5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-500/10">
                  <Clock weight="regular" className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">45min</p>
                  <p className="text-sm text-muted-foreground">Tempo total</p>
                </div>
              </div>
            </div>
          </div>

          {/* Scenarios */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">Escolha um Cenário</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {scenarios.map((scenario) => {
                const IconComponent = scenario.icon;
                return (
                  <div
                    key={scenario.id}
                    className="bg-card border border-border/50 rounded-xl p-6 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200 cursor-pointer group"
                    onClick={() => handleStartScenario(scenario)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <IconComponent weight="duotone" className="w-6 h-6 text-primary" />
                      </div>
                      <span className={cn("text-xs px-2 py-1 rounded-full font-medium", difficultyConfig[scenario.difficulty].class)}>
                        {difficultyConfig[scenario.difficulty].label}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{scenario.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{scenario.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock weight="light" className="w-3 h-3" />
                        {scenario.duration} min
                      </div>
                      <Button size="sm" className="gap-2">
                        <Play weight="bold" className="w-3 h-3" />
                        Iniciar
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Simulations */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Simulações Recentes</h2>
              <Button variant="ghost" className="text-primary text-sm">Ver histórico</Button>
            </div>
            <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left text-sm font-medium text-muted-foreground p-4">Cenário</th>
                    <th className="text-left text-sm font-medium text-muted-foreground p-4">Score</th>
                    <th className="text-left text-sm font-medium text-muted-foreground p-4">Data</th>
                    <th className="text-right text-sm font-medium text-muted-foreground p-4">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSimulations.map((sim) => (
                    <tr key={sim.id} className="border-b border-border/30 last:border-0 hover:bg-secondary/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <ChatCircle weight="duotone" className="w-4 h-4 text-primary" />
                          <span className="text-foreground">{sim.scenarioTitle}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-secondary rounded-full overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full",
                                sim.score >= 80 ? "bg-green-500" : sim.score >= 60 ? "bg-yellow-500" : "bg-red-500"
                              )}
                              style={{ width: `${sim.score}%` }}
                            />
                          </div>
                          <span className="text-sm text-foreground">{sim.score}%</span>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">{sim.date}</td>
                      <td className="p-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-primary gap-1"
                          onClick={() => {
                            const scenario = scenarios.find((s) => s.id === sim.scenarioId);
                            if (scenario) handleStartScenario(scenario);
                          }}
                        >
                          <ArrowsClockwise weight="bold" className="w-3 h-3" />
                          Refazer
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Render: Preparation
  if (viewState === "preparation" && selectedScenario) {
    const context = scenarioContexts[selectedScenario.id];
    return (
      <AppLayout>
        <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={handleBackToList}>
              <ArrowLeft weight="bold" className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-semibold text-foreground">{selectedScenario.title}</h1>
                <span className={cn("text-xs px-2 py-1 rounded-full font-medium", difficultyConfig[selectedScenario.difficulty].class)}>
                  {difficultyConfig[selectedScenario.difficulty].label}
                </span>
              </div>
            </div>
          </div>

          {/* Context Card */}
          <div className="bg-card border border-border/50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <FileText weight="duotone" className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">Contexto</h2>
            </div>
            <div className="space-y-2 text-muted-foreground">
              <p><span className="text-foreground font-medium">Paciente:</span> {context.patient.name}, {context.patient.age} anos</p>
              <p><span className="text-foreground font-medium">Procedimento:</span> {context.patient.procedure}</p>
              <p><span className="text-foreground font-medium">Situação:</span> {context.patient.situation}</p>
            </div>
          </div>

          {/* Profile Card */}
          <div className="bg-card border border-border/50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <User weight="duotone" className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">Como esse paciente pensa</h2>
            </div>
            <ul className="space-y-2">
              {context.profile.howTheyThink.map((thought: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-muted-foreground">
                  <span className="text-primary mt-1">•</span>
                  {thought}
                </li>
              ))}
            </ul>
          </div>

          {/* Objectives Card */}
          <div className="bg-card border border-border/50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Crosshair weight="duotone" className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">Seu objetivo nessa consulta</h2>
            </div>
            <ul className="space-y-2">
              {context.objectives.map((obj: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-muted-foreground">
                  <CheckCircle weight="fill" className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  {obj}
                </li>
              ))}
            </ul>
          </div>

          {/* Tip Card */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Lightbulb weight="duotone" className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Dica Rápida</h3>
                <p className="text-muted-foreground">{context.tip}</p>
              </div>
            </div>
          </div>

          {/* Start Button */}
          <Button className="w-full h-12 text-base gap-2" onClick={handleBeginSimulation}>
            <Play weight="bold" className="w-5 h-5" />
            Começar Simulação
          </Button>
        </div>
      </AppLayout>
    );
  }

  // Render: Chat
  if (viewState === "chat" && selectedScenario) {
    const context = scenarioContexts[selectedScenario.id];
    return (
      <AppLayout>
        <div className="h-[calc(100vh-8rem)] flex flex-col animate-fade-in">
          {/* Chat Header */}
          <div className="flex items-center justify-between pb-4 border-b border-border/50">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => setShowEndModal(true)}>
                <ArrowLeft weight="bold" className="w-5 h-5" />
              </Button>
              <span className={cn("text-xs px-2 py-1 rounded-full font-medium", difficultyConfig[selectedScenario.difficulty].class)}>
                {selectedScenario.title}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-3 py-1 rounded-md bg-secondary text-muted-foreground text-sm font-mono">
                {formatTime(timer)}
              </div>
              <Button variant="outline" size="sm" className="text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => setShowEndModal(true)}>
                Encerrar
              </Button>
            </div>
          </div>

          {/* Context Bar */}
          <div className="py-3 border-b border-border/30">
            <button
              className="flex items-center justify-between w-full text-left"
              onClick={() => setContextExpanded(!contextExpanded)}
            >
              <span className="text-sm text-muted-foreground">
                {context.patient.name}, {context.patient.age} anos • {context.patient.procedure} • {context.patient.referral}
              </span>
              {contextExpanded ? <CaretUp weight="bold" className="w-4 h-4 text-muted-foreground" /> : <CaretDown weight="bold" className="w-4 h-4 text-muted-foreground" />}
            </button>
            {contextExpanded && (
              <div className="mt-3 p-3 rounded-lg bg-secondary/50 text-sm text-muted-foreground">
                <p className="mb-2"><strong className="text-foreground">Dica:</strong> {context.tip}</p>
              </div>
            )}
          </div>

          {/* Messages */}
          <div ref={chatRef} className="flex-1 overflow-y-auto py-4 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={cn("flex", msg.sender === "doctor" ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[80%] px-4 py-3",
                    msg.sender === "doctor"
                      ? "bg-primary text-primary-foreground rounded-[12px_12px_4px_12px]"
                      : "bg-secondary text-foreground rounded-[12px_12px_12px_4px]"
                  )}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-secondary text-muted-foreground rounded-[12px_12px_12px_4px] px-4 py-3">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="pt-4 border-t border-border/50">
            <div className="flex gap-2">
              <textarea
                className="flex-1 min-h-[48px] max-h-[120px] px-4 py-3 bg-secondary border border-border/50 rounded-lg text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Digite sua resposta..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button className="h-12 w-12" onClick={handleSendMessage} disabled={!inputValue.trim() || isTyping}>
                <PaperPlaneTilt weight="bold" className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* End Modal */}
        <Dialog open={showEndModal} onOpenChange={setShowEndModal}>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle>Como você quer encerrar?</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 pt-4">
              <button
                className="w-full p-4 rounded-lg border border-green-500/30 bg-green-500/10 hover:bg-green-500/20 transition-colors flex items-center gap-3"
                onClick={() => handleEndSimulation("closed")}
              >
                <CheckCircle weight="fill" className="w-5 h-5 text-green-400" />
                <span className="text-foreground">Consegui fechar</span>
              </button>
              <button
                className="w-full p-4 rounded-lg border border-yellow-500/30 bg-yellow-500/10 hover:bg-yellow-500/20 transition-colors flex items-center gap-3"
                onClick={() => handleEndSimulation("thinking")}
              >
                <Clock weight="regular" className="w-5 h-5 text-yellow-400" />
                <span className="text-foreground">Paciente vai pensar</span>
              </button>
              <button
                className="w-full p-4 rounded-lg border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 transition-colors flex items-center gap-3"
                onClick={() => handleEndSimulation("lost")}
              >
                <X weight="bold" className="w-5 h-5 text-red-400" />
                <span className="text-foreground">Não consegui fechar</span>
              </button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Analyzing Modal */}
        <Dialog open={isAnalyzing}>
          <DialogContent className="bg-card border-border">
            <div className="flex flex-col items-center py-8">
              <CircleNotch weight="bold" className="w-12 h-12 text-primary animate-spin mb-4" />
              <p className="text-foreground font-medium">Analisando sua consulta...</p>
              <p className="text-sm text-muted-foreground mt-1">Isso pode levar alguns segundos</p>
            </div>
          </DialogContent>
        </Dialog>
      </AppLayout>
    );
  }

  // Render: Feedback
  if (viewState === "feedback" && feedback && selectedScenario) {
    const resultConfig = {
      closed: { icon: CheckCircle, text: "Paciente fechou!", color: "text-green-400", bg: "bg-green-500/10" },
      thinking: { icon: Clock, text: "Paciente vai pensar", color: "text-yellow-400", bg: "bg-yellow-500/10" },
      lost: { icon: X, text: "Paciente não fechou", color: "text-red-400", bg: "bg-red-500/10" },
    };
    const result = resultConfig[feedback.result];
    const ResultIcon = result.icon;

    return (
      <AppLayout>
        <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-foreground">Análise da Simulação</h1>
            <Button variant="outline" onClick={handleBackToList}>Nova Simulação</Button>
          </div>

          {/* Score Card */}
          <div className="bg-card border border-border/50 rounded-xl p-8 text-center">
            <div className="relative inline-flex items-center justify-center mb-4">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="none" className="text-secondary" />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${(feedback.score / 100) * 352} 352`}
                  strokeLinecap="round"
                  className={feedback.score >= 70 ? "text-green-500" : feedback.score >= 50 ? "text-yellow-500" : "text-red-500"}
                />
              </svg>
              <span className="absolute text-4xl font-bold text-foreground">{feedback.score}</span>
            </div>
            <p className="text-lg text-muted-foreground mb-4">
              {feedback.score >= 80 ? "Excelente!" : feedback.score >= 70 ? "Bom desempenho!" : feedback.score >= 50 ? "Pode melhorar" : "Precisa praticar mais"}
            </p>
            <div className={cn("inline-flex items-center gap-2 px-4 py-2 rounded-full", result.bg)}>
              <ResultIcon weight="fill" className={cn("w-5 h-5", result.color)} />
              <span className={result.color}>{result.text}</span>
            </div>
          </div>

          {/* Strengths */}
          <div className="bg-card border border-border/50 rounded-xl p-6 border-l-4 border-l-green-500">
            <div className="flex items-center gap-3 mb-4">
              <ThumbsUp weight="duotone" className="w-5 h-5 text-green-400" />
              <h2 className="text-lg font-semibold text-foreground">O que você fez bem</h2>
            </div>
            <ul className="space-y-2">
              {feedback.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-muted-foreground">
                  <CheckCircle weight="fill" className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
          </div>

          {/* Improvements */}
          <div className="bg-card border border-border/50 rounded-xl p-6 border-l-4 border-l-yellow-500">
            <div className="flex items-center gap-3 mb-4">
              <Warning weight="duotone" className="w-5 h-5 text-yellow-400" />
              <h2 className="text-lg font-semibold text-foreground">Oportunidades de melhoria</h2>
            </div>
            <ul className="space-y-2">
              {feedback.improvements.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-muted-foreground">
                  <WarningCircle weight="fill" className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
          </div>

          {/* Key Moments */}
          <div className="bg-card border border-border/50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <TrendUp weight="duotone" className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Momentos-Chave</h2>
            </div>
            <div className="space-y-3">
              {feedback.keyMoments.map((moment, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
                  <div
                    className={cn(
                      "w-3 h-3 rounded-full mt-1.5 flex-shrink-0",
                      moment.type === "positive" ? "bg-green-500" : moment.type === "objection" ? "bg-yellow-500" : moment.type === "opportunity" ? "bg-primary" : "bg-red-500"
                    )}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{formatTime(moment.timestamp)}</span>
                      <span className="text-sm text-foreground font-medium">{moment.description}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 italic">"{moment.excerpt}"</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Lightbulb weight="duotone" className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">O que fazer diferente</h2>
            </div>
            <ul className="space-y-2">
              {feedback.recommendations.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-muted-foreground">
                  <span className="text-primary">•</span>
                  {r}
                </li>
              ))}
            </ul>
          </div>

          {/* Suggested Phrase */}
          <div className="bg-card border border-border/50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Quotes weight="duotone" className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Frase que Funcionaria</h2>
            </div>
            <p className="text-muted-foreground italic leading-relaxed">"{feedback.suggestedPhrase}"</p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              className="flex-1 gap-2"
              onClick={() => {
                setMessages([]);
                setTimer(0);
                setResponseIndex(0);
                handleBeginSimulation();
              }}
            >
              <ArrowsClockwise weight="bold" className="w-4 h-4" />
              Refazer esse cenário
            </Button>
            <Button className="flex-1 gap-2" onClick={handleBackToList}>
              <Play weight="bold" className="w-4 h-4" />
              Escolher outro cenário
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return null;
}
