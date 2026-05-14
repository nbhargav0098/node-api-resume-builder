import { Router } from "express";
import { validate } from "../../middleware/validate.middleware";
import { protect } from "../../middleware/auth.middleware";
import { registerSchema, loginSchema } from "./auth.schema";
import * as authController from "./auth.controller";

const router = Router();

router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.post("/logout", protect, authController.logout);
router.post("/refresh", authController.refresh);
router.get("/me", protect, authController.getMe);

export default router;
