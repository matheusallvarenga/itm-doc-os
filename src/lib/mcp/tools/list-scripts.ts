import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase-for-user";

export default defineTool({
  name: "list_scripts",
  title: "List my scripts",
  description:
    "List the signed-in doctor's saved marketing scripts (roteiros). Newest first.",
  inputSchema: {
    limit: z
      .number()
      .int()
      .describe("Max scripts to return. Defaults to 20.")
      .optional(),
    type: z
      .string()
      .describe("Optional format filter: Reels, Stories, or Anúncio.")
      .optional(),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit, type }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    let q = supabase
      .from("scripts")
      .select("id, title, type, content, status, created_at")
      .eq("user_id", ctx.getUserId())
      .order("created_at", { ascending: false })
      .limit(Math.min(limit ?? 20, 100));

    if (type) q = q.eq("type", type);

    const { data, error } = await q;
    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { scripts: data ?? [] },
    };
  },
});
