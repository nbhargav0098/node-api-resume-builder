import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import { Request } from "express";

export const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  keyGenerator: (req: Request) => req.user?._id?.toString() ?? ipKeyGenerator(req.ip ?? ""),
  message: { success: false, message: "Too many AI requests. Wait a minute." },
});
