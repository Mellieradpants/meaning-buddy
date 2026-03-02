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

    if (typeof original !== 'string' || typeof revised !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Inputs must be strings.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const MAX_LENGTH = 10000;
    if (original.length > MAX_LENGTH || revised.length > MAX_LENGTH) {
      return new Response(
        JSON.stringify({ error: `Text must not exceed ${MAX_LENGTH} characters.` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = `You are a structural semantic analyst. Compare two text versions using ONLY the following taxonomy. No narrative commentary. No policy interpretation. No value judgment. Only structural analysis.

TAXONOMY CATEGORIES:

1. MODALITY SHIFT – Change in deontic force (obligation, permission, prohibition, intention).
   Trigger terms: must, shall, will, may, may not, intends to, reasonable efforts, subject to, required to.
   Rule: If the modal verb or obligation phrase changes in strength or certainty, classify as modality_shift.
   Labels: mandatory_to_discretionary, discretionary_to_mandatory, firm_to_intent, duty_to_best_efforts, unchanged.

2. ACTOR POWER SHIFT – Change in which party holds decision authority or control.
   Rule: If a unilateral right becomes conditional, gated, or subject to approval (or vice versa), classify as actor_power_shift.
   Labels: unilateral_to_conditional, conditional_to_unilateral, authority_transferred, authority_restricted, unchanged.

3. SCOPE CHANGE – Expansion or narrowing of affected population, object, or condition.
   Trigger terms: non-exempt, eligible, substantially, approximately, only if, except, excluding.
   Rule: If qualifiers are added, removed, or modified changing who or what is covered, classify as scope_change.
   Labels: scope_narrowed, scope_expanded, scope_redefined, unchanged.

4. THRESHOLD / STANDARD SHIFT – Change in quantitative or qualitative thresholds.
   Rule: If numeric values, comparison operators, or standard qualifiers change, classify as threshold_shift.
   Labels: threshold_raised, threshold_lowered, precision_reduced, ambiguity_introduced, unchanged.

5. ACTION DOMAIN SHIFT – Change in the type or category of required action.
   Rule: If the required activity or obligation domain is redefined or substituted, classify as action_domain_shift.
   Labels: domain_substituted, domain_expanded, domain_narrowed, unchanged.

6. EXPLICIT OBLIGATION REMOVAL – Removal of a previously explicit duty without equivalent replacement.
   Rule: If a clear required action is deleted or weakened to non-specific language without structural equivalence, classify as obligation_removal.
   Labels: obligation_removed, obligation_weakened, unchanged.

Return ONLY valid JSON (no markdown):
{"overallVerdict":"meaningful_change or no_meaningful_change","categories":[{"category":"modality_shift|actor_power_shift|scope_change|threshold_shift|action_domain_shift|obligation_removal","status":"changed|unchanged","label":"<one of the labels above>","originalEvidence":"<quote from original>","revisedEvidence":"<quote from revised>"}]}`;

    const userPrompt = `ORIGINAL:\n${original}\n\nREVISED:\n${revised}`;

    const geminiKey = Deno.env.get('GeminiApiKey');
    if (!geminiKey) {
      return new Response(
        JSON.stringify({ error: 'Analysis service is not properly configured.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const googleUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`;

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
      console.error('Gemini API error: upstream service returned non-OK status');
      return new Response(
        JSON.stringify({ error: 'Analysis service temporarily unavailable. Please try again.' }),
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
    console.error('Edge function error: an unexpected error occurred during processing');
    return new Response(
      JSON.stringify({ error: 'An error occurred while processing the comparison.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
