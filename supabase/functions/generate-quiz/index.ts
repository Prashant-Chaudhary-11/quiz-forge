import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const GEMINI_MODEL = "gemini-3.1-flash-lite";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=`;

interface GenerateRequest {
  content: string;
  questionCount: number;
  moduleTypes: string[];
  category: string;
  apiKey: string;
}

function buildPrompt(content: string, questionCount: number, moduleTypes: string[], category: string): string {
  const moduleDescriptions: Record<string, string> = {
    mcq: "Multiple Choice Questions — each with 4 options labeled A-D and exactly one correct answer",
    fill_blank: "Fill in the Blanks — a sentence with a blank (use ___ to mark the blank) and the correct word/phrase to fill in",
    match: "Match the Following — two lists of items (list A and list B) with correct pairings",
    true_false: "True/False — a statement that is either true or false, with the correct answer",
    short_answer: "Short Answer — an open-ended question with a concise model answer (1-3 sentences)",
  };

  const moduleList = moduleTypes
    .map((t) => `- "${t}": ${moduleDescriptions[t] || t}`)
    .join("\n");

  const categoryGuidance =
    category === "competitive"
      ? "Make these COMPETITIVE / exam-style questions: tricky, nuanced, testing deep understanding and edge cases, similar to what appears in competitive exams."
      : "Make these NORMAL difficulty questions: straightforward, testing core understanding of the material.";

  return `You are an expert quiz generator. Based on the study material provided below, generate exactly ${questionCount} questions distributed across the requested module types.

STUDY MATERIAL:
"""
${content}
"""

REQUIREMENTS:
${categoryGuidance}

Include ONLY these module types (distribute the ${questionCount} questions across them as evenly as possible):
${moduleList}

OUTPUT FORMAT:
Return a JSON object (and NOTHING else — no markdown, no code fences, no explanation) with this exact structure:
{
  "modules": [
    {
      "type": "mcq",
      "questions": [
        {
          "id": "mcq-1",
          "question": "The question text",
          "options": { "A": "option text", "B": "option text", "C": "option text", "D": "option text" },
          "correctAnswer": "A"
        }
      ]
    },
    {
      "type": "fill_blank",
      "questions": [
        {
          "id": "fill-1",
          "question": "The sentence with ___ marking the blank",
          "correctAnswer": "the word or phrase"
        }
      ]
    },
    {
      "type": "match",
      "questions": [
        {
          "id": "match-1",
          "question": "Match the following items",
          "listA": ["item 1", "item 2", "item 3", "item 4"],
          "listB": ["match 1", "match 2", "match 3", "match 4"],
          "correctPairs": { "item 1": "match 1", "item 2": "match 2" }
        }
      ]
    },
    {
      "type": "true_false",
      "questions": [
        {
          "id": "tf-1",
          "question": "The statement",
          "correctAnswer": true
        }
      ]
    },
    {
      "type": "short_answer",
      "questions": [
        {
          "id": "sa-1",
          "question": "The open-ended question",
          "correctAnswer": "The model answer"
        }
      ]
    }
  ]
}

Only include module types that were requested. Each module object has a "type" field and a "questions" array. Make sure every question id is unique. Generate high-quality questions that are directly based on the study material.`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { content, questionCount, moduleTypes, category, apiKey } =
      (await req.json()) as GenerateRequest;

    if (!apiKey || typeof apiKey !== "string") {
      return new Response(
        JSON.stringify({ error: "Missing Gemini API key." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (!content || content.trim().length < 20) {
      return new Response(
        JSON.stringify({ error: "Study material is too short to generate questions." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (!moduleTypes || moduleTypes.length === 0) {
      return new Response(
        JSON.stringify({ error: "Select at least one question type." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const prompt = buildPrompt(content, questionCount, moduleTypes, category);

    const geminiRes = await fetch(`${GEMINI_ENDPOINT}${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8192,
          responseMimeType: "application/json",
        },
      }),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      let message = `Gemini API error (${geminiRes.status})`;
      try {
        const errJson = JSON.parse(errText);
        if (errJson?.error?.message) message = errJson.error.message;
      } catch {
        // keep default message
      }
      return new Response(
        JSON.stringify({ error: message }),
        { status: geminiRes.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const geminiData = await geminiRes.json();
    const rawText =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ??
      geminiData?.candidates?.[0]?.content?.parts?.map((p: { text: string }) => p.text).join("") ??
      "";

    if (!rawText) {
      return new Response(
        JSON.stringify({ error: "Gemini returned an empty response. Try again." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        return new Response(
          JSON.stringify({ error: "Could not parse the AI response. Try again." }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    return new Response(JSON.stringify({ quiz: parsed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err?.message || "Unexpected server error." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
