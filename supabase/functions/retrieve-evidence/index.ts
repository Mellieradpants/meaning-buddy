const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// --------------- Rate limiter ---------------

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 5;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

// --------------- Source class descriptions ---------------

const SOURCE_CLASS_DESCRIPTIONS: Record<string, string> = {
  legal_statute: "official legal statutes, codified laws (USC, CFR), enacted legislation, court rulings",
  regulatory_filing: "regulatory agency filings, enforcement actions, compliance guidance documents",
  corporate_filing: "SEC filings, annual reports, proxy statements, corporate governance documents",
  medical_journal: "peer-reviewed medical journals, clinical guidelines, FDA approvals, medical databases",
  government_record: "executive orders, federal register entries, agency directives, government publications",
  technical_standard: "ISO standards, ASTM specifications, ANSI standards, IEEE protocols",
  general_reference: "authoritative reference sources relevant to the claim domain",
};

// --------------- Evidence retrieval tool ---------------

const evidenceTool = {
  type: "function" as const,
  function: {
    name: "report_evidence",
    description: "Report evidence findings for each claim. Return exact snippets from known sources. If no source is found, set evidenceStatus to 'not_found'.",
    parameters: {
      type: "object",
      properties: {
        claimResults: {
          type: "array",
          items: {
            type: "object",
            properties: {
              claimIndex: {
                type: "number",
                description: "Index of the claim in the input array (0-based)",
              },
              evidenceStatus: {
                type: "string",
                enum: ["found", "not_found"],
                description: "Whether a verifiable source was found for this claim",
              },
              sources: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    sourceName: {
                      type: "string",
                      description: "Name of the authoritative source (e.g., '29 CFR § 1910.134')",
                    },
                    link: {
                      type: "string",
                      description: "Direct URL to the source. Use empty string if no URL available.",
                    },
                    snippet: {
                      type: "string",
                      description: "Exact verbatim text from the source. Do NOT paraphrase.",
                    },
                    section: {
                      type: "string",
                      description: "Section, subsection, or identifier within the source",
                    },
                    timestamp: {
                      type: "string",
                      description: "Date of publication or last amendment if known",
                    },
                  },
                  required: ["sourceName", "link", "snippet"],
                },
              },
              comparison: {
                type: "string",
                enum: ["match", "partial", "unclear"],
                description: "How well the retrieved evidence matches the claim",
              },
            },
            required: ["claimIndex", "evidenceStatus", "sources", "comparison"],
          },
        },
      },
      required: ["claimResults"],
    },
  },
};

// --------------- Server ---------------

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    if (isRateLimited(clientIp)) {
      return new Response(
        JSON.stringify({ error: 'Too many requests. Please wait a moment and try again.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const { claims, sourceText } = body;

    if (!Array.isArray(claims) || claims.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Claims array is required.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (claims.length > 20) {
      return new Response(
        JSON.stringify({ error: 'Maximum 20 claims per request.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Evidence service is not properly configured.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build claim descriptions for the prompt
    const claimDescriptions = claims.map((c: any, i: number) => {
      const sourceClassDesc = SOURCE_CLASS_DESCRIPTIONS[c.sourceClass] || SOURCE_CLASS_DESCRIPTIONS.general_reference;
      return `[${i}] Claim: "${c.claim}"\n    Source class: ${c.sourceClass} (${sourceClassDesc})\n    Category: ${c.category}`;
    }).join('\n\n');

    const systemPrompt = `You are an evidence retrieval specialist. For each claim below, search your knowledge for the MOST AUTHORITATIVE source that can verify or refute the claim.

STRICT RULES:
1. ONLY return sources you are confident exist. If unsure, set evidenceStatus to "not_found".
2. The "snippet" field MUST contain the EXACT text from the source — do NOT paraphrase or summarize.
3. Route each claim to sources matching its source class. Do NOT use generic web results.
4. If a claim references a specific statute, regulation, or standard, find THAT specific source.
5. Never fabricate source names, URLs, or snippets. Return "not_found" rather than approximating.
6. For comparison: "match" = source directly confirms the claim, "partial" = source partially addresses it, "unclear" = relevance is uncertain.
7. Links should be to official government, institutional, or publisher domains when possible. Use empty string "" if no reliable URL exists.

Source text context (for understanding claim context):
<<<SOURCE>>>
${(sourceText || '').slice(0, 3000)}
<<<END_SOURCE>>>

Claims to verify:
${claimDescriptions}

Call the report_evidence function with your findings.`;

    const resp = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Retrieve evidence for the listed claims. Use report_evidence to return results.' },
        ],
        tools: [evidenceTool],
        tool_choice: { type: 'function', function: { name: 'report_evidence' } },
      }),
    });

    if (!resp.ok) {
      const errBody = await resp.text();
      console.error(`AI API error ${resp.status}:`, errBody);
      return new Response(
        JSON.stringify({ error: 'Evidence retrieval failed. Please try again.' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const json = await resp.json();
    const toolCall = json.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      console.error('No tool call in evidence response:', JSON.stringify(json).slice(0, 500));
      return new Response(
        JSON.stringify({ error: 'Evidence retrieval could not be completed.' }),
        { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let parsed: { claimResults: any[] };
    try {
      parsed = JSON.parse(toolCall.function.arguments);
    } catch (e) {
      console.error('Failed to parse evidence arguments:', e);
      return new Response(
        JSON.stringify({ error: 'Evidence retrieval produced invalid output.' }),
        { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ claimResults: parsed.claimResults }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('Unexpected error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
