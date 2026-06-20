# DevInsight

Real-time developer collaboration platform. Code sharing, pair programming, coding challenges.

## Structure

```
backend/   Express + Prisma + Socket.io (Node/TS)
frontend/  React 18 + CRA + Redux Toolkit + Tailwind (TS)
```

## Backend architecture

Repository → Service → Controller layers:
- `src/repositories/` — data access (BaseRepository CRUD, User, Snippet, Challenge, Room)
- `src/services/` — business logic (auth, user, snippet, challenge, collaboration)
- `src/controllers/` — thin HTTP mapping, delegates to services
- `src/middleware/` — auth (JWT), validation (Joi), error handler (custom AppError classes), rate limiters
- `src/errors/AppError.ts` — NotFoundError, ValidationError, AuthError, ForbiddenError, ConflictError, RateLimitError
- `src/sockets/` — Socket.io handlers with collaboration service (room join/leave, code sync, cursor, presence)
- `src/config/redis.ts` — auto-selects real Redis or in-memory mock based on REDIS_URL

## Commands

| Action | Command | Workdir |
|--------|---------|---------|
| Dev server | `npm run dev` | `backend/` |
| Build | `npm run build` | `backend/` |
| Test all | `npm test` | `backend/` |
| Single test | `npx jest path/to/test.test.ts` | `backend/` |
| Typecheck | `npm run typecheck` | `backend/` |
| Lint | `npm run lint` | `backend/` |
| Format | `npm run format` | `backend/` |
| Seed DB | `npm run seed` | `backend/` |
| Generate Prisma | `npm run prisma:generate` | `backend/` |
| Migrate | `npm run prisma:migrate` | `backend/` |
| Frontend dev | `npm start` | `frontend/` |
| Frontend test | `npm test` | `frontend/` |
| Full stack | `docker compose up --build` | root |

## Quirks

- **Seed must run via `prisma db seed`** (not `ts-node` directly). Prisma CLI loads `.env` before executing seed script. Direct `ts-node` will fail with "DATABASE_URL not found".
- **Dev DB**: SQLite at `backend/prisma/dev.db`. DATABASE_URL in `backend/.env` is `file:./dev.db` (relative to prisma schema directory).
- **Redis**: Optional. Falls back to in-memory mock when REDIS_URL is unset.
- **Prisma fields**: SQLite lacks enums and arrays. Role/difficulty/status stored as strings, tags/testCases as JSON strings. Repositories have `parseTags()`/`parseChallenge()` helpers for JSON parsing.
- **JS/TS code execution** uses Node `vm` module (escapable sandbox — dev-only). Python/Java execution uses `execSync` subprocesses.
- **Password validation**: min 8 chars, requires uppercase + lowercase + number (Joi schema).
- **TypeScript strict mode** enabled. `noEmit` on frontend (CRA handles bundling).
- **Husky pre-commit** runs `lint-staged` on staged `*.ts` files (eslint --fix + prettier --write).
- **Test setup**: `jest.setup.js` injects DATABASE_URL and JWT secrets. Tests use real SQLite dev.db. `forceExit: true` in jest config.
- **Routes**: `GET /my-submissions` must be registered BEFORE `GET /:id` to avoid param capture.

## Database (Prisma)

9 models: User, Snippet, Comment, Like, Challenge, ChallengeSubmission, Collaboration, RefreshToken, Achievement, UserAchievement.

## Deploy

Target: Vercel (frontend) + Railway (backend) + Neon (PostgreSQL) + Upstash (Redis). See `DEPLOYMENT.md` for env vars and build commands.

Frontend CRA builds to `build/`. Backend `npm run build` outputs to `dist/`.
