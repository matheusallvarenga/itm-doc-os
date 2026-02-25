import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
};

interface BadgeData {
  id: string;
  key: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earned_at?: string;
}

export function BadgesPanel() {
  const { user } = useAuth();
  const [badges, setBadges] = useState<BadgeData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchBadges = async () => {
      // Check for new badges first
      const { data: checkResult } = await supabase.functions.invoke("check-badges");
      if (checkResult?.newBadges?.length > 0) {
        fireBadgeConfetti();
        for (const badgeName of checkResult.newBadges) {
          toast({
            title: "🏆 Nova Conquista Desbloqueada!",
            description: badgeName,
          });
        }
      }

      // Fetch all badges + user's earned badges
      const [allBadges, userBadges] = await Promise.all([
        supabase.from("badges").select("*").order("criteria_value", { ascending: true }),
        supabase.from("user_badges").select("badge_id, earned_at").eq("user_id", user.id),
      ]);

      const earnedMap = new Map(
        (userBadges.data || []).map((ub: any) => [ub.badge_id, ub.earned_at])
      );

      setBadges(
        (allBadges.data || []).map((b: any) => ({
          ...b,
          earned: earnedMap.has(b.id),
          earned_at: earnedMap.get(b.id),
        }))
      );
      setLoading(false);
    };

    fetchBadges();
  }, [user]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Trophy weight="duotone" className="w-5 h-5 text-primary" />
            Conquistas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const earned = badges.filter((b) => b.earned);
  const locked = badges.filter((b) => !b.earned);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Trophy weight="duotone" className="w-5 h-5 text-primary" />
          Conquistas ({earned.length}/{badges.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {badges.map((badge) => {
            const Icon = iconMap[badge.icon] || Trophy;
            return (
              <div
                key={badge.id}
                className={cn(
                  "flex flex-col items-center gap-1.5 p-3 rounded-lg text-center transition-all",
                  badge.earned
                    ? "bg-primary/10 border border-primary/20"
                    : "bg-secondary/30 opacity-50"
                )}
                title={badge.description}
              >
                <div className="relative">
                  <Icon
                    weight={badge.earned ? "duotone" : "light"}
                    className={cn(
                      "w-7 h-7",
                      badge.earned ? "text-primary" : "text-muted-foreground"
                    )}
                  />
                  {!badge.earned && (
                    <Lock weight="bold" className="w-3 h-3 text-muted-foreground absolute -bottom-0.5 -right-0.5" />
                  )}
                </div>
                <span className="text-[10px] font-medium text-foreground leading-tight">
                  {badge.name}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
