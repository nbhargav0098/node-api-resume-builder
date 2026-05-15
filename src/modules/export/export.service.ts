import cloudinary from "../../config/cloudinary";
import { ApiError } from "../../utils/ApiError";
import Resume from "../resume/resume.model";

// ─── HTML Builders ────────────────────────────────────────────────────────────

const GOOGLE_FONTS = `<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Merriweather:wght@400;700&family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">`;

const PAGE_STYLE = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  @page { size: A4; margin: 0; }
  html, body { width: 794px; height: 1123px; overflow: hidden; }
`;

function section(title: string, content: string): string {
  return content
    ? `<div class="section"><h2 class="section-title">${title}</h2>${content}</div>`
    : "";
}

function buildModernHTML(data: Record<string, unknown>): string {
  const p = (data.personalInfo as Record<string, string>) || {};
  const exp = (data.experience as Record<string, string>[]) || [];
  const edu = (data.education as Record<string, string>[]) || [];
  const skills = (data.skills as string[]) || [];
  const projects = (data.projects as Record<string, string>[]) || [];
  const certs = (data.certifications as Record<string, string>[]) || [];
  const summary = (data.summary as string) || "";

  const expHTML = exp
    .map(
      (e) => `
    <div class="entry">
      <div class="entry-header"><span class="entry-title">${e.title || ""}</span><span class="entry-date">${e.startDate || ""} – ${e.endDate || "Present"}</span></div>
      <div class="entry-sub">${e.company || ""}${e.location ? `, ${e.location}` : ""}</div>
      <p class="entry-desc">${e.description || ""}</p>
    </div>`
    )
    .join("");

  const eduHTML = edu
    .map(
      (e) => `
    <div class="entry">
      <div class="entry-header"><span class="entry-title">${e.degree || ""}</span><span class="entry-date">${e.startDate || ""} – ${e.endDate || ""}</span></div>
      <div class="entry-sub">${e.institution || ""}</div>
    </div>`
    )
    .join("");

  const skillsHTML = skills.map((s) => `<span class="skill-chip">${s}</span>`).join("");

  const projectHTML = projects
    .map(
      (p) => `
    <div class="entry">
      <div class="entry-header"><span class="entry-title">${p.name || ""}</span>${p.url ? `<a class="entry-link" href="${p.url}">${p.url}</a>` : ""}</div>
      <p class="entry-desc">${p.description || ""}</p>
    </div>`
    )
    .join("");

  const certHTML = certs.map((c) => `<div class="cert">${c.name || ""} — ${c.issuer || ""} ${c.year ? `(${c.year})` : ""}</div>`).join("");

  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8">${GOOGLE_FONTS}<style>
${PAGE_STYLE}
body { font-family: 'Inter', sans-serif; color: #1a1a2e; background: white; display: flex; flex-direction: column; }
.header { background: #16213e; color: white; padding: 36px 48px; }
.name { font-size: 32px; font-weight: 700; letter-spacing: -0.5px; }
.tagline { font-size: 14px; color: #a8b2d8; margin-top: 4px; }
.contact { display: flex; gap: 20px; margin-top: 12px; font-size: 12px; color: #a8b2d8; }
.body { display: flex; flex: 1; }
.sidebar { width: 220px; background: #0f3460; color: white; padding: 28px 24px; flex-shrink: 0; }
.main { flex: 1; padding: 28px 36px; }
.section { margin-bottom: 20px; }
.section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #e94560; border-bottom: 2px solid #e94560; padding-bottom: 4px; margin-bottom: 12px; }
.sidebar .section-title { color: #a8b2d8; border-color: #a8b2d8; }
.entry { margin-bottom: 12px; }
.entry-header { display: flex; justify-content: space-between; align-items: baseline; }
.entry-title { font-size: 13px; font-weight: 600; }
.entry-date { font-size: 11px; color: #888; }
.entry-sub { font-size: 12px; color: #555; margin: 2px 0; }
.entry-desc { font-size: 12px; color: #444; line-height: 1.5; margin-top: 4px; }
.entry-link { font-size: 11px; color: #e94560; text-decoration: none; }
.skill-chip { display: inline-block; background: #1a3a5c; color: #a8d8ea; font-size: 11px; padding: 3px 10px; border-radius: 12px; margin: 3px 3px 3px 0; }
.summary { font-size: 12px; line-height: 1.6; color: #333; }
.cert { font-size: 12px; margin-bottom: 6px; color: #ccc; }
</style></head><body>
<div class="header">
  <div class="name">${p.fullName || "Your Name"}</div>
  <div class="tagline">${p.title || ""}</div>
  <div class="contact">
    ${p.email ? `<span>${p.email}</span>` : ""}
    ${p.phone ? `<span>${p.phone}</span>` : ""}
    ${p.location ? `<span>${p.location}</span>` : ""}
    ${p.linkedin ? `<span>${p.linkedin}</span>` : ""}
    ${p.github ? `<span>${p.github}</span>` : ""}
  </div>
</div>
<div class="body">
  <div class="sidebar">
    ${section("Skills", `<div>${skillsHTML}</div>`)}
    ${section("Certifications", certHTML)}
  </div>
  <div class="main">
    ${summary ? section("Summary", `<p class="summary">${summary}</p>`) : ""}
    ${section("Experience", expHTML)}
    ${section("Education", eduHTML)}
    ${section("Projects", projectHTML)}
  </div>
</div>
</body></html>`;
}

function buildClassicHTML(data: Record<string, unknown>): string {
  const p = (data.personalInfo as Record<string, string>) || {};
  const exp = (data.experience as Record<string, string>[]) || [];
  const edu = (data.education as Record<string, string>[]) || [];
  const skills = (data.skills as string[]) || [];
  const projects = (data.projects as Record<string, string>[]) || [];
  const certs = (data.certifications as Record<string, string>[]) || [];
  const summary = (data.summary as string) || "";

  const expHTML = exp
    .map(
      (e) => `
    <div class="entry">
      <div class="entry-header"><span class="entry-title">${e.title || ""}, ${e.company || ""}</span><span class="entry-date">${e.startDate || ""} – ${e.endDate || "Present"}</span></div>
      <p class="entry-desc">${e.description || ""}</p>
    </div>`
    )
    .join("");

  const eduHTML = edu
    .map(
      (e) => `
    <div class="entry">
      <div class="entry-header"><span class="entry-title">${e.degree || ""}, ${e.institution || ""}</span><span class="entry-date">${e.endDate || ""}</span></div>
    </div>`
    )
    .join("");

  const projectHTML = projects
    .map(
      (p) => `
    <div class="entry">
      <div class="entry-header"><span class="entry-title">${p.name || ""}</span></div>
      <p class="entry-desc">${p.description || ""}</p>
    </div>`
    )
    .join("");

  const certHTML = certs.map((c) => `<div class="entry"><span class="entry-title">${c.name || ""}</span> — ${c.issuer || ""}</div>`).join("");

  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8">${GOOGLE_FONTS}<style>
${PAGE_STYLE}
body { font-family: 'Merriweather', serif; color: #2c2c2c; background: white; padding: 60px 72px; }
.name { font-size: 28px; font-weight: 700; text-align: center; letter-spacing: 2px; text-transform: uppercase; }
.tagline { text-align: center; font-size: 13px; color: #666; margin-top: 4px; font-family: 'Inter', sans-serif; }
.contact { display: flex; justify-content: center; gap: 16px; margin-top: 8px; font-size: 11px; color: #555; font-family: 'Inter', sans-serif; }
.divider { border: none; border-top: 2px solid #2c2c2c; margin: 16px 0; }
.thin-divider { border: none; border-top: 1px solid #ccc; margin: 12px 0; }
.section { margin-bottom: 18px; }
.section-title { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px; }
.entry { margin-bottom: 10px; }
.entry-header { display: flex; justify-content: space-between; }
.entry-title { font-size: 13px; font-weight: 700; font-family: 'Inter', sans-serif; }
.entry-date { font-size: 11px; color: #666; font-family: 'Inter', sans-serif; }
.entry-desc { font-size: 12px; line-height: 1.6; color: #444; margin-top: 4px; font-family: 'Inter', sans-serif; }
.skills-list { font-size: 12px; font-family: 'Inter', sans-serif; color: #333; line-height: 1.8; }
.summary { font-size: 12px; line-height: 1.7; color: #444; font-family: 'Inter', sans-serif; }
</style></head><body>
<div class="name">${p.fullName || "Your Name"}</div>
<div class="tagline">${p.title || ""}</div>
<div class="contact">
  ${p.email ? `<span>${p.email}</span>` : ""}
  ${p.phone ? `<span>${p.phone}</span>` : ""}
  ${p.location ? `<span>${p.location}</span>` : ""}
  ${p.linkedin ? `<span>${p.linkedin}</span>` : ""}
</div>
<hr class="divider"/>
${summary ? `<div class="section"><div class="section-title">Professional Summary</div><p class="summary">${summary}</p></div><hr class="thin-divider"/>` : ""}
${exp.length ? `<div class="section"><div class="section-title">Experience</div>${expHTML}</div><hr class="thin-divider"/>` : ""}
${edu.length ? `<div class="section"><div class="section-title">Education</div>${eduHTML}</div><hr class="thin-divider"/>` : ""}
${skills.length ? `<div class="section"><div class="section-title">Skills</div><div class="skills-list">${skills.join(" · ")}</div></div><hr class="thin-divider"/>` : ""}
${projects.length ? `<div class="section"><div class="section-title">Projects</div>${projectHTML}</div><hr class="thin-divider"/>` : ""}
${certs.length ? `<div class="section"><div class="section-title">Certifications</div>${certHTML}</div>` : ""}
</body></html>`;
}

function buildMinimalHTML(data: Record<string, unknown>): string {
  const p = (data.personalInfo as Record<string, string>) || {};
  const exp = (data.experience as Record<string, string>[]) || [];
  const edu = (data.education as Record<string, string>[]) || [];
  const skills = (data.skills as string[]) || [];
  const projects = (data.projects as Record<string, string>[]) || [];
  const certs = (data.certifications as Record<string, string>[]) || [];
  const summary = (data.summary as string) || "";

  const expHTML = exp
    .map(
      (e) => `
    <div class="entry">
      <div class="entry-header"><span class="entry-title">${e.title || ""}</span><span class="entry-date">${e.startDate || ""} – ${e.endDate || "Present"}</span></div>
      <div class="entry-sub">${e.company || ""}${e.location ? ` · ${e.location}` : ""}</div>
      <p class="entry-desc">${e.description || ""}</p>
    </div>`
    )
    .join("");

  const eduHTML = edu
    .map(
      (e) => `
    <div class="entry">
      <div class="entry-header"><span class="entry-title">${e.degree || ""}</span><span class="entry-date">${e.endDate || ""}</span></div>
      <div class="entry-sub">${e.institution || ""}</div>
    </div>`
    )
    .join("");

  const projectHTML = projects
    .map(
      (p) => `
    <div class="entry">
      <div class="entry-header"><span class="entry-title">${p.name || ""}</span>${p.url ? `<a class="entry-link" href="${p.url}">${p.url}</a>` : ""}</div>
      <p class="entry-desc">${p.description || ""}</p>
    </div>`
    )
    .join("");

  const certHTML = certs.map((c) => `<div class="entry-sub" style="margin-bottom:4px">${c.name || ""} — ${c.issuer || ""}</div>`).join("");

  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8">${GOOGLE_FONTS}<style>
${PAGE_STYLE}
body { font-family: 'Roboto', sans-serif; color: #222; background: white; padding: 48px 56px; }
.name { font-size: 30px; font-weight: 700; color: #111; }
.title-line { font-size: 14px; color: #555; margin-top: 2px; }
.contact { display: flex; gap: 16px; margin-top: 8px; font-size: 11px; color: #666; flex-wrap: wrap; }
.contact a { color: #4a90d9; text-decoration: none; }
.divider { border: none; border-top: 1px solid #e0e0e0; margin: 14px 0; }
.section { margin-bottom: 16px; }
.section-title { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #4a90d9; margin-bottom: 8px; }
.entry { margin-bottom: 10px; }
.entry-header { display: flex; justify-content: space-between; align-items: baseline; }
.entry-title { font-size: 13px; font-weight: 500; color: #111; }
.entry-date { font-size: 11px; color: #888; }
.entry-sub { font-size: 12px; color: #666; margin: 2px 0; }
.entry-desc { font-size: 12px; line-height: 1.6; color: #444; margin-top: 3px; }
.entry-link { font-size: 11px; color: #4a90d9; text-decoration: none; }
.skills { display: flex; flex-wrap: wrap; gap: 6px; }
.skill { font-size: 11px; padding: 3px 10px; border: 1px solid #ddd; border-radius: 4px; color: #333; }
.summary { font-size: 12px; line-height: 1.7; color: #444; }
</style></head><body>
<div class="name">${p.fullName || "Your Name"}</div>
<div class="title-line">${p.title || ""}</div>
<div class="contact">
  ${p.email ? `<span>${p.email}</span>` : ""}
  ${p.phone ? `<span>${p.phone}</span>` : ""}
  ${p.location ? `<span>${p.location}</span>` : ""}
  ${p.linkedin ? `<a href="${p.linkedin}">${p.linkedin}</a>` : ""}
  ${p.github ? `<a href="${p.github}">${p.github}</a>` : ""}
</div>
<hr class="divider"/>
${summary ? `<div class="section"><div class="section-title">Summary</div><p class="summary">${summary}</p></div><hr class="divider"/>` : ""}
${exp.length ? `<div class="section"><div class="section-title">Experience</div>${expHTML}</div><hr class="divider"/>` : ""}
${edu.length ? `<div class="section"><div class="section-title">Education</div>${eduHTML}</div><hr class="divider"/>` : ""}
${skills.length ? `<div class="section"><div class="section-title">Skills</div><div class="skills">${skills.map((s) => `<span class="skill">${s}</span>`).join("")}</div></div><hr class="divider"/>` : ""}
${projects.length ? `<div class="section"><div class="section-title">Projects</div>${projectHTML}</div><hr class="divider"/>` : ""}
${certs.length ? `<div class="section"><div class="section-title">Certifications</div>${certHTML}</div>` : ""}
</body></html>`;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const exportService = {
  async generatePDF(resumeId: string, userId: string) {
    const resume = await Resume.findById(resumeId);
    if (!resume) throw new ApiError(404, "Resume not found");
    if (resume.userId.toString() !== userId) throw new ApiError(403, "Unauthorized");

    const data = resume.data as unknown as Record<string, unknown>;

    let html: string;
    if (resume.templateId === "modern") html = buildModernHTML(data);
    else if (resume.templateId === "classic") html = buildClassicHTML(data);
    else html = buildMinimalHTML(data);

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const chromium = require("@sparticuz/chromium");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const puppeteer = require("puppeteer-core");

    const browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    let pdfBuffer: Buffer;
    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: "networkidle0" });
      pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: { top: 0, right: 0, bottom: 0, left: 0 },
      });
    } finally {
      await browser.close();
    }

    const filename = `${resume.title}.pdf`;

    const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { resource_type: "raw", folder: "resume-builder/pdfs", public_id: filename },
        (err, result) => {
          if (err || !result) return reject(err ?? new Error("Cloudinary upload failed"));
          resolve(result as { secure_url: string });
        }
      );
      stream.end(pdfBuffer);
    });

    return { downloadUrl: uploadResult.secure_url, filename };
  },
};
