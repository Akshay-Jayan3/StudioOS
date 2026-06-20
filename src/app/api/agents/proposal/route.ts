import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { proposalSystemPrompt } from "@/agents/proposal-agent/system-prompt";
import { proposalInputSchema, proposalOutputSchema } from "@/agents/proposal-agent/schema";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const input = proposalInputSchema.parse(body);

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL!,
      systemInstruction: proposalSystemPrompt,
    });

    const prompt = `Create a detailed proposal for the following interior design project.

Client: ${input.clientName}
Project Name: ${input.projectName}
Project Type: ${input.projectType}
Space Details: ${input.spaceDetails}
Budget: ${input.budget}
Timeline: ${input.timeline}
Style Direction: ${input.styleDirection}
Key Requirements: ${input.keyRequirements}
Studio Name: ${input.studioName}

Return a JSON object with exactly this structure:
{
  "proposalTitle": "...",
  "executiveSummary": "2-3 paragraph overview",
  "projectScope": [{"area": "...", "description": "...", "included": ["item1", "item2"]}],
  "deliverables": [{"phase": "...", "items": ["..."], "duration": "..."}],
  "timeline": {
    "totalDuration": "...",
    "phases": [{"phase": "...", "duration": "...", "milestones": ["..."]}]
  },
  "pricing": {
    "designFee": {"amount": "₹X,XX,XXX", "basis": "..."},
    "procurementEstimate": "₹X,XX,XXX",
    "totalEstimate": "₹X,XX,XXX",
    "paymentSchedule": [{"milestone": "...", "percentage": 30, "amount": "₹X,XX,XXX"}]
  },
  "exclusions": ["what is not included"],
  "terms": ["key terms and conditions"],
  "closingNote": "warm closing paragraph"
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in response");

    const parsed = JSON.parse(jsonMatch[0]);
    const validated = proposalOutputSchema.parse(parsed);

    return NextResponse.json({ success: true, data: validated });
  } catch (error) {
    console.error("Proposal agent error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
