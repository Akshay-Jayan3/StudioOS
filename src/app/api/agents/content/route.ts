import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { contentSystemPrompt } from "@/agents/content-agent/system-prompt";
import { contentInputSchema, contentOutputSchema } from "@/agents/content-agent/schema";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const input = contentInputSchema.parse(body);

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL!,
      systemInstruction: contentSystemPrompt,
    });

    const prompt = `Create marketing content for this completed interior design project.

Project Name: ${input.projectName}
Project Type: ${input.projectType}
Client Profile: ${input.clientProfile}
Style Description: ${input.styleDescription}
Key Features: ${input.keyFeatures}
Challenges Solved: ${input.challenges}
Outcome: ${input.outcome}
Budget Range: ${input.budget || "Not disclosed"}
Duration: ${input.duration || "Not specified"}

Return a JSON object with exactly this structure:
{
  "caseStudy": {
    "title": "...",
    "subtitle": "...",
    "problem": "paragraph about what the client needed",
    "process": "paragraph about how the studio approached it",
    "outcome": "paragraph about the result",
    "designerQuote": "a quote from the designer's perspective",
    "tags": ["tag1", "tag2"]
  },
  "instagramCaption": {
    "hook": "first line — the scroll-stopper",
    "body": "main caption body",
    "cta": "call to action",
    "hashtags": ["#tag1", "#tag2"],
    "fullCaption": "complete ready-to-post caption"
  },
  "linkedinPost": {
    "headline": "attention-grabbing first line",
    "body": "main post content",
    "insight": "the professional insight or lesson",
    "cta": "call to action",
    "fullPost": "complete ready-to-post LinkedIn content"
  },
  "projectStory": {
    "oneLiner": "one sentence project summary",
    "threeLineSummary": "three line summary for portfolio",
    "keywords": ["keyword1", "keyword2"]
  }
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in response");

    const parsed = JSON.parse(jsonMatch[0]);
    const validated = contentOutputSchema.parse(parsed);

    return NextResponse.json({ success: true, data: validated });
  } catch (error) {
    console.error("Content agent error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
