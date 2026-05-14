import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { ApiError } from "../../utils/ApiError";
import { generateAccessToken, generateRefreshToken } from "../../utils/generateTokens";
import User from "./auth.model";

export const authService = {
  async register(name: string, email: string, password: string) {
    const existing = await User.findOne({ email });
    if (existing) throw new ApiError(409, "Email already in use");

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });

    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString());

    user.refreshToken = await bcrypt.hash(refreshToken, 10);
    await user.save();

    const { password: _p, refreshToken: _rt, ...userData } = user.toObject();
    return { user: userData, accessToken, refreshToken };
  },

  async login(email: string, password: string) {
    const user = await User.findOne({ email });
    if (!user) throw new ApiError(401, "Invalid credentials");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new ApiError(401, "Invalid credentials");

    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString());

    user.refreshToken = await bcrypt.hash(refreshToken, 10);
    await user.save();

    const { password: _p, refreshToken: _rt, ...userData } = user.toObject();
    return { user: userData, accessToken, refreshToken };
  },

  async logout(userId: string) {
    await User.findByIdAndUpdate(userId, { refreshToken: "" });
  },

  async refreshAccessToken(incomingToken: string) {
    let decoded: { _id: string };
    try {
      decoded = jwt.verify(incomingToken, process.env.JWT_REFRESH_SECRET!) as { _id: string };
    } catch {
      throw new ApiError(401, "Unauthorized");
    }

    const user = await User.findById(decoded._id);
    if (!user) throw new ApiError(401, "Unauthorized");

    if (!user.refreshToken) throw new ApiError(401, "Session expired");

    const isValid = await bcrypt.compare(incomingToken, user.refreshToken);
    if (!isValid) throw new ApiError(401, "Session expired");

    const accessToken = generateAccessToken(user._id.toString());
    return { accessToken };
  },

  async getMe(userId: string) {
    const user = await User.findById(userId).select("-password -refreshToken");
    if (!user) throw new ApiError(404, "User not found");
    return user;
  },
};
