import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/ApiResponse";
import { exportService } from "./export.service";

export const generatePDF = asyncHandler(async (req: Request, res: Response) => {
  const result = await exportService.generatePDF(req.params.id as string, req.user._id.toString());
  res.status(200).json(new ApiResponse(200, "PDF generated", result));
});
