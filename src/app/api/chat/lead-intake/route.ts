import { GoogleGenerativeAI } from "@google/generative-ai";
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

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  let messages: { role: "user" | "assistant"; content: string }[] = [];

  try {
    const body = await req.json();
    const parsed = chatRequestSchema.parse(body);
    messages = parsed.messages;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

    // 1. Conversational reply
    const chatModel = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL!,
      systemInstruction: leadIntakeSystemPrompt,
    });

    const priorMessages = messages.slice(0, -1);
    const firstUserIndex = priorMessages.findIndex((m) => m.role === "user");
    const history = (firstUserIndex === -1 ? [] : priorMessages.slice(firstUserIndex)).map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));
    const lastMessage = messages[messages.length - 1].content;

    const chat = chatModel.startChat({ history });
    const chatResult = await chat.sendMessage(lastMessage);
    const reply = chatResult.response.text();

    // 2. Extraction check — has enough info been gathered to create a lead?
    const extractionModel = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL!,
    });
    const transcript = [...messages, { role: "assistant" as const, content: reply }]
      .map((m) => `${m.role === "user" ? "Visitor" : "Nila"}: ${m.content}`)
      .join("\n");

    const extractionPrompt = `Here is a conversation between a website visitor and an interior design studio's chat assistant:

${transcript}

Determine if enough information has been gathered to create a sales lead. You need at minimum: a name AND (an email OR a phone number). Project type, budget, and timeline are nice to have but not required to proceed.

Return JSON exactly in this shape:
{
  "hasEnoughInfo": boolean,
  "name": "string or omit",
  "email": "string or omit",
  "phone": "string or omit",
  "project_type": "string or omit",
  "budget": "string or omit",
  "timeline": "string or omit",
  "notes": "any other useful context, or omit"
}`;

    const extractionResult = await extractionModel.generateContent(extractionPrompt);
    const extractionText = extractionResult.response.text();
    const jsonMatch = extractionText.match(/\{[\s\S]*\}/);
    let extraction = { hasEnoughInfo: false } as ReturnType<typeof leadExtractionSchema.parse>;

    if (jsonMatch) {
      try {
        extraction = leadExtractionSchema.parse(JSON.parse(jsonMatch[0]));
      } catch {
        // extraction parsing failed, treat as not ready
      }
    }

    let leadCaptured = false;

    if (extraction.hasEnoughInfo && extraction.name && (extraction.email || extraction.phone)) {
      const supabase = getServiceClient();
      const budgetNum = extraction.budget
        ? parseFloat(extraction.budget.replace(/[^0-9.]/g, "")) * (extraction.budget.toLowerCase().includes("lakh") ? 100000 : 1)
        : null;

      const { error: insertError } = await supabase.from("leads").insert({
        name: extraction.name,
        email: extraction.email || `no-email-${Date.now()}@placeholder.local`,
        phone: extraction.phone || null,
        project_type: extraction.project_type || null,
        budget: budgetNum || null,
        source: "AI Chatbot",
        notes: extraction.notes || null,
        status: "New Lead",
      });

      if (!insertError) leadCaptured = true;
    }

    await logAIRun({
      agent: "Lead Intake Agent",
      input: messages,
      output: { reply, extraction, leadCaptured },
      status: "completed",
      durationMs: Date.now() - startTime,
    });

    return NextResponse.json({ success: true, reply, leadCaptured });
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
