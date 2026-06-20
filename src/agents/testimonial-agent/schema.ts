import { z } from "zod";

export const testimonialInputSchema = z.object({
  clientName: z.string(),
  projectName: z.string(),
  projectHighlights: z.string(),
  relationshipNotes: z.string().optional(),
});

export const testimonialOutputSchema = z.object({
  testimonialRequest: z.object({
    subject: z.string(),
    message: z.string(),
  }),
  whatsappVersion: z.string(),
  referralFollowUp: z.object({
    whenToSend: z.string(),
    message: z.string(),
  }),
  suggestedQuestions: z.array(z.string()),
});

export type TestimonialInput = z.infer<typeof testimonialInputSchema>;
export type TestimonialOutput = z.infer<typeof testimonialOutputSchema>;
