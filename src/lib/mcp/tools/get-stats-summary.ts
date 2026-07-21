import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase-for-user";

export default defineTool({
  name: "get_stats_summary",
  title: "Get my stats summary",
  description:
    "Return a summary of the signed-in doctor's totals: scripts, patients, simulations, videos, consultations, average score.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const userId = ctx.getUserId();

    const [scripts, patients, sims, videos, consults, videoScores, simScores, consultScores] =
      await Promise.all([
        supabase.from("scripts").select("id", { count: "exact", head: true }).eq("user_id", userId),
        supabase.from("patients").select("id", { count: "exact", head: true }).eq("user_id", userId),
        supabase.from("simulations").select("id", { count: "exact", head: true }).eq("user_id", userId),
        supabase.from("videos").select("id", { count: "exact", head: true }).eq("user_id", userId),
        supabase.from("consultations").select("id", { count: "exact", head: true }).eq("user_id", userId),
        supabase.from("videos").select("score").eq("user_id", userId).not("score", "is", null),
        supabase.from("simulations").select("score").eq("user_id", userId).not("score", "is", null),
        supabase.from("consultations").select("score").eq("user_id", userId).not("score", "is", null),
      ]);

    const allScores = [
      ...(videoScores.data ?? []).map((r: { score: number }) => r.score),
      ...(simScores.data ?? []).map((r: { score: number }) => r.score),
      ...(consultScores.data ?? []).map((r: { score: number }) => r.score),
    ];
    const avgScore =
      allScores.length > 0
        ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
        : 0;

    const summary = {
      scripts: scripts.count ?? 0,
      patients: patients.count ?? 0,
      simulations: sims.count ?? 0,
      videos: videos.count ?? 0,
      consultations: consults.count ?? 0,
      averageScore: avgScore,
    };

    return {
      content: [{ type: "text", text: JSON.stringify(summary, null, 2) }],
      structuredContent: { summary },
    };
  },
});
