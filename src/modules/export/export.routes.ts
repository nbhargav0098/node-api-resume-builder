import { Router } from "express";
import { protect } from "../../middleware/auth.middleware";
import * as exportController from "./export.controller";

const router = Router();

router.post("/pdf/:id", protect, exportController.generatePDF);

export default router;
