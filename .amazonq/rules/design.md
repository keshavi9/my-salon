# Design System — SalonPro

## 1. Brand Identity

**Salon Name:** Hair Ahmedabad / SalonPro
**Brand Personality:** Premium, feminine, modern, warm

---

## 2. Color Palette

### Primary (Salon)

**Updated 2026-07-14 (palette refresh):** Migrated from soft lavender to modern luxury purple (#7B2CBF) + magenta accent (#B5179E) following the 60/30/10 rule. Previous scale (soft lavender `#6A0DAD` base) is replaced in full.

| Token | Hex | Usage |
|---|---|---|
| `salon-50` | `#FAFAFC` | Page backgrounds (60% zone) |
| `salon-100` | `#F3E8FF` | Hover fills, light tag backgrounds |
| `salon-200` | `#E9D5FF` | Subtle borders, secondary fills |
| `salon-300` | `#D8B4FE` | Mid-tone accents |
| `salon-400` | `#C084FC` | Secondary buttons, tags |
| `salon-500` | `#A855F7` | Hover state between 400 and 600 |
| `salon-600` | `#9333EA` | Active states, sidebar active text |
| `salon-700` | `#7B2CBF` | Primary brand — CTA buttons, sidebar active |
| `salon-800` | `#5A189A` | Hover on primary, pressed state |
| `salon-900` | `#3B0764` | Deep brand, darkest accent |

**Named semantic token (not part of the numeric scale):**
| Token | Hex | Usage |
|---|---|---|
| `salon-blush` | `#B5179E` | Magenta accent — highlights, gradient end, dark-mode sidebar active text |

### Support Colors
| Token | Hex | Usage |
|---|---|---|
| `support-sage` | `#22C55E` | Success, active, approved states |
| `support-gold` | `#F59E0B` | Warning, pending, break states |
| `support-sky` | `#3B82F6` | Info, bookings |
| `support-plum` | `#5A189A` | Deep accents, gradients |

### Semantic
| State | Color |
|---|---|
| Success / Active / Approved | `#22C55E` (green-500) |
| Warning / Pending / Break | `#F59E0B` (amber-400) |
| Error / Cancelled | `#EF4444` (red-500) |
| Info / Completed | `#3B82F6` (blue-500) |
| Upcoming | `#7B2CBF` (brand purple) |

### CSS Variables (Light Mode)
```css
--bg:             #FAFAFC
--bg-secondary:   #FFFFFF
--border:         #E5E7EB
--text-primary:   #111111
--text-secondary: #6B7280
--hover:          #EFE8F8
--accent:         #7B2CBF
--accent-dark:    #5A189A
--accent-light:   #F3E8FF
--sidebar-bg:          #F4F4F8
--sidebar-active-bg:   #EFE8F8
--sidebar-active-text: #7B2CBF
--sidebar-text:        #374151
--header-bg:     #F4F4F8
--header-border: #E5E7EB
```

### CSS Variables (Dark Mode)
```css
--bg:             #0F0F14
--bg-secondary:   #1A1A23
--border:         #2E2E38
--text-primary:   #FFFFFF
--text-secondary: #A1A1AA
--hover:          #2A1F3D
--accent:         #9D4EDD
--accent-dark:    #7B2CBF
--accent-light:   #2A1F3D
--sidebar-bg:          #16161D
--sidebar-active-bg:   #2A1F3D
--sidebar-active-text: #C084FC  /* salon-400 */
--sidebar-text:        #A1A1AA
--header-bg:     #16161D
--header-border: #2E2E38
```

---

## 3. Typography

- **Font Family:** System default (Next.js default sans-serif stack)
- **Scale:**

| Size | Class | Usage |
|---|---|---|
| 10px | `text-[10px]` | Labels, badges, micro text |
| 12px | `text-xs` | Sub-labels, helper text |
| 13px | `text-[13px]` | Sidebar nav items |
| 14px | `text-sm` | Body text, table rows |
| 16px | `text-base` | Section headings |
| 18px | `text-lg` | Card titles |
| 24px | `text-2xl` | Metric values (donut center) |
| 30px | `text-3xl` | KPI metric numbers |

- **Weights:** `font-medium` (nav), `font-semibold` (headings), `font-bold` (metrics, KPIs)
- **Tracking:** `tracking-tight` on large headings

---

## 4. Spacing & Layout

- **Sidebar width:** `w-64` (256px), fixed left
- **Header height:** `h-16` (64px), fixed top
- **Content area:** `ml-64 pt-16` with `px-6 py-6`
- **Page background:** `bg-[#FBF4F8]` (light) / `dark:bg-transparent`
- **Section gap:** `space-y-6`
- **Card padding:** `p-5` or `px-5 py-4`
- **Grid gaps:** `gap-4` (metrics), `gap-6` (sections)

---

## 5. Component Patterns

### Cards
```
rounded-2xl border border-white/80 bg-white
shadow-[0_18px_45px_rgba(36,21,26,0.07)]
dark:border-white/10 dark:bg-white/[0.04]
```
- Hover: `-translate-y-1` + deeper shadow
- Top accent bar: `h-0.5 bg-gradient-to-r` in brand gradient

### Buttons (Primary)
```
bg-[#7B2CBF] text-white rounded-xl px-5 h-11
hover:bg-[#5A189A] hover:-translate-y-0.5
shadow-md hover:shadow-lg transition
```

### Buttons (Secondary)
```
bg-white border border-[#7B2CBF] text-[#7B2CBF] rounded-xl px-5 h-11
hover:bg-[#EFE8F8] transition
```

### Badges / Status Pills
```
rounded-full px-2.5 py-1 text-xs font-semibold
```
- Approved/Active: `bg-green-50 text-green-600`
- Pending/Break: `bg-amber-50 text-amber-600`
- Cancelled/Error: `bg-red-50 text-red-500`
- Completed/Info: `bg-blue-50 text-blue-600`
- Upcoming/Booked: `bg-purple-50 text-[#7B2CBF]`
- Done: `bg-gray-100 text-gray-500`

### Sidebar Nav Items
- Active: `bg-[#EFE8F8] text-[#7B2CBF]` with `w-1.5 h-1.5` accent dot
- Hover: `bg-[#EFE8F8]`
- Sub-items indented with `ml-4 pl-3` and left border `border-l-2`

### Section Headers (inside cards)
- Icon: `h-7 w-7 rounded-lg bg-gradient-to-br` in brand gradient
- Title: `text-base font-semibold text-[#111111]`
- Subtitle: `text-xs text-gray-500`

### Avatar / Initials
- Circle with `avatarColor(name)` background (deterministic from char code)
- Initials: first letter of each word, max 2 chars, uppercase

---

## 6. Gradients

| Name | Value |
|---|---|
| Primary | `from-[#7B2CBF] to-[#9333EA]` |
| Magenta | `from-[#9333EA] to-[#B5179E]` (salon-600 → salon-blush) |
| Sage | `from-[#22C55E] to-[#3B82F6]` |
| Gold | `from-[#F59E0B] to-[#EF4444]` |
| Sky | `from-[#3B82F6] to-[#5A189A]` |

---

## 7. Animations

- **Intersection Observer** pattern: elements animate in when scrolled into view
- Progress bars: `transition-all duration-1000 ease-out` from `0%` to actual value
- Donut chart segments: `transition duration-1000` with `transitionDelay` per segment
- Bar chart: `transition-all duration-700`
- Hover cards: `transition-all duration-300`
- Live indicator: `animate-ping` on emerald dot

---

## 8. Dark Mode

- Toggled via `.dark` class on `<html>` (Tailwind `darkMode: 'class'`)
- Managed by `themeStore.ts` (Zustand)
- All colors use CSS variables — no hardcoded dark overrides in components
- Dark sidebar: `#16161D` bg, `#C084FC` active text (salon-400)

---

## 9. Responsive Breakpoints

| Breakpoint | Width | Notes |
|---|---|---|
| `sm` | 640px | Stack → row layouts |
| `lg` | 1024px | 2-column grids |
| `xl` | 1280px | 3–4 column grids, sidebar always visible |

- Sidebar is always fixed on desktop; **there is no mobile sidebar and none is planned** — mobile web is explicitly out of scope for the CRM (see `prd.md` Non-Functional Requirements). Mobile users get the separate React Native app, not a responsive CRM view. The `sm` breakpoint below exists for incidental content stacking only, not for a mobile nav pattern.
- Metric cards: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`

---

## 10. Scrollbar

```css
::-webkit-scrollbar { width: 5px; height: 5px; }
::-webkit-scrollbar-thumb { background: var(--border); border-radius: 99px; }
::-webkit-scrollbar-thumb:hover { background: var(--accent); }
```

---

## 11. Icons

- Library: **Lucide React** (`lucide-react`)
- Size in sidebar: `size={18}` (parent), `size={14}` (sub-items)
- Size in card headers: `size={13}`
- Size in metric icons: `size={19}`
- Always white when inside gradient icon containers

---

## 12. Form Inputs

- Library: React Hook Form + Zod
- Component: `Input.tsx`, `PhoneInput.tsx` in `components/ui/`
- Style: `rounded-xl border border-[--border] bg-white px-4 py-2.5 text-sm`
- Focus: `ring-2 ring-salon-400`
- Error: red border + error message below field

---

## 13. Logo

- Icon: `<Scissors>` from Lucide inside `w-9 h-9 rounded-xl` with primary gradient
- Text: "SalonPro" bold + "Salon Management" sub-label
- Located at top of sidebar
- Image: `public/images/salonlogo.png`
