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
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify caller is admin
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) throw new Error("Unauthorized");

    const adminClient = createClient(supabaseUrl, serviceKey);
    const { data: roleData } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) throw new Error("Forbidden: not admin");

    // Fetch global stats
    const [profiles, scripts, videos, simulations, consultations, patients, activities] = await Promise.all([
      adminClient.from("profiles").select("id, user_id, full_name, specialty, points, level, current_streak, best_streak, avatar_url, created_at"),
      adminClient.from("scripts").select("id, user_id, created_at", { count: "exact" }),
      adminClient.from("videos").select("id, user_id, score, created_at", { count: "exact" }),
      adminClient.from("simulations").select("id, user_id, score, created_at", { count: "exact" }),
      adminClient.from("consultations").select("id, user_id, score, created_at", { count: "exact" }),
      adminClient.from("patients").select("id, user_id, created_at", { count: "exact" }),
      adminClient.from("activity_log").select("id, user_id, type, points, description, created_at").order("created_at", { ascending: false }).limit(20),
    ]);

    const videoScores = (videos.data || []).filter(v => v.score != null).map(v => v.score as number);
    const simScores = (simulations.data || []).filter(s => s.score != null).map(s => s.score as number);
    const consultScores = (consultations.data || []).filter(c => c.score != null).map(c => c.score as number);
    const allScores = [...videoScores, ...simScores, ...consultScores];
    const avgScore = allScores.length > 0 ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) : 0;

    return new Response(JSON.stringify({
      users: profiles.data || [],
      stats: {
        totalUsers: (profiles.data || []).length,
        totalScripts: scripts.count || 0,
        totalVideos: videos.count || 0,
        totalSimulations: simulations.count || 0,
        totalConsultations: consultations.count || 0,
        totalPatients: patients.count || 0,
        averageScore: avgScore,
      },
      recentActivity: activities.data || [],
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    const status = e.message === "Forbidden: not admin" ? 403 : 401;
    return new Response(JSON.stringify({ error: e.message }), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
