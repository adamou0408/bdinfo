// Spec: specs/market-development-tool/contracts.md — Data Models
// Task: specs/market-development-tool/tasks.md — Task 2

import { z } from "zod";

export const leadQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  industry: z.string().optional(),
  pipeline_stage: z.string().optional(),
  search: z.string().optional(),
  sort_by: z.enum(["created_at", "last_interaction_at"]).default("created_at"),
});

export const leadUpdateSchema = z.object({
  pipeline_stage: z
    .enum(["discovered", "contacted", "communicating", "proposed", "closed_won", "closed_lost"])
    .optional(),
  tags: z.array(z.string()).optional(),
  companyName: z.string().optional(),
  industry: z.string().optional(),
  scale: z.string().optional(),
});

export const interactionCreateSchema = z.object({
  type: z.enum(["note", "message", "meeting", "proposal", "call", "social_engagement"]),
  channel: z.string().optional(),
  summary: z.string().optional(),
  result: z.string().optional(),
});

export const contentGenerateSchema = z.object({
  content_type: z.enum(["case_study", "industry_insight", "tech_guide", "success_story"]),
  target_industry: z.string().default("傳統產業"),
  topic: z.string(),
  tone: z.string().default("專業但易懂"),
});

export const contentUpdateSchema = z.object({
  title: z.string().optional(),
  body: z.string().optional(),
  status: z.enum(["draft", "pending_review", "approved", "published", "archived"]).optional(),
  scheduled_at: z.string().datetime().optional(),
  platform: z.string().optional(),
});

export const portfolioCaseSchema = z.object({
  title: z.string().min(1),
  clientIndustry: z.string().optional(),
  problemDescription: z.string().optional(),
  solutionDescription: z.string().optional(),
  results: z.string().optional(),
  testimonial: z.string().optional(),
  isPublic: z.boolean().default(true),
  displayOrder: z.number().default(0),
});

export const dataDeletionSchema = z.object({
  email: z.string().email(),
  verification_code: z.string().min(6).max(6),
});
