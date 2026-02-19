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

    const { answers, patientName, specialty } = await req.json();

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
            content: `Você é um especialista em Eneagrama aplicado à comunicação médico-paciente. Com base nas respostas sobre o comportamento observado do paciente, identifique o tipo de Eneagrama (1-9) e forneça orientações práticas para o médico.

Especialidade do médico: ${specialty || "Não informada"}`
          },
          {
            role: "user",
            content: `Paciente: ${patientName}\n\nRespostas do questionário sobre comportamentos observados:\n${answers.map((a: any, i: number) => `${i + 1}. ${a.question}: ${a.answer}`).join('\n')}\n\nIdentifique o tipo de Eneagrama e forneça orientações.`
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "decode_patient",
              description: "Decode the patient's Enneagram type and provide guidance",
              parameters: {
                type: "object",
                properties: {
                  enneagramType: { type: "number", description: "Enneagram type 1-9" },
                  enneagramName: { type: "string", description: "Name of the type in Portuguese" },
                  confidence: { type: "number", description: "Confidence percentage 0-100" },
                  description: { type: "string", description: "Brief description of why this type" },
                  howTheyThink: { type: "array", items: { type: "string" }, description: "How this patient type thinks (3 items)" },
                  communicationTips: { type: "array", items: { type: "string" }, description: "Communication tips for this type (4 items)" },
                  phrasesToUse: { type: "array", items: { type: "string" }, description: "Specific phrases to use with this patient (3 items)" },
                  phrasesToAvoid: { type: "array", items: { type: "string" }, description: "Phrases to avoid (3 items)" },
                  closingStrategy: { type: "string", description: "Best strategy to close with this patient type" }
                },
                required: ["enneagramType", "enneagramName", "confidence", "description", "howTheyThink", "communicationTips", "phrasesToUse", "phrasesToAvoid", "closingStrategy"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "decode_patient" } }
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
    const result = toolCall ? JSON.parse(toolCall.function.arguments) : null;

    return new Response(JSON.stringify({ result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("decode-patient error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
