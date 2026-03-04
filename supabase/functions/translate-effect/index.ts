import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { effects, targetLanguage } = await req.json();

    if (
      !Array.isArray(effects) ||
      effects.length === 0 ||
      !targetLanguage ||
      targetLanguage === "English"
    ) {
      return new Response(JSON.stringify({ translations: effects || [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a precise translator. You will receive an array of short English sentences describing operational effects of document changes. Translate each one into ${targetLanguage}.

Rules:
- Translate ONLY the text. Output a JSON array of translated strings in the same order.
- Preserve all numbers, dates, percentages, units, and named entities EXACTLY (e.g., 90%, 75%, 7 years, 3 years, March 1).
- Preserve sentence boundaries and meaning.
- Do NOT add explanations, legal advice, or commentary.
- Use plain, active voice, short sentences.
- Output ONLY the JSON array, nothing else.`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: JSON.stringify(effects),
            },
          ],
          temperature: 0.1,
        }),
      }
    );

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", status, t);
      throw new Error("Translation failed");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Parse the JSON array from the response
    let translations: string[];
    try {
      // Strip markdown code fences if present
      const cleaned = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
      translations = JSON.parse(cleaned);
      if (!Array.isArray(translations) || translations.length !== effects.length) {
        throw new Error("Length mismatch");
      }
    } catch {
      console.error("Failed to parse translations:", content);
      // Fall back to English
      translations = effects;
    }

    return new Response(JSON.stringify({ translations }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("translate-effect error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error", translations: [] }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
