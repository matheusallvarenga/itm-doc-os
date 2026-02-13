import { AppLayout } from "@/components/layout/AppLayout";
import { cn } from "@/lib/utils";
import { 
  Trophy, 
  Medal, 
  Crown, 
  Fire, 
  TrendUp, 
  TrendDown, 
  Minus,
  CalendarBlank
} from "@phosphor-icons/react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState } from "react";

type Period = "week" | "month" | "all";

const periods: { value: Period; label: string }[] = [
  { value: "week", label: "Esta semana" },
  { value: "month", label: "Este mês" },
  { value: "all", label: "Geral" },
];

const leaderboard = [
  { rank: 1, name: "Dr. Marcel Pita", specialty: "Ortopedista", points: 2450, streak: 21, change: 0 },
  { rank: 2, name: "Dr. Mohamed Najmeddine", specialty: "Transplante Capilar", points: 2180, streak: 14, change: 1 },
  { rank: 3, name: "Dr. Alexsandro Orbem", specialty: "Dentista", points: 2050, streak: 18, change: -1 },
  { rank: 4, name: "Dr. Sandro Alves", specialty: "Cirurgião Plástico", points: 1890, streak: 12, change: 2 },
  { rank: 5, name: "Dr. Cleber Amarante", specialty: "Nutrólogo", points: 1780, streak: 9, change: 0 },
  { rank: 6, name: "Dra. Isabela Dantas", specialty: "Anestesiologista", points: 1650, streak: 7, change: -2 },
  { rank: 7, name: "Dra. Soraya Chantre", specialty: "Dermatologista", points: 1520, streak: 11, change: 1 },
  { rank: 8, name: "Dr. Marcos Vinícius", specialty: "Fibromialgia", points: 1400, streak: 5, change: 0 },
  { rank: 9, name: "Dr. Gustavo Camargo", specialty: "Cirurgião Plástico", points: 1320, streak: 8, change: 3 },
  { rank: 10, name: "Dr. Danillo Almeida", specialty: "Ortopedista", points: 1280, streak: 4, change: -1 },
  { rank: 11, name: "Dr. Juan Urcioli", specialty: "Cirurgião Plástico", points: 1150, streak: 6, change: 2 },
  { rank: 12, name: "Dr. Rodolfo Lemos", specialty: "Cirurgião Plástico", points: 1080, streak: 3, change: 0 },
  { rank: 13, name: "Dr. Felipe Coppini", specialty: "Dentista", points: 950, streak: 5, change: 1 },
];

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
                <p className="text-muted-foreground mt-1">
                  {getPeriodSubtitle()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-lg border border-border/50">
                <Trophy size={20} weight="regular" className="text-primary" />
                <span className="text-sm">
                  Sua posição: <span className="text-primary font-semibold">#12</span>
                </span>
              </div>
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

        {/* Top 3 podium */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {/* Second place */}
          <div className="flex flex-col items-center pt-8">
            <div className="relative">
              <Avatar className="w-16 h-16 border-2" style={{ borderColor: '#C0C0C0' }}>
                <AvatarFallback className="bg-[#1A1A1A] text-foreground">MN</AvatarFallback>
              </Avatar>
              <div 
                className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                style={{ backgroundColor: '#C0C0C0', color: '#141414' }}
              >
                2
              </div>
            </div>
            <Medal size={24} weight="fill" color="#C0C0C0" className="mt-2" />
            <p className="mt-2 text-sm font-medium text-foreground text-center">{leaderboard[1].name}</p>
            <p className="text-xs text-muted-foreground">{leaderboard[1].points} pts</p>
          </div>

          {/* First place */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="absolute -top-8 left-1/2 -translate-x-1/2">
                <Crown size={32} weight="fill" color="#FFD700" className="animate-pulse-glow" />
              </div>
              <Avatar className="w-20 h-20 border-4 glow-primary" style={{ borderColor: '#FFD700' }}>
                <AvatarFallback className="bg-primary/20 text-primary text-lg">MP</AvatarFallback>
              </Avatar>
              <div 
                className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                style={{ backgroundColor: '#FFD700', color: '#141414' }}
              >
                1
              </div>
            </div>
            <Crown size={28} weight="fill" color="#FFD700" className="mt-2" />
            <p className="mt-2 text-sm font-medium text-foreground text-center">{leaderboard[0].name}</p>
            <p className="text-xs text-primary font-semibold">{leaderboard[0].points} pts</p>
          </div>

          {/* Third place */}
          <div className="flex flex-col items-center pt-8">
            <div className="relative">
              <Avatar className="w-16 h-16 border-2" style={{ borderColor: '#CD7F32' }}>
                <AvatarFallback className="bg-[#1A1A1A] text-foreground">AO</AvatarFallback>
              </Avatar>
              <div 
                className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                style={{ backgroundColor: '#CD7F32' }}
              >
                3
              </div>
            </div>
            <Medal size={24} weight="fill" color="#CD7F32" className="mt-2" />
            <p className="mt-2 text-sm font-medium text-foreground text-center">{leaderboard[2].name}</p>
            <p className="text-xs text-muted-foreground">{leaderboard[2].points} pts</p>
          </div>
        </div>

        {/* Full leaderboard */}
        <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-secondary/50 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            <div className="col-span-1">Rank</div>
            <div className="col-span-5">Médico</div>
            <div className="col-span-2 text-center">Streak</div>
            <div className="col-span-2 text-center">Pontos</div>
            <div className="col-span-2 text-center">Variação</div>
          </div>

          <div className="divide-y divide-border/30">
            {leaderboard.map((user) => (
              <div
                key={user.rank}
                className={cn(
                  "grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-secondary/30 transition-colors",
                  user.rank <= 3 && "bg-primary/5"
                )}
              >
                <div className="col-span-1 flex items-center">
                  {getRankIcon(user.rank)}
                </div>
                <div className="col-span-5 flex items-center gap-3">
                  <Avatar className="w-10 h-10 border border-border">
                    <AvatarFallback className="bg-secondary text-foreground text-sm">
                      {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </AvatarFallback>
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
                <div className="col-span-2 flex items-center justify-center">
                  {user.change > 0 ? (
                    <div className="flex items-center gap-1 text-success">
                      <TrendUp size={16} weight="bold" color="#22C55E" />
                      <span className="text-xs font-medium">+{user.change}</span>
                    </div>
                  ) : user.change < 0 ? (
                    <div className="flex items-center gap-1 text-destructive">
                      <TrendDown size={16} weight="bold" color="#EF4444" />
                      <span className="text-xs font-medium">{user.change}</span>
                    </div>
                  ) : (
                    <Minus size={16} weight="regular" color="#9CA3AF" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
