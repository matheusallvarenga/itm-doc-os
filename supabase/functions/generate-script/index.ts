import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { topic, type, specialty } = await req.json();

    const typeInstructions: Record<string, string> = {
      "Reels": "Roteiro para Reels (15-60 segundos). Gancho forte nos 3 primeiros segundos, conteúdo direto, CTA claro.",
      "Stories": "Roteiro para Stories (15 segundos por story, 3-5 stories). Narrativa sequencial, enquetes, interação.",
      "Anúncio": "Roteiro para anúncio pago. Problema → solução → prova → CTA. Linguagem persuasiva.",
    };

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `Você é um especialista em criação de conteúdo para médicos nas redes sociais. Crie roteiros que geram engajamento e autoridade.

Especialidade do médico: ${specialty}
Formato: ${type}
${typeInstructions[type] || ""}

O roteiro deve ser prático, com marcações claras de cenas/momentos, e incluir sugestões de enquadramento e texto na tela quando aplicável.`
          },
          {
            role: "user",
            content: `Crie um roteiro de ${type} sobre: ${topic}`
          }
        ],
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (status === 402) return new Response(JSON.stringify({ error: "Payment required" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error(`AI gateway error: ${status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-script error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
