import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase-for-user";

export default defineTool({
  name: "list_patients",
  title: "List my patients",
  description:
    "List the signed-in doctor's saved patients, including any decoded Enneagram type.",
  inputSchema: {
    limit: z
      .number()
      .int()
      .describe("Max patients to return. Defaults to 20.")
      .optional(),
    search: z
      .string()
      .describe("Optional case-insensitive substring match on patient name.")
      .optional(),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit, search }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    let q = supabase
      .from("patients")
      .select(
        "id, name, email, phone, notes, enneagram_type, enneagram_name, created_at"
      )
      .eq("user_id", ctx.getUserId())
      .order("updated_at", { ascending: false })
      .limit(Math.min(limit ?? 20, 100));

    if (search) q = q.ilike("name", `%${search}%`);

    const { data, error } = await q;
    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { patients: data ?? [] },
    };
  },
});
