import { Router } from "express";
import { protect } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";
import { createResumeSchema, updateResumeSchema, saveVersionSchema } from "./resume.schema";
import * as resumeController from "./resume.controller";

const router = Router();

router.get("/public/:slug", resumeController.getPublicResume);

router.get("/", protect, resumeController.getUserResumes);
router.post("/", protect, validate(createResumeSchema), resumeController.createResume);
router.get("/:id", protect, resumeController.getResumeById);
router.put("/:id", protect, validate(updateResumeSchema), resumeController.updateResume);
router.delete("/:id", protect, resumeController.deleteResume);
router.post("/:id/publish", protect, resumeController.publishResume);
router.post("/:id/unpublish", protect, resumeController.unpublishResume);
router.post("/:id/version", protect, validate(saveVersionSchema), resumeController.saveVersion);

export default router;
