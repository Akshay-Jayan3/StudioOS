import { client } from "@/trigger";
import { eventTrigger } from "@trigger.dev/sdk";
import { z } from "zod";
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { createServiceClient } from "@/lib/supabase/server";
import { Resend } from "resend";

const kickoffOutputSchema = z.object({
  welcomeEmail: z.object({
    subject: z.string(),
    body: z.string(),
  }),
  milestones: z.array(z.object({
    name: z.string(),
    daysFromStart: z.number(),
    description: z.string(),
  })),
  onboardingChecklist: z.array(z.string()),
  designerBriefSummary: z.string(),
});

export const projectKickoffJob = client.defineJob({
  id: "project-kickoff",
  name: "Project Kickoff Agent",
  version: "1.0.0",
  trigger: eventTrigger({
    name: "lead.won",
    schema: z.object({
      leadId: z.string(),
      clientName: z.string(),
      clientEmail: z.string(),
      projectType: z.string(),
      budget: z.number().optional(),
    }),
  }),
  run: async (payload, io) => {
    const supabase = createServiceClient();
    const startTime = Date.now();

    // Log task run
    const { data: taskRun } = await supabase
      .from("ai_task_runs")
      .insert({
        agent: "Project Kickoff Agent",
        trigger_type: "webhook",
        trigger_entity: "lead",
        trigger_entity_id: payload.leadId,
        status: "running",
        input: payload as any,
      })
      .select()
      .single();

    // Create client record
    const { data: newClient } = await io.runTask("create-client", async () => {
      const result = await supabase
        .from("clients")
        .insert({
          name: payload.clientName,
          email: payload.clientEmail,
          lead_id: payload.leadId,
        })
        .select()
        .single();
      if (result.error) throw new Error(result.error.message);
      return result.data;
    });

    // Create project record
    const { data: project } = await io.runTask("create-project", async () => {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 4);

      const result = await supabase
        .from("projects")
        .insert({
          name: `${payload.clientName} — ${payload.projectType}`,
          client_id: newClient.id,
          status: "Discovery",
          start_date: startDate.toISOString().split("T")[0],
          end_date: endDate.toISOString().split("T")[0],
          budget: payload.budget || null,
        })
        .select()
        .single();
      if (result.error) throw new Error(result.error.message);
      return result.data;
    });

    // Generate kickoff content via AI
    const kickoff = await io.runTask("generate-kickoff", async () => {
      const { object } = await generateObject({
        model: google(process.env.GEMINI_MODEL!),
        schema: kickoffOutputSchema,
        system: `You are the studio director of a premium interior design studio in India.
Write a warm, professional onboarding welcome for a new client.
Make them feel they made the right choice. Be specific, not generic.`,
        prompt: `Generate kickoff content for:

Client: ${payload.clientName}
Project Type: ${payload.projectType}
Budget: ${payload.budget ? `₹${(payload.budget / 100000).toFixed(1)}L` : "To be confirmed"}
Project Start: Today

Create:
1. A warm welcome email (not generic, feels personally written)
2. Realistic milestone plan (6-8 milestones, days from start)
3. Onboarding checklist (what client needs to share with us)
4. Brief summary for the assigned designer`,
      });
      return object;
    });

    // Create milestones in DB
    await io.runTask("create-milestones", async () => {
      const startDate = new Date();
      const milestoneInserts = kickoff.milestones.map((m) => {
        const dueDate = new Date(startDate);
        dueDate.setDate(dueDate.getDate() + m.daysFromStart);
        return {
          project_id: project.id,
          name: m.name,
          due_date: dueDate.toISOString().split("T")[0],
          completed: false,
        };
      });
      await supabase.from("milestones").insert(milestoneInserts);
    });

    // Send welcome email
    await io.runTask("send-welcome-email", async () => {
      const resend = new Resend(process.env.RESEND_API_KEY!);
      await resend.emails.send({
        from: "hello@aurainteriors.in",
        to: payload.clientEmail,
        subject: kickoff.welcomeEmail.subject,
        text: kickoff.welcomeEmail.body,
      });
    });

    // Mark task complete
    await supabase
      .from("ai_task_runs")
      .update({
        status: "completed",
        output: { ...kickoff, projectId: project.id, clientId: newClient.id } as any,
        duration_ms: Date.now() - startTime,
        completed_at: new Date().toISOString(),
      })
      .eq("id", taskRun?.id);

    return {
      clientId: newClient.id,
      projectId: project.id,
      milestonesCreated: kickoff.milestones.length,
      emailSent: true,
    };
  },
});
