import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { leadIntakeSystemPrompt } from "@/agents/lead-intake-agent/system-prompt";
import { chatRequestSchema, leadExtractionSchema } from "@/agents/lead-intake-agent/schema";
import { logAIRun } from "@/lib/log-ai-run";

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );
}

function parseBudget(budget?: string): number | null {
  if (!budget) return null;
  const num = parseFloat(budget.replace(/[^0-9.]/g, ""));
  if (Number.isNaN(num)) return null;
  return num * (budget.toLowerCase().includes("lakh") ? 100000 : 1);
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  let messages: { role: "user" | "assistant"; content: string }[] = [];

  try {
    const body = await req.json();
    const parsed = chatRequestSchema.parse(body);
    messages = parsed.messages;
    const existingLeadId: string | undefined = body.leadId || undefined;

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

    // 1. Conversational reply
    const priorMessages = messages.slice(0, -1);
    const firstUserIndex = priorMessages.findIndex((m) => m.role === "user");
    const history = (firstUserIndex === -1 ? [] : priorMessages.slice(firstUserIndex)).map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));
    const lastMessage = messages[messages.length - 1].content;

    const chat = ai.chats.create({
      model: process.env.GEMINI_MODEL!,
      config: { systemInstruction: leadIntakeSystemPrompt },
      history,
    });
    const chatResult = await chat.sendMessage({ message: lastMessage });
    const reply = chatResult.text || "";

    // 2. Extraction — pull whatever structured info is present so far
    const transcript = [...messages, { role: "assistant" as const, content: reply }]
      .map((m) => `${m.role === "user" ? "Visitor" : "Nila"}: ${m.content}`)
      .join("\n");

    const extractionPrompt = `Here is a conversation between a website visitor and an interior design studio's chat assistant:

${transcript}

Extract whatever structured information is present in the conversation so far.

"hasEnoughInfo" means: a name AND (an email OR a phone number) have been mentioned.

"readyToWrapUp" means: hasEnoughInfo is true, AND at least project_type and (budget or timeline) have been mentioned, AND at least one of space_description, style_preferences, must_haves, or pain_points has been mentioned. Also set readyToWrapUp to true if the visitor clearly signals they want to end the conversation (e.g. "that's all", "gotta go", "thanks bye"), even if not everything was covered. Otherwise false — keep the conversation going.

Other fields should be filled in if mentioned, omitted if not.

Return JSON exactly in this shape:
{
  "hasEnoughInfo": boolean,
  "readyToWrapUp": boolean,
  "name": "string or omit",
  "email": "string or omit",
  "phone": "string or omit",
  "project_type": "string or omit",
  "budget": "string or omit",
  "timeline": "string or omit",
  "space_description": "string or omit — size, rooms, current state of the space",
  "style_preferences": "string or omit — style/aesthetic they mentioned",
  "must_haves": "string or omit — specific features or requirements they mentioned",
  "pain_points": "string or omit — frustrations or concerns they mentioned",
  "notes": "any other useful context, or omit"
}`;

    const extractionResult = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL!,
      contents: extractionPrompt,
    });
    const extractionText = extractionResult.text || "";
    const jsonMatch = extractionText.match(/\{[\s\S]*\}/);
    let extraction = { hasEnoughInfo: false, readyToWrapUp: false } as ReturnType<typeof leadExtractionSchema.parse>;

    if (jsonMatch) {
      try {
        extraction = leadExtractionSchema.parse(JSON.parse(jsonMatch[0]));
      } catch {
        // extraction parsing failed, treat as not ready
      }
    }

    let leadCaptured = false;
    let leadId = existingLeadId;

    const fieldUpdate = {
      project_type: extraction.project_type || null,
      budget: parseBudget(extraction.budget),
      timeline: extraction.timeline || null,
      space_description: extraction.space_description || null,
      style_preferences: extraction.style_preferences || null,
      must_haves: extraction.must_haves || null,
      pain_points: extraction.pain_points || null,
      notes: extraction.notes || null,
    };

    const supabase = getServiceClient();

    if (!leadId && extraction.hasEnoughInfo && extraction.name && (extraction.email || extraction.phone)) {
      // First time we have enough to create the lead
      const { data, error: insertError } = await supabase
        .from("leads")
        .insert({
          name: extraction.name,
          email: extraction.email || `no-email-${Date.now()}@placeholder.local`,
          phone: extraction.phone || null,
          source: "AI Chatbot",
          status: "New Lead",
          ...fieldUpdate,
        })
        .select()
        .single();

      if (!insertError && data) {
        leadCaptured = true;
        leadId = data.id;
      }
    } else if (leadId) {
      // Lead already exists — keep enriching it as the conversation continues
      await supabase.from("leads").update(fieldUpdate).eq("id", leadId);
      leadCaptured = true;
    }

    await logAIRun({
      agent: "Lead Intake Agent",
      input: messages,
      output: { reply, extraction, leadCaptured, leadId, conversationComplete: extraction.readyToWrapUp },
      status: "completed",
      durationMs: Date.now() - startTime,
    });

    return NextResponse.json({ success: true, reply, leadCaptured, leadId, conversationComplete: extraction.readyToWrapUp });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Lead intake chat error:", error);
    await logAIRun({
      agent: "Lead Intake Agent",
      input: messages,
      status: "failed",
      error: errorMessage,
      durationMs: Date.now() - startTime,
    });
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
