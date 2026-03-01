const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { original, revised } = await req.json();

    if (!original || !revised) {
      return new Response(
        JSON.stringify({ error: 'Both original and revised text are required.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = `You are a legal and policy document analyst. Compare two text versions and determine if revisions change meaning substantively.

Focus on: Scope, Obligation, Condition, Definition, Rights, Liability.

Return ONLY valid JSON (no markdown):
{"overallVerdict":"meaningful_change or no_meaningful_change","overallSummary":"...","findings":[{"type":"scope|obligation|condition|definition|rights|liability|no_change","severity":"high|medium|low|none","summary":"...","detail":"...","originalSnippet":"...","revisedSnippet":"..."}]}`;

    const userPrompt = `ORIGINAL:\n${original}\n\nREVISED:\n${revised}`;

    const geminiKey = Deno.env.get('GeminiApiKey');
    if (!geminiKey) {
      return new Response(
        JSON.stringify({ error: 'GeminiApiKey secret is not configured.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const googleUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${geminiKey}`;

    const googleResponse = await fetch(googleUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: systemPrompt + '\n\n' + userPrompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          maxOutputTokens: 4096,
        },
      }),
    });

    if (!googleResponse.ok) {
      const errText = await googleResponse.text();
      console.error('Gemini API error:', googleResponse.status, errText);
      return new Response(
        JSON.stringify({ error: 'AI analysis failed.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const googleResult = await googleResponse.json();
    const content = googleResult.candidates?.[0]?.content?.parts?.[0]?.text || '';
    let jsonStr = content;
    const match = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (match) jsonStr = match[1].trim();
    const parsed = JSON.parse(jsonStr);

    return new Response(JSON.stringify(parsed), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'An error occurred while processing the comparison.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
