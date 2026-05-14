import { z } from "zod";

export const createResumeSchema = z.object({
  title: z.string().optional(),
});

export const updateResumeSchema = z.object({
  title: z.string().optional(),
  templateId: z.enum(["modern", "classic", "minimal"]).optional(),
  data: z
    .object({
      personalInfo: z.record(z.string(), z.unknown()).optional(),
      summary: z.string().optional(),
      experience: z.array(z.unknown()).optional(),
      education: z.array(z.unknown()).optional(),
      skills: z.array(z.unknown()).optional(),
      projects: z.array(z.unknown()).optional(),
      certifications: z.array(z.unknown()).optional(),
    })
    .optional(),
});

export const saveVersionSchema = z.object({
  label: z.string().min(1, "Label is required"),
});

export type CreateResumeInput = z.infer<typeof createResumeSchema>;
export type UpdateResumeInput = z.infer<typeof updateResumeSchema>;
