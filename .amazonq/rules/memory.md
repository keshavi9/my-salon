# Memory — SalonPro AI Development Log

## Project Summary
Full-stack Salon Management CRM for Hair Ahmedabad. Four sub-projects:
- `Crm-Frontend/` — Next.js 16 + TypeScript + Tailwind
- `Backend-all-in-one/` — Node.js + Express + **PostgreSQL (via Prisma ORM)** — **updated 2026-07-14: this doc briefly said MongoDB (a same-day correction of an earlier, wrong "PostgreSQL" line — see git-blame-style note: the *first* version of this doc was actually right, the "fix" that changed it to MongoDB was wrong). Confirmed final: PostgreSQL + Prisma. This means every file/task in this repo that mentions Mongoose, `MONGO_URI`, or a `models/` folder of Mongoose schemas is now stale and has been updated to Prisma equivalents (`prisma/schema.prisma`, `DATABASE_URL`, `@prisma/client`). If you find remaining Mongoose references anywhere outside this rules folder, they need the same swap.**
- `Mobile-App/customer-mobile/` — React Native (Expo)
- `Instagram-bookings/` — Next.js micro-frontend — **corrected spelling (was "Instgram-bookings"); verify actual folder name on disk matches, since import paths would break if the real directory still has the typo**

---

## Current Phase
**Phase 2 — Live API Integration** (Phase 1 is fully complete)

---

## Completed Work

> ⚠️ **"Completed" below means the file/route exists, not that it's functional.** See `staff` route callout — a registered route with no controller behind it will crash on request, not just serve stale data. Cross-check against "Known Issues" before trusting any ✅ in this doc or in `phase.md`.

### Backend (Phase 1)
- Express server at `server.js` with CORS, dotenv, PostgreSQL (Prisma Client)
- Routes registered: `/api/auth`, `/api/customers`, `/api/bookings`, `/api/payments`, `/api/services`, `/api/staff` (⚠️ **route file exists but has no corresponding controller — will error at request time, see Known Issue #6**), `/api/support`
- Models (defined in `prisma/schema.prisma`): `User`, `Customer`, `Booking`, `Service`, `Payment`, `SupportTicket` (no `Staff` model — staff are `User` rows with `role: staff`)
- Controllers: `authController`, `bookingController`, `customerController`, `paymentController`, `supportController`, `webhookController` (no `staffController`)
- Middleware: `auth.js` (JWT verify), `roleGuard.js` (RBAC), `rateLimiter.js`
- Support tickets: full CRUD + email via nodemailer + stats endpoint

### Frontend (Phase 1)
- Full design system implemented via CSS variables in `globals.css`
- `AppShell.tsx` — auth guard, sidebar + header layout
- `Sidebar.tsx` — collapsible nav, active states, all 14 module groups
- `Header.tsx` — branch selector, theme toggle
- Stores: `authStore.ts` (JWT persist), `locationStore.ts` (branch + all seed data), `themeStore.ts`
- `lib/api.ts` — Axios with JWT interceptor, 401 auto-redirect
- `types/index.ts` — all TypeScript interfaces
- `utils/helpers.ts` — formatCurrency, formatDate, cn, validateEmail, sanitizeInput, etc.
- UI components: `Button`, `Input`, `Card`, `Modal`, `Badge`, `Loader`, `skeleton`, `PhoneInput`
- `components/forms/ClientForm.tsx` — reusable add/edit client form
- `lib/bookingWorkflow.ts` — booking state machine

### Frontend Pages (Phase 1 — seed data)
| Page | Status | Notes |
|---|---|---|
| `/auth/login` | ✅ Done | Wired to authStore → real API |
| `/dashboard` | ✅ Done | Full UI, seed data from locationStore |
| `/customers` | ✅ Done | Seed data, add/delete modal |
| `/staff` | ✅ Done | Seed data from BRANCH_STAFF, add/edit/delete |
| `/services` | ✅ Done | Local state, add/delete modal |
| `/booking` | ✅ Done | Tabbed: walkin/schedule/calendar sub-pages |
| `/invoices` | ✅ Scaffolded | Seed data from BRANCH_INVOICES |
| `/payments` | ✅ Scaffolded | Page exists |
| `/membership/*` | ✅ Scaffolded | Plans, packages, loyalty pages exist |
| `/discounts` | ✅ Scaffolded | Page exists |
| `/inventory/*` | ✅ Scaffolded | Stock, reorder, purchase-order pages exist |
| `/expense/*` | ✅ Scaffolded | List + add pages exist |
| `/reports/*` | ✅ Scaffolded | 4 sub-pages exist |
| `/analytics/*` | ✅ Scaffolded | 3 sub-pages exist |
| `/notifications/*` | ✅ Scaffolded | List + whatsapp-logs exist |
| `/settings/*` | ✅ Scaffolded | General, notifications, security, profile |
| `/support` | ✅ Scaffolded | Ticket list + new ticket pages |

---

## Key Architecture Decisions

1. **Seed data lives in `locationStore.ts`** — `BRANCH_DATA`, `BRANCH_STAFF`, `BRANCH_INVOICES`, `BRANCH_TRANSACTIONS`, `BRANCH_INVENTORY` are all exported constants. Pages read from these for Phase 1.
2. **No Redux** — Zustand only. Three stores: auth, location, theme.
3. **All HTTP calls via `lib/api.ts`** — never use fetch directly.
4. **CSS variables for theming** — no hardcoded dark overrides in components.
5. **`cn()` from `utils/helpers.ts`** — used for conditional class merging (not clsx directly).
6. **RESOLVED — role enum decision:** Backend `User.role` enum is expanded to `admin | manager | receptionist | stylist` to match the frontend types and PRD target users exactly. The old 2-value `admin | staff` enum is deprecated. `roleGuard.js` must be updated to check against the 4-value enum — until it is, any route gated on `manager`/`receptionist`/`stylist` specifically will never match and will incorrectly reject those users. This is now a Phase 2 blocking task (see Pending Tasks).
7. **Booking model is simplified** — current `Booking.js` has `service: String` (not array of service refs). Needs migration in Phase 2 to match frontend `BookingService[]` type.
8. **Staff is not a separate model** — currently staff are `User` documents with role `staff`. A dedicated `Staff` model is needed for Phase 2 (specialization, commissionRate, workingDays, etc.).
9. **RESOLVED — booking/payment status vocab duplication:** `features.md` previously listed two unrelated status vocabularies for booking (`Booked→Checked_In→In_Service→Completed` workflow vs. `pending|confirmed|in-progress|completed|cancelled|no-show` status field) with no mapping. Decision: the workflow states describe the *in-progress lifecycle* of an active appointment; the status field is the *persisted DB field* and is the only one stored on the `Booking` document. Mapping: `pending`→not yet Booked/confirmed, `confirmed`→`Booked`, `in-progress`→`Checked_In`/`In_Service`, `completed`→`Completed`, plus two states the workflow diagram didn't have room for (`cancelled`, `no-show`). Same fix applied to payment: `Payment.status` (`pending|paid|refunded`) is the source of truth; `Booking.paymentStatus` (`unpaid|partial|paid`) is a derived summary field, not an independent enum. See `features.md` for the updated mapping table.

---

## Known Issues / Bugs

1. **Staff model missing** — `/api/staff` route exists but no dedicated Staff model; currently likely using User model. Need to create `Staff.js` model with full fields.
2. **Booking model mismatch** — `Booking.js` has `service: String` but frontend expects `services: BookingService[]`. Needs schema update.
3. **Customer model incomplete** — missing `gender`, `dateOfBirth`, `address`, `totalVisits`, `totalSpent`, `membershipTier` fields vs frontend `Customer` type.
4. **API response format inconsistency** — some controllers return raw data (bookingController, customerController) instead of `{ success, data, message }` standard format.
5. **Support ticketId format** — controller generates `TKT-{timestamp36}{random}` but PRD specifies `TKT-YYYYMMDD-XXXX` format.
6. **No Staff controller** — `routes/staff.js` exists but no `staffController.js` in controllers folder.
7. **Services edit not wired** — services page `Edit` button calls `alert()` instead of opening edit modal.
8. **`/expenses` duplicate route** — both `/expense` and `/expenses` folders exist in app directory.

---

## Pending Tasks (Phase 2)

- [ ] Migrate `User.role` enum from `admin|staff` to `admin|manager|receptionist|stylist`; write a Prisma migration (`npx prisma migrate dev`) for existing rows; update `roleGuard.js` checks accordingly (blocking — see Known Issue #6/Decision #6 above)
- [ ] Add `wallet` to `Payment.method` enum (currently `cash|card|upi|other`; PRD §5 Payments requires it) — or, if wallet is intentionally out of scope for Phase 2, remove it from `prd.md` instead. Pick one; right now the two docs disagree.
- [ ] Add `Staff` model to `prisma/schema.prisma` with full fields (specialization, commissionRate, workingDays, isActive), run a migration, generate the client
- [ ] Create `staffController.js` with full CRUD using `prisma.staff.*` calls (**note: `routes/staff.js` already references this file — it does not exist yet, so the current route will throw on any request until this is built**)
- [ ] Convert `SupportTicket.messages[]` from its old embedded-array design into a proper `SupportMessage` model with a `ticketId` foreign key (Postgres has no native embedded-document array type; this needs a real join)
- [ ] Update `Customer.js` model to add missing fields
- [ ] Update `Booking.js` model to support `services[]` array
- [ ] Standardise all controller responses to `{ success, data, message }` format
- [ ] Create missing models: Inventory, Expense, Membership, Discount
- [ ] Create missing controllers and routes for above models
- [ ] Wire `/customers` page to live API (replace seed data)
- [ ] Wire `/staff` page to live API
- [ ] Wire `/services` page to live API
- [ ] Wire `/booking/walkin` and `/booking/schedule` to live API
- [ ] Wire `/booking/list` to live API
- [ ] Wire `/invoices` to live API
- [ ] Wire `/payments` to live API
- [ ] Wire `/support` and `/support/new` to live API
- [ ] Fix services page edit button (open edit modal instead of alert)
- [ ] Remove duplicate `/expenses` folder (keep `/expense`)
- [ ] Fix ticketId format to `TKT-YYYYMMDD-XXXX`

---

## Files Created / Modified

### Created
- `Crm-Frontend/src/app/` — all page files (see table above)
- `Crm-Frontend/src/components/layout/AppShell.tsx`
- `Crm-Frontend/src/components/layout/Sidebar.tsx`
- `Crm-Frontend/src/components/layout/Header.tsx`
- `Crm-Frontend/src/components/forms/ClientForm.tsx`
- `Crm-Frontend/src/components/ui/` — Button, Input, Card, Modal, Badge, Loader, skeleton, PhoneInput
- `Crm-Frontend/src/store/authStore.ts`
- `Crm-Frontend/src/store/locationStore.ts`
- `Crm-Frontend/src/store/themeStore.ts`
- `Crm-Frontend/src/lib/api.ts`
- `Crm-Frontend/src/lib/bookingWorkflow.ts`
- `Crm-Frontend/src/types/index.ts`
- `Crm-Frontend/src/utils/helpers.ts`
- `Crm-Frontend/src/utils/invoicePDF.ts`
- `Crm-Frontend/src/app/globals.css`
- `Backend-all-in-one/server.js`
- `Backend-all-in-one/src/config/db.js`
- `Backend-all-in-one/src/models/` — User, Customer, Booking, Service, Payment, SupportTicket
- `Backend-all-in-one/src/controllers/` — auth, booking, customer, payment, support, webhook
- `Backend-all-in-one/src/middleware/` — auth, roleGuard, rateLimiter
- `Backend-all-in-one/src/routes/` — auth, bookings, customers, payments, services, staff, support, webhooks
- `.amazonq/rules/phase.md` — this file
- `.amazonq/rules/memory.md` — this file

---

## Important Notes

- **Branch selector** is in the Header; persisted via `location-storage` Zustand key. All dashboard/staff/invoice/inventory/transaction data is scoped to `branchId`.
- **Dark mode** toggled via `.dark` class on `<html>`. Managed by `themeStore`. All colors use CSS variables.
- **IntersectionObserver pattern** used for scroll-triggered animations (progress bars, donut chart) — established in dashboard page.
- **Avatar colors** are deterministic from `name.charCodeAt(0) % colors.length` — used in dashboard and customers pages.
- **Price storage**: Service prices stored in paise (×100), displayed in rupees — getter/setter in `Service.js` model.
- **Tailwind config** uses `darkMode: 'class'` — confirmed in `tailwind.config.ts`.
- **`seed.js`** exists in backend root — likely seeds admin user and sample data. Review before Phase 2 API testing.
