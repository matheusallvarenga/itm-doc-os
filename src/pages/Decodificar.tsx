import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Crosshair, ArrowRight, Clock, User } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const recentPatients = [
  { id: 1, name: "Maria S.", code: 7, type: "Entusiasta", date: "Hoje" },
  { id: 2, name: "João P.", code: 3, type: "Realizador", date: "Ontem" },
  { id: 3, name: "Ana L.", code: 9, type: "Pacificador", date: "Há 2 dias" },
];

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

export default function Decodificar() {
  return (
    <AppLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Decodificar <span className="accent-text">Paciente</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Descubra o tipo de Eneagrama do seu paciente e saiba como conduzi-lo
          </p>
        </div>

        {/* Start new decode */}
        <div className="bg-card border border-border/50 rounded-xl p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
            <div className="p-4 rounded-2xl bg-primary/10 glow-primary-sm">
              <Crosshair weight="duotone" className="w-12 h-12 text-primary" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Novo Diagnóstico de Eneagrama
              </h2>
              <p className="text-muted-foreground max-w-lg">
                Responda perguntas sobre comportamentos observados no paciente e descubra seu{" "}
                <span className="accent-text">tipo de Eneagrama (1 a 9)</span>. 
                Você receberá scripts de condução personalizados.
              </p>
            </div>
            <Button size="lg" className="gap-2 glow-primary-sm">
              Iniciar Diagnóstico
              <ArrowRight weight="bold" className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Enneagram types grid */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Os 9 Tipos do Eneagrama
          </h2>
          <div className="grid grid-cols-3 md:grid-cols-9 gap-2">
            {Object.entries(enneagramTypes).map(([code, { name, color }]) => (
              <div
                key={code}
                className={cn(
                  "flex flex-col items-center justify-center p-3 rounded-lg border transition-all hover:scale-105 cursor-pointer",
                  color
                )}
              >
                <span className="text-2xl font-bold">{code}</span>
                <span className="text-[10px] text-center mt-1 opacity-80">{name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent patients */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">
              Pacientes Recentes
            </h2>
            <Button variant="ghost" className="text-primary text-sm">
              Ver todos
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentPatients.map((patient) => (
              <div
                key={patient.id}
                className="bg-card border border-border/50 rounded-xl p-5 card-hover cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-secondary">
                      <User weight="light" className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{patient.name}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock weight="light" className="w-3 h-3" />
                        {patient.date}
                      </div>
                    </div>
                  </div>
                  <div
                    className={cn(
                      "w-10 h-10 rounded-lg border flex items-center justify-center font-bold text-lg",
                      enneagramTypes[patient.code].color
                    )}
                  >
                    {patient.code}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Tipo: <span className="text-foreground">{patient.type}</span>
                  </span>
                  <ArrowRight weight="bold" className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info section */}
        <div className="bg-secondary/30 border border-border/30 rounded-xl p-6">
          <h3 className="font-medium text-foreground mb-3">
            O que é o <span className="accent-text">Eneagrama</span>?
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            O Eneagrama é um sistema de 9 tipos de personalidade que revela padrões de comportamento, 
            motivações e medos centrais. Ao identificar o tipo do paciente, você adapta sua comunicação 
            para gerar mais conexão e conversão.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
            <div className="flex gap-3">
              <span className="text-primary font-bold">1.</span>
              <p>Observe comportamentos e responda perguntas sobre o paciente</p>
            </div>
            <div className="flex gap-3">
              <span className="text-primary font-bold">2.</span>
              <p>O sistema identifica o tipo de Eneagrama (1 a 9) com precisão</p>
            </div>
            <div className="flex gap-3">
              <span className="text-primary font-bold">3.</span>
              <p>Receba scripts e frases específicas para cada tipo de personalidade</p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
