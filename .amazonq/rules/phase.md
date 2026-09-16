# Development Phases — SalonPro

## Phase 1 — Foundation & Core CRM ✅ COMPLETED

### Backend
- [x] Express server with CORS, dotenv, PostgreSQL connection (Prisma)
- [x] Auth module: JWT login/register/me, bcrypt password hashing
- [x] Auth middleware (`auth.js`), RBAC middleware (`roleGuard.js`), rate limiter
- [x] Models: User, Customer, Booking, Service, Payment, SupportTicket
- [x] Controllers: auth, booking, customer, payment, support, webhook
- [x] Routes: auth, bookings, customers, payments, services, support, webhooks
- [~] Routes: staff — **file exists but is non-functional; no `staffController.js` backs it, so any request to `/api/staff` currently throws. Do not treat this as done — see `memory.md` Known Issues.**

### Frontend — Layout & Shell
- [x] Next.js App Router setup with TypeScript + Tailwind
- [x] Global CSS variables (light/dark mode)
- [x] AppShell with auth guard redirect
- [x] Sidebar with collapsible nav groups, active states, brand logo
- [x] Header component
- [x] All Zustand stores: authStore, locationStore (with full branch seed data), themeStore
- [x] Axios instance with JWT interceptor and 401 auto-redirect (`lib/api.ts`)
- [x] Full TypeScript types (`types/index.ts`)
- [x] Utility functions: formatCurrency, formatDate, cn, validateEmail, sanitizeInput, etc.
- [x] UI primitives: Button, Input, Card, Modal, Badge, Loader, Skeleton, PhoneInput
- [x] ClientForm reusable form component

### Frontend — Pages (seed-data driven, no live API)
- [x] `/auth/login` — login page with demo quick-login
- [x] `/dashboard` — full dashboard: metrics, timeline, staff tracker, weekly bar chart, top products, reviews, live activity, service analytics donut
- [x] `/customers` — client list with search, add modal (ClientForm), branch-scoped seed data
- [x] `/staff` — staff grid with add/edit/delete modal, working days, branch-scoped
- [x] `/services` — service cards with category filter, add modal
- [x] `/booking` — tabbed page embedding walkin/schedule/calendar sub-pages
- [x] All other module pages scaffolded (invoices, payments, membership, discounts, inventory, expense, reports, analytics, notifications, settings, support)

### Booking Workflow
- [x] `lib/bookingWorkflow.ts` — booking state machine types and logic

---

## Phase 2 — Live API Integration 🔄 CURRENT PHASE

Connect all frontend pages to the real backend API. Replace seed/mock data with live API calls.

### Priority Order
1. **Auth** — already wired (authStore calls `/api/auth/login`)
2. **Customers** — wire `/customers` page to `GET/POST/DELETE /api/customers`
3. **Services** — wire `/services` page to `GET/POST/DELETE /api/services`
4. **Staff** — wire `/staff` page to `GET/POST/PUT/DELETE /api/staff`
5. **Bookings** — wire booking forms and list to `/api/bookings`
6. **Payments** — wire `/payments` to `/api/payments`
7. **Support** — wire `/support` and `/support/new` to `/api/support`
8. **Dashboard** — replace BRANCH_DATA seed with aggregated API data (or keep seed for demo)

### Tasks
- [ ] Add loading states and error toasts on all API-connected pages
- [ ] Standardise all API responses to `{ success, data, message }` format in controllers
- [ ] Add missing backend controllers: staff (CRUD), services (CRUD), inventory, expense, membership, discount
- [ ] Add missing backend models: Staff (separate from User), Inventory, Expense, Membership, Discount
- [ ] Add missing backend routes and wire to server.js
- [ ] Implement search/filter query params in GET endpoints
- [ ] Add pagination to list endpoints

---

## Phase 3 — Advanced Features 🔜 UPCOMING

- Invoice PDF generation (jsPDF + html2canvas) wired to real booking data
- WhatsApp notification logs UI
- Membership plans and packages CRUD with live API
- Loyalty points calculation on booking completion
- Discount code validation at POS
- Inventory low-stock alerts
- Reports with real aggregated data (daily reconciliation, business trend)
- Analytics charts with Recharts using real data
- Settings: password change, profile edit wired to API

---

## Phase 4 — Mobile App & Instagram Bookings 🔜 UPCOMING

- Customer mobile app (React Native / Expo) — auth, booking flow, wallet
- Instagram bookings micro-frontend
- Push notifications

---

## Phase 5 — Production Hardening 🔜 UPCOMING

- Payment gateway integration (Razorpay)
- WhatsApp Business API
- Full WCAG 2.1 AA audit
- Performance optimisation (LCP < 2s)
- CI/CD pipeline
- Environment-specific configs
