import { z } from "zod";

export const proposalInputSchema = z.object({
  clientName: z.string(),
  projectName: z.string(),
  projectType: z.string(),
  spaceDetails: z.string(),
  budget: z.string(),
  timeline: z.string(),
  styleDirection: z.string(),
  keyRequirements: z.string(),
  studioName: z.string().default("Studio"),
});

export const proposalOutputSchema = z.object({
  proposalTitle: z.string(),
  executiveSummary: z.string(),
  projectScope: z.array(z.object({
    area: z.string(),
    description: z.string(),
    included: z.array(z.string()),
  })),
  deliverables: z.array(z.object({
    phase: z.string(),
    items: z.array(z.string()),
    duration: z.string(),
  })),
  timeline: z.object({
    totalDuration: z.string(),
    phases: z.array(z.object({
      phase: z.string(),
      duration: z.string(),
      milestones: z.array(z.string()),
    })),
  }),
  pricing: z.object({
    designFee: z.object({
      amount: z.string(),
      basis: z.string(),
    }),
    procurementEstimate: z.string(),
    totalEstimate: z.string(),
    paymentSchedule: z.array(z.object({
      milestone: z.string(),
      percentage: z.number(),
      amount: z.string(),
    })),
  }),
  exclusions: z.array(z.string()),
  terms: z.array(z.string()),
  closingNote: z.string(),
});

export type ProposalInput = z.infer<typeof proposalInputSchema>;
export type ProposalOutput = z.infer<typeof proposalOutputSchema>;
