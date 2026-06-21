import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import { testimonialSystemPrompt } from "@/agents/testimonial-agent/system-prompt";
import { testimonialInputSchema, testimonialOutputSchema } from "@/agents/testimonial-agent/schema";
import { logAIRun } from "@/lib/log-ai-run";

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  let input: any;
  try {
    const body = await req.json();
    input = testimonialInputSchema.parse(body);

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

    const prompt = `Create a testimonial request for this completed project.

Client Name: ${input.clientName}
Project Name: ${input.projectName}
Project Highlights: ${input.projectHighlights}
Relationship Notes: ${input.relationshipNotes || "None"}

Return a JSON object with exactly this structure:
{
  "testimonialRequest": {
    "subject": "email subject line",
    "message": "warm, specific email message asking for a testimonial"
  },
  "whatsappVersion": "shorter, casual version for WhatsApp",
  "referralFollowUp": {
    "whenToSend": "e.g. 2 weeks after testimonial received",
    "message": "referral ask message, separate from testimonial ask"
  },
  "suggestedQuestions": ["question to help the client write a more specific testimonial"]
}`;

    const result = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL!,
      contents: prompt,
      config: { systemInstruction: testimonialSystemPrompt },
    });
    const text = result.text || "";

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in response");

    const parsed = JSON.parse(jsonMatch[0]);
    const validated = testimonialOutputSchema.parse(parsed);

    await logAIRun({
      agent: "Testimonial Agent",
      input,
      output: validated,
      status: "completed",
      durationMs: Date.now() - startTime,
    });

    return NextResponse.json({ success: true, data: validated });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Testimonial agent error:", error);
    await logAIRun({
      agent: "Testimonial Agent",
      input,
      status: "failed",
      error: errorMessage,
      durationMs: Date.now() - startTime,
    });
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
