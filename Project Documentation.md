# MockMind Product Technical Documentation Book

## 1. Title Page

### 1.1 Project

**MockMind**

### 1.2 Developer

**Deep Ghinaiya**

### 1.3 Product Version

**v1.0.0** (client and server)

### 1.4 Technology Stack

**MERN + AI Integration**

- Frontend: React 18, React Router 6, Vite, Axios, Recharts
- Backend: Node.js, Express, Mongoose, Express Validator, Multer
- Database: MongoDB + GridFS
- Security: JWT, bcryptjs
- Integrations: Groq API, Nodemailer (SMTP)

---

## 2. Product Overview

### 2.1 Product Summary

MockMind is a full-stack AI-enabled interview preparation platform. It supports structured interview simulation with question generation, voice and code responses, AI evaluation, concept-level chatbot assistance, historical session review, and an administrator analytics/moderation console.

### 2.2 Intended Users

- Technical interview candidates (students and early-career professionals)
- Learners preparing role-specific practice plans
- Product administrator monitoring usage and quality signals

### 2.3 Product Value Proposition

MockMind combines practice execution and feedback generation in a single workflow. Instead of static question banks, it delivers session-level simulation with immediate AI assistance and performance visibility.

---

## 3. Engineering Intent

### 3.1 Why This Product Was Built

Mock interviews are often unstructured and disconnected from feedback systems. MockMind was built to consolidate questioning, answering, evaluation, and concept clarification into one product surface.

### 3.2 Problem Statement

Current preparation workflows typically lack:

- Session continuity from question selection to performance review
- Real-time concept support when users are blocked
- Usable operational data for administrators

---

## 4. Product Capabilities

### 4.1 Identity and Access

- User registration and login with validated payloads
- JWT-based protected session access
- Separate admin login with role-tagged JWT

### 4.2 Practice Session Configuration

- User chooses `techStack`, `difficulty`, and language set
- Frontend enforces stack-language compatibility constraints before session execution

### 4.3 AI Questioning Pipeline

- Backend invokes Groq chat completion for question generation
- Prompt requires exactly 10 questions with mixed theory and coding intent
- Server sanitizes and parses LLM output before returning to client

### 4.4 Theory Answer Capture (Audio)

- Browser MediaRecorder captures theory answers
- Multipart upload to backend
- Groq Whisper transcription
- Audio persisted to MongoDB GridFS (`practiceAudio` bucket)

### 4.5 Coding Answer Capture (Text)

- In-session code textarea for coding questions
- Text answers merged into final evaluation payload

### 4.6 AI Evaluation

- Backend submits normalized questions and answers to evaluator prompt
- Returns per-question correctness and feedback plus numeric score
- Persists full session as `PracticeSession`

### 4.7 In-Session AI Chat Assistant

- Accepts selected question context, user query, and recent message history
- Enforces structured plain-text reply format
- Normalization pipeline removes noisy formatting for readability

### 4.8 Feedback and Contact Workflows

- Authenticated users submit feedback and contact requests
- Feedback pipeline generates unique reference ID
- Acknowledgement emails sent through SMTP integration

### 4.9 Admin Operations Console

- KPI dashboard with chart visualizations
- Data moderation tables for users, feedback, and contact submissions
- Delete actions for feedback and contact entries

---

## 5. System Architecture

### 5.1 Architecture Style

MockMind follows a client-server SPA architecture with API orchestration and AI service dependencies.

### 5.2 Runtime Components

- React SPA (`client`) for user/admin UX
- Express API (`server`) for auth, orchestration, validation, and persistence
- MongoDB for primary data store
- GridFS for audio object persistence
- Groq platform for generation, transcription, evaluation, and chat support
- SMTP transport for transactional email

### 5.3 Logical Diagram (Text)

```text
[React SPA]
   |
   | HTTPS + Bearer JWT
   v
[Express API Layer]
   |-- Auth Middleware (user/admin)
   |-- Validation Layer
   |-- Controllers
   |
   |----> [MongoDB Collections: users, admins, practicesessions, feedbacks, contactmessages]
   |----> [GridFS Bucket: practiceAudio]
   |----> [Groq API: questions, chatbot, evaluation, transcription]
   |----> [SMTP: registration/contact/feedback emails]
```

### 5.4 Request-Response Lifecycle

1. Client submits authenticated request.
2. Middleware verifies token and role context.
3. Route validation checks payload shape.
4. Controller executes business logic and external integrations.
5. Persistence layer writes to MongoDB/GridFS.
6. API returns normalized JSON response to client.

### 5.5 Session Data Flow (Practice)

1. `POST /api/practice/questions` generates question set.
2. Theory answers are uploaded to `/api/practice/answers` and transcribed.
3. Final submission to `/api/practice/evaluate` computes scoring.
4. Session persisted and exposed through `/api/practice/sessions`.

---

## 6. Repository and Module Architecture

### 6.1 Top-Level Structure

```text
MockMind/
  client/                # Frontend SPA
  server/                # Backend API
  README.md
```

### 6.2 Frontend Hierarchy (`client/src`)

```text
client/src/
  api/                   # API client adapters (auth/admin/practice/contact/feedback)
  components/            # Reusable UI/guard components
  pages/                 # Route-level page modules (user + admin)
  utils/                 # Form validation helpers
  image/                 # Static assets
  App.jsx                # Route map and access boundaries
  main.jsx               # App bootstrap
  styles.css             # Global styling and page-level layout classes
```

### 6.3 Backend Hierarchy (`server/src`)

```text
server/src/
  config/                # Database bootstrap
  models/                # Mongoose schemas
  middleware/            # Auth and error middleware
  routes/                # Route registry + validation contracts
  controllers/           # Domain and integration orchestration
  utils/                 # Email service + fixed admin seeder
  index.js               # Server composition and startup
```

### 6.4 Engineering Responsibility Boundaries

- `routes/` defines API contract surface and input constraints.
- `controllers/` owns business orchestration and service integration.
- `models/` defines persistence contract.
- `middleware/` enforces cross-cutting concerns (auth/error handling).
- `api/` on frontend isolates HTTP calls from UI components.

---

## 7. Data Model and Persistence Design

### 7.1 Core Collections

| Collection         | Purpose                              | Key Fields                                                                                                      |
| ------------------ | ------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| `users`            | End-user identity                    | `name`, `email` (unique), `password`, timestamps                                                                |
| `admins`           | Admin identity (fixed-account model) | `singletonKey` (unique), `email` (unique), `password`, `isActive`                                               |
| `practicesessions` | Session execution records            | `user`, `techStack`, `difficulty`, `languages`, `questions[]`, `answers[]`, `results[]`, `score`, `submittedAt` |
| `feedbacks`        | Product feedback channel             | `name`, `email`, `rating`, `improvement`, `referenceId` (unique), `userId`                                      |
| `contactmessages`  | Contact inquiries                    | `name`, `email`, `message`, `userId`                                                                            |

### 7.2 GridFS Usage

Audio files for theory answers are stored in:

- `practiceAudio.files`
- `practiceAudio.chunks`

This allows document data and binary audio to remain within the same database infrastructure.

### 7.3 Relationships

- One `User` to many `PracticeSession`
- Optional `User` reference from feedback/contact records
- Admin lifecycle controlled through singleton-style account seeding

### 7.4 Indexing Strategy (Current)

Implemented unique constraints:

- `users.email`
- `admins.email`
- `admins.singletonKey`
- `feedbacks.referenceId`

No custom compound or analytics-specific indexes are explicitly defined in code at this stage.

---

## 8. API Surface (Summarized)

### 8.1 API Base

`/api`

### 8.2 Endpoint Groups

#### 8.2.1 Authentication Group

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`

Purpose: user identity creation, session token issuance, profile retrieval.

#### 8.2.2 Practice Group

- `POST /practice/questions`
- `POST /practice/answers`
- `POST /practice/evaluate`
- `POST /practice/chatbot`
- `GET /practice/sessions`

Purpose: full interview simulation loop from generation to persisted evaluation.

#### 8.2.3 User Communication Group

- `POST /contact`
- `POST /feedback`

Purpose: collect user communication and send transactional acknowledgement.

#### 8.2.4 Admin Group

- `POST /admin/login`
- `POST /admin/logout`
- `GET /admin/me`
- `GET /admin/dashboard-stats`
- `GET /admin/chart-stats`
- `GET /admin/users`
- `GET /admin/feedbacks`
- `DELETE /admin/feedbacks/:id`
- `GET /admin/contacts`
- `DELETE /admin/contacts/:id`

Purpose: platform observability and moderation.

### 8.3 Request and Response Contract Pattern

- Request validation is enforced at route level using Express Validator.
- Authenticated endpoints require `Authorization: Bearer <token>`.
- Response format is JSON across all route groups.
- Error responses are normalized through middleware (`message`-centric payloads).

### 8.4 Representative Payload Shapes

**Practice Question Generation Request**

```json
{
  "techStack": "frontend",
  "difficulty": "medium",
  "languages": ["JavaScript", "React.js"]
}
```

**Practice Evaluation Response**

```json
{
  "results": [{ "questionId": "theory-0", "correct": true, "feedback": "..." }],
  "score": 78
}
```

---

## 9. Authentication and Security Model

### 9.1 Token Design

- User JWT TTL: `7d`
- Admin JWT TTL: `12h`
- Admin token contains `role: admin` claim

### 9.2 Access Control

- Public routes: root health, user register/login, admin login
- User-protected routes: practice, feedback, contact, profile
- Admin-protected routes: full `/api/admin` surface except login

### 9.3 Credential Security

- Passwords hashed with bcrypt before persistence
- User and admin password validation policies enforced at route level

### 9.4 Input and Upload Controls

- Structured payload validation for all major routes
- Audio MIME allowlist and file size limit (10MB)

### 9.5 Operational Notes

- Frontend guards route entry based on token presence in localStorage
- Server performs authoritative token verification and user/admin lookup

---

## 10. Integrations and External Dependencies

### 10.1 Groq API

Usage domains:

- Interview question generation
- Audio transcription (Whisper)
- Answer evaluation
- Concept chatbot response generation

Implementation highlights:

- Prompt templates for output shaping
- JSON sanitization/parsing for structured AI responses
- Fallback reply strategy for chatbot resilience

### 10.2 SMTP / Nodemailer

Usage domains:

- Registration confirmation
- Contact acknowledgement
- Feedback acknowledgement with reference ID

Implementation highlights:

- Transport verification at server startup
- Inline logo embedding support with CID attachments

---

## 11. Testing Strategy

### 11.1 Current Quality Baseline

The repository currently does not include committed automated test scripts. Validation and runtime checks are implemented in application code, and quality is primarily verified through manual and integration-level runs.

### 11.2 Recommended Automated Test Scope

- Backend unit tests for controllers and middleware branches
- Contract tests for validation behavior and response schemas
- Frontend component tests for auth flow and session UX states
- End-to-end workflow tests for practice pipeline and admin moderation

### 11.3 Manual Test Matrix

| Test ID | Area     | Scenario               | Input/Action                     | Expected Output                                     |
| ------- | -------- | ---------------------- | -------------------------------- | --------------------------------------------------- |
| T-01    | Auth     | User registration      | Valid registration payload       | User created, token issued, email attempt executed  |
| T-02    | Auth     | Duplicate registration | Existing email                   | Conflict response and no duplicate user             |
| T-03    | Practice | Generate questions     | Valid stack/difficulty/languages | 10-question set returned                            |
| T-04    | Practice | Upload theory answer   | Audio upload with `questionId`   | Transcript returned and file persisted              |
| T-05    | Practice | Evaluate session       | Complete question+answer payload | Results array and score returned, session persisted |
| T-06    | Practice | Chat assistant         | Concept query with context       | Structured readable reply returned                  |
| T-07    | History  | Retrieve sessions      | Authenticated GET sessions       | Recent sessions sorted by submitted date            |
| T-08    | Feedback | Feedback submission    | Rating + improvement payload     | Feedback saved with reference ID                    |
| T-09    | Contact  | Contact submission     | Valid contact payload            | Contact saved and acknowledgement handled           |
| T-10    | Admin    | KPI dashboard          | Admin login then dashboard fetch | KPI and chart datasets resolved                     |
| T-11    | Admin    | Feedback moderation    | Delete feedback by id            | Record deleted and list refreshed                   |
| T-12    | Admin    | Contact moderation     | Delete contact by id             | Record deleted and list refreshed                   |

---

## 12. Deployment and Environment

### 12.1 Required Server Environment Variables

- `PORT`
- `MONGO_URI`
- `JWT_SECRET`
- `CLIENT_URL`
- `GROQ_API_KEY`
- `GROQ_MODEL`
- `EMAIL_HOST`
- `EMAIL_PORT`
- `EMAIL_SERVICE`
- `EMAIL_USER`
- `EMAIL_PASS`
- `EMAIL_FROM`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `ADMIN_NAME`

### 12.2 Local Development Setup

1. Install backend dependencies and configure `.env` in `server/`.
2. Run backend (`npm run dev`) from `server/`.
3. Install frontend dependencies in `client/`.
4. Run frontend (`npm run dev`) from `client/`.
5. Access frontend at `http://localhost:5173`.

### 12.3 Production Build and Runtime

1. Build client bundle with `npm run build` in `client/`.
2. Start API with `npm start` in `server/`.
3. Configure production CORS origin and secure secrets through environment management.
4. Ensure MongoDB, SMTP, and Groq dependencies are reachable from runtime environment.

---

## 13. Engineering Challenges and Learnings

### 13.1 Key Challenges

- Constraining LLM output into deterministic structures for app consumption
- Handling hybrid response modalities (audio plus typed code)
- Maintaining separate but parallel user/admin security workflows
- Orchestrating async external dependencies while preserving stable UX behavior

### 13.2 Key Learnings

- Defensive parsing and normalization are mandatory for AI-assisted production paths
- GridFS provides practical persistence for medium-sized audio artifacts in MongoDB-centric systems
- Explicit role claims simplify admin authorization boundaries
- Response formatting quality directly impacts product usability, especially in chatbot interfaces

---

## 14. Product Roadmap Recommendations

### 14.1 Reliability and Security

- Introduce refresh token + revocation strategy
- Add endpoint-level rate limiting for AI-intensive routes
- Add structured audit logs for admin actions

### 14.2 Data and Performance

- Add pagination/search for admin list endpoints
- Add targeted indexes for high-volume analytics queries
- Move static API URLs to environment-based frontend configuration

### 14.3 Quality Engineering

- Add automated unit/integration/E2E pipelines
- Add contract tests for core API groups
- Add performance tests for transcription/evaluation endpoints

### 14.4 Product Experience

- Expand session analytics with longitudinal topic trend tracking
- Add richer coding answer editor capabilities and lint hooks
- Introduce configurable email templates and localization

---

## 15. Source Map (Implementation Reference)

### 15.1 Backend Core

- `server/src/index.js`
- `server/src/config/db.js`
- `server/src/routes/*.js`
- `server/src/controllers/*.js`
- `server/src/middleware/*.js`
- `server/src/models/*.js`
- `server/src/utils/sendEmail.js`
- `server/src/utils/adminSeeder.js`

### 15.2 Frontend Core

- `client/src/App.jsx`
- `client/src/api/*.js`
- `client/src/components/*.jsx`
- `client/src/pages/*.jsx`
- `client/src/utils/validation.js`
- `client/src/styles.css`

---

**Document Type:** Product Technical Documentation Book  
**Prepared For:** Portfolio Presentation  
**Prepared By:** Deep
