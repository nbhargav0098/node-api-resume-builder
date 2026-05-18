import { model } from "../../config/gemini";
import { ApiError } from "../../utils/ApiError";
import { logger } from "../../middleware/logger.middleware";

const callGemini = async (prompt: string): Promise<unknown> => {
  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json|```/g, "").trim();
    return JSON.parse(text);
  } catch (err) {
    logger.error("Gemini API error", { message: err instanceof Error ? err.message : String(err) });
    throw new ApiError(503, "AI service unavailable");
  }
};

export const aiService = {
  async improveBullet(text: string, role: string, company: string) {
    const prompt = `You are a senior resume coach. Rewrite this bullet point to be powerful and results-driven. Start with a strong action verb. Use the STAR method. Quantify impact where possible. Keep under 20 words. Role: ${role} at ${company}. Bullet: ${text}. Respond ONLY with valid JSON: { "improved": string, "alternatives": string[] } with 2 alternatives. No markdown, no explanation, no backticks.`;
    return callGemini(prompt);
  },

  async generateSummary(
    name: string,
    role: string,
    yearsExp: number,
    skills: string[],
    topAchievement: string
  ) {
    const prompt = `You are a professional resume writer. Write a compelling 3-sentence professional summary. Sentence 1: role and years. Sentence 2: top skills and achievement. Sentence 3: value to team. Data: name=${name}, role=${role}, years=${yearsExp}, skills=${skills.join(", ")}, achievement=${topAchievement}. Respond ONLY with valid JSON: { "summary": string }. No markdown, no explanation, no backticks.`;
    return callGemini(prompt);
  },

  async checkATSScore(resumeText: string, jobDescription: string) {
    const prompt = `You are an ATS scanner. Analyze this resume against the job description. Resume: ${resumeText}. Job: ${jobDescription}. Respond ONLY with valid JSON: { "score": number 0-100, "matchedKeywords": string[], "missingKeywords": string[], "suggestions": string[] with 5 tips, "sectionScores": { "experience": number, "skills": number, "education": number, "format": number } }. No markdown, no explanation, no backticks.`;
    return callGemini(prompt);
  },

  async suggestSkills(role: string, currentSkills: string[]) {
    const prompt = `You are a technical recruiter. Suggest the 10 most in-demand skills for ${role} NOT in this list: ${currentSkills.join(", ")}. Respond ONLY with valid JSON: { "suggestions": [{ "category": string, "skills": string[] }] }. Categories: Languages, Frameworks, Tools, Cloud, Soft Skills. No markdown, no explanation, no backticks.`;
    return callGemini(prompt);
  },
};
