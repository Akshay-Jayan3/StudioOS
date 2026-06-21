import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import { discoverySystemPrompt } from "@/agents/discovery-agent/system-prompt";
import { discoveryInputSchema, discoveryOutputSchema } from "@/agents/discovery-agent/schema";
import { logAIRun } from "@/lib/log-ai-run";

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  let input: any;
  try {
    const body = await req.json();
    input = discoveryInputSchema.parse(body);

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

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

    const result = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL!,
      contents: prompt,
      config: { systemInstruction: discoverySystemPrompt },
    });
    const text = result.text || "";

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in response");

    const parsed = JSON.parse(jsonMatch[0]);
    const validated = discoveryOutputSchema.parse(parsed);

    await logAIRun({
      agent: "Discovery Agent",
      input,
      output: validated,
      status: "completed",
      durationMs: Date.now() - startTime,
    });

    return NextResponse.json({ success: true, data: validated });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Discovery agent error:", error);
    await logAIRun({
      agent: "Discovery Agent",
      input,
      status: "failed",
      error: errorMessage,
      durationMs: Date.now() - startTime,
    });
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
