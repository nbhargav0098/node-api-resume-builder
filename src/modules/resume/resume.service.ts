import { ApiError } from "../../utils/ApiError";
import Resume from "./resume.model";

export const resumeService = {
  async getUserResumes(userId: string) {
    return Resume.find({ userId }).sort({ updatedAt: -1 }).select("-versions");
  },

  async createResume(userId: string, title?: string) {
    return Resume.create({
      userId,
      title: title ?? "Untitled Resume",
      data: {
        personalInfo: {},
        summary: "",
        experience: [],
        education: [],
        skills: [],
        projects: [],
        certifications: [],
      },
    });
  },

  async getResumeById(id: string, userId: string) {
    const resume = await Resume.findById(id);
    if (!resume) throw new ApiError(404, "Resume not found");
    if (resume.userId.toString() !== userId) throw new ApiError(403, "Unauthorized");
    return resume;
  },

  async updateResume(id: string, userId: string, updateData: Record<string, unknown>) {
    const resume = await Resume.findById(id);
    if (!resume) throw new ApiError(404, "Resume not found");
    if (resume.userId.toString() !== userId) throw new ApiError(403, "Unauthorized");
    const updated = await Resume.findByIdAndUpdate(id, updateData, { new: true });
    return updated;
  },

  async deleteResume(id: string, userId: string) {
    const resume = await Resume.findById(id);
    if (!resume) throw new ApiError(404, "Resume not found");
    if (resume.userId.toString() !== userId) throw new ApiError(403, "Unauthorized");
    await resume.deleteOne();
  },

  async publishResume(id: string, userId: string) {
    const resume = await Resume.findById(id);
    if (!resume) throw new ApiError(404, "Resume not found");
    if (resume.userId.toString() !== userId) throw new ApiError(403, "Unauthorized");
    const { nanoid } = await import("nanoid");
    resume.slug = nanoid(8);
    resume.isPublic = true;
    await resume.save();
    return resume;
  },

  async unpublishResume(id: string, userId: string) {
    const resume = await Resume.findById(id);
    if (!resume) throw new ApiError(404, "Resume not found");
    if (resume.userId.toString() !== userId) throw new ApiError(403, "Unauthorized");
    resume.isPublic = false;
    await resume.save();
    return resume;
  },

  async getPublicResume(slug: string) {
    const resume = await Resume.findOneAndUpdate(
      { slug, isPublic: true },
      { $inc: { views: 1 } },
      { new: true }
    );
    if (!resume) throw new ApiError(404, "Resume not found");
    return resume;
  },

  async saveVersion(id: string, userId: string, label: string) {
    const resume = await Resume.findById(id);
    if (!resume) throw new ApiError(404, "Resume not found");
    if (resume.userId.toString() !== userId) throw new ApiError(403, "Unauthorized");
    if (resume.versions.length >= 10) resume.versions.shift();
    resume.versions.push({ data: resume.data as unknown as Record<string, unknown>, label, createdAt: new Date() });
    await resume.save();
    return resume;
  },
};
