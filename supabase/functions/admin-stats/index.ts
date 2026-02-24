import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function verifyAdmin(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) throw new Error("Missing auth");

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

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

  return { user, adminClient };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { adminClient } = await verifyAdmin(req);
    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    // --- Admin actions ---
    if (req.method === "POST" && action) {
      const body = await req.json();

      if (action === "update_profile") {
        const { user_id, full_name, specialty } = body;
        const { error } = await adminClient
          .from("profiles")
          .update({ full_name, specialty })
          .eq("user_id", user_id);
        if (error) throw error;
        return new Response(JSON.stringify({ ok: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (action === "toggle_active") {
        const { user_id, is_active } = body;
        const { error } = await adminClient
          .from("profiles")
          .update({ is_active })
          .eq("user_id", user_id);
        if (error) throw error;
        return new Response(JSON.stringify({ ok: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (action === "delete_user") {
        const { user_id } = body;
        // Delete from auth (cascades to profiles via trigger/FK)
        const { error } = await adminClient.auth.admin.deleteUser(user_id);
        if (error) throw error;
        return new Response(JSON.stringify({ ok: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // --- Default: fetch stats ---
    const [profiles, scripts, videos, simulations, consultations, patients, activities] = await Promise.all([
      adminClient.from("profiles").select("id, user_id, full_name, specialty, points, level, current_streak, best_streak, avatar_url, created_at, is_active"),
      adminClient.from("scripts").select("id", { count: "exact", head: true }),
      adminClient.from("videos").select("id, score", { count: "exact" }),
      adminClient.from("simulations").select("id, score", { count: "exact" }),
      adminClient.from("consultations").select("id, score", { count: "exact" }),
      adminClient.from("patients").select("id", { count: "exact", head: true }),
      adminClient.from("activity_log").select("id, user_id, type, points, description, created_at").order("created_at", { ascending: false }).limit(20),
    ]);

    const allScores = [
      ...(videos.data || []).filter(v => v.score != null).map(v => v.score as number),
      ...(simulations.data || []).filter(s => s.score != null).map(s => s.score as number),
      ...(consultations.data || []).filter(c => c.score != null).map(c => c.score as number),
    ];
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
    const status = e.message === "Forbidden: not admin" ? 403 : e.message === "Unauthorized" ? 401 : 500;
    return new Response(JSON.stringify({ error: e.message }), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
