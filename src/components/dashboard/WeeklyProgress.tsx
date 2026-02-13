import { cn } from "@/lib/utils";

const progressData = [
  { day: "Seg", value: 60 },
  { day: "Ter", value: 85 },
  { day: "Qua", value: 45 },
  { day: "Qui", value: 90 },
  { day: "Sex", value: 75 },
  { day: "Sáb", value: 30 },
  { day: "Dom", value: 0 },
];

export function WeeklyProgress() {
  const maxValue = Math.max(...progressData.map((d) => d.value));

  return (
    <div className="bg-card border border-border/50 rounded-xl p-5">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">
          Progresso Semanal
        </h3>
        <span className="text-sm text-primary font-medium">
          385 <span className="text-muted-foreground">pontos</span>
        </span>
      </div>

      <div className="flex items-end justify-between gap-2 h-32">
        {progressData.map((data, index) => (
          <div key={data.day} className="flex-1 flex flex-col items-center gap-2">
            <div className="w-full flex items-end justify-center h-24">
              <div
                className={cn(
                  "w-full max-w-[32px] rounded-t-md transition-all duration-500",
                  data.value > 0 ? "bg-primary" : "bg-border/30",
                  data.value >= 80 && "glow-primary-sm"
                )}
                style={{
                  height: `${data.value > 0 ? (data.value / maxValue) * 100 : 8}%`,
                  animationDelay: `${index * 100}ms`,
                }}
              />
            </div>
            <span className="text-xs text-muted-foreground font-medium">
              {data.day}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
