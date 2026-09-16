# Rules — SalonPro Development Standards

## 1. Folder Structure

### CRM Frontend (`Crm-Frontend/src/`)
```
app/                    # Next.js App Router pages
  [module]/
    page.tsx            # Page component
    layout.tsx          # Layout wrapper (if needed)
    loading.tsx         # Suspense loading skeleton
    [sub-route]/
      page.tsx
components/
  ui/                   # Reusable primitives (Button, Input, Card, Modal, Badge, Loader, skeleton)
  layout/               # AppShell, Header, Sidebar
  forms/                # Reusable form components (ClientForm, etc.)
lib/
  api.ts                # Axios instance with interceptors
  bookingWorkflow.ts    # Booking state machine logic
store/
  authStore.ts          # Auth state (Zustand + persist)
  locationStore.ts      # Branch selector + all branch seed data
  themeStore.ts         # Dark/light mode
types/
  index.ts              # All TypeScript interfaces and types
utils/
  helpers.ts            # Utility functions (cn, formatCurrency, etc.)
  invoicePDF.ts         # PDF generation logic
```

### Backend (`Backend-all-in-one/src/`)
```
config/
  db.js                 # Prisma Client singleton instance (new PrismaClient())
controllers/            # Route handler logic (use `prisma.<model>.findMany()` etc.)
middleware/
  auth.js               # JWT verification
  rateLimiter.js        # Express rate limiting
  roleGuard.js          # RBAC middleware
routes/                 # Express routers
prisma/
  schema.prisma         # Single source of truth for all models (User, Customer, Booking, Service, Payment, SupportTicket, Staff)
  migrations/           # Auto-generated Prisma migration history — never hand-edit
```

**Note:** there is no `models/` folder anymore. Prisma generates a typed client from `schema.prisma` — don't hand-write model files the way Mongoose required. Run `npx prisma generate` after any schema change, and `npx prisma migrate dev --name <change>` to create a migration.

---

## 2. Naming Conventions

| Item | Convention | Example |
|---|---|---|
| React components | PascalCase | `BookingCard.tsx` |
| Pages | `page.tsx` (Next.js convention) | `app/booking/list/page.tsx` |
| Hooks | camelCase with `use` prefix | `useBooking.ts` |
| Stores | camelCase with `Store` suffix | `authStore.ts` |
| Types/Interfaces | PascalCase | `BookingFormData` |
| API routes | kebab-case | `/api/booking-list` |
| CSS variables | kebab-case with `--` prefix | `--sidebar-active-bg` |
| Constants | UPPER_SNAKE_CASE | `BRANCH_DATA`, `BRANCHES` |
| Utility functions | camelCase | `formatCurrency`, `initials` |

---

## 3. Coding Standards

### TypeScript
- Strict mode enabled (`tsconfig.json`)
- No `any` unless absolutely unavoidable; prefer `unknown`
- All props must be typed; no implicit `any`
- Use `interface` for object shapes, `type` for unions/aliases
- Export types from `types/index.ts`

### React / Next.js
- Use `'use client'` only when browser APIs or hooks are needed
- Prefer Server Components for static/data-fetch pages
- Keep components small and single-responsibility
- No inline styles except for dynamic values (e.g., `style={{ width: \`${load}%\` }}`)
- Use `cn()` from `utils/helpers.ts` for conditional class merging
- Always add `key` props on mapped elements using stable IDs

### State Management
- Zustand for global state; no Redux
- Use `persist` middleware only for data that must survive page refresh
- Keep store actions minimal; no business logic in stores

### Forms
- React Hook Form + Zod for all forms
- Define Zod schema alongside the form component
- Show field-level validation errors below each input

### API Calls
- All HTTP calls go through `lib/api.ts` (Axios instance)
- Never use `fetch` directly
- Handle errors in try/catch; show user-friendly messages
- Use consistent response format (see API Standards below)

---

## 4. Architecture Rules

- **No business logic in pages** — pages only compose components and call stores/APIs
- **No direct DOM manipulation** — use React refs only when necessary
- **No hardcoded branch data in pages** — always read from `locationStore`
- **No duplicate components** — check `components/ui/` before creating new primitives
- **No inline API calls** — all API logic in store actions or custom hooks
- **Reuse existing UI components** — Button, Input, Card, Modal, Badge, Loader from `components/ui/`

---

## 5. API Standards

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {}
}
```

### Error Response
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": []
}
```

### HTTP Status Codes
| Code | Usage |
|---|---|
| 200 | Success (GET, PUT) |
| 201 | Created (POST) |
| 400 | Validation error |
| 401 | Unauthenticated |
| 403 | Forbidden (RBAC) |
| 404 | Not found |
| 429 | Rate limited |
| 500 | Server error |

---

## 6. Security Rules

- JWT secret stored only in `.env` — never in code
- Passwords hashed with bcryptjs (salt rounds: 10)
- All protected routes use `auth.js` middleware
- RBAC enforced via `roleGuard.js` on sensitive endpoints
- Role enum is `admin | manager | receptionist | stylist` everywhere (backend `User.role`, frontend types, RBAC checks) — this was previously inconsistent (`admin|staff` on the backend vs. 4 roles on the frontend); see `memory.md` for the migration task
- CORS restricted to `FRONTEND_URL` env variable
- No stack traces in API error responses
- No PII logged to console in production
- Rate limiting on auth endpoints via `rateLimiter.js`

---

## 7. Error Handling

### Frontend
- Wrap async calls in try/catch
- Show toast or inline error messages (never raw error objects)
- 401 → auto-redirect to login (handled in Axios interceptor)
- Loading states managed with `isLoading` boolean in stores

### Backend
- Wrap all controller logic in try/catch
- Return structured error responses (see API Standards)
- Log errors server-side; never expose stack traces to client
- Validate all inputs before database operations

---

## 8. Libraries — Approved

| Library | Purpose |
|---|---|
| `next` | Framework |
| `react`, `react-dom` | UI |
| `typescript` | Type safety |
| `tailwindcss` | Styling |
| `zustand` | State management |
| `react-hook-form` | Forms |
| `zod` | Validation |
| `axios` | HTTP client |
| `lucide-react` | Icons |
| `recharts` | Charts |
| `jspdf` + `html2canvas` | PDF export |
| `date-fns` | Date utilities |
| `clsx` | Conditional class names |
| `tailwind-merge` | Dedupes conflicting Tailwind classes inside `cn()` — required alongside `clsx`, not optional |
| `bcryptjs` | Password hashing |
| `jsonwebtoken` | JWT |
| `prisma` + `@prisma/client` | PostgreSQL ORM — schema, migrations, typed query client |
| `express` | Backend framework |
| `cors` | CORS middleware |
| `dotenv` | Env variables |

---

## 9. Libraries — Prohibited

- `moment.js` — use `date-fns` instead
- `redux` / `redux-toolkit` — use Zustand
- `styled-components` / `emotion` — use Tailwind CSS
- `fetch` directly — use Axios via `lib/api.ts`
- `jQuery` — not needed
- Any UI component library (MUI, Ant Design, Chakra) — use custom `components/ui/`
- `mongoose` / MongoDB drivers of any kind — the project is PostgreSQL via Prisma; do not reintroduce a NoSQL dependency
- Raw SQL query builders (`knex`, `pg` used directly, etc.) — use Prisma Client for all queries; use `prisma.$queryRaw` only for the rare case Prisma's API can't express

---

## 10. Git Workflow

- Branch naming: `feature/module-name`, `fix/bug-description`, `chore/task`
- Commit messages: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`
- Never commit `.env` files
- Never commit `node_modules/`
- PR required before merging to `main`

---

## 11. Environment Variables

### Backend (`.env`)
```
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/salon_crm
JWT_SECRET=<strong_secret>
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
EMAIL_USER=support@hairahmedabad.com
EMAIL_PASSWORD=<app_password>
DEV_TEAM_EMAIL=dev-team@hairahmedabad.com
```

### Frontend (`.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## 12. Performance Rules

- Use `loading.tsx` (Suspense) on every route that fetches data
- Lazy-load heavy components (charts, PDF generator)
- Avoid re-renders: memoize expensive computations with `useMemo`
- Use `IntersectionObserver` for scroll-triggered animations (already established pattern)
- Optimise images with Next.js `<Image>` component

---

## 13. AI Development Rules

- Read all documentation before writing any code
- Never modify files outside the scope of the current task
- Never delete existing functionality
- Always reuse existing components and utilities
- Update `memory.md` after every significant task
- Ask for clarification before making architectural decisions
- Never hardcode data that belongs in environment variables or the database
