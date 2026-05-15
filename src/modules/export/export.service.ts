import cloudinary from "../../config/cloudinary";
import { ApiError } from "../../utils/ApiError";
import Resume from "../resume/resume.model";

// ─── Types (mirrors frontend types/index.ts) ──────────────────────────────────

interface PersonalInfo {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
}

interface Experience {
  company?: string;
  role?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  bullets?: string[];
}

interface Education {
  institution?: string;
  degree?: string;
  gpa?: string;
  startDate?: string;
  endDate?: string;
}

interface SkillGroup {
  category?: string;
  items?: string[];
}

interface Project {
  name?: string;
  techStack?: string[];
  link?: string;
  liveLink?: string;
  bullets?: string[];
}

interface Certification {
  name?: string;
  issuer?: string;
  date?: string;
  link?: string;
}

interface ResumeData {
  personalInfo?: PersonalInfo;
  summary?: string;
  experience?: Experience[];
  education?: Education[];
  skills?: SkillGroup[];
  projects?: Project[];
  certifications?: Certification[];
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const PAGE_STYLE = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  @page { size: A4; margin: 0; }
  html, body { width: 794px; min-height: 1123px; overflow: hidden; }
`;

// ─── HTML Builders ────────────────────────────────────────────────────────────

function bulletsHTML(bullets: string[] = []): string {
  const items = bullets.filter(Boolean);
  if (!items.length) return "";
  return `<ul style="margin:5px 0 0 0;padding-left:16px">${items.map((b) => `<li style="font-size:11px;line-height:1.55;margin-bottom:2px;color:#444">${b}</li>`).join("")}</ul>`;
}

function buildModernHTML(d: ResumeData): string {
  const p = d.personalInfo || {};
  const exp = d.experience || [];
  const edu = d.education || [];
  const skills = d.skills || [];
  const projects = d.projects || [];
  const certs = d.certifications || [];
  const summary = d.summary || "";

  const contact = [p.email, p.phone, p.location, p.linkedin, p.github, p.portfolio]
    .filter(Boolean)
    .map((v) => `<div style="font-size:9px;color:#a0a0c0;margin-bottom:4px;word-break:break-all">${v}</div>`)
    .join("");

  const expHTML = exp
    .map(
      (e) => `
    <div style="margin-bottom:14px;padding-left:10px;border-left:2px solid #6c63ff">
      <div style="display:flex;justify-content:space-between;align-items:baseline">
        <div>
          <div style="font-size:12px;font-weight:700;color:#1a1a2e">${e.role || ""}</div>
          <div style="font-size:10px;font-weight:600;color:#6c63ff">${e.company || ""}</div>
        </div>
        <div style="text-align:right;font-size:9px;color:#888">
          <div>${e.startDate || ""}${e.current ? " – Present" : e.endDate ? ` – ${e.endDate}` : ""}</div>
          ${e.location ? `<div style="color:#aaa">${e.location}</div>` : ""}
        </div>
      </div>
      ${bulletsHTML(e.bullets)}
    </div>`
    )
    .join("");

  const eduHTML = edu
    .map(
      (e) => `
    <div style="margin-bottom:10px;display:flex;justify-content:space-between">
      <div>
        <div style="font-size:11px;font-weight:700;color:#1a1a2e">${e.degree || ""}</div>
        <div style="font-size:10px;color:#6c63ff">${e.institution || ""}</div>
        ${e.gpa ? `<div style="font-size:9px;color:#888">GPA ${e.gpa}</div>` : ""}
      </div>
      <div style="font-size:9px;color:#888">${e.startDate || ""}${e.endDate ? ` – ${e.endDate}` : ""}</div>
    </div>`
    )
    .join("");

  const skillsHTML = skills
    .map(
      (g) => `
    <div style="margin-bottom:8px">
      ${g.category ? `<div style="font-size:9px;font-weight:700;color:#6c63ff;margin-bottom:3px">${g.category}</div>` : ""}
      <div style="display:flex;flex-wrap:wrap;gap:3px">
        ${(g.items || []).map((s) => `<span style="font-size:8px;background:rgba(108,99,255,0.2);color:#e0e0f0;padding:2px 6px;border-radius:3px">${s}</span>`).join("")}
      </div>
    </div>`
    )
    .join("");

  const projHTML = projects
    .map(
      (pr) => `
    <div style="margin-bottom:12px">
      <div style="font-size:11px;font-weight:700;color:#1a1a2e">${pr.name || ""}</div>
      ${(pr.techStack || []).length ? `<div style="display:flex;flex-wrap:wrap;gap:3px;margin:3px 0">${(pr.techStack || []).map((t) => `<span style="font-size:8px;background:#f0efff;color:#6c63ff;padding:1px 5px;border-radius:3px">${t}</span>`).join("")}</div>` : ""}
      ${bulletsHTML(pr.bullets)}
    </div>`
    )
    .join("");

  const certHTML = certs
    .map(
      (c) => `
    <div style="margin-bottom:7px">
      <div style="font-size:9px;font-weight:600;color:#fff">${c.name || ""}</div>
      <div style="font-size:8px;color:#a0a0c0">${c.issuer || ""}${c.date ? ` · ${c.date}` : ""}</div>
    </div>`
    )
    .join("");

  function sideSection(title: string, body: string) {
    if (!body.trim()) return "";
    return `
      <div style="margin-bottom:22px">
        <div style="font-size:9px;font-weight:700;letter-spacing:1.5px;color:#6c63ff;text-transform:uppercase;border-bottom:1px solid #6c63ff;padding-bottom:3px;margin-bottom:8px">${title}</div>
        ${body}
      </div>`;
  }

  function mainSection(title: string, body: string) {
    if (!body.trim()) return "";
    return `
      <div style="margin-bottom:20px">
        <div style="font-size:10px;font-weight:700;letter-spacing:1.5px;color:#6c63ff;text-transform:uppercase;border-bottom:2px solid #6c63ff;padding-bottom:3px;margin-bottom:10px">${title}</div>
        ${body}
      </div>`;
  }

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>${PAGE_STYLE}
body { font-family: Arial, sans-serif; display: flex; width: 794px; min-height: 1123px; }
</style></head><body>
<div style="width:30%;background:#1a1a2e;color:#e0e0f0;padding:36px 18px;box-sizing:border-box;flex-shrink:0">
  <div style="margin-bottom:28px">
    <h1 style="font-size:20px;font-weight:700;color:#fff;line-height:1.2">${p.name || "Your Name"}</h1>
    <div style="width:36px;height:3px;background:#6c63ff;margin-top:6px"></div>
  </div>
  ${sideSection("Contact", contact)}
  ${sideSection("Skills", skillsHTML)}
  ${sideSection("Certifications", certHTML)}
</div>
<div style="flex:1;padding:36px 28px;background:#fff;box-sizing:border-box">
  ${summary ? mainSection("Professional Summary", `<p style="font-size:10px;color:#444;line-height:1.65">${summary}</p>`) : ""}
  ${mainSection("Experience", expHTML)}
  ${mainSection("Education", eduHTML)}
  ${mainSection("Projects", projHTML)}
</div>
</body></html>`;
}

function buildClassicHTML(d: ResumeData): string {
  const p = d.personalInfo || {};
  const exp = d.experience || [];
  const edu = d.education || [];
  const skills = d.skills || [];
  const projects = d.projects || [];
  const certs = d.certifications || [];
  const summary = d.summary || "";

  const contactLine = [p.email, p.phone, p.location, p.linkedin, p.github]
    .filter(Boolean)
    .join(" · ");

  function sec(title: string, body: string) {
    if (!body.trim()) return "";
    return `<div style="margin-bottom:16px"><div style="font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#111;border-bottom:1.5px solid #111;padding-bottom:3px;margin-bottom:8px">${title}</div>${body}</div>`;
  }

  const expHTML = exp.map((e) => `
    <div style="margin-bottom:12px">
      <div style="display:flex;justify-content:space-between;align-items:baseline">
        <div>
          <span style="font-size:12px;font-weight:700;color:#111">${e.role || ""}</span>
          ${e.company ? `<span style="font-size:11px;color:#444">, ${e.company}</span>` : ""}
          ${e.location ? `<span style="font-size:10px;color:#777"> — ${e.location}</span>` : ""}
        </div>
        <span style="font-size:10px;color:#666;white-space:nowrap">${e.startDate || ""}${e.current ? "–Present" : e.endDate ? `–${e.endDate}` : ""}</span>
      </div>
      ${bulletsHTML(e.bullets)}
    </div>`).join("");

  const eduHTML = edu.map((e) => `
    <div style="display:flex;justify-content:space-between;margin-bottom:8px">
      <div>
        <span style="font-size:12px;font-weight:700">${e.degree || ""}</span>
        ${e.institution ? `<span style="font-size:11px;color:#555">, ${e.institution}</span>` : ""}
        ${e.gpa ? `<span style="font-size:10px;color:#777"> · GPA ${e.gpa}</span>` : ""}
      </div>
      <span style="font-size:10px;color:#666">${e.startDate || ""}${e.endDate ? `–${e.endDate}` : ""}</span>
    </div>`).join("");

  const skillsHTML = skills.map((g) =>
    `<div style="margin-bottom:5px;display:flex;gap:8px">
      ${g.category ? `<span style="font-size:10px;font-weight:700;min-width:70px">${g.category}:</span>` : ""}
      <span style="font-size:10px;color:#444">${(g.items || []).join(", ")}</span>
    </div>`
  ).join("");

  const projHTML = projects.map((pr) => `
    <div style="margin-bottom:10px">
      <div style="font-size:12px;font-weight:700">${pr.name || ""}${(pr.techStack || []).length ? ` <span style="font-size:9px;font-weight:400;color:#666;font-style:italic">(${(pr.techStack || []).join(", ")})</span>` : ""}</div>
      ${bulletsHTML(pr.bullets)}
    </div>`).join("");

  const certHTML = certs.map((c) =>
    `<div style="margin-bottom:5px;display:flex;justify-content:space-between">
      <span style="font-size:10px"><strong>${c.name || ""}</strong>${c.issuer ? ` · ${c.issuer}` : ""}</span>
      ${c.date ? `<span style="font-size:9px;color:#666">${c.date}</span>` : ""}
    </div>`
  ).join("");

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>${PAGE_STYLE}
body { font-family: Georgia, serif; color: #222; background: white; padding: 52px 60px; box-sizing: border-box; }
</style></head><body>
<div style="text-align:center;margin-bottom:20px;border-bottom:1px solid #ccc;padding-bottom:14px">
  <h1 style="font-size:26px;font-weight:700;letter-spacing:1px;color:#111">${p.name || "Your Name"}</h1>
  ${contactLine ? `<div style="font-size:9.5px;color:#555;margin-top:8px;letter-spacing:0.3px">${contactLine}</div>` : ""}
</div>
${summary ? sec("Summary", `<p style="font-size:10.5px;line-height:1.7;color:#333">${summary}</p>`) : ""}
${sec("Experience", expHTML)}
${sec("Education", eduHTML)}
${sec("Skills", skillsHTML)}
${sec("Projects", projHTML)}
${sec("Certifications", certHTML)}
</body></html>`;
}

function buildMinimalHTML(d: ResumeData): string {
  const p = d.personalInfo || {};
  const exp = d.experience || [];
  const edu = d.education || [];
  const skills = d.skills || [];
  const projects = d.projects || [];
  const certs = d.certifications || [];
  const summary = d.summary || "";

  function leftSec(title: string, body: string) {
    if (!body.trim()) return "";
    return `<div style="margin-bottom:18px"><div style="font-size:9px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#333;border-bottom:1px solid #ddd;padding-bottom:2px;margin-bottom:7px">${title}</div>${body}</div>`;
  }

  function rightSec(title: string, body: string) {
    if (!body.trim()) return "";
    return `<div style="margin-bottom:18px"><div style="font-size:9px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#333;border-bottom:1px solid #ddd;padding-bottom:2px;margin-bottom:7px">${title}</div>${body}</div>`;
  }

  const contactHTML = [p.email, p.phone, p.location, p.linkedin, p.github, p.portfolio]
    .filter(Boolean)
    .map((v) => `<div style="font-size:9px;color:#555;margin-bottom:3px;word-break:break-all">${v}</div>`)
    .join("");

  const skillsHTML = skills.map((g) => `
    <div style="margin-bottom:7px">
      ${g.category ? `<div style="font-size:9px;font-weight:600;color:#333;margin-bottom:2px">${g.category}</div>` : ""}
      <div style="font-size:8.5px;color:#555;line-height:1.5">${(g.items || []).join(", ")}</div>
    </div>`).join("");

  const eduHTML = edu.map((e) => `
    <div style="margin-bottom:9px">
      <div style="font-size:10px;font-weight:600;color:#111">${e.degree || ""}</div>
      <div style="font-size:9px;color:#555">${e.institution || ""}</div>
      <div style="font-size:8.5px;color:#888">${e.startDate || ""}${e.endDate ? `–${e.endDate}` : ""}${e.gpa ? ` · GPA ${e.gpa}` : ""}</div>
    </div>`).join("");

  const certHTML = certs.map((c) => `
    <div style="margin-bottom:7px">
      <div style="font-size:9px;font-weight:600">${c.name || ""}</div>
      <div style="font-size:8.5px;color:#666">${c.issuer || ""}${c.date ? ` · ${c.date}` : ""}</div>
    </div>`).join("");

  const expHTML = exp.map((e) => `
    <div style="margin-bottom:13px">
      <div style="display:flex;justify-content:space-between;align-items:baseline">
        <div>
          <span style="font-size:11px;font-weight:600;color:#111">${e.role || ""}</span>
          ${e.company ? `<span style="font-size:10px;color:#555"> · ${e.company}</span>` : ""}
        </div>
        <span style="font-size:8.5px;color:#888;white-space:nowrap">${e.startDate || ""}${e.current ? "–Present" : e.endDate ? `–${e.endDate}` : ""}</span>
      </div>
      ${e.location ? `<div style="font-size:8.5px;color:#999;margin-bottom:3px">${e.location}</div>` : ""}
      ${bulletsHTML(e.bullets)}
    </div>`).join("");

  const projHTML = projects.map((pr) => `
    <div style="margin-bottom:11px">
      <div style="display:flex;justify-content:space-between;align-items:baseline">
        <span style="font-size:11px;font-weight:600;color:#111">${pr.name || ""}</span>
        ${pr.link ? `<span style="font-size:8px;color:#888">${pr.link}</span>` : ""}
      </div>
      ${(pr.techStack || []).length ? `<div style="font-size:8.5px;color:#666;margin-bottom:2px">${(pr.techStack || []).join(" · ")}</div>` : ""}
      ${bulletsHTML(pr.bullets)}
    </div>`).join("");

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>${PAGE_STYLE}
body { font-family: Arial, sans-serif; color: #222; background: white; padding: 40px 44px; box-sizing: border-box; }
</style></head><body>
<div style="margin-bottom:20px">
  <h1 style="font-size:22px;font-weight:700;color:#111;letter-spacing:-0.3px">${p.name || "Your Name"}</h1>
  <div style="height:2px;width:44px;background:#333;margin:5px 0 10px 0"></div>
</div>
<div style="display:flex;gap:28px">
  <div style="width:35%;flex-shrink:0">
    ${leftSec("Contact", contactHTML)}
    ${leftSec("Skills", skillsHTML)}
    ${leftSec("Education", eduHTML)}
    ${leftSec("Certifications", certHTML)}
  </div>
  <div style="flex:1">
    ${summary ? rightSec("Summary", `<p style="font-size:10px;line-height:1.65;color:#444">${summary}</p>`) : ""}
    ${rightSec("Experience", expHTML)}
    ${rightSec("Projects", projHTML)}
  </div>
</div>
</body></html>`;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const exportService = {
  async generatePDF(resumeId: string, userId: string) {
    const resume = await Resume.findById(resumeId);
    if (!resume) throw new ApiError(404, "Resume not found");
    if (resume.userId.toString() !== userId) throw new ApiError(403, "Unauthorized");

    const data = resume.data as unknown as ResumeData;

    let html: string;
    if (resume.templateId === "modern") html = buildModernHTML(data);
    else if (resume.templateId === "classic") html = buildClassicHTML(data);
    else html = buildMinimalHTML(data);

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const puppeteer = require("puppeteer-core");

    let executablePath: string;
    let launchArgs: string[];

    if (process.env.NODE_ENV === "production") {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const chromium = require("@sparticuz/chromium");
      executablePath = await chromium.executablePath();
      launchArgs = chromium.args;
    } else {
      executablePath =
        process.env.CHROME_PATH ||
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
      launchArgs = ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"];
    }

    const browser = await puppeteer.launch({
      args: launchArgs,
      executablePath,
      headless: true,
    });

    let pdfBuffer: Buffer;
    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: "load" });
      // puppeteer-core v21+ returns Uint8Array — must convert to Buffer for Cloudinary stream
      const raw = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: { top: 0, right: 0, bottom: 0, left: 0 },
      });
      pdfBuffer = Buffer.from(raw);
    } finally {
      await browser.close();
    }

    const safeTitle = resume.title.replace(/[^a-zA-Z0-9-_]/g, "_");
    const filename = `${safeTitle}-${Date.now()}`;

    const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: "raw",
          folder: "resume-builder/pdfs",
          public_id: filename,
          format: "pdf",
        },
        (err, result) => {
          if (err || !result) return reject(err ?? new Error("Cloudinary upload failed"));
          resolve(result as { secure_url: string });
        }
      );
      stream.end(pdfBuffer);
    });

    return { downloadUrl: uploadResult.secure_url, filename: `${filename}.pdf` };
  },
};
