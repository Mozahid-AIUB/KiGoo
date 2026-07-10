# KiGoo — Multi-Service Mobility Platform — Product Design Specification

## MVP v1: KiGoo Campus (Mohammadpur ↔ NSU / IUB / AIUB)

---

### Document Control

| Item | Detail |
|---|---|
| Document Title | KiGoo Platform — Product Design Specification |
| Version | 2.0 (supersedes v1.1 — see [Changelog](#changelog-v11--v20)) |
| Date | July 10, 2026 |
| Prepared By | Product Planning (Claude-এর সহায়তায়) |
| Status | Approved — implementation-এর জন্য প্রস্তুত |
| Previous version | `2026-07-10-mohammadpur-varsity-bus-design.md` (v1.1) |

---

## Executive Summary

KiGoo একটা **student-first mobility platform**, যেটার goal হলো university transportation-কে safer, smarter, এবং affordable করা। KiGoo শুধু একটা bus-booking app না — এটা design করা হচ্ছে একটা **multi-service platform** হিসেবে, যেখানে ভবিষ্যতে বিভিন্ন transportation service (ride-sharing, carpool ইত্যাদি) একই app-এর নিচে যোগ হতে পারবে।

**MVP v1-এ শুধু একটা service live থাকবে: KiGoo Campus** — Mohammadpur থেকে বসুন্ধরা এলাকার তিনটা varsity-তে (NSU, IUB, AIUB) pre-booked, fixed-seat shuttle service।

Architecture এমনভাবে করা হচ্ছে যাতে future-এ নতুন service (নতুন route, নতুন city, বা সম্পূর্ণ ভিন্ন mobility service) শুধু Home screen-এ একটা নতুন "Service Card" যোগ করেই চালু করা যায় — পুরো app redesign করার দরকার না পড়ে।

---

## Changelog (v1.1 → v2.0)

এই version-এ যে changes হয়েছে, এবং কেন:

| Area | v1.1 (আগে) | v2.0 (এখন) | Why changed |
|---|---|---|---|
| Route model | ১টা trip, multi-stop (Mohammadpur → NSU → IUB → AIUB, একই trip-এ) | প্রতিটা university আলাদা route (Mohammadpur → NSU, Mohammadpur → IUB, Mohammadpur → AIUB — আলাদা আলাদা trip) | User-approved decision — booking UX সহজ হবে, প্রতিটা university-র জন্য আলাদা schedule/capacity control পাওয়া যাবে |
| Student Verification | ছিল না (শুধু phone+OTP auth) | Required — University + Student ID + ID card upload + optional selfie, admin approval flow | Platform-এর trust/safety বাড়ানোর জন্য; শুধু verified student রা booking করতে পারবে |
| QR Ticket | ছিল না | Required — প্রতিটা confirmed booking-এ secure QR generate হবে, boarding-এর আগে scan হবে | Boarding verification-কে digital ও tamper-proof করার জন্য |
| Platform framing | Single-purpose bus booking app | Multi-service platform (KiGoo Campus = প্রথম service, আরও service যোগ হতে পারবে future-এ) | Long-term vision — একই app-এ ride-sharing, carpool ইত্যাদি যোগ হবে |
| Tech stack | High-level mention only | Explicit: TanStack Query, Google Maps API, Expo Notifications, Supabase Storage | Implementation-এর জন্য concrete stack lock করা হলো |

**⚠️ Breaking change note:** Route model change-এর কারণে ইতিমধ্যে তৈরি করা Supabase schema (`trips` table-এ single `direction: to_varsity | from_varsity` enum) **migrate করতে হবে** নতুন per-university route model-এ। দেখুন [Migration Impact](#migration-impact-on-existing-work) section।

---

## ১. Platform Structure

### ১.১ Multi-Service Model

```
KiGoo (App)
│
├── 🚍 KiGoo Campus        ← MVP v1: শুধু এটা live থাকবে
├── 🔜 [Future Service 2]   ← Home screen-এ card হিসেবে যোগ হবে, app redesign লাগবে না
└── 🔜 [Future Service 3]
```

- Home screen একটা **dashboard** — এখানে সব available service card আকারে দেখানো হয়
- MVP v1-এ শুধু "KiGoo Campus" card active/enabled থাকবে; বাকি সব "Upcoming" হিসেবে দেখানো যেতে পারে (grey out করা, "Coming Soon" badge সহ)

### ১.২ Business Model (অপরিবর্তিত — v1.1 থেকে)

- **Operational structure:** নিজের/rent করা vehicle (মাইক্রোবাস/কোস্টার)
- **Revenue model:** per-seat one-time booking fare + duration-based subscription plan (weekly/15-day/monthly)
- **Pilot operation:** Trip count এবং time সম্পূর্ণ admin panel থেকে control হবে — কোনো hardcoded schedule নাই

---

## ২. Route Design (v2.0 — CHANGED)

প্রতিটা university-র জন্য **আলাদা route**:

| Route | Direction |
|---|---|
| Route A | Mohammadpur ↔ NSU |
| Route B | Mohammadpur ↔ IUB |
| Route C | Mohammadpur ↔ AIUB |
| Future | নতুন route যোগ করা যাবে admin panel থেকে |

- প্রতিটা route-এর নিজস্ব pickup point, schedule, এবং seat capacity থাকবে
- Booking flow-এ rider প্রথমে **route select** করবে (কোন university), তারপর trip (to/from campus), তারপর time/bus/seat
- Fare route অনুযায়ী ভিন্ন হতে পারবে (future-proof — future-এ distance/route-based pricing সহজে যোগ করা যাবে)

---

## ৩. Core System Components

### ৩.১ Authentication

| Screen | Purpose |
|---|---|
| Splash Screen | App launch |
| Welcome Screen | Onboarding intro |
| Sign Up | New account |
| Login | Existing user |
| Forgot Password | Password reset |
| Email Verification | Email confirm |

**Confirmed:** Phone + OTP (v1.1 থেকে অপরিবর্তিত, already built) — Supabase Auth phone/OTP provider দিয়ে backend করা হবে। Email Verification screen বাদ যাচ্ছে যেহেতু auth phone-based।

### ৩.২ Student Verification (NEW — Required for MVP v1)

Booking করার আগে প্রতিটা student-কে verify হতে হবে।

**Required fields:**
- University (dropdown: NSU / IUB / AIUB)
- Student ID (text)
- University ID Card (image upload → Supabase Storage)
- Selfie Verification (Optional)

**Verification status:**
- `pending` — submit করেছে, admin review বাকি
- `verified` — admin approve করেছে, booking করতে পারবে
- `rejected` — admin reject করেছে, reason সহ (rider আবার submit করতে পারবে)

**Gate:** শুধু `verified` status-এর student-রা KiGoo Campus booking flow-এ ঢুকতে পারবে। Non-verified user Home দেখতে পারবে কিন্তু booking করতে গেলে verification flow-এ redirect হবে।

### ৩.৩ Home (Dashboard)

| Section | Content |
|---|---|
| Greeting | "স্বাগতম, [Name]" |
| Active Booking Card | চলমান/আজকের booking থাকলে card আকারে top-এ |
| Service Cards | KiGoo Campus (active) + future services (locked/coming soon) |
| Announcements | Admin-broadcast announcements |
| Upcoming Launches | নতুন route/service preview |
| Community Updates | Community section-এর highlight |

### ৩.৪ KiGoo Campus — Booking Flow

```
[Verification Gate — unverified হলে এখানে redirect]
Route Select → Trip Select (To/From Campus, Time, Bus) →
Seat Select → Booking Summary → Confirm Booking (no payment step) → QR Ticket
```

| Step | Detail |
|---|---|
| Verification Gate | Unverified user booking শুরু করতে গেলে verification flow-এ redirect হবে (browsing routes/schedule আগে allowed ছিল) |
| Route Selection | User route বেছে নেয় (e.g. Mohammadpur → NSU) |
| Trip Selection | To Campus / From Campus, Departure Time, Bus, Seat |
| Booking Summary | Route, Pickup Point, Time, Seat Number, Fare, Status — সব review করে Confirm |
| Confirm Booking | Payment gateway ছাড়াই সরাসরি confirm হবে (§৩.১২ দেখুন) — fare বাসে cash-এ collect হবে |

### ৩.৫ QR Ticket (NEW — Required for MVP v1)

Booking confirm হওয়ার পর একটা secure QR ticket generate হবে।

**QR-তে থাকবে:**
- Student Name
- Booking ID
- Trip ID
- Bus Number
- Seat Number
- Departure Time
- Verification Status

**Boarding flow:** বাসে ওঠার আগে এই QR scan হবে।

**Confirmed:** MVP v1-এ Driver Panel থাকছে না, তাই boarding-এ **Admin Panel-এর ভিতরে একটা lightweight "Scan & Board" web page** থাকবে — staff/operator phone-এর browser camera দিয়ে rider-এর QR scan করবে, booking status `boarded` mark হবে। এটা Admin Panel scope-এ যোগ হলো (দেখুন §৩.১০)।

### ৩.৬ My Trips

| Tab | Content |
|---|---|
| Upcoming Trips | ভবিষ্যতের confirmed booking |
| Today's Trip | আজকের trip, quick access |
| Completed Trips | ইতিহাস |
| Cancelled Trips | Cancel করা booking |
| Trip Details | প্রতিটা booking-এর বিস্তারিত (QR সহ) |

### ৩.৭ Notifications

- Booking Confirmed
- Trip Reminder
- Bus Arrival Alert
- Schedule Changes
- Announcements
- Service Updates

### ৩.৮ Profile

- Profile Picture, Student Info (University, Department, Student ID, Phone)
- Verification Status (badge: Pending/Verified/Rejected)
- Emergency Contact
- Settings, Logout

### ৩.৯ Community (NEW)

- WhatsApp Community link
- Facebook Page link
- Instagram link
- Feedback Form
- Support

### ৩.১০ Admin Panel

| Feature | Detail |
|---|---|
| Dashboard | Overview stats |
| Student Verification | Pending queue — approve/reject with reason |
| Manage Students | Student list, profile, status |
| Manage Routes | Route CRUD (NEW — v1.1-এ ছিল না, route model change-এর কারণে দরকার) |
| Manage Stops | Pickup point CRUD |
| Manage Buses | Vehicle CRUD (v1.1 spec-এ ছিল "Vehicle & Driver management") |
| Manage Drivers | Driver CRUD |
| Manage Bookings | Booking overview, seat map |
| Manage Seats | Seat map/layout config |
| Announcements | Broadcast to riders |
| Notifications | Push/SMS trigger |
| Reports | Booking count summary (revenue tracking manual/cash-based, যেহেতু payment gateway MVP-তে নাই) |
| Analytics | Usage trends — MVP-তে basic booking count/route popularity পর্যন্ত সীমিত রাখা হবে |
| Scan & Board | **NEW** — QR scan করে boarding confirm করার web page (staff phone camera দিয়ে ব্যবহার হবে) |
| Survey Dashboard | Feedback form responses |

**Current build status:** Trip Management screen (create/edit/cancel trip) already built এবং working — কিন্তু route model change-এর কারণে এটা আপডেট করা লাগবে (single trip → route-based trip)। দেখুন নিচে।

### ৩.১১ Driver Panel (Future — explicitly out of MVP v1)

Driver Login, Today's Route, Passenger List, QR Scanner, Trip Start/Complete, Navigation.

### ৩.১২ Payment (Confirmed: out of MVP v1)

**Confirmed:** MVP v1 launch হবে payment gateway ছাড়া — booking confirm সরাসরি হবে (payment step skip), fare আপাতত in-person/cash-এ collect হবে বাসে ওঠার সময়। bKash/Nagad/Card/Wallet পরবর্তী phase-এ যোগ হবে, একবার core booking loop প্রমাণিত হলে।

---

## ৪. Data Model (High-level, v2.0)

| Entity | Fields | Change from v1.1 |
|---|---|---|
| User | id, email/phone, name, university, department, student_id, verification_status, emergency_contact | + university, department, verification_status |
| Verification | id, user_id, university, student_id, id_card_url, selfie_url, status (pending\|verified\|rejected), reviewed_by, reviewed_at, rejection_reason | **NEW entity** |
| Route | id, name, origin, destination, active | **NEW entity** (v1.1-এ ছিল না — single hardcoded route ছিল) |
| Stop | id, route_id, name, order | **NEW entity** |
| Trip | id, route_id, date, departure_time, direction (to_campus\|from_campus), vehicle_id, total_seats, available_seats, status | route_id যোগ হলো (আগে ছিল hardcoded direction enum) |
| Booking | id, trip_id, user_id, stop_id, seat_no, payment_status, booking_status, booking_type, qr_code | + qr_code field |
| Plan | id, name, price, duration_days, daily_ride_limit | অপরিবর্তিত |
| UserPlan | id, user_id, plan_id, start_date, end_date, status, rides_used_today | অপরিবর্তিত |
| Vehicle | id, plate_no, capacity, driver_name, driver_phone | অপরিবর্তিত |

---

## ৫. Migration Impact on Existing Work

এই section-টা critical — আমরা ইতিমধ্যে কিছু কাজ করে ফেলেছি v1.1 model-এ, সেটা এখন কী হবে:

| Already built | Status | Action needed |
|---|---|---|
| Supabase `vehicles` table | ✅ Live | কোনো change দরকার নাই |
| Supabase `trips` table (single-route, `direction` enum) | ✅ Live | **Migrate করতে হবে** — নতুন `routes` table যোগ, `trips.route_id` যোগ, পুরনো `direction: to_varsity/from_varsity` কে `to_campus/from_campus` per-route-এ rework করা লাগবে |
| Admin Panel — Trip Management screen | ✅ Working (Next.js, localhost:3000/trips) | Route dropdown যোগ করতে হবে trip form-এ; Route management screen নতুন বানানো লাগবে |
| Rider App theme (purple rebrand) | ✅ Done | কোনো change দরকার নাই — এই doc-এর "Blue & White Theme" note-টা conflict করছে, দেখুন Open Decisions |
| Rider App — HomeScreen, mock trips | ⏳ Mock data, not yet connected to Supabase | নতুন Home dashboard structure (Service Cards) অনুযায়ী rebuild করতে হবে |
| Auth screens (Login, OTP) | ✅ UI exists (phone+OTP based) | যদি email+password-এ যাই (এই doc অনুযায়ী), এই screens rework করা লাগবে |

---

## ৬. Decisions (confirmed 2026-07-10)

আগের version-এ যে ৫টা conflict/gap ছিল, সব confirm হয়ে গেছে:

| # | Question | Decision | Why |
|---|---|---|---|
| 1 | Auth method | **Phone + OTP** (keep as-is) | ইতিমধ্যে built, Bangladeshi student-দের জন্য বেশি natural; rework এড়ানো গেলো |
| 2 | Theme color | **Purple/Violet** (keep as-is) | Official KiGoo Campus poster/mascot branding অনুযায়ী; "Blue & White" doc line-টা outdated, ignore করা হলো |
| 3 | QR scan at boarding | **Admin/staff web scanner** — admin panel-এ একটা lightweight scan page, staff phone browser camera দিয়ে scan করে "boarded" mark করবে | Driver Panel ছাড়াই boarding verification সম্ভব করে; পরে Driver Panel আসলে এই scan logic reuse করা যাবে |
| 4 | Payment MVP scope | **Payment gateway ছাড়া launch** — booking confirm হবে সরাসরি, fare আপাতত in-person/cash-এ collect হবে | দ্রুত ship করা যাবে; bKash/Nagad sandbox+webhook+reconciliation ভারী কাজ, core booking loop প্রমাণিত হওয়ার পর যোগ করা হবে |
| 5 | Verification strictness | **Browse allowed, booking blocked** — unverified user Home/routes/schedule দেখতে পারবে, কিন্তু booking flow-এ ঢুকলে verification-এ redirect হবে | নতুন user-দের জন্য softer first impression; ID upload করার আগে app explore করতে দেয় |

এই ৫টা decision এখন **final** — নিচের সব section এগুলো অনুযায়ী update করা হয়েছে।

---

## ৭. Tech Stack (Locked)

| Layer | Choice |
|---|---|
| Frontend | React Native + Expo + TypeScript |
| Backend | Supabase |
| Database | PostgreSQL (via Supabase) |
| Authentication | Supabase Auth |
| Storage | Supabase Storage (ID card/selfie images) |
| Maps | Google Maps API |
| Push Notifications | Expo Notifications |
| State Management | TanStack Query |
| Admin Panel | Next.js + Tailwind (already scaffolded) |

**Note:** TanStack Query রাইডার app-এ এখনো install/wire করা হয়নি — mock data সরিয়ে real Supabase data আনার সময় এটা যোগ করা হবে।

---

## ৮. MVP v1 Scope Summary

**In scope:**
- Auth: Phone + OTP (Supabase Auth)
- Student Verification (University, Student ID, ID card upload, optional selfie; admin approve/reject queue); browsing allowed pre-verification, booking blocked
- KiGoo Campus service: route select → trip select → seat select → booking summary → confirm (no payment step)
- QR Ticket generation + Admin "Scan & Board" web page for boarding verification
- My Trips (upcoming/today/completed/cancelled)
- Notifications
- Profile
- Community links
- Admin Panel: Dashboard, Verification queue, Manage Routes/Stops/Buses/Drivers/Bookings/Seats, Scan & Board, Announcements, Reports, basic Analytics, Survey Dashboard

**Out of scope (explicitly Future):**
- Driver Panel (Driver login, navigation) — boarding handled via Admin Scan & Board instead
- Payment gateway integration (bKash/Nagad/Card/Wallet) — fare collected in-person/cash for MVP v1
- Live bus tracking, ride sharing, carpool, SOS, wallet, promo codes, ratings, AI route optimization, multi-city

---

## ৯. Vision

Build the most trusted student mobility platform in Bangladesh. Start with KiGoo Campus, then expand into ride sharing, carpooling, delivery, digital payments, and a complete mobility ecosystem — all under a single KiGoo app.
