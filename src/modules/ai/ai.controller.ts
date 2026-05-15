import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/ApiResponse";
import { aiService } from "./ai.service";

export const improveBullet = asyncHandler(async (req: Request, res: Response) => {
  const { text, role, company } = req.body;
  const result = await aiService.improveBullet(text, role, company);
  res.status(200).json(new ApiResponse(200, "Bullet improved", result));
});

export const generateSummary = asyncHandler(async (req: Request, res: Response) => {
  const { name, role, yearsExp, skills, topAchievement } = req.body;
  const result = await aiService.generateSummary(name, role, yearsExp, skills, topAchievement);
  res.status(200).json(new ApiResponse(200, "Summary generated", result));
});

export const checkATSScore = asyncHandler(async (req: Request, res: Response) => {
  const { resumeText, jobDescription } = req.body;
  const result = await aiService.checkATSScore(resumeText, jobDescription);
  res.status(200).json(new ApiResponse(200, "ATS score calculated", result));
});

export const suggestSkills = asyncHandler(async (req: Request, res: Response) => {
  const { role, currentSkills } = req.body;
  const result = await aiService.suggestSkills(role, currentSkills);
  res.status(200).json(new ApiResponse(200, "Skills suggested", result));
});
