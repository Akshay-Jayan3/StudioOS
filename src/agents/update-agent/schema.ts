import { z } from "zod";

export const updateInputSchema = z.object({
  projectName: z.string(),
  clientName: z.string(),
  currentPhase: z.string(),
  completedThisWeek: z.string(),
  inProgress: z.string(),
  upcomingMilestones: z.string(),
  issues: z.string().optional(),
  clientDecisionsNeeded: z.string().optional(),
  overallHealth: z.enum(["On Track", "At Risk", "Delayed"]),
});

export const updateOutputSchema = z.object({
  subject: z.string(),
  weeklyUpdate: z.object({
    greeting: z.string(),
    progressSummary: z.string(),
    accomplishments: z.array(z.string()),
    currentStatus: z.string(),
    nextSteps: z.array(z.object({
      action: z.string(),
      date: z.string(),
      owner: z.enum(["Studio", "Client", "Vendor"]),
    })),
    clientActions: z.array(z.string()),
    closing: z.string(),
  }),
  internalNotes: z.object({
    risks: z.array(z.object({
      issue: z.string(),
      impact: z.string(),
      action: z.string(),
    })),
    teamReminders: z.array(z.string()),
    projectHealthScore: z.number().min(1).max(10),
  }),
  whatsappVersion: z.string(),
});

export type UpdateInput = z.infer<typeof updateInputSchema>;
export type UpdateOutput = z.infer<typeof updateOutputSchema>;
