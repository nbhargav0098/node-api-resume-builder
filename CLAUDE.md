# Resume Builder — Backend

## Project Overview
Node.js + Express REST API for the resume builder app.
Frontend lives in a completely separate repository.
Goal: Portfolio project for LinkedIn, resume, and interviews.

## Tech Stack
- Node.js + Express + TypeScript
- MongoDB + Mongoose (database)
- JWT (access token 15min + refresh token 7 days)
- bcryptjs (password hashing)
- Zod (request validation)
- Google Gemini 1.5 Flash API (AI features)
- Cloudinary (image and PDF storage)
- Puppeteer + @sparticuz/chromium (PDF generation)
- Winston (logging)
- Morgan (HTTP request logger)
- express-rate-limit (rate limiting)
- nanoid (unique slug generation)
- cors, dotenv, helmet

## Commands
```bash
npm run dev     # nodemon dev server on port 5000
npm run build   # compile TypeScript → dist/
npm start       # run compiled dist/server.js (production)
npm run lint    # ESLint check
```

## Folder Structure
```
src/
  config/
    db.ts               # MongoDB connection with reconnect logic
    gemini.ts           # Gemini AI client setup
    cloudinary.ts       # Cloudinary setup

  middleware/
    auth.middleware.ts         # verify JWT, attach req.user
    rateLimiter.middleware.ts  # express-rate-limit configs
    validate.middleware.ts     # Zod request validation wrapper
    error.middleware.ts        # global error handler
    logger.middleware.ts       # Winston + Morgan setup

  modules/
    auth/
      auth.routes.ts      # route definitions + middleware
      auth.controller.ts  # parse req → call service → send res
      auth.service.ts     # ALL business logic here
      auth.model.ts       # Mongoose User schema + model
      auth.schema.ts      # Zod validation schemas
    resume/
      resume.routes.ts
      resume.controller.ts
      resume.service.ts
      resume.model.ts
      resume.schema.ts
    ai/
      ai.routes.ts
      ai.controller.ts
      ai.service.ts       # all Gemini prompts live here
      ai.schema.ts
    export/
      export.routes.ts
      export.controller.ts
      export.service.ts   # Puppeteer PDF generation

  utils/
    ApiResponse.ts        # consistent response: { success, statusCode, message, data }
    ApiError.ts           # custom error class with statusCode
    asyncHandler.ts       # wraps async controllers, catches errors
    generateTokens.ts     # JWT access + refresh token helpers

  app.ts                  # Express app setup, all middleware, all routes
  server.ts               # entry point, starts server
```

## API Routes
```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
POST   /api/v1/auth/refresh
GET    /api/v1/auth/me              ← protected

GET    /api/v1/resumes              ← protected
POST   /api/v1/resumes              ← protected
GET    /api/v1/resumes/:id          ← protected
PUT    /api/v1/resumes/:id          ← protected
DELETE /api/v1/resumes/:id          ← protected
POST   /api/v1/resumes/:id/publish  ← protected
POST   /api/v1/resumes/:id/version  ← protected
GET    /api/v1/resumes/public/:slug ← public (no auth)

POST   /api/v1/ai/improve-bullet    ← protected + rate limited
POST   /api/v1/ai/generate-summary  ← protected + rate limited
POST   /api/v1/ai/ats-score         ← protected + rate limited
POST   /api/v1/ai/suggest-skills    ← protected + rate limited

POST   /api/v1/export/pdf/:id       ← protected
GET    /api/v1/health               ← public (for Render health check)
```

## Environment Variables
```bash
# .env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://...
JWT_SECRET=
JWT_REFRESH_SECRET=
GEMINI_API_KEY=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLIENT_URL=http://localhost:3000
```

## Module Pattern — ALWAYS follow this exactly
```
routes.ts     → define endpoints and attach middleware only
controller.ts → parse req body/params, call service method, send ApiResponse
service.ts    → ALL business logic, all DB queries, throw ApiError on errors
model.ts      → Mongoose schema and model export only
schema.ts     → Zod validation schemas only
```

## Standard Utilities — ALWAYS use these

### ApiResponse (every success response)
```typescript
res.status(200).json(new ApiResponse(200, "Resume fetched", data));
```

### ApiError (every error)
```typescript
throw new ApiError(404, "Resume not found");
throw new ApiError(403, "Unauthorized");
throw new ApiError(400, "Invalid input");
```

### asyncHandler (every controller method)
```typescript
export const getResume = asyncHandler(async (req, res) => {
  const resume = await resumeService.getById(req.params.id, req.user._id);
  res.status(200).json(new ApiResponse(200, "Resume fetched", resume));
});
```

### Ownership check (every resource route)
```typescript
if (resume.userId.toString() !== req.user._id.toString()) {
  throw new ApiError(403, "Unauthorized");
}
```

## Auth Strategy
- Access token: signed with JWT_SECRET, 15min expiry, returned in response body
- Refresh token: signed with JWT_REFRESH_SECRET, 7 days expiry
- Refresh token stored as bcrypt hash in User document
- Refresh token sent to frontend as httpOnly cookie (credentials: true)
- protect middleware: reads Authorization: Bearer <token> header

## AI Rules
- Model: gemini-1.5-flash only
- Rate limit: 10 requests per user per minute (key = req.user._id)
- Every Gemini prompt must end with:
  "Respond ONLY with valid JSON. No markdown, no explanation, no backticks."
- Always strip ```json and ``` before JSON.parse()
- Always wrap Gemini calls in try/catch → throw ApiError(503, "AI service unavailable")

## CORS Setup
```typescript
cors({ origin: process.env.CLIENT_URL, credentials: true })
```

## Coding Rules — ALWAYS FOLLOW
- Controllers NEVER contain business logic — service only
- Every async controller MUST use asyncHandler() — no raw try/catch in controllers
- Every POST and PUT route MUST have Zod validation middleware
- Every protected resource route MUST have ownership check
- Use Winston logger — never console.log
- No stack traces in error responses when NODE_ENV=production
- API versioning: ALL routes under /api/v1/
- No refactoring unless explicitly asked

## DO NOT
- Do NOT put business logic in controllers
- Do NOT skip asyncHandler on any controller method
- Do NOT skip ownership check on any resource route
- Do NOT use console.log — use Winston logger
- Do NOT push .env to git
- Do NOT return stack traces in production
- Do NOT skip Zod validation on POST and PUT routes
