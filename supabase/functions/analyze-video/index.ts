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

    const { title, url, description, specialty } = await req.json();

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
            content: `Você é um especialista em análise de vídeos médicos para redes sociais. Analise o vídeo descrito e forneça feedback detalhado baseado em 10 critérios.

Especialidade: ${specialty || "Não informada"}

Critérios de análise (cada um com peso):
1. Gancho inicial (15%) - Primeiros 3 segundos prendem atenção?
2. Clareza da mensagem (15%) - A mensagem principal é clara?
3. Linguagem corporal (10%) - Postura, gestos, expressões
4. Tom de voz (10%) - Engajamento, ritmo, variação
5. Call to action (15%) - Direcionamento claro ao final?
6. Enquadramento (10%) - Composição visual adequada?
7. Iluminação (5%) - Luz adequada e profissional?
8. Áudio (5%) - Qualidade sonora
9. Duração ideal (5%) - Tempo adequado para o formato?
10. Storytelling (10%) - Narrativa envolvente?`
          },
          {
            role: "user",
            content: `Analise este vídeo:\nTítulo: ${title}\n${url ? `URL: ${url}` : ""}\n${description ? `Descrição: ${description}` : ""}\n\nFornece análise detalhada.`
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "analyze_video",
              description: "Provide detailed video analysis",
              parameters: {
                type: "object",
                properties: {
                  overallScore: { type: "number", description: "Overall score 0-100" },
                  criteria: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        score: { type: "number" },
                        maxScore: { type: "number" },
                        feedback: { type: "string" }
                      },
                      required: ["name", "score", "maxScore", "feedback"]
                    }
                  },
                  strengths: { type: "array", items: { type: "string" } },
                  improvements: { type: "array", items: { type: "string" } },
                  scriptSuggestion: { type: "string", description: "Suggested improved script" },
                  overallFeedback: { type: "string" }
                },
                required: ["overallScore", "criteria", "strengths", "improvements", "scriptSuggestion", "overallFeedback"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "analyze_video" } }
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (status === 402) return new Response(JSON.stringify({ error: "Payment required" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error(`AI gateway error: ${status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    const analysis = toolCall ? JSON.parse(toolCall.function.arguments) : null;

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-video error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
