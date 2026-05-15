import { z } from "zod";

export const improveBulletSchema = z.object({
  text: z.string().min(1, "Bullet text is required"),
  role: z.string().min(1, "Role is required"),
  company: z.string().min(1, "Company is required"),
});

export const generateSummarySchema = z.object({
  name: z.string().min(1, "Name is required"),
  role: z.string().min(1, "Role is required"),
  yearsExp: z.number({ error: "Years of experience must be a number" }),
  skills: z.array(z.string()).min(1, "At least one skill is required"),
  topAchievement: z.string().min(1, "Top achievement is required"),
});

export const atsScoreSchema = z.object({
  resumeText: z.string().min(1, "Resume text is required"),
  jobDescription: z.string().min(1, "Job description is required"),
});

export const suggestSkillsSchema = z.object({
  role: z.string().min(1, "Role is required"),
  currentSkills: z.array(z.string()),
});
