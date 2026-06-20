import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { updateSystemPrompt } from "@/agents/update-agent/system-prompt";
import { updateInputSchema, updateOutputSchema } from "@/agents/update-agent/schema";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const input = updateInputSchema.parse(body);

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL!,
      systemInstruction: updateSystemPrompt,
    });

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

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in response");

    const parsed = JSON.parse(jsonMatch[0]);
    const validated = updateOutputSchema.parse(parsed);

    return NextResponse.json({ success: true, data: validated });
  } catch (error) {
    console.error("Update agent error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
