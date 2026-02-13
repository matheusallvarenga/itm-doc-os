import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Copy, DotsThreeVertical, Sparkle, VideoCamera, InstagramLogo, Megaphone } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

// Usuário logado
const currentUser = {
  name: "Dr. Marcel Pita",
  specialty: "Ortopedia",
};

// Roteiros do usuário (específicos para Ortopedia)
const roteiros = [
  {
    id: 1,
    title: "Reels: Dor no joelho ao subir escadas",
    type: "Reels",
    createdAt: "Há 2 horas",
    status: "completo",
  },
  {
    id: 2,
    title: "Stories: Recuperação pós-cirurgia de quadril",
    type: "Stories",
    createdAt: "Ontem",
    status: "completo",
  },
  {
    id: 3,
    title: "Anúncio: Tratamento de artrose sem cirurgia",
    type: "Anúncio",
    createdAt: "Há 3 dias",
    status: "rascunho",
  },
  {
    id: 4,
    title: "Reels: Quando a dor nas costas é preocupante",
    type: "Reels",
    createdAt: "Há 5 dias",
    status: "completo",
  },
];

// Templates sugeridos por especialidade
const templatesBySpecialty: Record<string, { title: string; description: string; icon: any }[]> = {
  "Ortopedia": [
    { title: "Dor que você ignora", description: "Fale sobre sintomas que pacientes subestimam", icon: Sparkle },
    { title: "Mitos sobre cirurgia", description: "Desfaça medos comuns sobre procedimentos", icon: VideoCamera },
    { title: "Exercícios que pioram", description: "Alerte sobre práticas que lesionam", icon: InstagramLogo },
    { title: "Quando procurar ajuda", description: "Sinais de alerta que não podem esperar", icon: Megaphone },
  ],
  "Transplante Capilar": [
    { title: "Verdade sobre calvície", description: "Desmistifique a queda de cabelo", icon: Sparkle },
    { title: "Resultados reais", description: "Mostre casos de sucesso", icon: VideoCamera },
    { title: "Cuidados pós-transplante", description: "Oriente sobre recuperação", icon: InstagramLogo },
    { title: "Idade ideal para transplante", description: "Tire dúvidas sobre timing", icon: Megaphone },
  ],
  "Dentista": [
    { title: "Sorriso que envelhece", description: "Impacto da estética dental na aparência", icon: Sparkle },
    { title: "Dor que não passa", description: "Quando a dor de dente é urgente", icon: VideoCamera },
    { title: "Clareamento: mitos", description: "Verdades sobre clareamento dental", icon: InstagramLogo },
    { title: "Facetas vs. lentes", description: "Diferenças e indicações", icon: Megaphone },
  ],
  "Cirurgião Plástico": [
    { title: "Expectativa vs. realidade", description: "Resultados realistas de procedimentos", icon: Sparkle },
    { title: "Recuperação honesta", description: "O que esperar do pós-operatório", icon: VideoCamera },
    { title: "Procedimentos combinados", description: "Quando faz sentido juntar", icon: InstagramLogo },
    { title: "Sinais de alerta", description: "Quando não fazer cirurgia", icon: Megaphone },
  ],
  "Nutrólogo": [
    { title: "Dieta milagrosa não existe", description: "Desmistifique promessas falsas", icon: Sparkle },
    { title: "Suplementos: verdade", description: "O que realmente funciona", icon: VideoCamera },
    { title: "Sinais de deficiência", description: "Sintomas que indicam falta de nutrientes", icon: InstagramLogo },
    { title: "Alimentação para energia", description: "Como comer para render mais", icon: Megaphone },
  ],
  "Dermatologista": [
    { title: "Manchas que preocupam", description: "Quando a mancha é perigosa", icon: Sparkle },
    { title: "Skincare que funciona", description: "Rotina baseada em evidências", icon: VideoCamera },
    { title: "Acne adulta", description: "Por que ainda tenho espinhas", icon: InstagramLogo },
    { title: "Protetor solar: erros", description: "Uso incorreto que não protege", icon: Megaphone },
  ],
};

const typeIcons: Record<string, { icon: any; color: string }> = {
  "Reels": { icon: VideoCamera, color: "text-pink-400 bg-pink-500/10" },
  "Stories": { icon: InstagramLogo, color: "text-purple-400 bg-purple-500/10" },
  "Anúncio": { icon: Megaphone, color: "text-yellow-400 bg-yellow-500/10" },
};

export default function Roteiros() {
  const templates = templatesBySpecialty[currentUser.specialty] || templatesBySpecialty["Ortopedia"];

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              Gerador de <span className="accent-text">Roteiros</span>
            </h1>
            <p className="text-muted-foreground mt-1">
              Roteiros personalizados para <span className="text-primary">{currentUser.specialty}</span>
            </p>
          </div>
          <Button className="gap-2 glow-primary-sm">
            <Plus weight="bold" className="w-4 h-4" />
            Criar Roteiro
          </Button>
        </div>

        {/* Quick templates */}
        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-3">
            Sugestões para {currentUser.specialty}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {templates.map((template, index) => (
              <div
                key={index}
                className="bg-card border border-border/50 rounded-xl p-4 card-hover cursor-pointer group"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <template.icon weight="duotone" className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-foreground truncate">{template.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{template.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          {["Todos", "Reels", "Stories", "Anúncio"].map((filter, index) => (
            <button
              key={filter}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                index === 0
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground hover:text-foreground border border-border/50"
              )}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Roteiros list */}
        <div className="space-y-3">
          {roteiros.map((roteiro) => {
            const typeStyle = typeIcons[roteiro.type] || typeIcons["Reels"];
            return (
              <div
                key={roteiro.id}
                className="bg-card border border-border/50 rounded-xl p-5 card-hover flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className={cn("p-3 rounded-lg", typeStyle.color)}>
                    <typeStyle.icon weight="duotone" className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">{roteiro.title}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-muted-foreground">{roteiro.type}</span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">{roteiro.createdAt}</span>
                      <span
                        className={cn(
                          "text-xs px-2 py-0.5 rounded-full",
                          roteiro.status === "completo"
                            ? "badge-success"
                            : "badge-pending"
                        )}
                      >
                        {roteiro.status}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                    <Copy weight="regular" className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-muted-foreground">
                    <DotsThreeVertical weight="bold" className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-secondary/30 border border-border/30 rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <FileText weight="duotone" className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">24</p>
                <p className="text-sm text-muted-foreground">Roteiros criados</p>
              </div>
            </div>
          </div>
          <div className="bg-secondary/30 border border-border/30 rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-pink-500/10">
                <VideoCamera weight="duotone" className="w-5 h-5 text-pink-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">18</p>
                <p className="text-sm text-muted-foreground">Reels gerados</p>
              </div>
            </div>
          </div>
          <div className="bg-secondary/30 border border-border/30 rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Sparkle weight="duotone" className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">92%</p>
                <p className="text-sm text-muted-foreground">Taxa de uso</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
