import { z } from "zod";

export const contentInputSchema = z.object({
  projectName: z.string(),
  projectType: z.string(),
  clientProfile: z.string(),
  styleDescription: z.string(),
  keyFeatures: z.string(),
  challenges: z.string(),
  outcome: z.string(),
  budget: z.string().optional(),
  duration: z.string().optional(),
});

export const contentOutputSchema = z.object({
  caseStudy: z.object({
    title: z.string(),
    subtitle: z.string(),
    problem: z.string(),
    process: z.string(),
    outcome: z.string(),
    designerQuote: z.string(),
    tags: z.array(z.string()),
  }),
  instagramCaption: z.object({
    hook: z.string(),
    body: z.string(),
    cta: z.string(),
    hashtags: z.array(z.string()),
    fullCaption: z.string(),
  }),
  linkedinPost: z.object({
    headline: z.string(),
    body: z.string(),
    insight: z.string(),
    cta: z.string(),
    fullPost: z.string(),
  }),
  projectStory: z.object({
    oneLiner: z.string(),
    threeLineSummary: z.string(),
    keywords: z.array(z.string()),
  }),
});

export type ContentInput = z.infer<typeof contentInputSchema>;
export type ContentOutput = z.infer<typeof contentOutputSchema>;
