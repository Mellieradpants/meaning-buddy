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

    const prompt = `You are a legal and policy document analyst. Compare the two versions of text below and determine whether the revisions change the meaning in any substantive way.

Focus on changes in:
- **Scope**: Who or what is affected (broader or narrower)
- **Obligation**: What is required, permitted, or prohibited (stronger or weaker)
- **Condition**: When or under what circumstances something applies (added, removed, modified)
- **Definition**: How key terms are defined (expanded, narrowed, altered)
- **Rights**: What rights are granted or removed
- **Liability**: Responsibility, indemnification, or penalties

For each finding, classify:
- type: one of "scope", "obligation", "condition", "definition", "rights", "liability", "no_change"
- severity: "high" (fundamentally changes meaning), "medium" (notable shift), "low" (minor nuance change), "none" (no meaningful change)
- summary: one-sentence description of what changed
- detail: fuller explanation if needed (empty string if not)
- originalSnippet: the relevant text from the original
- revisedSnippet: the relevant text from the revision

Also provide:
- overallVerdict: "meaningful_change" or "no_meaningful_change"
- overallSummary: a plain summary of whether and how the meaning changed

Return ONLY valid JSON in this exact format:
{
  "overallVerdict": "meaningful_change" | "no_meaningful_change",
  "overallSummary": "...",
  "findings": [
    {
      "type": "scope" | "obligation" | "condition" | "definition" | "rights" | "liability" | "no_change",
      "severity": "high" | "medium" | "low" | "none",
      "summary": "...",
      "detail": "...",
      "originalSnippet": "...",
      "revisedSnippet": "..."
    }
  ]
}

ORIGINAL:
${original}

REVISED:
${revised}`;

    // Use Lovable AI (proxied through Supabase AI gateway)
    const response = await fetch('https://api.supabase.com/v1/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_AUTH_TOKEN')}`,
        'X-Supabase-Project-Ref': Deno.env.get('SUPABASE_PROJECT_REF') || '',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'user', content: prompt }
        ],
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'AI analysis failed. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiResult = await response.json();
    const content = aiResult.choices?.[0]?.message?.content || '';
    
    // Extract JSON from the response (handle markdown code blocks)
    let jsonStr = content;
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    }

    const parsed = JSON.parse(jsonStr);

    return new Response(
      JSON.stringify(parsed),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in meaning-diff function:', error);
    return new Response(
      JSON.stringify({ error: 'An error occurred while processing the comparison.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
