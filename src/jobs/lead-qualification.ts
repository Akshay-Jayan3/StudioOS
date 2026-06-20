import { client } from "@/trigger";
import { eventTrigger } from "@trigger.dev/sdk";
import { z } from "zod";
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { createServiceClient } from "@/lib/supabase/server";
import { Resend } from "resend";

const qualificationOutputSchema = z.object({
  score: z.number().min(1).max(10),
  summary: z.string(),
  budgetAssessment: z.enum(["Realistic", "Tight", "Unrealistic"]),
  projectFit: z.enum(["Strong", "Moderate", "Weak"]),
  urgency: z.enum(["High", "Medium", "Low"]),
  redFlags: z.array(z.string()),
  strengths: z.array(z.string()),
  recommendedAction: z.enum(["Fast Track", "Standard Follow-up", "Nurture", "Decline"]),
  draftReplyEmail: z.object({
    subject: z.string(),
    body: z.string(),
  }),
});

export const leadQualificationJob = client.defineJob({
  id: "lead-qualification",
  name: "Lead Qualification Agent",
  version: "1.0.0",
  trigger: eventTrigger({
    name: "lead.created",
    schema: z.object({
      leadId: z.string(),
    }),
  }),
  run: async (payload, io) => {
    const startTime = Date.now();
    const supabase = createServiceClient();

    // Fetch the lead
    const { data: lead, error } = await io.runTask(
      "fetch-lead",
      async () => {
        const result = await supabase
          .from("leads")
          .select("*")
          .eq("id", payload.leadId)
          .single();
        if (result.error) throw new Error(result.error.message);
        return result.data;
      }
    );

    // Log task run start
    const { data: taskRun } = await supabase
      .from("ai_task_runs")
      .insert({
        agent: "Lead Qualification Agent",
        trigger_type: "webhook",
        trigger_entity: "lead",
        trigger_entity_id: payload.leadId,
        status: "running",
        input: { leadId: payload.leadId, leadName: lead.name },
      })
      .select()
      .single();

    // Run qualification analysis
    const qualification = await io.runTask(
      "qualify-lead",
      async () => {
        const { object } = await generateObject({
          model: google(process.env.GEMINI_MODEL!),
          schema: qualificationOutputSchema,
          system: `You are a lead qualification specialist for a premium interior design studio in India.
Assess leads based on: budget realism, project scope clarity, decision-making readiness, and studio fit.
Be honest — a low score with clear reasoning is more valuable than an inflated one.`,
          prompt: `Qualify this interior design lead:

Name: ${lead.name}
Email: ${lead.email}
Project Type: ${lead.project_type || "Not specified"}
Budget: ${lead.budget ? `₹${(lead.budget / 100000).toFixed(1)}L` : "Not specified"}
Source: ${lead.source || "Unknown"}
Notes: ${lead.notes || "None"}

Score 1-10. Draft a warm, professional reply email inviting them for a discovery call.
The email should feel personal, not templated.`,
        });
        return object;
      },
      { retry: { limit: 3, minTimeoutInMs: 1000, factor: 2 } }
    );

    // Update lead with AI score and qualification
    await io.runTask("update-lead", async () => {
      await supabase
        .from("leads")
        .update({
          ai_score: qualification.score,
          ai_qualification: qualification as any,
          status: qualification.recommendedAction === "Decline" ? "Lost" : "New Lead",
        })
        .eq("id", payload.leadId);
    });

    // Send reply email if score >= 6
    if (qualification.score >= 6 && lead.email) {
      await io.runTask("send-reply-email", async () => {
        const resend = new Resend(process.env.RESEND_API_KEY!);
        await resend.emails.send({
          from: "studio@aurainteriors.in",
          to: lead.email!,
          subject: qualification.draftReplyEmail.subject,
          text: qualification.draftReplyEmail.body,
        });
      });
    }

    // Update task run as completed
    await supabase
      .from("ai_task_runs")
      .update({
        status: "completed",
        output: qualification as any,
        duration_ms: Date.now() - startTime,
        completed_at: new Date().toISOString(),
      })
      .eq("id", taskRun?.id);

    return {
      leadId: payload.leadId,
      score: qualification.score,
      action: qualification.recommendedAction,
      emailSent: qualification.score >= 6,
    };
  },
});
