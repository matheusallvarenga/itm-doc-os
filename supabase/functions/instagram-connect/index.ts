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
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

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

    const body = await req.json();
    const { action } = body;

    if (action === "get_status") {
      // Check if user has an instagram connection
      const adminClient = createClient(supabaseUrl, serviceKey);
      const { data } = await adminClient
        .from("instagram_connections")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!data) {
        return new Response(JSON.stringify({ connected: false }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Fetch metrics from Instagram Graph API
      try {
        const igUserId = data.ig_user_id;
        const accessToken = data.access_token;

        const [profileRes, mediaRes] = await Promise.all([
          fetch(`https://graph.instagram.com/${igUserId}?fields=id,username,account_type,media_count,followers_count&access_token=${accessToken}`),
          fetch(`https://graph.instagram.com/${igUserId}/media?fields=id,caption,media_type,timestamp,like_count,comments_count,permalink&limit=10&access_token=${accessToken}`),
        ]);

        const profile = await profileRes.json();
        const media = await mediaRes.json();

        if (profile.error) {
          // Token might be expired
          return new Response(JSON.stringify({ connected: true, expired: true, error: profile.error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify({
          connected: true,
          profile,
          posts: media.data || [],
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (fetchErr) {
        return new Response(JSON.stringify({ connected: true, expired: true, error: fetchErr.message }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    if (action === "save_token") {
      const { access_token, ig_user_id, username } = body;
      const adminClient = createClient(supabaseUrl, serviceKey);

      // Upsert connection
      const { error } = await adminClient
        .from("instagram_connections")
        .upsert({
          user_id: user.id,
          access_token,
          ig_user_id,
          username,
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id" });

      if (error) throw error;

      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "disconnect") {
      const adminClient = createClient(supabaseUrl, serviceKey);
      await adminClient
        .from("instagram_connections")
        .delete()
        .eq("user_id", user.id);

      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
