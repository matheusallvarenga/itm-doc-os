import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Get all public tables
    const { data: tables, error: tablesError } = await supabase.rpc(
      "get_public_tables"
    );

    if (tablesError) {
      // Fallback: query information_schema directly via a simple RPC
      throw new Error(tablesError.message);
    }

    let sqlOutput = `-- Database export generated at ${new Date().toISOString()}\n\n`;

    for (const table of tables) {
      const tableName = table.table_name;

      // Get table data
      const { data: rows, error } = await supabase
        .from(tableName)
        .select("*");

      if (error) {
        sqlOutput += `-- Error reading table ${tableName}: ${error.message}\n\n`;
        continue;
      }

      if (!rows || rows.length === 0) {
        sqlOutput += `-- Table "${tableName}" is empty\n\n`;
        continue;
      }

      sqlOutput += `-- Table: ${tableName} (${rows.length} rows)\n`;

      for (const row of rows) {
        const columns = Object.keys(row).join(", ");
        const values = Object.values(row)
          .map((v) => {
            if (v === null) return "NULL";
            if (typeof v === "number" || typeof v === "boolean") return String(v);
            if (typeof v === "object") return `'${JSON.stringify(v).replace(/'/g, "''")}'`;
            return `'${String(v).replace(/'/g, "''")}'`;
          })
          .join(", ");
        sqlOutput += `INSERT INTO "${tableName}" (${columns}) VALUES (${values});\n`;
      }
      sqlOutput += "\n";
    }

    return new Response(sqlOutput, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": 'attachment; filename="export.sql"',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
