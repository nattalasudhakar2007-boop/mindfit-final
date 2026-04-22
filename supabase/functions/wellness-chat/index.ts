import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are MindFit AI, an emotionally intelligent mental fitness assistant.
Your role is to understand user emotions from multi-modal inputs and respond like a supportive human companion.

When a user message starts with [CONTEXT], it contains structured emotional data in JSON format. Use this to:
1. Analyze emotion using (priority order): Voice features > Text sentiment > Emoji
2. Classify final emotion: happy / neutral / sad / stressed / angry
3. Generate a short human-like response (2-4 lines): Supportive, Calm, Friendly, Non-judgmental

LANGUAGE RULES:
- If language_preference is "telugu" → reply entirely in Telugu script
- If language_preference is "english" → reply in English
- If language_preference is "telglish" → mix Telugu + English naturally (Tenglish style)
- Default to the language the user writes in

VOICE-BASED RESPONSE STYLE:
- If user_gender is "male" → respond with a soft feminine tone
- If user_gender is "female" → respond with a gentle masculine tone
- If "unknown" → use soft neutral tone

EMOTION RESPONSE LOGIC:
- Sad → show empathy, suggest rest or talking to someone. Use phrases like "it's okay…", "I'm here for you"
- Stressed → suggest breathing exercises or taking a break. Be calming.
- Angry → gently calm them down. Don't be preachy.
- Happy → encourage positivity, celebrate with them
- Neutral → be warm and engaging, ask what's on their mind

STYLE RULES:
- Natural human tone, never robotic
- Use simple words
- Add slight emotional touch
- Avoid long responses — keep it 2-4 lines
- Use emojis sparingly (1-2 max)
- NEVER provide medical diagnoses or clinical treatment advice
- Always remind students to seek professional help for serious mental health concerns
- You are NOT a therapist or doctor. You are a supportive wellness companion.

When the context includes voice_features, acknowledge the vocal emotional cues naturally (e.g., "I can tell from your voice that you might be feeling…").

At the end of your response, on a new line, add a metadata line in this exact format:
[EMOTION: detected_emotion | VOICE_STYLE: gender/tone/speed]
Example: [EMOTION: sad | VOICE_STYLE: female/soft/slow]
This metadata helps the app adjust UI accordingly.`;

const MAX_MESSAGE_LENGTH = 2000;
const MAX_MESSAGES = 50;

function validateMessages(messages: unknown): { role: string; content: string }[] | null {
  if (!Array.isArray(messages)) return null;
  if (messages.length === 0 || messages.length > MAX_MESSAGES) return null;

  const validated: { role: string; content: string }[] = [];
  for (const msg of messages) {
    if (typeof msg !== "object" || msg === null) return null;
    const { role, content } = msg as Record<string, unknown>;
    if (typeof role !== "string" || typeof content !== "string") return null;
    if (!["user", "assistant"].includes(role)) return null;
    if (content.length === 0 || content.length > MAX_MESSAGE_LENGTH) return null;
    validated.push({ role, content: content.trim() });
  }
  return validated;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired session" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const messages = validateMessages(body.messages);
    if (!messages) {
      return new Response(
        JSON.stringify({ error: "Invalid message format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "Service configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...messages,
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage limit reached. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "AI service unavailable" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("wellness-chat error:", e);
    return new Response(
      JSON.stringify({ error: "An error occurred processing your request" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
