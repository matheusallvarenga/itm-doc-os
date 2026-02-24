import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing auth");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const adminClient = createClient(supabaseUrl, serviceKey);

    // Get user's current counts
    const [scripts, videos, simulations, patients, profile, existingBadges, allBadges, highScoreV, highScoreS, highScoreC] = await Promise.all([
      adminClient.from("scripts").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      adminClient.from("videos").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      adminClient.from("simulations").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      adminClient.from("patients").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      adminClient.from("profiles").select("best_streak").eq("user_id", user.id).single(),
      adminClient.from("user_badges").select("badge_id").eq("user_id", user.id),
      adminClient.from("badges").select("*"),
      adminClient.from("videos").select("score").eq("user_id", user.id).not("score", "is", null).gte("score", 90).limit(1),
      adminClient.from("simulations").select("score").eq("user_id", user.id).not("score", "is", null).gte("score", 90).limit(1),
      adminClient.from("consultations").select("score").eq("user_id", user.id).not("score", "is", null).gte("score", 90).limit(1),
    ]);

    const earnedIds = new Set((existingBadges.data || []).map(b => b.badge_id));
    const badges = allBadges.data || [];
    const bestStreak = profile.data?.best_streak || 0;
    const hasHighScore = (highScoreV.data?.length || 0) > 0 || (highScoreS.data?.length || 0) > 0 || (highScoreC.data?.length || 0) > 0;

    const countsMap: Record<string, number> = {
      scripts_count: scripts.count || 0,
      videos_count: videos.count || 0,
      simulations_count: simulations.count || 0,
      patients_count: patients.count || 0,
      streak: bestStreak,
      high_score: hasHighScore ? 100 : 0,
    };

    const newBadges: string[] = [];
    for (const badge of badges) {
      if (earnedIds.has(badge.id)) continue;
      const current = countsMap[badge.criteria_type] ?? 0;
      if (current >= badge.criteria_value) {
        const { error } = await adminClient.from("user_badges").insert({
          user_id: user.id,
          badge_id: badge.id,
        });
        if (!error) newBadges.push(badge.name);
      }
    }

    return new Response(JSON.stringify({ newBadges, total: (existingBadges.data?.length || 0) + newBadges.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
