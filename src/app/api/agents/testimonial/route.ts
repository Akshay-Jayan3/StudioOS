import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { testimonialSystemPrompt } from "@/agents/testimonial-agent/system-prompt";
import { testimonialInputSchema, testimonialOutputSchema } from "@/agents/testimonial-agent/schema";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const input = testimonialInputSchema.parse(body);

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL!,
      systemInstruction: testimonialSystemPrompt,
    });

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

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in response");

    const parsed = JSON.parse(jsonMatch[0]);
    const validated = testimonialOutputSchema.parse(parsed);

    return NextResponse.json({ success: true, data: validated });
  } catch (error) {
    console.error("Testimonial agent error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
