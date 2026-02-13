import { cn } from "@/lib/utils";
import { Icon as PhosphorIcon } from "@phosphor-icons/react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: PhosphorIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function StatCard({ title, value, subtitle, icon: Icon, trend, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "bg-card border border-border/50 rounded-xl p-5 card-hover",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-3xl font-semibold text-foreground">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center gap-1 pt-1">
              <span
                className={cn(
                  "text-xs font-medium",
                  trend.isPositive ? "text-success" : "text-destructive"
                )}
              >
                {trend.isPositive ? "+" : ""}{trend.value}%
              </span>
              <span className="text-xs text-muted-foreground">vs semana passada</span>
            </div>
          )}
        </div>
        <div className="p-3 rounded-lg bg-primary/10">
          <Icon weight="duotone" className="w-5 h-5 text-primary" />
        </div>
      </div>
    </div>
  );
}
