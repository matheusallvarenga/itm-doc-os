import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase-for-user";

export default defineTool({
  name: "create_script",
  title: "Create a script",
  description:
    "Create a new marketing script (roteiro) in the signed-in doctor's library. Use for saving AI-generated or hand-written scripts.",
  inputSchema: {
    title: z.string().trim().min(1).describe("Short title for the script."),
    type: z
      .enum(["Reels", "Stories", "Anúncio"])
      .describe("Format of the script."),
    content: z.string().describe("Full script text.").optional(),
    status: z
      .enum(["rascunho", "completo"])
      .describe("Draft or completed. Defaults to 'completo'.")
      .optional(),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async ({ title, type, content, status }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("scripts")
      .insert({
        user_id: ctx.getUserId(),
        title,
        type,
        content: content ?? null,
        status: status ?? "completo",
      })
      .select("id, title, type, status, created_at")
      .single();

    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }
    return {
      content: [{ type: "text", text: `Created script "${data.title}" (id: ${data.id}).` }],
      structuredContent: { script: data },
    };
  },
});
