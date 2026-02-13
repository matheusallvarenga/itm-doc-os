import { cn } from "@/lib/utils";
import { FileText, VideoCamera, Crosshair, ChatCircle } from "@phosphor-icons/react";

const activities = [
  {
    id: 1,
    type: "roteiro",
    title: "Novo roteiro criado",
    description: "Reels sobre procedimentos estéticos",
    time: "Há 2 horas",
    icon: FileText,
  },
  {
    id: 2,
    type: "video",
    title: "Vídeo analisado",
    description: "Nota: 8.5/10 - Excelente engajamento",
    time: "Há 5 horas",
    icon: VideoCamera,
  },
  {
    id: 3,
    type: "paciente",
    title: "Paciente decodificado",
    description: "Código 7 - Perfil Analítico",
    time: "Ontem",
    icon: Crosshair,
  },
  {
    id: 4,
    type: "simulacao",
    title: "Simulação completa",
    description: "Score: 92% - Consulta de primeira vez",
    time: "Há 2 dias",
    icon: ChatCircle,
  },
];

export function RecentActivity() {
  return (
    <div className="bg-card border border-border/50 rounded-xl p-5">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Atividade Recente
      </h3>

      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div
            key={activity.id}
            className={cn(
              "flex items-start gap-3 pb-4",
              index !== activities.length - 1 && "border-b border-border/30"
            )}
          >
            <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
              <activity.icon weight="duotone" className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">
                {activity.title}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {activity.description}
              </p>
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {activity.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
