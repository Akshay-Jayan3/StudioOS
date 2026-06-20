import { client } from "@/trigger";
import { intervalTrigger } from "@trigger.dev/sdk";
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/server";
import { Resend } from "resend";

const weeklyUpdateSchema = z.object({
  subject: z.string(),
  emailBody: z.string(),
  whatsappVersion: z.string(),
  projectHealthScore: z.number().min(1).max(10),
  clientActionsRequired: z.array(z.string()),
  internalRisks: z.array(z.string()),
});

export const weeklyStatusJob = client.defineJob({
  id: "weekly-status-updates",
  name: "Weekly Status Orchestrator",
  version: "1.0.0",
  trigger: intervalTrigger({
    seconds: 60 * 60 * 24 * 7, // weekly
  }),
  run: async (payload, io) => {
    const supabase = createServiceClient();

    // Fetch all active projects with client info
    const projects = await io.runTask("fetch-active-projects", async () => {
      const result = await supabase
        .from("projects")
        .select("*, clients(name, email)")
        .in("status", ["Discovery", "Design", "Approval", "Execution"]);
      return result.data || [];
    });

    if (!projects || projects.length === 0) {
      return { message: "No active projects", updatesGenerated: 0 };
    }

    const results = [];

    for (const project of projects) {
      const client_data = project.clients as any;
      if (!client_data?.email) continue;

      // Fetch milestones for this project
      const { data: milestones } = await supabase
        .from("milestones")
        .select("*")
        .eq("project_id", project.id)
        .order("due_date");

      const completedMilestones = milestones?.filter((m) => m.completed) || [];
      const pendingMilestones = milestones?.filter((m) => !m.completed) || [];
      const overdueMilestones = pendingMilestones.filter(
        (m) => m.due_date && new Date(m.due_date) < new Date()
      );

      const taskRun = await io.runTask(
        `generate-update-${project.id}`,
        async () => {
          // Log start
          const { data: run } = await supabase
            .from("ai_task_runs")
            .insert({
              agent: "Weekly Status Agent",
              trigger_type: "scheduled",
              trigger_entity: "project",
              trigger_entity_id: project.id,
              status: "running",
              input: { projectId: project.id, projectName: project.name },
            })
            .select()
            .single();

          const { object: update } = await generateObject({
            model: google(process.env.GEMINI_MODEL!),
            schema: weeklyUpdateSchema,
            system: `You are a client communication specialist for a premium interior design studio.
Write weekly project updates that are warm, specific, and build client confidence.
Never use vague language like "things are progressing well". Be specific about what happened.`,
            prompt: `Generate a weekly update for:

Project: ${project.name}
Client: ${client_data.name}
Phase: ${project.status}
Budget Used: ${Math.round(((project.spent || 0) / (project.budget || 1)) * 100)}%

Completed milestones: ${completedMilestones.map((m) => m.name).join(", ") || "None yet"}
Pending milestones: ${pendingMilestones.map((m) => `${m.name} (due ${m.due_date})`).join(", ") || "None"}
Overdue milestones: ${overdueMilestones.map((m) => m.name).join(", ") || "None"}

Write as if you're the project manager writing to the client directly.`,
          });

          // Send email
          const resend = new Resend(process.env.RESEND_API_KEY!);
          await resend.emails.send({
            from: "updates@aurainteriors.in",
            to: client_data.email,
            subject: update.subject,
            text: update.emailBody,
          });

          // Mark task complete
          await supabase
            .from("ai_task_runs")
            .update({
              status: "completed",
              output: update as any,
              completed_at: new Date().toISOString(),
            })
            .eq("id", run?.id);

          return { projectName: project.name, healthScore: update.projectHealthScore };
        }
      );

      results.push(taskRun);
    }

    return {
      updatesGenerated: results.length,
      projects: results,
    };
  },
});
