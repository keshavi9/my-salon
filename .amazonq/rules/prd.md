# Product Requirement Document — Hair Ahmedabad

## 1. Project Overview

SalonPro is a full-stack Salon Management & CRM platform built for **Hair Ahmedabad**, a multi-branch premium salon chain in Ahmedabad, Gujarat. The system covers every operational touchpoint: bookings, billing, staff, inventory, memberships, analytics, and customer engagement.

---

## 2. Business Objectives

- Digitise and centralise all salon operations across multiple branches.
- Reduce manual effort for front-desk staff through smart booking workflows.
- Increase customer retention via loyalty, membership, and WhatsApp notifications.
- Give management real-time visibility into revenue, staff performance, and inventory.
- Provide customers a self-service mobile app for booking and wallet management.

---

## 3. Target Users

| Role | Description |
|---|---|
| Admin | Full access to all modules, all branches |
| Manager | Branch-level access, no system settings |
| Receptionist | Bookings, walk-ins, invoices, customer lookup |
| Stylist | View own schedule, mark service complete |
| Customer (Mobile) | Book services, manage wallet, view history |

---

## 4. Project Scope

### In Scope
- CRM Frontend (Next.js) — admin/staff web dashboard
- Backend API (Node.js + Express + PostgreSQL via Prisma)
- Customer Mobile App (React Native / Expo)
- Instagram Bookings micro-frontend
- Multi-branch support (Main, Satellite, SG Highway)

### Out of Scope
- Payment gateway integration (Razorpay/Stripe) — future phase
- WhatsApp Business API — future phase
- Franchise management beyond 3 branches — future phase

---

## 5. Functional Requirements

### Authentication
- JWT-based login/logout for admin and staff
- Role-based access control (RBAC)
- Password hashing with bcryptjs
- Token stored in localStorage; auto-redirect on 401

### Dashboard
- Per-branch metrics: Revenue, Bookings, Occupancy Rate, New Customers
- Today's appointment timeline with status badges
- Staff tracker with workload bars
- Weekly performance bar chart
- Top products, recent reviews, live activity feed
- Service analytics donut chart

### Bookings
- Walk-in booking (immediate, no pre-schedule)
- Scheduled booking (date + time slot)
- Calendar view (day/week)
- Booking list with filters
- POS (Point of Sale) checkout
- Booking workflow states: Booked → Checked_In → In_Service → Completed
- Payment models: Pre-Paid and Post-Paid

### Customers (Clients)
- Create, view, edit, search customers
- Loyalty points tracking
- Membership tier: Silver / Gold / Platinum
- Visit history and total spend
- Notes per customer

### Services
- CRUD for services
- Categories: Hair, Nails, Facial, Waxing
- Price stored in paise, displayed in rupees
- Duration in minutes
- Active/inactive toggle

### Staff
- CRUD for staff members
- Roles: Stylist, Assistant, Manager
- Specialisation tags
- Commission rate
- Working days schedule
- Active/inactive toggle

### Invoices
- Auto-generated per completed booking
- GST calculation
- PDF export (jsPDF + html2canvas)
- WhatsApp share flag
- Status: Paid / Pending

### Payments
- Methods: Cash, Card, UPI (Phase 2, matches current `Payment.method` enum `cash|card|upi|other`); Wallet (Phase 3 — not yet in the backend enum, do not build UI for it until the model is updated)
- Status: Pending, Paid, Refunded
- Linked to booking and customer

### Membership
- Plans: Silver, Gold, Platinum with price, duration, benefits, discount
- Packages: bundled services with validity
- Loyalty: points earn/redeem rules

### Discounts
- Coupon codes (percentage or fixed)
- Min purchase, max discount cap
- Usage limit and validity dates

### Inventory
- Product stock management
- Low-stock alerts
- Reorder list
- Purchase orders
- Consumable vs retail products

### Expenses
- Add and list salon expenses
- Categories, payment method, date, receipt

### Reports
- Daily reconciliation
- Transaction history
- Business trend (weekly/monthly)
- Stylist performance/progress

### Analytics
- Revenue analytics with charts
- Client insights (retention, frequency)
- Service popularity breakdown

### Notifications
- In-app notification centre
- WhatsApp message logs

### Settings
- General salon settings
- Notification preferences
- Security (password change)
- Profile management

### Support
- Create and track support tickets
- Categories: billing, technical, feature, bug, question
- Priority levels: low, medium, high, critical
- Status: open, in-progress, resolved, closed
- Email notification on ticket creation

### Multi-Branch
- Branch selector in header (Main, Satellite, SG Highway)
- All dashboard data scoped to selected branch
- Branch-specific staff, inventory, invoices, transactions

---

## 6. Non-Functional Requirements

- **Performance**: API responses < 500ms; frontend LCP < 2s
- **Security**: JWT auth, bcrypt passwords, no secrets in code, CORS restricted
- **Scalability**: Modular architecture, easy to add new branches/features
- **Accessibility**: WCAG 2.1 AA compliant UI
- **Responsiveness**: Works on desktop (1280px+) and tablet (768px+). **Mobile web (<768px) is explicitly out of scope for the CRM dashboard** — the sidebar has no collapsed/mobile variant (see `design.md` §9). Mobile users are served by the separate React Native app, not a responsive web view. Don't build for `sm` breakpoint in the CRM beyond incidental stacking.
- **Dark Mode**: Full dark/light theme support via CSS variables
- **Reliability**: Graceful error handling, no stack traces exposed to client

---

## 7. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 19.2, TypeScript, Tailwind CSS |
| State | Zustand (persist middleware) |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| PDF | jsPDF + html2canvas |
| Icons | Lucide React |
| Backend | Node.js, Express 4, PostgreSQL 16, Prisma 6 |
| Auth | JWT (jsonwebtoken), bcryptjs |
| Mobile | React Native (Expo) |
| HTTP Client | Axios |
