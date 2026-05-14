# Resume Builder — Claude Code Workflow
## Two Repo Setup: Frontend + Backend

---

## One Time Setup

### Step 1 — Install Claude Code
```bash
# Mac / Linux
curl -fsSL https://claude.ai/install.sh | bash

# Mac via Homebrew
brew install --cask claude-code
```
You need Claude Pro ($20/month) or higher. If you already pay for Claude.ai, you already have access.

---

### Step 2 — Create Two Repos

```bash
# Backend repo
mkdir resume-builder-backend
cd resume-builder-backend
git init
echo "node_modules/\ndist/\n.env\n*.log" > .gitignore

# Copy the backend CLAUDE.md here
# (drag the backend CLAUDE.md file into this folder)

cd ..

# Frontend repo
mkdir resume-builder-frontend
cd resume-builder-frontend
git init
echo "node_modules/\n.next/\n.env.local\n*.log" > .gitignore

# Copy the frontend CLAUDE.md here
# (drag the frontend CLAUDE.md file into this folder)
```

---

### Step 3 — Create GitHub Repos (two separate repos)
```
GitHub → New Repository → resume-builder-backend  (private or public)
GitHub → New Repository → resume-builder-frontend  (private or public)
```

```bash
# Link backend repo
cd resume-builder-backend
git remote add origin https://github.com/yourusername/resume-builder-backend.git

# Link frontend repo
cd resume-builder-frontend
git remote add origin https://github.com/yourusername/resume-builder-frontend.git
```

---

### Step 4 — Open Two Terminal Windows
```bash
# Terminal 1 — always for backend
cd resume-builder-backend
claude

# Terminal 2 — always for frontend
cd resume-builder-frontend
claude
```

Keep both open side by side throughout the project.

---

## Build Order (important — always build backend first)

```
Phase 1  → Backend Setup
Phase 2  → Backend Auth APIs
Phase 3  → Backend Resume APIs
Phase 4  → Backend AI Module
Phase 5  → Backend PDF Export
Phase 6  → Frontend Setup
Phase 7  → Frontend Auth Pages
Phase 8  → Frontend Dashboard + Editor
Phase 9  → Frontend Templates + PDF Download
Phase 10 → Frontend AI Panel
Phase 11 → Frontend Polish + Advanced Features
Phase 12 → Deploy Both
```

Why backend first? Because the frontend needs real APIs to connect to. Build and test each backend phase before building its frontend counterpart.

---

## Daily Habit (start every session with this)

```bash
# In whichever repo you are working in today
git checkout -b feature/what-you-are-building
claude

# First message to Claude Code every single session:
"Read the CLAUDE.md file. Today I want to build [describe the feature].
Before writing any code, tell me your plan."
```

Always press **Shift+Tab** to enter Plan Mode before Claude makes any changes. Review the plan first, then approve it.

---
---

# BACKEND PHASES

---

## PHASE 1 — Backend Project Setup

Open Claude Code in `resume-builder-backend` folder and paste this:

```
Read the CLAUDE.md file carefully.

Set up the complete Node.js + Express + TypeScript backend project from scratch.

Install these dependencies:
express, mongoose, jsonwebtoken, bcryptjs, zod, cors, morgan, helmet, dotenv,
express-rate-limit, @google/generative-ai, cloudinary, multer, nanoid,
puppeteer-core, @sparticuz/chromium, winston

Install these devDependencies:
typescript, ts-node, nodemon, @types/node, @types/express, @types/bcryptjs,
@types/jsonwebtoken, @types/cors, @types/morgan, eslint

Create these config files:
1. package.json with scripts: dev (nodemon), build (tsc), start (node dist/server.js), lint
2. tsconfig.json with strict: true, outDir: dist, rootDir: src
3. nodemon.json watching src folder
4. .env.example with all variables from CLAUDE.md
5. .gitignore (node_modules, dist, .env)

Create all folders from CLAUDE.md folder structure with empty placeholder files.

Create these utility files with full working code:
- src/utils/ApiResponse.ts — class with statusCode, success, message, data
- src/utils/ApiError.ts — class extending Error with statusCode
- src/utils/asyncHandler.ts — wraps async functions and catches errors

Create src/config/db.ts:
- Connect to MongoDB using MONGODB_URI from env
- Log "MongoDB connected" on success
- Log error and exit process on failure

Create src/app.ts:
- Initialize Express
- Add helmet, cors (CLIENT_URL from env, credentials: true), morgan, express.json()
- Add GET /api/v1/health returning { status: "ok", timestamp: new Date() }
- Export app

Create src/server.ts:
- Import app and connectDB
- Call connectDB then start server on PORT from env

Run npm run dev and confirm server starts on port 5000. Show me the terminal output.
```

**After Claude finishes:**
```bash
git add .
git commit -m "feat: phase 1 backend project setup"
git push origin main
```

---

## PHASE 2 — Backend Auth Module

Open Claude Code in `resume-builder-backend` and paste this:

```
Read the CLAUDE.md file.

Build the complete authentication module following the module pattern in CLAUDE.md exactly.
Controllers only call services. Services contain all business logic. Use asyncHandler on every controller method.

src/modules/auth/auth.model.ts — Mongoose User model:
Fields: name (String required), email (String required unique lowercase),
password (String required minlength 6), avatar (String default ""),
provider (String enum: email|google, default: email),
refreshToken (String default ""), timestamps: true

src/modules/auth/auth.schema.ts — Zod schemas:
- registerSchema: name (min 2 chars), email (valid email), password (min 6 chars)
- loginSchema: email, password

src/modules/auth/auth.service.ts:
- register(name, email, password):
  check if email exists → throw ApiError(409, "Email already in use")
  hash password (bcrypt, saltRounds 10)
  create user
  generate accessToken (JWT_SECRET, 15m) and refreshToken (JWT_REFRESH_SECRET, 7d)
  hash refreshToken and save to user document
  return { user without password, accessToken, refreshToken }

- login(email, password):
  find user by email → throw ApiError(401, "Invalid credentials") if not found
  compare password → throw ApiError(401, "Invalid credentials") if wrong
  generate both tokens, hash and save refreshToken
  return { user without password, accessToken, refreshToken }

- logout(userId):
  set user refreshToken to "" in DB

- refreshAccessToken(incomingToken):
  verify with JWT_REFRESH_SECRET → throw ApiError(401) if invalid
  find user by decoded._id
  compare incomingToken with stored hash using bcrypt → throw ApiError(401, "Session expired") if mismatch
  generate new accessToken
  return { accessToken }

- getMe(userId):
  find user by _id, select("-password -refreshToken"), return user

src/modules/auth/auth.controller.ts:
- Each method uses asyncHandler
- register: call service → set refreshToken as httpOnly cookie (maxAge 7 days) → send ApiResponse(201)
- login: call service → set httpOnly cookie → send ApiResponse(200)
- logout: clear cookie → call service → send ApiResponse(200)
- refresh: read refreshToken from req.cookies → call service → return new accessToken
- getMe: call service → send ApiResponse(200)

src/middleware/auth.middleware.ts:
- Read Authorization header, split "Bearer <token>"
- Verify with JWT_SECRET → throw ApiError(401) if missing or invalid
- Find user by decoded._id, select("-password -refreshToken")
- Attach to req.user → call next()

src/modules/auth/auth.routes.ts:
POST /register → validate(registerSchema) → authController.register
POST /login → validate(loginSchema) → authController.login
POST /logout → protect → authController.logout
POST /refresh → authController.refresh
GET  /me → protect → authController.getMe

Register in src/app.ts under /api/v1/auth

Test all 5 endpoints and show me the results.
```

**After Claude finishes:**
```bash
git add .
git commit -m "feat: phase 2 backend auth module"
git push origin main
```

---

## PHASE 3 — Backend Resume Module

Open Claude Code in `resume-builder-backend` and paste this:

```
Read the CLAUDE.md file.

Build the complete resume module. Follow the module pattern exactly — controllers only call services, services do all DB work and throw ApiErrors.

src/modules/resume/resume.model.ts — Mongoose Resume model:
- userId: ObjectId ref User required
- title: String required default "Untitled Resume"
- templateId: String enum modern|classic|minimal default "minimal"
- isPublic: Boolean default false
- slug: String unique sparse
- views: Number default 0
- data: Object containing: personalInfo (Object), summary (String default ""), experience (Array default []), education (Array default []), skills (Array default []), projects (Array default []), certifications (Array default [])
- versions: Array of { data: Object, label: String, createdAt: Date default now }
- timestamps: true

src/modules/resume/resume.schema.ts — Zod schemas:
- createResumeSchema: title optional string
- updateResumeSchema: all fields optional

src/modules/resume/resume.service.ts:
- getUserResumes(userId): find all by userId, sort updatedAt desc, exclude versions field
- createResume(userId, title): create with empty data object
- getResumeById(id, userId): find → ApiError(404) if not found → ownership check → return
- updateResume(id, userId, data): find → ownership check → update → return updated
- deleteResume(id, userId): find → ownership check → delete
- publishResume(id, userId): find → ownership check → generate nanoid(8) slug → set isPublic true → save
- unpublishResume(id, userId): find → ownership check → set isPublic false → save
- getPublicResume(slug): find by slug where isPublic true → ApiError(404) if not found → increment views with $inc operator → return
- saveVersion(id, userId, label): find → ownership check → if versions.length >= 10 remove oldest → push new version snapshot → save

Routes:
GET    /api/v1/resumes              protect → getUserResumes
POST   /api/v1/resumes              protect → createResume
GET    /api/v1/resumes/:id          protect → getResumeById
PUT    /api/v1/resumes/:id          protect → updateResume
DELETE /api/v1/resumes/:id          protect → deleteResume
POST   /api/v1/resumes/:id/publish  protect → publishResume
POST   /api/v1/resumes/:id/unpublish protect → unpublishResume
POST   /api/v1/resumes/:id/version  protect → saveVersion
GET    /api/v1/resumes/public/:slug (no auth) → getPublicResume

Register in app.ts under /api/v1/resumes. Test all endpoints and show results.
```

**After Claude finishes:**
```bash
git add .
git commit -m "feat: phase 3 backend resume module"
git push origin main
```

---

## PHASE 4 — Backend AI Module

Open Claude Code in `resume-builder-backend` and paste this:

```
Read the CLAUDE.md file.

Set up Gemini client in src/config/gemini.ts:
import { GoogleGenerativeAI } from "@google/generative-ai"
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
export const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

Add AI rate limiter in src/middleware/rateLimiter.middleware.ts:
export const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  keyGenerator: (req: any) => req.user?._id?.toString() || req.ip,
  message: { success: false, message: "Too many AI requests. Wait a minute." }
})

Build the complete AI module.

src/modules/ai/ai.service.ts — 4 methods:

1. improveBullet(text, role, company):
Prompt: "You are a senior resume coach. Rewrite this bullet point to be powerful and results-driven. Start with a strong action verb. Use the STAR method. Quantify impact where possible. Keep under 20 words. Role: {role} at {company}. Bullet: {text}. Respond ONLY with valid JSON: { improved: string, alternatives: string[] } with 2 alternatives. No markdown, no backticks."

2. generateSummary(name, role, yearsExp, skills, topAchievement):
Prompt: "You are a professional resume writer. Write a compelling 3-sentence professional summary. Sentence 1: role and years. Sentence 2: top skills and achievement. Sentence 3: value to team. Data: name={name}, role={role}, years={yearsExp}, skills={skills}, achievement={topAchievement}. Respond ONLY with valid JSON: { summary: string }. No markdown, no backticks."

3. checkATSScore(resumeText, jobDescription):
Prompt: "You are an ATS scanner. Analyze this resume against the job description. Resume: {resumeText}. Job: {jobDescription}. Respond ONLY with valid JSON: { score: number 0-100, matchedKeywords: string[], missingKeywords: string[], suggestions: string[] with 5 tips, sectionScores: { experience: number, skills: number, education: number, format: number } }. No markdown, no backticks."

4. suggestSkills(role, currentSkills):
Prompt: "You are a technical recruiter. Suggest the 10 most in-demand skills for {role} NOT in this list: {currentSkills}. Respond ONLY with valid JSON: { suggestions: [{ category: string, skills: string[] }] }. Categories: Languages, Frameworks, Tools, Cloud, Soft Skills. No markdown, no backticks."

For each method:
- Call model.generateContent(prompt)
- Get text: result.response.text()
- Strip: text.replace(/```json|```/g, "").trim()
- JSON.parse the result
- Wrap in try/catch → throw ApiError(503, "AI service unavailable") on any error

Routes with aiLimiter on all:
POST /api/v1/ai/improve-bullet   → protect → aiLimiter → validate → improveBullet
POST /api/v1/ai/generate-summary → protect → aiLimiter → validate → generateSummary
POST /api/v1/ai/ats-score        → protect → aiLimiter → validate → checkATSScore
POST /api/v1/ai/suggest-skills   → protect → aiLimiter → validate → suggestSkills

Register in app.ts under /api/v1/ai. Test all endpoints and show results.
```

**After Claude finishes:**
```bash
git add .
git commit -m "feat: phase 4 backend AI module"
git push origin main
```

---

## PHASE 5 — Backend PDF Export

Open Claude Code in `resume-builder-backend` and paste this:

```
Read the CLAUDE.md file.

Build the PDF export module.

src/modules/export/export.service.ts:

generatePDF(resumeId, userId):
1. Fetch resume, verify ownership (ApiError 403 if not owner)
2. Build HTML string based on resume.templateId:
   - Create 3 functions: buildModernHTML(data), buildClassicHTML(data), buildMinimalHTML(data)
   - Each returns full HTML with inline CSS, A4 size (794px x 1123px), @page { size: A4; margin: 0; }
   - Load Google Fonts via <link> tag
   - Render all resume.data sections
3. Launch Puppeteer:
   const chromium = require("@sparticuz/chromium")
   const puppeteer = require("puppeteer-core")
   const browser = await puppeteer.launch({
     args: chromium.args,
     executablePath: await chromium.executablePath(),
     headless: chromium.headless,
   })
4. Set content: await page.setContent(html, { waitUntil: "networkidle0" })
5. Generate PDF: await page.pdf({ format: "A4", printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } })
6. Close browser
7. Upload buffer to Cloudinary: resource_type "raw", folder "resume-builder/pdfs"
8. Return { downloadUrl, filename: resume.title + ".pdf" }

Route:
POST /api/v1/export/pdf/:id → protect → generatePDF

Register in app.ts. Test: create resume → call export → confirm Cloudinary URL returned.
```

**After Claude finishes:**
```bash
git add .
git commit -m "feat: phase 5 backend PDF export"
git push origin main
```

---
---

# FRONTEND PHASES

---

## PHASE 6 — Frontend Project Setup

Open Claude Code in `resume-builder-frontend` and paste this:

```
Read the CLAUDE.md file carefully.

Set up the complete Next.js 14 frontend.

Run this first:
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*"

Then install:
npm install zustand axios react-hook-form zod @hookform/resolvers @hello-pangea/dnd react-hot-toast next-themes posthog-js qrcode @types/qrcode

Create all folders from CLAUDE.md with empty placeholder files.

Create .env.local.example:
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

Create types/index.ts with full TypeScript interfaces:
User, Resume, ResumeData, PersonalInfo, Experience, Education, SkillGroup, Project, Certification

Create store/authStore.ts (Zustand):
State: user (User | null), accessToken (string | null), isAuthenticated (boolean)
Actions: setAuth(user, accessToken), clearAuth(), updateUser(user)

Create store/resumeStore.ts (Zustand):
State: resume (Resume | null), isDirty (boolean), isSaving (boolean), activeSection (string)
Actions: setResume, updateSection(section, data), setTemplate(id), setActiveSection, markSaved

Create lib/api.ts:
- Axios instance, baseURL from NEXT_PUBLIC_API_URL env var
- Request interceptor: get accessToken from authStore → add Authorization: Bearer header
- Response interceptor: on 401 → POST /auth/refresh → save new token in store → retry original request
- Export as default

Create middleware.ts:
- Protect /dashboard and /editor routes → redirect to /login if no token
- Redirect authenticated users away from /login and /register → redirect to /dashboard

Run npm run dev and confirm port 3000 starts. Show me the output.
```

**After Claude finishes:**
```bash
git add .
git commit -m "feat: phase 6 frontend project setup"
git push origin main
```

---

## PHASE 7 — Frontend Auth Pages

Open Claude Code in `resume-builder-frontend` and paste this:

```
Read the CLAUDE.md file.

Build the complete authentication UI.

components/ui/Button.tsx:
- Props: variant (primary|secondary|ghost|danger), size (sm|md|lg), loading (boolean), disabled
- Show spinner when loading=true
- Full TypeScript types

components/ui/Input.tsx:
- Props: label, error (string), helperText, all standard input props
- Show red border and error message when error prop is set

app/(auth)/login/page.tsx:
- react-hook-form with Zod: email (valid format) + password (min 6)
- On submit: POST /auth/login via lib/api.ts
- On success: call setAuth in authStore → redirect to /dashboard
- On error: show react-hot-toast error with the API error message
- Loading state on submit button
- "Don't have an account? Register" link

app/(auth)/register/page.tsx:
- react-hook-form with Zod: name (min 2) + email + password (min 6) + confirmPassword (must match)
- On submit: POST /auth/register
- On success: POST /auth/login automatically → setAuth → redirect to /dashboard
- Error toast on failure, loading state on button

app/page.tsx — simple landing page:
- Hero: "Build Your Perfect Resume with AI"
- 3 feature cards: AI Suggestions, ATS Checker, PDF Export
- Two buttons: "Get Started Free" → /register, "Login" → /login

app/layout.tsx:
- Add Toaster from react-hot-toast
- On mount: call GET /auth/me via lib/api.ts → if success setAuth → if 401 clearAuth

Test full flow: register → auto-login → dashboard redirect → refresh page → session restores.
```

**After Claude finishes:**
```bash
git add .
git commit -m "feat: phase 7 frontend auth pages"
git push origin main
```

---

## PHASE 8 — Frontend Dashboard + Editor

Open Claude Code in `resume-builder-frontend` and paste this:

```
Read the CLAUDE.md file.

Build the Dashboard and Resume Editor.

app/(dashboard)/layout.tsx:
- Left sidebar: app logo, "Dashboard" nav link, user name + avatar at bottom, logout button
- Logout: clearAuth → redirect /login
- Main content area takes remaining width

app/(dashboard)/dashboard/page.tsx:
- Fetch GET /resumes on mount
- Loading: show 4 skeleton cards
- Empty state: "No resumes yet" with create button
- Grid of ResumeCard components
- "New Resume" button top right → POST /resumes { title: "Untitled Resume" } → redirect to /editor/[id]

components/dashboard/ResumeCard.tsx:
- Shows: title, template badge, updatedAt (formatted "2 days ago"), public badge if isPublic
- Hover shows: Edit button → /editor/[id]
- Three dot menu: Rename, Delete
- Delete: confirm modal → DELETE /resumes/:id → remove from list optimistically

app/(dashboard)/editor/[id]/page.tsx:
- Fetch GET /resumes/:id → setResume in store → show loading skeleton while fetching
- Layout: left 40% (section nav + active section form) | right 60% (live preview panel)
- Top bar: editable title input, template switcher (3 buttons), Share button, Export PDF button, auto-save status
- Auto-save status indicator: "Saved ✓" | "Saving..." | "Unsaved changes ●"
- Section navigation: Personal Info, Summary, Experience, Education, Skills, Projects, Certifications
- Click section → shows that section's form below the nav
- Right panel: TemplateWrapper component with isPreview=true (placeholder for now)

hooks/useAutoSave.ts:
- Watch isDirty from store
- Debounce 2000ms
- PUT /resumes/:id with current resume data via lib/api.ts
- Set isSaving true during call, call markSaved() on success

Build all section form components (components/editor/sections/):
Each form: react-hook-form, every onChange calls updateSection in resumeStore

PersonalInfo.tsx: name, email, phone, location, linkedin, github, portfolio — all text inputs in a grid
Summary.tsx: large textarea with character count display
Experience.tsx: list of experience items — add/remove item buttons, each item has company, role, location, start date, end date, "currently working here" checkbox, dynamic bullet point list with add/remove per bullet
Education.tsx: list — institution, degree, gpa, start/end dates
Skills.tsx: list of skill groups — each group has a category name input + skill chip list with add/remove
Projects.tsx: list — name, tech stack chips, github link, live link, bullet points
Certifications.tsx: list — name, issuer, date, credential link

Test: fill all sections, confirm auto-save triggers after 2 seconds, confirm data persists on page refresh.
```

**After Claude finishes:**
```bash
git add .
git commit -m "feat: phase 8 frontend dashboard and editor"
git push origin main
```

---

## PHASE 9 — Resume Templates + PDF Download

Open Claude Code in `resume-builder-frontend` and paste this:

```
Read the CLAUDE.md file.

Build 3 resume templates and connect PDF export.

CRITICAL: All templates use inline styles ONLY — no Tailwind. Puppeteer renders these server-side.
All templates accept props: { data: ResumeData, isPreview: boolean }
When isPreview=true → wrap in: <div style={{ transform: "scale(0.45)", transformOrigin: "top left", width: "794px", height: "1123px", overflow: "hidden" }}>

components/preview/templates/ModernTemplate.tsx:
- Two column: left sidebar 30% (#1a1a2e dark), right content 70% (white)
- Sidebar: name, title, contact info, skills progress bars, certifications
- Right: summary paragraph, experience timeline with left border line, education, projects
- Accent: #6c63ff purple
- Google Fonts: Raleway (headings) + Source Sans Pro (body) via <style> @import

components/preview/templates/ClassicTemplate.tsx:
- Single column, full width
- Name large centered at top, title below in gray
- Contact info in one line with separators
- Section headings: uppercase, letter-spaced, border-bottom
- Clean black and white
- Google Fonts: Libre Baskerville + Lato

components/preview/templates/MinimalTemplate.tsx:
- Two column grid: left 35% right 65%
- No decorative colors, thin #333 line under name only
- Left: contact, skills as text list, education
- Right: summary, experience, projects
- Most ATS-friendly: no images, no colored boxes
- Google Fonts: Plus Jakarta Sans

components/preview/TemplateWrapper.tsx:
- Receives templateId and data and isPreview props
- Renders matching template, falls back to MinimalTemplate

Update editor right panel to render TemplateWrapper with isPreview=true and data from resumeStore.

Template switcher in editor top bar:
- 3 buttons labeled "Modern", "Classic", "Minimal"
- Active one has purple border/highlight
- On click → setTemplate in store → PUT /resumes/:id with new templateId

Export PDF button:
- On click → set loading "Generating PDF..."
- POST /api/v1/export/pdf/:id via lib/api.ts
- On success → window.open(downloadUrl) to trigger browser download
- On error → toast error

Public resume page (app/r/[slug]/page.tsx):
- Server component, fetch resume data server-side via direct API call
- generateMetadata: title "{name} - Resume", description = summary
- Render TemplateWrapper at full size (isPreview=false)
- "Download PDF" button at top
- "Made with Resume Builder" footer
```

**After Claude finishes:**
```bash
git add .
git commit -m "feat: phase 9 templates and PDF download"
git push origin main
```

---

## PHASE 10 — Frontend AI Panel

Open Claude Code in `resume-builder-frontend` and paste this:

```
Read the CLAUDE.md file.

Build the AI Assistant panel in the resume editor.

hooks/useAI.ts — 4 functions each managing their own loading + error state:
- improveBullet(text, role, company) → POST /ai/improve-bullet
- generateSummary(params) → POST /ai/generate-summary
- checkATSScore(resumeText, jobDescription) → POST /ai/ats-score
- suggestSkills(role, currentSkills) → POST /ai/suggest-skills
All use lib/api.ts. Return { data, loading, error }.

components/editor/AIPanel.tsx:
- Toggle button "✨ AI" in editor top bar → opens/closes slide-in panel from right
- Panel: 320px wide, slides over the preview, has a close X button
- Three tabs: Improve | ATS Score | Skills

Tab 1 — Improve:
- List all bullet points from experience and projects in resumeStore
- Each bullet shows the text + "✨" button beside it
- On click → call improveBullet with { text, role, company } from that experience item
- Show spinner inline while loading
- Show result below: improved text + 2 alternatives
- "Accept" button: updates that bullet in resumeStore → triggers auto-save
- "Reject" button: hides result

"Generate Summary" button inside the Summary section form:
- Gather: name from personalInfo, role from experience[0].role, yearsExp (calc from dates), skills list, topAchievement from experience[0].bullets[0]
- Call generateSummary
- Show result with Accept/Reject

Tab 2 — ATS Score:
- Textarea: "Paste job description here..."
- "Analyze" button
- Flatten entire resume to plain text (join all fields with spaces)
- Call checkATSScore
- Show: large SVG circle with score number (red <50, orange 50-75, green >75)
- Matched keywords as green chips
- Missing keywords as red chips (click to add to skills section in store)
- 5 suggestion items as bullet list
- 4 section score mini bars

Tab 3 — Skills:
- Auto-reads role from experience[0].role and current skills from store
- "Suggest Skills" button → call suggestSkills
- Show result grouped by category as clickable chips
- Click chip → adds skill to matching category in skills section of resumeStore → auto-save

All requests:
- Disable button while loading
- Show loading skeleton while waiting
- Toast error on failure: "AI unavailable, please try again"
```

**After Claude finishes:**
```bash
git add .
git commit -m "feat: phase 10 AI panel"
git push origin main
```

---

## PHASE 11 — Polish + Advanced Features

Open Claude Code in `resume-builder-frontend` and paste this:

```
Read the CLAUDE.md file.

Add these final features and polish.

1. Share Modal (components/dashboard/ShareModal.tsx):
- Triggered by Share button in editor top bar
- Toggle public/private → POST /resumes/:id/publish or /unpublish
- When public: show shareable link + copy to clipboard button (navigator.clipboard.writeText)
- QR code: qrcode.toDataURL(url) → render as <img src={dataUrl}/>
- View count: "👁 {views} views"

2. Version History:
- "Save Version" button in editor top bar
- Prompt for label using window.prompt or small inline input
- POST /resumes/:id/version with { label }
- Side panel showing list of versions: label + formatted date
- "Restore" button → confirm with modal → PUT /resumes/:id with that version's data → setResume in store

3. UI components:
- components/ui/Modal.tsx: backdrop, close on Escape key, close on backdrop click, portal rendered
- components/ui/Skeleton.tsx: animated gray pulse block, accepts className for sizing
- Add skeleton loading to: dashboard card grid, editor load state, AI panel results

4. Mobile responsive editor:
- Below 768px: hide live preview panel
- Show "Edit" | "Preview" tab buttons at top
- Edit tab: shows form panel
- Preview tab: shows template at reduced scale

5. Dark mode:
- Toggle button in Sidebar
- Use next-themes ThemeProvider already in layout
- Verify all Tailwind classes have dark: variants where needed

6. PostHog analytics — track these events:
resume_created, resume_deleted, resume_exported, resume_shared, resume_published
ai_bullet_improved, ai_summary_generated, ai_ats_checked, ai_skills_suggested
template_changed, version_saved, version_restored

After all features, run these quality checks and fix all errors:
- cd frontend && npm run lint
- cd frontend && npm run type-check
- cd frontend && npm run build

Show me the output of each command.
```

**After Claude finishes:**
```bash
git add .
git commit -m "feat: phase 11 polish and advanced features"
git push origin main
```

---

## PHASE 12 — Deploy

### Step 1 — MongoDB Atlas (database)
```
1. atlas.mongodb.com → Create free M0 cluster
2. Database Access → Add DB User: username + strong password
3. Network Access → Add IP: 0.0.0.0/0 (needed for Render dynamic IPs)
4. Connect → Drivers → copy connection string
5. Replace <password> in the string with your DB user password
6. Save this URI — you will need it in the next step
```

### Step 2 — Deploy Backend to Render
```
1. render.com → New → Web Service
2. Connect your resume-builder-backend GitHub repo
3. Settings:
   Name: resume-builder-backend
   Build Command: npm install && npm run build
   Start Command: node dist/server.js
4. Add environment variables one by one:
   NODE_ENV          = production
   PORT              = 5000
   MONGODB_URI       = (paste from Atlas step above)
   JWT_SECRET        = (run in terminal: openssl rand -base64 64)
   JWT_REFRESH_SECRET= (run again: openssl rand -base64 64)
   GEMINI_API_KEY    = (from aistudio.google.com → Get API Key)
   CLOUDINARY_CLOUD_NAME = (from cloudinary.com dashboard)
   CLOUDINARY_API_KEY    = (from cloudinary.com dashboard)
   CLOUDINARY_API_SECRET = (from cloudinary.com dashboard)
   CLIENT_URL        = https://your-frontend.vercel.app (update after deploying frontend)
5. Deploy → wait for "Live" status
6. Copy your backend URL: https://resume-builder-backend.onrender.com
```

### Step 3 — Deploy Frontend to Vercel
```
1. vercel.com → Add New Project
2. Import resume-builder-frontend GitHub repo
3. Framework: Next.js (auto-detected)
4. Add environment variables:
   NEXT_PUBLIC_API_URL       = https://resume-builder-backend.onrender.com/api/v1
   NEXT_PUBLIC_POSTHOG_KEY   = (from posthog.com → free account)
   NEXT_PUBLIC_POSTHOG_HOST  = https://app.posthog.com
5. Deploy → copy your frontend URL: https://resume-builder-frontend.vercel.app
```

### Step 4 — Update Backend CORS
```
Go to Render → resume-builder-backend → Environment
Update CLIENT_URL = https://resume-builder-frontend.vercel.app
Render will auto-redeploy
```

### Step 5 — Final End-to-End Test
```
Open your Vercel URL and test this full flow:
1. Register new account
2. Create a resume, fill all sections
3. Switch templates and confirm preview changes
4. Export PDF and confirm download works
5. Use AI bullet improver on one bullet
6. Run ATS score with a real job description
7. Make resume public and visit the public URL
8. Check PostHog dashboard for events
```

---

## Quick Reference — What to Paste Where

| Phase | Repo | What gets built |
|---|---|---|
| 1 | Backend | Express setup, MongoDB, utilities |
| 2 | Backend | Auth APIs — register, login, JWT tokens |
| 3 | Backend | Resume CRUD APIs |
| 4 | Backend | AI features with Gemini |
| 5 | Backend | PDF export with Puppeteer |
| 6 | Frontend | Next.js setup, types, Zustand, Axios |
| 7 | Frontend | Login and register pages |
| 8 | Frontend | Dashboard and resume editor |
| 9 | Frontend | 3 templates and PDF download |
| 10 | Frontend | AI assistant panel |
| 11 | Frontend | Polish, dark mode, mobile, analytics |
| 12 | Both | Deploy to Render + Vercel |
