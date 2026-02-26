import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Validate user
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(supabaseUrl, serviceKey);
    const url = new URL(req.url);
    const period = url.searchParams.get("period") || "week";

    // Get all profiles
    const { data: profiles } = await adminClient
      .from("profiles")
      .select("user_id, full_name, specialty, points, current_streak, best_streak, is_active")
      .eq("is_active", true);

    if (!profiles || profiles.length === 0) {
      return new Response(JSON.stringify({ ranking: [], userPosition: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let rankedUsers;

    if (period === "all") {
      // Use total points from profiles
      rankedUsers = profiles
        .map((p) => ({
          user_id: p.user_id,
          name: p.full_name || "Usuário",
          specialty: p.specialty || "",
          points: p.points || 0,
          streak: p.current_streak || 0,
        }))
        .sort((a, b) => b.points - a.points);
    } else {
      // Calculate points from activity_log within the period
      const now = new Date();
      let since: string;
      if (period === "week") {
        const d = new Date(now);
        d.setDate(d.getDate() - 7);
        since = d.toISOString();
      } else {
        // month
        const d = new Date(now);
        d.setDate(d.getDate() - 30);
        since = d.toISOString();
      }

      const { data: activities } = await adminClient
        .from("activity_log")
        .select("user_id, points")
        .gte("created_at", since);

      // Aggregate points per user
      const pointsMap: Record<string, number> = {};
      for (const a of activities || []) {
        pointsMap[a.user_id] = (pointsMap[a.user_id] || 0) + (a.points || 0);
      }

      rankedUsers = profiles
        .map((p) => ({
          user_id: p.user_id,
          name: p.full_name || "Usuário",
          specialty: p.specialty || "",
          points: pointsMap[p.user_id] || 0,
          streak: p.current_streak || 0,
        }))
        .sort((a, b) => b.points - a.points);
    }

    // Add rank
    const ranking = rankedUsers.map((u, i) => ({ ...u, rank: i + 1 }));
    const userPosition = ranking.findIndex((u) => u.user_id === user.id) + 1;

    return new Response(
      JSON.stringify({ ranking: ranking.slice(0, 50), userPosition }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
