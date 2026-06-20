import { z } from "zod";

export const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
});

export const chatRequestSchema = z.object({
  messages: z.array(chatMessageSchema).min(1),
});

export const leadExtractionSchema = z.object({
  hasEnoughInfo: z.boolean(),
  readyToWrapUp: z.boolean(),
  name: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  project_type: z.string().optional(),
  budget: z.string().optional(),
  timeline: z.string().optional(),
  space_description: z.string().optional(),
  style_preferences: z.string().optional(),
  must_haves: z.string().optional(),
  pain_points: z.string().optional(),
  notes: z.string().optional(),
});

export type ChatMessage = z.infer<typeof chatMessageSchema>;
export type LeadExtraction = z.infer<typeof leadExtractionSchema>;
