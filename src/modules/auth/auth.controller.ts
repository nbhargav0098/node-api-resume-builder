import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/ApiResponse";
import { ApiError } from "../../utils/ApiError";
import { authService } from "./auth.service";

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  const { user, accessToken, refreshToken } = await authService.register(name, email, password);
  res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);
  res.status(201).json(new ApiResponse(201, "Registration successful", { user, accessToken }));
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const { user, accessToken, refreshToken } = await authService.login(email, password);
  res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);
  res.status(200).json(new ApiResponse(200, "Login successful", { user, accessToken }));
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  res.clearCookie("refreshToken");
  await authService.logout(req.user._id.toString());
  res.status(200).json(new ApiResponse(200, "Logged out", null));
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const incomingToken = req.cookies?.refreshToken as string | undefined;
  if (!incomingToken) throw new ApiError(401, "No refresh token");
  const { accessToken } = await authService.refreshAccessToken(incomingToken);
  res.status(200).json(new ApiResponse(200, "Token refreshed", { accessToken }));
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.getMe(req.user._id.toString());
  res.status(200).json(new ApiResponse(200, "User fetched", user));
});
