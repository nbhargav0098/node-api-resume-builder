import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/ApiResponse";
import { resumeService } from "./resume.service";

export const getUserResumes = asyncHandler(async (req: Request, res: Response) => {
  const resumes = await resumeService.getUserResumes(req.user._id.toString());
  res.status(200).json(new ApiResponse(200, "Resumes fetched", resumes));
});

export const createResume = asyncHandler(async (req: Request, res: Response) => {
  const { title } = req.body;
  const resume = await resumeService.createResume(req.user._id.toString(), title);
  res.status(201).json(new ApiResponse(201, "Resume created", resume));
});

export const getResumeById = asyncHandler(async (req: Request, res: Response) => {
  const resume = await resumeService.getResumeById(req.params.id as string, req.user._id.toString());
  res.status(200).json(new ApiResponse(200, "Resume fetched", resume));
});

export const updateResume = asyncHandler(async (req: Request, res: Response) => {
  const resume = await resumeService.updateResume(req.params.id as string, req.user._id.toString(), req.body);
  res.status(200).json(new ApiResponse(200, "Resume updated", resume));
});

export const deleteResume = asyncHandler(async (req: Request, res: Response) => {
  await resumeService.deleteResume(req.params.id as string, req.user._id.toString());
  res.status(200).json(new ApiResponse(200, "Resume deleted", null));
});

export const publishResume = asyncHandler(async (req: Request, res: Response) => {
  const resume = await resumeService.publishResume(req.params.id as string, req.user._id.toString());
  res.status(200).json(new ApiResponse(200, "Resume published", resume));
});

export const unpublishResume = asyncHandler(async (req: Request, res: Response) => {
  const resume = await resumeService.unpublishResume(req.params.id as string, req.user._id.toString());
  res.status(200).json(new ApiResponse(200, "Resume unpublished", resume));
});

export const getPublicResume = asyncHandler(async (req: Request, res: Response) => {
  const resume = await resumeService.getPublicResume(req.params.slug as string);
  res.status(200).json(new ApiResponse(200, "Resume fetched", resume));
});

export const saveVersion = asyncHandler(async (req: Request, res: Response) => {
  const { label } = req.body;
  const resume = await resumeService.saveVersion(req.params.id as string, req.user._id.toString(), label);
  res.status(200).json(new ApiResponse(200, "Version saved", resume));
});
