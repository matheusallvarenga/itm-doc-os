import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import {
  Trophy,
  Medal,
  Crown,
  Fire,
  CalendarBlank,
  SpinnerGap,
} from "@phosphor-icons/react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type Period = "week" | "month" | "all";

const periods: { value: Period; label: string }[] = [
  { value: "week", label: "Esta semana" },
  { value: "month", label: "Este mês" },
  { value: "all", label: "Geral" },
];

interface RankedUser {
  rank: number;
  user_id: string;
  name: string;
  specialty: string;
  points: number;
  streak: number;
}

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Crown size={20} weight="fill" color="#FFD700" />;
    case 2:
      return <Medal size={20} weight="fill" color="#C0C0C0" />;
    case 3:
      return <Medal size={20} weight="fill" color="#CD7F32" />;
    default:
      return <span className="text-sm font-medium text-muted-foreground w-5 text-center">{rank}</span>;
  }
};

export default function Ranking() {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>("week");
  const [ranking, setRanking] = useState<RankedUser[]>([]);
  const [userPosition, setUserPosition] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRanking = async () => {
      setLoading(true);
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID || "glbwtdrzqxjnzodgdhtp";
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setLoading(false); return; }
      try {
        const res = await fetch(
          `https://${projectId}.supabase.co/functions/v1/get-ranking?period=${selectedPeriod}`,
          { headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" } }
        );
        const json = await res.json();
        setRanking(json.ranking || []);
        setUserPosition(json.userPosition || 0);
      } catch { /* ignore */ }
      setLoading(false);
    };
    fetchRanking();
  }, [selectedPeriod]);

  const getPeriodLabel = () => {
    switch (selectedPeriod) {
      case "week": return "Semanal";
      case "month": return "Mensal";
      case "all": return "Geral";
    }
  };

  const getPeriodSubtitle = () => {
    switch (selectedPeriod) {
      case "week": return "Top performers da semana";
      case "month": return "Top performers do mês";
      case "all": return "Ranking geral de todos os tempos";
    }
  };

  const top3 = ranking.slice(0, 3);

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <Trophy size={28} weight="duotone" className="text-primary" />
              <div>
                <h1 className="text-2xl font-semibold text-foreground">
                  Ranking <span className="accent-text">{getPeriodLabel()}</span>
                </h1>
                <p className="text-muted-foreground mt-1">{getPeriodSubtitle()}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-lg border border-border/50">
              <Trophy size={20} weight="regular" className="text-primary" />
              <span className="text-sm">
                Sua posição: <span className="text-primary font-semibold">#{userPosition || "—"}</span>
              </span>
            </div>
          </div>

          {/* Period Selector */}
          <div className="flex items-center gap-2">
            <CalendarBlank size={18} weight="light" className="text-muted-foreground" />
            <div className="flex items-center gap-1 p-1 bg-card rounded-lg border border-border/50">
              {periods.map((period) => (
                <button
                  key={period.value}
                  onClick={() => setSelectedPeriod(period.value)}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-md transition-all",
                    selectedPeriod === period.value
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  )}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <SpinnerGap size={32} className="text-primary animate-spin" />
          </div>
        ) : ranking.length === 0 ? (
          <div className="bg-card border border-border/50 rounded-xl p-12 text-center">
            <Trophy size={48} weight="duotone" className="text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhum dado de ranking disponível para este período.</p>
          </div>
        ) : (
          <>
            {/* Top 3 podium */}
            {top3.length >= 3 && (
              <div className="grid grid-cols-3 gap-4 mb-8">
                {[top3[1], top3[0], top3[2]].map((u, idx) => {
                  const podiumConfig = [
                    { color: "#C0C0C0", size: "w-16 h-16", pt: "pt-8", IconComp: Medal, iconSize: 24 },
                    { color: "#FFD700", size: "w-20 h-20", pt: "", IconComp: Crown, iconSize: 28 },
                    { color: "#CD7F32", size: "w-16 h-16", pt: "pt-8", IconComp: Medal, iconSize: 24 },
                  ][idx];
                  const initials = u.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2);
                  return (
                    <div key={u.user_id} className={cn("flex flex-col items-center", podiumConfig.pt)}>
                      <div className="relative">
                        {idx === 1 && (
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2">
                            <Crown size={32} weight="fill" color="#FFD700" className="animate-pulse-glow" />
                          </div>
                        )}
                        <Avatar className={cn(podiumConfig.size, idx === 1 ? "border-4 glow-primary" : "border-2")} style={{ borderColor: podiumConfig.color }}>
                          <AvatarFallback className={cn(idx === 1 ? "bg-primary/20 text-primary text-lg" : "bg-[#1A1A1A] text-foreground")}>{initials}</AvatarFallback>
                        </Avatar>
                        <div
                          className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                          style={{ backgroundColor: podiumConfig.color, color: "#141414" }}
                        >
                          {u.rank}
                        </div>
                      </div>
                      <podiumConfig.IconComp size={podiumConfig.iconSize} weight="fill" color={podiumConfig.color} className="mt-2" />
                      <p className="mt-2 text-sm font-medium text-foreground text-center">{u.name}</p>
                      <p className={cn("text-xs", idx === 1 ? "text-primary font-semibold" : "text-muted-foreground")}>{u.points} pts</p>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Full leaderboard */}
            <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
              <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-secondary/50 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <div className="col-span-1">Rank</div>
                <div className="col-span-5">Médico</div>
                <div className="col-span-2 text-center">Streak</div>
                <div className="col-span-2 text-center">Pontos</div>
                <div className="col-span-2 text-center">Nível</div>
              </div>

              <div className="divide-y divide-border/30">
                {ranking.map((user) => {
                  const initials = user.name.split(" ").map((n) => n[0]).join("").slice(0, 2);
                  return (
                    <div
                      key={user.user_id}
                      className={cn(
                        "grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-secondary/30 transition-colors",
                        user.rank <= 3 && "bg-primary/5"
                      )}
                    >
                      <div className="col-span-1 flex items-center">{getRankIcon(user.rank)}</div>
                      <div className="col-span-5 flex items-center gap-3">
                        <Avatar className="w-10 h-10 border border-border">
                          <AvatarFallback className="bg-secondary text-foreground text-sm">{initials}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-foreground">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.specialty}</p>
                        </div>
                      </div>
                      <div className="col-span-2 flex items-center justify-center gap-1">
                        <Fire
                          size={16}
                          weight={user.streak >= 14 ? "fill" : "regular"}
                          color={user.streak >= 14 ? "#F97316" : "#9CA3AF"}
                        />
                        <span className={cn("text-sm", user.streak >= 14 ? "text-orange-400 font-medium" : "text-muted-foreground")}>
                          {user.streak}
                        </span>
                      </div>
                      <div className="col-span-2 text-center">
                        <span className="text-sm font-semibold text-foreground">{user.points}</span>
                      </div>
                      <div className="col-span-2 text-center">
                        <span className="text-xs text-muted-foreground">—</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
