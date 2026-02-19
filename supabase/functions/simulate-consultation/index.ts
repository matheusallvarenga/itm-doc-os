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

    const { messages, scenario, action } = await req.json();

    // Action: "chat" for patient responses, "feedback" for analysis
    if (action === "feedback") {
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
              content: `Você é um especialista em comunicação médico-paciente e análise de consultas. Analise a conversa de simulação abaixo e retorne um JSON com a análise.

Cenário: ${scenario.title} - ${scenario.description}
Paciente: ${scenario.patientName}, ${scenario.patientAge} anos
Procedimento: ${scenario.procedure}

Retorne APENAS um JSON válido (sem markdown) com esta estrutura:
{
  "score": número de 0 a 100,
  "strengths": ["ponto forte 1", "ponto forte 2", "ponto forte 3"],
  "improvements": ["melhoria 1", "melhoria 2", "melhoria 3"],
  "keyMoments": [
    {"type": "positive|objection|opportunity|error", "description": "descrição", "excerpt": "trecho da conversa"}
  ],
  "recommendations": ["recomendação 1", "recomendação 2", "recomendação 3", "recomendação 4"],
  "suggestedPhrase": "frase sugerida para situação similar"
}`
            },
            {
              role: "user",
              content: `Analise esta conversa de simulação:\n\n${messages.map((m: any) => `${m.sender === 'doctor' ? 'Médico' : 'Paciente'}: ${m.content}`).join('\n')}`
            }
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "provide_feedback",
                description: "Provide structured feedback for the consultation simulation",
                parameters: {
                  type: "object",
                  properties: {
                    score: { type: "number", description: "Score from 0 to 100" },
                    strengths: { type: "array", items: { type: "string" } },
                    improvements: { type: "array", items: { type: "string" } },
                    keyMoments: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          type: { type: "string", enum: ["positive", "objection", "opportunity", "error"] },
                          description: { type: "string" },
                          excerpt: { type: "string" }
                        },
                        required: ["type", "description", "excerpt"]
                      }
                    },
                    recommendations: { type: "array", items: { type: "string" } },
                    suggestedPhrase: { type: "string" }
                  },
                  required: ["score", "strengths", "improvements", "keyMoments", "recommendations", "suggestedPhrase"]
                }
              }
            }
          ],
          tool_choice: { type: "function", function: { name: "provide_feedback" } }
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
      const feedback = toolCall ? JSON.parse(toolCall.function.arguments) : null;

      return new Response(JSON.stringify({ feedback }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Chat mode - patient response (streaming)
    const systemPrompt = `Você é um paciente em uma simulação de consulta médica. Seu perfil:

Cenário: ${scenario.title}
Nome: ${scenario.patientName}, ${scenario.patientAge} anos
Procedimento: ${scenario.procedure}
Situação: ${scenario.situation}
Perfil de personalidade: ${scenario.profile}

REGRAS:
- Responda como o paciente, em primeira pessoa
- Use linguagem coloquial brasileira
- Mantenha-se no personagem e no perfil descrito
- Reaja naturalmente às abordagens do médico
- Se o médico for convincente, mostre sinais de abertura gradual
- Se pressionar demais, resista mais
- Respostas curtas e naturais (1-3 frases)
- NUNCA quebre o personagem`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.map((m: any) => ({
            role: m.sender === "doctor" ? "user" : "assistant",
            content: m.content,
          })),
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
    const content = data.choices?.[0]?.message?.content || "Hmm, entendo...";

    return new Response(JSON.stringify({ content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("simulate-consultation error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
