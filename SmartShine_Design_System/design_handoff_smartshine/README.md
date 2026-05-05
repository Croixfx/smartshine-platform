# Handoff: SmartShine Platform — Full UI Kit

**Date:** May 2026  
**Project:** SmartShine Car Wash Platform, Kigali, Rwanda  
**Stack:** React 18 + Vite + Tailwind CSS (frontend) · Django 4.2 + DRF (backend)

---

## About the Design Files

The HTML files bundled in this package are **high-fidelity design references** — interactive prototypes built to show exact look, feel, and behavior. They are **not production code** to copy directly.

Your task is to **recreate these designs in the existing React + Tailwind codebase** (`smartshine-platform/frontend/`) using its established patterns (React Router, AuthContext, Axios client, Tailwind utility classes). Use the HTML prototypes as the visual and behavioral specification.

---

## Fidelity

**High-fidelity.** All screens contain:
- Exact colors (hex values listed in Design Tokens below)
- Exact typography (Playfair Display for headings, DM Sans for UI)
- Exact spacing, border radius, shadows
- Working interactions (form validation, tab switching, status steppers)
- Realistic mock data matching the actual API schema

Recreate every screen pixel-for-pixel using Tailwind utility classes. The updated `tailwind.config.js` (included) maps all brand tokens to Tailwind classes.

---

## Screens / Views

### 1. Login Page (`/login`)
**File:** `ui_kits/customer_app/index.html` → `LoginPage` component  
**Purpose:** OTP-based sign-in. Step 1: phone input. Step 2: 6-digit OTP verification.

**Desktop layout:** Split — left 45% brand panel, right 55% form.

**Brand panel (left):**
- Background: `linear-gradient(160deg, #0B2740 0%, #1A5276 55%, #2E86C1 100%)`
- Logo: "Smart" in white, "Shine" in `#F39C12`, Playfair Display 32px 700
- Tagline: "Your car, always spotless." — Playfair Display 28px 700, white, max-width 280px
- 3 feature bullets with amber checkmark circles
- Trust stats: 500+ cars · 4.8★ · 5 locations — Playfair Display 22px amber values
- Footer text: `rgba(255,255,255,.3)` 11px

**Form panel (right):**
- Background: `#F8F9FA`
- Centered form, max-width 400px
- Heading: Playfair Display 28px 700, `#1a1a2e`
- Sub: DM Sans 14px `#888`
- Step indicator: 2 circles (26px, `#1A5276` when active) connected by a 2px line
- Phone field: 🇷🇼 +250 prefix block (white bg, border-right: none, border-radius left only) + text input (border-radius right only). Accepts `7XXXXXXXX` (9 digits without leading 0).
- Password field (optional): with show/hide eye toggle
- Divider: "or sign in with OTP" between password and amber CTA button
- CTA button: `#F39C12` bg, `#1a1a2e` text, 15px 700, 13px padding, `border-radius: 12px`, shadow `0 4px 16px rgba(243,156,18,.25)`
- "Create one →" link in `#2E86C1`

**Step 2 — OTP:**
- 6 **individual** `<input type="text" maxLength={1}>` boxes (not one field)
- Each box: `height: 54px`, `border-radius: 10px`, border `#E9ECEF` (empty) / `#2E86C1` (filled), bg `#EFF6FF` when filled
- Auto-focus next box on input; backspace moves to previous box
- Countdown timer: `MM:SS` format, 2 minutes. "Resend OTP" activates at 0.
- Dev mode info box: amber bg `#FEF9EE`, border `#FDE68A`, text `#92400E` — "Development Mode — check Django terminal for OTP"

**Validation:**
- Phone regex: `/^0?7\d{8}$/` — accepts `782693724` or `0782693724`
- OTP must be 6 digits before submit button enables

**API endpoints (real implementation):**
- `POST /api/accounts/otp/request/` → `{ phone }`
- `POST /api/accounts/otp/verify/` → `{ phone, code }` → returns JWT tokens
- On success: read `user.role`, redirect to `ROLE_REDIRECT[role]`

---

### 2. Registration Page (`/register`)
**File:** `ui_kits/customer_app/index.html` → `RegisterPage` component  
**Purpose:** New user sign-up.

**Layout:** Same split layout as Login.

**Form fields:**
1. Full Name (required) — text input
2. Phone Number (required) — 🇷🇼 +250 prefix + input, same pattern as login
3. Email (optional) — email input
4. Password (required, min 6 chars) — with show/hide toggle

**Password strength indicator:**
- 4 bars below the field, each `height: 4px, border-radius: 2px`
- Fills left to right: 1=Weak `#DC2626`, 2=Fair `#F59E0B`, 3=Good `#2E86C1`, 4=Strong `#22C55E`
- Label shown below bars matching the colour

**CTA:** "Create Account →" — same amber button style as Login  
**Footer:** Terms of Service + Privacy Policy links in `#2E86C1`  
**Bottom link:** "Already have an account? Sign in"

**API endpoint:** `POST /api/accounts/register/` → `{ phone, full_name, email?, password }`

---

### 3. Home Page (`/`)
**File:** `ui_kits/customer_app/index.html` → `HomePage` component  
**Purpose:** Browse branches on a map and card grid.

**Hero section:**
- Background: `linear-gradient(135deg, #0B2740 0%, #1A5276 60%, #2E86C1 100%)`
- Decorative circles: amber and white at 8% opacity, positioned top-right and bottom-left
- Badge pill: "KIGALI'S #1 CAR WASH" — amber bg/border, 12px 600, letter-spacing .06em
- Headline: "Find a Branch **Near You**" — Playfair Display 40px 800, white, "Near You" in `#F39C12`
- Sub: DM Sans 15px `rgba(255,255,255,.7)`, max-width 480px centered
- 3 pill chips: rating, locations, hours — `rgba(255,255,255,.1)` bg, white text 13px

**Map:** SVG placeholder (400px wide, 280px tall). Wire in Leaflet when building production. Centered on Kigali `-1.9441, 30.0619`.

**Branch grid:** `auto-fill, minmax(280px, 1fr)` grid with 14px gaps. Search input top-right.

**How it Works section:**
- `margin-top: 56px`
- Heading: Playfair Display 26px 700 centered
- 3 cards in same auto-fill grid: icon (44×44px, bg `#EFF6FF`, border-radius 12px), title (DM Sans 16px 700), description (13px `#888`, line-height 1.5)

**CTA Banner:**
- Background: `linear-gradient(135deg, #1A5276, #2E86C1)`
- Border-radius: 20px, padding 36px 40px
- Flex row: text left, amber button right
- "Book Now →" button → navigates to first branch detail

---

### 4. Branch Detail Page (`/branches/:id`)
**File:** `ui_kits/customer_app/index.html` → `BranchDetailPage` component  
**Purpose:** View branch info and book a service.

**Category tabs (filter bar):**
- Tabs: All / Automatic / Traditional / Mobile
- Active tab: `#1A5276` bg, white text, shadow `0 2px 8px rgba(26,82,118,.2)`
- Inactive: white bg, `#888` text, light shadow
- Border-radius: 20px (pill shape), font 12px 600
- Filters `SERVICES` array by `category` field

**Service cards:** See ServiceCard component. "Book Now" routes to booking flow.

**API:** `GET /api/branches/:id/` returns `{ ...branch, service_types: [...] }`

---

### 5. Booking Flow (`/book`)
**File:** `ui_kits/customer_app/index.html` → `BookingFlowPage` component  
**Purpose:** 4-step wizard to confirm a booking.

**Progress indicator:** 4 step circles (32px) connected by 2px lines.
- Done: `#1A5276` bg + white checkmark SVG
- Active: `#F39C12` bg + white number
- Future: `#E9ECEF` bg + grey number

**Step 1 — Service Confirmed:** Summary card (service name, branch, price, description) + details card (category, duration, hours).

**Step 2 — Select Vehicle:** Radio-style vehicle cards (border changes to `#2E86C1` when selected, bg `#EFF6FF`). "+ Add New Vehicle" dashed button opens inline form with plate, make, model, color fields.

**Step 3 — Date & Time:**
- Calendar: 7-column grid. Past dates disabled (`#DDD` text, `cursor: not-allowed`). Selected: `#1A5276` bg white text.
- Month navigation: `‹` / `›` buttons with `border: 1px solid #E9ECEF`
- Time slot grid: 4 columns. Available: white bg `#E9ECEF` border. Selected: `#F39C12` bg. Taken: `#F9FAFB` bg, `text-decoration: line-through`, `#CCC` text.
- Step only enables "Continue" when BOTH date AND time are selected.

**Step 4 — Review & Confirm:**
- Booking summary card (service, branch, vehicle, date, time, duration)
- Price breakdown: service price / deposit 30% (amber) / balance on arrival / **Due now** (16px 800 `#1A5276`)
- Info box: amber bg `#FEF9EE`, text `#92400E`, "Pay 30% deposit now to confirm"
- CTA: "Proceed to Payment →" in amber

**API:** `POST /api/bookings/` → `{ branch, service_type, vehicle, scheduled_at }`

---

### 6. Payment Page (`/pay`)
**File:** `ui_kits/customer_app/index.html` → `PaymentPage` component  
**Purpose:** Pay for a confirmed booking via MoMo or Airtel.

**States:** `idle` → `processing` (spinner) → `success` (green checkmark + confirmation)

**Payment method buttons:** Radio-style cards. MoMo: `#FFCC00` bg icon. Airtel: `#DC143C` bg icon. Selected: `#EFF6FF` bg, `#2E86C1` 2px border.

**Processing state:** Animated CSS spinner (`border-top-color: #2E86C1`, `animation: spin 0.8s linear infinite`)

**Success state:** Green circle (`#DCFCE7`), white checkmark SVG, Playfair Display 24px "Booking Confirmed!", confirmation number `SS-XXXXX`.

**API:** `POST /api/payments/initiate/` → `{ booking_id, phone, method: 'momo'|'airtel' }`

---

### 7. My Bookings (`/bookings`)
**File:** `ui_kits/customer_app/index.html` → `BookingsPage` component  
**Purpose:** View active and past bookings.

**Tabs:** "Active (N)" / "History (N)" — pill tabs inside white rounded container (`border-radius: 12px, padding: 4px`). Active tab: `#1A5276` bg white text.

**Status filter:** Active = `['pending','confirmed','in_progress']`. History = `['completed','cancelled']`.

**Status progress bar** (shown on Active tab only):
- Steps: Pending → Confirmed → In Progress → Completed (4 nodes)
- Cancelled shows: Pending → Cancelled (2 nodes, red `#DC2626`)
- Done nodes: `#1A5276` bg + checkmark. Current: colored bg + white dot. Future: `#E9ECEF`.

**API:** `GET /api/bookings/`

---

### 8. My Vehicles (`/vehicles`)
**File:** `ui_kits/customer_app/index.html` → `VehiclesPage` component  
**Purpose:** Manage registered vehicles.

**Add Vehicle button:** Amber when closed, grey "✕ Cancel" when open. Toggles inline form.

**Inline add form:** 2-column grid. Fields: Plate Number, Make, Model, Color (text inputs) + Type (select: Sedan / SUV / Hatchback / Pickup / Van / Other). Submit: "Add Vehicle" in `#1A5276`.

**API:** `GET /api/vehicles/` · `POST /api/vehicles/`

---

### 9. Worker Portal — Mobile (`/worker`)
**File:** `ui_kits/worker_portal/mobile.html`  
**Purpose:** Worker sees job queue and advances job status on phone.

**Layout:** Max-width 430px, bottom navigation bar (fixed, `position: fixed; bottom: 0`).

**Bottom nav:** 3 tabs — Queue / Active / History. Active tab: `#1A5276` text + 2px top accent line.

**Touch targets:** All interactive elements minimum 52px tall. Primary action button 64px tall.

**Status flow:** received → washing → rinsing → drying → done

**Plate photo button:** 72px tall, full width, `#1A5276` bg, camera SVG icon + text. Shows spinner during capture, then success state with green bg.

**API:** `PATCH /api/bookings/:id/status/` → `{ status: next_status }`

---

### 10. Driver Portal — Mobile (`/driver`)
**File:** `ui_kits/driver_portal/mobile.html`  
**Purpose:** Driver accepts pickups, tracks journey milestones, views earnings.

**Layout:** Max-width 430px, bottom nav (Requests / Active / Earnings).

**Map:** Full viewport width (`width: 100%`), no border-radius on map container. SVG placeholder — wire in Leaflet in production.

**Milestone buttons:** 64px tall amber button, full width. Advances through: On Way → Arrived → Collected → At Branch → Returning → Delivered.

**Online/Offline toggle:** In top bar. Online shows pulsing green dot (`animation: pulse-dot 2s infinite`). Offline hides request list.

**API:** `PATCH /api/bookings/:id/status/` · `GET /api/payments/?driver=me`

---

### 11. Admin Dashboard (`/admin`)
**File:** `ui_kits/admin_dashboard/index.html`  
**Purpose:** Full platform management.

**Layout:** Fixed sidebar (220px, `#1A5276` bg) + scrollable main content area.

**Sidebar:** Logo + "ADMIN DASHBOARD" overline. Nav items with `rgba(255,255,255,.12)` active bg. User info at bottom.

**KPI cards:** 4-column grid. Value in Playfair Display 30px with brand colour. Delta badge: green ↑ / red ↓ with % vs yesterday.

**Revenue chart:** 7-bar SVG bar chart. Today's bar in `#F39C12`, past bars in `#1A5276`, future in `#E9ECEF`.

**Bookings table:** Status filter tabs (pill buttons). Table with `thead` column headers in 10px uppercase `#AAAAAA`. Status cells use same badge colours as rest of app.

**Branches table:** Queue depth shown as coloured bar (green/amber/red) + number. Revenue column.

**API:** `GET /api/bookings/` · `GET /api/branches/` · `GET /api/payments/`

---

## Interactions & Behavior

| Interaction | Detail |
|---|---|
| OTP digit boxes | Focus next on input; focus prev on Backspace; paste fills all 6 |
| Booking step advance | "Continue" disabled until each step's required data is filled |
| Calendar past dates | `cursor: not-allowed`, `opacity: 0.4`, click ignored |
| Category tabs | Filter `service_types` array in-place, no route change |
| Bookings tabs | Client-side filter of fetched bookings array |
| Worker status advance | Optimistic UI — update local state immediately, then PATCH API |
| Driver milestone advance | Same optimistic pattern |
| Payment processing | 2.2s fake delay in prototype → real: poll `/api/payments/:id/` for status |
| Add Vehicle inline form | Validated before appending; clears after save |
| Search (branches) | Client-side `.filter()` on name + address, debounce 300ms recommended |

**Transitions:** `transition: all 150ms ease` on buttons, borders, backgrounds. `200ms ease` on progress indicators.

---

## State Management

Each page is self-contained in the prototype. In the real app:

```
AuthContext: { user, login, logout }
  user.role → 'customer' | 'worker' | 'driver' | 'admin'

BookingContext (or local state in the flow):
  selectedBranch, selectedService, selectedVehicle,
  selectedDate, selectedTime → passed to PaymentPage

Navigation flow:
  /login → /  (customer)
          → /worker  (worker)
          → /driver  (driver)
          → /admin   (admin)
```

---

## Design Tokens

```css
/* Brand */
--primary:        #1A5276   /* Tailwind: bg-primary */
--primary-dark:   #154360   /* Tailwind: bg-primary-dark */
--primary-light:  #2471A3
--secondary:      #2E86C1   /* Tailwind: bg-secondary */
--accent:         #F39C12   /* Tailwind: bg-accent */
--accent-dark:    #D68910

/* Surfaces */
--bg:             #F8F9FA   /* Tailwind: bg-brand-bg */
--surface:        #FFFFFF
--border:         #E9ECEF

/* Text */
--text-primary:   #1a1a2e
--text-secondary: #888888
--text-tertiary:  #AAAAAA

/* Status */
--success:        #22C55E  bg: #DCFCE7  text: #15803D
--error:          #DC2626  bg: #FEE2E2  text: #B91C1C
--warning:        #F59E0B  bg: #FEF3C7  text: #92400E
--info:           #3B82F6  bg: #DBEAFE  text: #1D4ED8
--purple:         #8B5CF6  bg: #EDE9FE

/* Booking status */
pending:     bg #FEF3C7  text #92400E
confirmed:   bg #DBEAFE  text #1D4ED8
in_progress: bg #EDE9FE  text #6D28D9
completed:   bg #DCFCE7  text #15803D
cancelled:   bg #FEE2E2  text #B91C1C

/* Service category */
automatic:   bg #EDE9FE  text #6D28D9
traditional: bg #FEF3C7  text #92400E
mobile:      bg #DCFCE7  text #15803D

/* Typography */
--font-display: 'Playfair Display', Georgia, serif  (600, 700, 800)
--font-body:    'DM Sans', system-ui, sans-serif    (300, 400, 500, 600, 700)

/* Radius */
input:  10px   btn: 12px   card: 16px   pill: 9999px

/* Shadows */
card:        0 2px 12px rgba(0,0,0,.04)
card-hover:  0 4px 20px rgba(0,0,0,.08)
modal:       0 8px 40px rgba(0,0,0,.12)
cta-hover:   0 6px 20px rgba(243,156,18,.30)

/* Spacing (same as Tailwind defaults) */
4px · 8px · 12px · 16px · 20px · 24px · 32px · 40px · 48px · 64px
```

---

## Fonts

Load from Google Fonts in `index.html` `<head>`:

```html
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap" rel="stylesheet">
```

---

## Assets

| Asset | Location | Notes |
|---|---|---|
| Logo SVG | `assets/logo.svg` | Wordmark + droplet mark. "Smart" = `#1A5276`, "Shine" = `#F39C12` |
| Tailwind config | `assets/tailwind.config.js` | Copy to `smartshine-platform/frontend/tailwind.config.js` |
| CSS tokens | `colors_and_type.css` | Full CSS custom property definitions + helper classes |
| Design system README | `README.md` | Complete design system reference |

No icon library is bundled. Lucide Icons (`https://unpkg.com/lucide@latest`) is recommended — matches the clean 2px stroke aesthetic.

---

## Files in This Package

```
design_handoff_smartshine/
├── README.md                          ← This file
├── tailwind.config.js                 ← Copy to frontend/
├── colors_and_type.css                ← All CSS tokens
├── assets/
│   └── logo.svg                       ← SmartShine logo
├── customer_app/
│   ├── index.html                     ← Full customer app prototype (12 screens)
│   ├── Navbar.jsx                     ← Navbar component reference
│   ├── Footer.jsx
│   ├── BranchCard.jsx
│   ├── ServiceCard.jsx
│   ├── BookingRow.jsx
│   └── VehicleCard.jsx
├── worker_portal/
│   └── mobile.html                    ← Mobile worker portal
├── driver_portal/
│   └── mobile.html                    ← Mobile driver portal
└── admin_dashboard/
    └── index.html                     ← Admin dashboard
```

---

## Implementation Notes for Claude Code

1. **Start with `tailwind.config.js`** — copy it to `frontend/` first so all brand colour classes work
2. **Fonts** — add the Google Fonts `<link>` to `frontend/index.html`
3. **Routing** — The app uses React Router. Auth guard is in `ProtectedRoute.jsx` and `RoleRoute.jsx` — keep using those patterns
4. **API base URL** — `frontend/src/api/client.js` uses `baseURL: http://localhost:8000/api/`. All endpoints listed above are relative to that base.
5. **OTP flow** — The real `AuthContext.login()` calls `otp/verify/` and stores JWT. Hook into that instead of the prototype's fake setTimeout.
6. **Map** — Replace SVG placeholder with `<MapContainer>` from `react-leaflet`. The `leafletFix.js` utility already handles the default marker icon issue.
7. **Mobile portals** — Worker and Driver portals use `max-width: 430px` — wrap in a responsive layout that centres them on desktop and fills on mobile.
