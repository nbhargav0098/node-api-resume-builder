import { Router } from "express";
import { protect } from "../../middleware/auth.middleware";
import { aiLimiter } from "../../middleware/rateLimiter.middleware";
import { validate } from "../../middleware/validate.middleware";
import {
  improveBulletSchema,
  generateSummarySchema,
  atsScoreSchema,
  suggestSkillsSchema,
} from "./ai.schema";
import * as aiController from "./ai.controller";

const router = Router();

router.post("/improve-bullet", protect, aiLimiter, validate(improveBulletSchema), aiController.improveBullet);
router.post("/generate-summary", protect, aiLimiter, validate(generateSummarySchema), aiController.generateSummary);
router.post("/ats-score", protect, aiLimiter, validate(atsScoreSchema), aiController.checkATSScore);
router.post("/suggest-skills", protect, aiLimiter, validate(suggestSkillsSchema), aiController.suggestSkills);

export default router;
