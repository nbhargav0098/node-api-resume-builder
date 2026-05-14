import mongoose, { Schema, Document, Types } from "mongoose";

export interface IResume extends Document {
  userId: Types.ObjectId;
  title: string;
  templateId: "modern" | "classic" | "minimal";
  isPublic: boolean;
  slug?: string;
  views: number;
  data: {
    personalInfo: Record<string, unknown>;
    summary: string;
    experience: unknown[];
    education: unknown[];
    skills: unknown[];
    projects: unknown[];
    certifications: unknown[];
  };
  versions: {
    data: Record<string, unknown>;
    label: string;
    createdAt: Date;
  }[];
}

const resumeSchema = new Schema<IResume>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, default: "Untitled Resume" },
    templateId: { type: String, enum: ["modern", "classic", "minimal"], default: "minimal" },
    isPublic: { type: Boolean, default: false },
    slug: { type: String, unique: true, sparse: true },
    views: { type: Number, default: 0 },
    data: {
      personalInfo: { type: Object, default: {} },
      summary: { type: String, default: "" },
      experience: { type: [Schema.Types.Mixed], default: [] },
      education: { type: [Schema.Types.Mixed], default: [] },
      skills: { type: [Schema.Types.Mixed], default: [] },
      projects: { type: [Schema.Types.Mixed], default: [] },
      certifications: { type: [Schema.Types.Mixed], default: [] },
    },
    versions: [
      {
        data: { type: Object, required: true },
        label: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model<IResume>("Resume", resumeSchema);
