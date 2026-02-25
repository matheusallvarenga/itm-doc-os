import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { fireBadgeConfetti } from "@/lib/confetti";
import {
  FileText,
  ChatCircle,
  VideoCamera,
  Crosshair,
  Lightning,
  Star,
  Trophy,
  Lock,
  Fire,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const iconMap: Record<string, any> = {
  FileText,
  ChatCircle,
  VideoCamera,
  Crosshair,
  Lightning,
  Star,
  Trophy,
  Fire,
};

const criteriaLabels: Record<string, string> = {
  scripts_count: "roteiros criados",
  videos_count: "vídeos analisados",
  simulations_count: "simulações feitas",
  patients_count: "pacientes decodificados",
  streak: "dias de streak",
  high_score: "score ≥ 90",
};

interface BadgeWithProgress {
  id: string;
  key: string;
  name: string;
  description: string;
  icon: string;
  criteria_type: string;
  criteria_value: number;
  earned: boolean;
  earned_at?: string;
  currentValue: number;
}

export function ProfileBadges() {
  const { user } = useAuth();
  const [badges, setBadges] = useState<BadgeWithProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetch = async () => {
      const { data: checkResult } = await supabase.functions.invoke("check-badges");
      if (checkResult?.newBadges?.length > 0) {
        fireBadgeConfetti();
        for (const name of checkResult.newBadges) {
          toast({ title: "🏆 Nova Conquista!", description: name });
        }
      }

      const [allBadges, userBadges, scripts, videos, sims, patients, profile] = await Promise.all([
        supabase.from("badges").select("*").order("criteria_value", { ascending: true }),
        supabase.from("user_badges").select("badge_id, earned_at").eq("user_id", user.id),
        supabase.from("scripts").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("videos").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("simulations").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("patients").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("profiles").select("best_streak").eq("user_id", user.id).single(),
      ]);

      const countsMap: Record<string, number> = {
        scripts_count: scripts.count || 0,
        videos_count: videos.count || 0,
        simulations_count: sims.count || 0,
        patients_count: patients.count || 0,
        streak: profile.data?.best_streak || 0,
        high_score: 0,
      };

      const earnedMap = new Map(
        (userBadges.data || []).map((ub: any) => [ub.badge_id, ub.earned_at])
      );

      setBadges(
        (allBadges.data || []).map((b: any) => ({
          ...b,
          earned: earnedMap.has(b.id),
          earned_at: earnedMap.get(b.id),
          currentValue: Math.min(countsMap[b.criteria_type] ?? 0, b.criteria_value),
        }))
      );
      setLoading(false);
    };

    fetch();
  }, [user]);

  if (loading) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-lg">Conquistas</CardTitle></CardHeader>
        <CardContent>
          <div className="flex justify-center py-6">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const earned = badges.filter(b => b.earned);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Trophy weight="duotone" className="w-5 h-5 text-primary" />
          Conquistas ({earned.length}/{badges.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {badges.map((badge) => {
          const Icon = iconMap[badge.icon] || Trophy;
          const pct = badge.criteria_value > 0
            ? Math.round((badge.currentValue / badge.criteria_value) * 100)
            : 0;

          return (
            <div
              key={badge.id}
              className={cn(
                "flex items-center gap-4 p-3 rounded-lg border transition-all",
                badge.earned
                  ? "bg-primary/5 border-primary/20"
                  : "bg-secondary/30 border-border/30"
              )}
            >
              <div className="relative shrink-0">
                <Icon
                  weight={badge.earned ? "duotone" : "light"}
                  className={cn("w-8 h-8", badge.earned ? "text-primary" : "text-muted-foreground")}
                />
                {!badge.earned && (
                  <Lock weight="bold" className="w-3.5 h-3.5 text-muted-foreground absolute -bottom-0.5 -right-0.5" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{badge.name}</span>
                  {badge.earned ? (
                    <span className="text-xs text-primary font-medium">✓ Conquistado</span>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      {badge.currentValue}/{badge.criteria_value} {criteriaLabels[badge.criteria_type] || ""}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{badge.description}</p>
                {!badge.earned && (
                  <Progress value={pct} className="h-1.5 mt-2" />
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
