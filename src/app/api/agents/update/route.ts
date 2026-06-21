import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import { updateSystemPrompt } from "@/agents/update-agent/system-prompt";
import { updateInputSchema, updateOutputSchema } from "@/agents/update-agent/schema";
import { logAIRun } from "@/lib/log-ai-run";

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  let input: any;
  try {
    const body = await req.json();
    input = updateInputSchema.parse(body);

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

    const prompt = `Generate a weekly project update for the following project.

Project Name: ${input.projectName}
Client Name: ${input.clientName}
Current Phase: ${input.currentPhase}
Completed This Week: ${input.completedThisWeek}
In Progress: ${input.inProgress}
Upcoming Milestones: ${input.upcomingMilestones}
Issues: ${input.issues || "None"}
Client Decisions Needed: ${input.clientDecisionsNeeded || "None"}
Overall Project Health: ${input.overallHealth}

Return a JSON object with exactly this structure:
{
  "subject": "email subject line",
  "weeklyUpdate": {
    "greeting": "personalised greeting",
    "progressSummary": "2-sentence executive summary",
    "accomplishments": ["specific thing completed", "another thing"],
    "currentStatus": "one clear status statement",
    "nextSteps": [{"action": "...", "date": "this week / next week / by DD MMM", "owner": "Studio | Client | Vendor"}],
    "clientActions": ["if client needs to do anything specific"],
    "closing": "warm professional closing"
  },
  "internalNotes": {
    "risks": [{"issue": "...", "impact": "...", "action": "..."}],
    "teamReminders": ["reminder for the team"],
    "projectHealthScore": 8
  },
  "whatsappVersion": "short 3-5 line WhatsApp friendly version of the update"
}`;

    const result = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL!,
      contents: prompt,
      config: { systemInstruction: updateSystemPrompt },
    });
    const text = result.text || "";

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in response");

    const parsed = JSON.parse(jsonMatch[0]);
    const validated = updateOutputSchema.parse(parsed);

    await logAIRun({
      agent: "Update Agent",
      input,
      output: validated,
      status: "completed",
      durationMs: Date.now() - startTime,
    });

    return NextResponse.json({ success: true, data: validated });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Update agent error:", error);
    await logAIRun({
      agent: "Update Agent",
      input,
      status: "failed",
      error: errorMessage,
      durationMs: Date.now() - startTime,
    });
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
