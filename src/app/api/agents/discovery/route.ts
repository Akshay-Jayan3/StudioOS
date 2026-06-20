import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { discoverySystemPrompt } from "@/agents/discovery-agent/system-prompt";
import { discoveryInputSchema, discoveryOutputSchema } from "@/agents/discovery-agent/schema";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const input = discoveryInputSchema.parse(body);

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL!,
      systemInstruction: discoverySystemPrompt,
    });

    const prompt = `Analyze the following client discovery questionnaire and produce a structured project brief.

Client Name: ${input.clientName}
Project Type: ${input.projectType}
Space Description: ${input.spaceDescription}
Budget: ${input.budget}
Timeline: ${input.timeline}
Style Preferences: ${input.stylePreferences}
Must Haves: ${input.mustHaves}
Pain Points: ${input.painPoints}
Additional Notes: ${input.additionalNotes || "None provided"}

Return a JSON object with exactly this structure:
{
  "projectSummary": "2-3 sentence overview",
  "clientGoals": ["goal1", "goal2"],
  "budgetAnalysis": {
    "stated": "what client said",
    "realistic": "what it actually buys",
    "assessment": "Adequate | Tight | Unrealistic",
    "recommendation": "your advice"
  },
  "stylePreferences": ["preference1", "preference2"],
  "requirements": [{"item": "...", "priority": "Must Have | Nice to Have | Optional"}],
  "risks": [{"risk": "...", "severity": "High | Medium | Low", "mitigation": "..."}],
  "missingInformation": ["what we still need to know"],
  "nextQuestions": ["question to ask in next meeting"],
  "readinessScore": 7,
  "designerNotes": "internal notes for the design team"
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in response");

    const parsed = JSON.parse(jsonMatch[0]);
    const validated = discoveryOutputSchema.parse(parsed);

    return NextResponse.json({ success: true, data: validated });
  } catch (error) {
    console.error("Discovery agent error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
