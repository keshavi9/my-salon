# Features — SalonPro Module Reference

## 1. Authentication Module

### Routes
- `POST /api/auth/login` — email + password → JWT token + user object
- `POST /api/auth/logout` — client-side token removal

### Frontend
- `/auth/login` — login page
- `authStore.ts` — Zustand store with persist; holds `user`, `token`, `isAuthenticated`
- Axios interceptor attaches `Authorization: Bearer <token>` to every request
- 401 response → auto-redirect to `/auth/login`

### Validation
- Email: required, valid format
- Password: required, min 6 chars

### RBAC
- Roles: `admin`, `staff` (backend); `admin`, `manager`, `receptionist`, `stylist` (frontend types)
- Route guards via `roleGuard.js` middleware

---

## 2. Dashboard Module

### Page: `/dashboard`

**Sections:**
1. Header — greeting, date, "New Booking" CTA
2. Metric Cards (4) — Revenue, Bookings, Occupancy Rate, New Customers
3. Today's Timeline — appointment list with status badges (Done / Active / Next / Booked)
4. Staff Tracker — workload progress bars per staff member
5. Weekly Performance — animated bar chart (Mon–Today)
6. Top Products — ranked retail items with sales/stock/trend
7. Recent Reviews — star ratings + comments
8. Live Activity — real-time notification feed
9. Service Analytics — animated donut chart + breakdown cards

**Data Source:** `locationStore.ts` → `BRANCH_DATA[branchId]`

**Branch Selector:** Header component; persisted in `location-storage` via Zustand

---

## 3. Booking Module

### Routes (Frontend)
| Path | Description |
|---|---|
| `/booking` | Booking overview |
| `/booking/walkin` | Walk-in booking form |
| `/booking/schedule` | Scheduled booking form |
| `/booking/calendar` | Calendar view |
| `/booking/list` | All bookings with filters |
| `/booking/new` | New booking (from dashboard CTA) |
| `/booking/pos` | POS checkout |

### API Endpoints
- `GET /api/bookings` — list with filters (status, date, staff)
- `POST /api/bookings` — create booking
- `PUT /api/bookings/:id` — update status/details
- `DELETE /api/bookings/:id` — cancel booking

### Booking Workflow States
```
Booked → Checked_In → In_Service → Completed
```

### Booking Types
- `Scheduled` — pre-booked with date/time
- `Walk_In` — immediate, no prior appointment

### Payment Models
- `Pre-Paid` — payment collected at booking
- `Post-Paid` — payment collected after service

### Status Values
`pending` | `confirmed` | `in-progress` | `completed` | `cancelled` | `no-show`

This is the field actually persisted on `Booking.status`. The "Booking Workflow States" above describe the in-progress lifecycle of a *confirmed* booking on the day of service — they are a UI/state-machine concept, not a separate DB field. Mapping:

| Workflow state | `Booking.status` |
|---|---|
| (not yet booked) | `pending` |
| `Booked` | `confirmed` |
| `Checked_In` | `in-progress` |
| `In_Service` | `in-progress` |
| `Completed` | `completed` |
| (no workflow equivalent) | `cancelled`, `no-show` |

### Payment Status
`Booking.paymentStatus`: `unpaid` | `partial` | `paid` — a derived summary field on the booking, computed from its linked `Payment` records. Not an independent source of truth; see Payment Module (`Payment.status`) below for the actual per-transaction status.

### Validation
- Customer: required (existing or new)
- Service: at least one required
- Staff: required
- Date + time: required for scheduled; not required for walk-in
- Amount: must be ≥ 0

---

## 4. Customer (Client) Module

### Routes (Frontend)
| Path | Description |
|---|---|
| `/customers` | Customer list with search |
| `/customers/add` | Add new customer form |

### API Endpoints
- `GET /api/customers` — list with search/filter
- `POST /api/customers` — create customer
- `GET /api/customers/:id` — customer detail
- `PUT /api/customers/:id` — update customer
- `DELETE /api/customers/:id` — soft delete

### Fields
- `name` (required), `phone` (required, unique), `email`, `gender`, `dateOfBirth`, `address`, `loyaltyPoints`, `notes`

### Business Logic
- Phone must be unique across all customers
- Loyalty points auto-updated on booking completion
- Membership tier derived from total spend

### Form Component
`ClientForm.tsx` — reusable for both add and edit

---

## 5. Service Module

### Routes (Frontend)
- `/services` — service list with category filter

### API Endpoints
- `GET /api/services` — list (filter by category, isActive)
- `POST /api/services` — create
- `PUT /api/services/:id` — update
- `DELETE /api/services/:id` — deactivate

### Fields
- `name` (required, unique), `category` (Hair|Nails|Facial|Waxing), `price` (rupees, stored as paise), `duration` (minutes), `isActive`

### Business Logic
- Price getter/setter converts between paise (storage) and rupees (display)
- Inactive services hidden from booking forms

---

## 6. Staff Module

### Routes (Frontend)
| Path | Description |
|---|---|
| `/staff` | Staff list |
| `/staff/add` | Add staff form |

### API Endpoints
- `GET /api/staff` — list
- `POST /api/staff` — create
- `PUT /api/staff/:id` — update
- `DELETE /api/staff/:id` — deactivate

### Fields
- `name`, `email`, `phone`, `role` (stylist|assistant|manager), `specialization[]`, `commissionRate`, `isActive`, `workingDays[]`

### Business Logic
- Staff availability checked against working days during booking
- Commission calculated on completed bookings

---

## 7. Invoice Module

### Routes (Frontend)
- `/invoices` — invoice list with filters

### Features
- Auto-generated on booking completion
- GST included in amount display
- PDF export via `invoicePDF.ts` (jsPDF + html2canvas)
- WhatsApp share flag per invoice
- Status: Paid / Pending

### Invoice Fields
- `id`, `client`, `date`, `services`, `amount`, `gst`, `status`, `whatsapp`, `phone`, `email`

---

## 8. Payment Module

### Routes (Frontend)
- `/payments` — payment history

### API Endpoints
- `GET /api/payments` — list
- `POST /api/payments` — record payment
- `PUT /api/payments/:id` — update status (refund)

### Fields
- `booking` (FK → `Booking.id`), `customer` (FK → `Customer.id`), `amount`, `method` (`cash|card|upi|other` — **`wallet` is Phase 3, not yet in this enum**; PRD payments section was corrected to match), `status` (pending|paid|refunded) — this is the authoritative payment status; `Booking.paymentStatus` is a derived rollup, see Booking Module above

---

## 9. Membership Module

### Routes (Frontend)
| Path | Description |
|---|---|
| `/membership` | Overview |
| `/membership/plans` | Membership plan CRUD |
| `/membership/packages` | Service packages CRUD |
| `/membership/loyalty` | Loyalty rules |

### Plan Fields
- `name`, `tier` (silver|gold|platinum), `price`, `duration` (days), `benefits[]`, `discount` (%), `isActive`

### Package Fields
- `name`, `services[]` (serviceId + quantity), `totalValue`, `sellingPrice`, `validityDays`, `isActive`

### Loyalty
- Points earned per rupee spent
- Points redeemable as discount on next visit

---

## 10. Discount Module

### Routes (Frontend)
- `/discounts` — discount list and CRUD

### Fields
- `code`, `type` (percentage|fixed), `value`, `minPurchase`, `maxDiscount`, `validFrom`, `validTo`, `usageLimit`, `usedCount`, `isActive`

### Validation
- Code: unique, alphanumeric
- Value: > 0; percentage ≤ 100
- validTo must be after validFrom

---

## 11. Inventory Module

### Routes (Frontend)
| Path | Description |
|---|---|
| `/inventory` | Stock list |
| `/inventory/reorder` | Low-stock reorder list |
| `/inventory/purchase-order` | Purchase orders |

### Fields
- `name`, `sku`, `category`, `stock`, `minThreshold`, `unit`, `costPrice`, `sellingPrice`, `isConsumable`, `usagePerService`

### Business Logic
- Alert triggered when `stock ≤ minThreshold`
- Consumable items auto-deducted on service completion (future)

---

## 12. Expense Module

### Routes (Frontend)
| Path | Description |
|---|---|
| `/expense` | Expense list |
| `/expense/add` | Add expense form |

### Fields
- `category`, `description`, `amount`, `paymentMethod`, `date`, `receipt`, `notes`

---

## 13. Reports Module

### Routes (Frontend)
| Path | Description |
|---|---|
| `/reports` | Daily reconciliation |
| `/reports/transactions` | Transaction history |
| `/reports/business-trend` | Weekly/monthly trend charts |
| `/reports/stylist-progress` | Per-stylist performance |

### Data
- Sourced from `BRANCH_TRANSACTIONS` and booking/payment aggregates
- Date range filters on all report pages

---

## 14. Analytics Module

### Routes (Frontend)
| Path | Description |
|---|---|
| `/analytics` | Overview with Recharts |
| `/analytics/revenue` | Revenue breakdown |
| `/analytics/client-insights` | Retention, frequency, LTV |

---

## 15. Notification Module

### Routes (Frontend)
| Path | Description |
|---|---|
| `/notifications` | All notifications |
| `/notifications/whatsapp-logs` | WhatsApp message delivery logs |

### Notification Types
`booking` | `payment` | `reminder` | `birthday` | `system`

### Channels
`whatsapp` | `sms` | `email` | `push`

---

## 16. Settings Module

### Routes (Frontend)
| Path | Description |
|---|---|
| `/settings` | General settings |
| `/settings/notifications` | Notification preferences |
| `/settings/security` | Password change |
| `/settings/profile` | Profile edit |

---

## 17. Support Module

### Routes (Frontend)
| Path | Description |
|---|---|
| `/support` | Ticket list with stats |
| `/support/new` | Create new ticket |

### API Endpoints
- `GET /api/support` — list tickets
- `POST /api/support` — create ticket (sends email)
- `GET /api/support/:id` — ticket detail + messages
- `PUT /api/support/:id` — update status/reply
- `DELETE /api/support/:id` — close ticket

### Fields
- `ticketId` (auto-generated), `subject`, `category`, `priority`, `status`, `description`, `adminEmail`, `attachments[]` (Postgres native text array — fine as-is), `messages[]` (**schema change for Prisma: this was an embedded-document array under the old NoSQL design; it needs to become a separate `SupportMessage` model with a FK to `SupportTicket.id`, since Postgres doesn't support arrays of objects the way Mongo did**), `assignedTo`, `resolvedAt`

### Business Logic
- `ticketId` format: `TKT-YYYYMMDD-XXXX`
- Email sent to `adminEmail` and `DEV_TEAM_EMAIL` on creation
- Status transitions: open → in-progress → resolved → closed

---

## 18. Multi-Branch Module

### Store: `locationStore.ts`
- `branchId`: `'main'` | `'satellite'` | `'sghighway'`
- `setBranch(id)` — persisted in `location-storage`

### Branch Data
- `BRANCH_DATA` — dashboard metrics, timeline, staff, charts per branch
- `BRANCH_STAFF` — staff list per branch
- `BRANCH_INVOICES` — invoices per branch
- `BRANCH_TRANSACTIONS` — transactions per branch
- `BRANCH_INVENTORY` — inventory per branch

---

## 19. Mobile App (Customer)

### Screens
| Stack | Screens |
|---|---|
| Auth | Splash, Login, OTP |
| Home | Home, Salon List, Salon Detail, Search |
| Booking | Service Selection, Staff Selection, Slot Selection, Summary, Payment, Success |
| Bookings | Booking List, Booking Detail, Reschedule, Write Review |
| Profile | Profile, Edit Profile, Addresses, Add Address, Notifications, Settings, Help |
| Wallet | Wallet Home, Add Money, Transaction History, Referral |

### State
- `authStore`, `bookingStore`, `notificationStore` (Zustand)

### Storage
- AsyncStorage via `services/storage/index.ts`
