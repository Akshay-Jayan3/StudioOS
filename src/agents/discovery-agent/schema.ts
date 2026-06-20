import { z } from "zod";

export const discoveryInputSchema = z.object({
  clientName: z.string(),
  projectType: z.string(),
  spaceDescription: z.string(),
  budget: z.string(),
  timeline: z.string(),
  stylePreferences: z.string(),
  mustHaves: z.string(),
  painPoints: z.string(),
  additionalNotes: z.string().optional(),
});

export const discoveryOutputSchema = z.object({
  projectSummary: z.string(),
  clientGoals: z.array(z.string()),
  budgetAnalysis: z.object({
    stated: z.string(),
    realistic: z.string(),
    assessment: z.string(),
    recommendation: z.string(),
  }),
  stylePreferences: z.array(z.string()),
  requirements: z.array(z.object({
    item: z.string(),
    priority: z.enum(["Must Have", "Nice to Have", "Optional"]),
  })),
  risks: z.array(z.object({
    risk: z.string(),
    severity: z.enum(["High", "Medium", "Low"]),
    mitigation: z.string(),
  })),
  missingInformation: z.array(z.string()),
  nextQuestions: z.array(z.string()),
  readinessScore: z.number().min(0).max(10),
  designerNotes: z.string(),
});

export type DiscoveryInput = z.infer<typeof discoveryInputSchema>;
export type DiscoveryOutput = z.infer<typeof discoveryOutputSchema>;
