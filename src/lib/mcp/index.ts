import { auth, defineMcp } from "@lovable.dev/mcp-js";
import getProfile from "./tools/get-profile";
import listScripts from "./tools/list-scripts";
import createScript from "./tools/create-script";
import listPatients from "./tools/list-patients";
import listRecentActivity from "./tools/list-recent-activity";
import getStatsSummary from "./tools/get-stats-summary";

// OAuth issuer MUST be the direct Supabase host (never the .lovable.cloud proxy).
// Build it from VITE_SUPABASE_PROJECT_ID, which Vite inlines at build time so
// the entry stays import-safe.
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "intentum-doc-os-mcp",
  title: "INTENTUM Doc OS",
  version: "0.1.0",
  instructions:
    "Tools for the INTENTUM Doc OS (Código de Poder) app — the signed-in doctor's medical marketing workspace. Use `get_profile` and `get_stats_summary` to understand the current user. Use `list_scripts`, `list_patients`, and `list_recent_activity` to browse their content. Use `create_script` to save a new marketing script (Reels, Stories, or Anúncio).",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    getProfile,
    getStatsSummary,
    listScripts,
    createScript,
    listPatients,
    listRecentActivity,
  ],
});
