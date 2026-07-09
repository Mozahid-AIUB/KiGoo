# DirectRide — App-based Direct বাস সার্ভিস

## মোহাম্মদপুর – বসুন্ধরা Varsity Corridor (NSU / IUB / AIUB)

---

### Document Control

| Item | Detail |
|---|---|
| Document Title | DirectRide — Product Design Specification |
| Version | 1.1 |
| Date | July 10, 2026 |
| Prepared By | Product Planning (Claude-এর সহায়তায়) |
| Status | Approved — implementation planning-এর জন্য প্রস্তুত |

---

## Executive Summary

DirectRide একটা app-based, pre-booking driven বাস সার্ভিস, যার goal হলো মোহাম্মদপুর থেকে বসুন্ধরা এলাকার তিনটা varsity-তে (NSU, IUB, AIUB) daily commute করা student দের জন্য একটা reliable, direct, এবং guaranteed-seat transport solution দেওয়া।

বর্তমানে এই route-এর student রা মূলত দুইটা problem face করেন — (ক) peak time-এ traditional বাস/লেগুনায় seat না পাওয়া, এবং (খ) direct ও comfortable ride-এর কোনো option না থাকা। DirectRide একটা pre-booked fixed-seat model দিয়ে এটা solve করবে, যেখানে rider রা ride-এর আগেই specific seat book করে guarantee পেয়ে যাবে।

Pilot phase-এ একটা single route দিয়ে সার্ভিস শুরু হবে। কিন্তু system architecture এমনভাবে design করা হবে যাতে future-এ নতুন area এবং নতুন varsity easily add করা যায়।

---

## ১. Business Model

- **Operational structure:** কোম্পানির নিজের/rent করা vehicle (মাইক্রোবাস/কোস্টার) use হবে — third-party বাস owner-দের উপর depend করতে হবে না, যাতে service quality এবং schedule-এর উপর full control থাকে।
- **Route structure:** Fixed route, fixed daily schedule।
- **Revenue model:** দুইটা way-তে revenue আসবে — (ক) per-seat one-time booking fare (flat fare, সব stop-এর জন্য same), এবং (খ) duration-based subscription plan (weekly/15-day/monthly) — details section ৩.৩-এ।
- **Pilot operation:** Pilot phase-এ daily approximately ৪+ trip expected (যেমন সকাল ৭:০০ এবং ৯:০০ — varsity-মুখী; দুপুর ১:০০ এবং বিকাল ৫:০০ — return trip)। এটা কোনো fixed/hardcoded schedule না — actual number এবং time admin panel থেকে demand অনুযায়ী decide হবে (দেখুন section ৩.২)।

## ২. Route Design

| Direction | Order |
|---|---|
| Morning trip | মোহাম্মদপুর → NSU → IUB → AIUB |
| Return trip | AIUB → IUB → NSU → মোহাম্মদপুর |

- একটা single trip-এই তিনটা varsity cover করা হবে (multiple stop, single route)।
- Booking-এর সময় rider নিজের drop stop (NSU / IUB / AIUB) select করবে।
- Fare structure: সব stop-এর জন্য same flat fare; future-এ distance-based fare structure-এ migrate করার option রাখা আছে।

## ৩. Core System Components

### ৩.১ Rider App (React Native + Expo — Android & iOS)

| Feature | Detail |
|---|---|
| Auth | Phone number + OTP based |
| Home screen | Available trip list (date, time, direction, empty seat, fare) |
| Booking flow | Trip select → stop select → seat select → payment |
| Payment | bKash/Nagad integration; payment success হলেই booking confirm হবে |
| Booking management | Upcoming + history, cancel option |
| Notifications | Booking confirmation, trip reminder (push/SMS) |

### ৩.২ Admin Panel (Web Dashboard)

| Feature | Detail |
|---|---|
| Trip scheduling | Fully manual control — কোনো trip pre-defined/hardcoded থাকবে না। Admin নিজেই প্রতিটা trip create করবেন (date, time, direction, vehicle, capacity set করে), দরকার হলে edit/cancel করবেন। কবে কতগুলো এবং কোন time-এর trip চলবে — এই decision সম্পূর্ণভাবে admin-এর হাতে থাকবে |
| Booking overview | প্রতিটা trip-এর booking list, seat map, revenue |
| Vehicle & driver management | Basic CRUD (plate number, driver name/phone); MVP-তে আলাদা driver app থাকবে না, coordination manually হবে |
| Reporting | Daily booking count, revenue summary |

### ৩.৩ Plan/Subscription Model

Rider রা দুই way-তে commute করতে পারবেন — per-trip one-time booking (per-seat), অথবা duration-based plan কিনে। দুইটাই simultaneously available থাকবে; rider নিজের প্রয়োজন অনুযায়ী choose করবেন।

| Item | Detail |
|---|---|
| Plan types | Weekly (৭ দিন), 15-day, Monthly (৩০ দিন) — admin panel থেকে price এবং duration configurable |
| Ride limit | Plan duration-এ unlimited ride; তবে misuse prevent করার জন্য **daily max ২টা trip** (usually একটা যাওয়া, একটা ফেরা) limit applicable |
| Booking method | Plan holder-কেও প্রতিটা trip-এর জন্য separately seat book করতে হবে (seat count limited থাকায় confirmation দরকার); difference শুধু এই যে booking-এর সময় নতুন payment লাগবে না |
| Expiry | Duration শেষ হলে plan inactive হয়ে যাবে; re-activate করতে নতুন plan কিনতে হবে |

### ৩.৪ Backend/API

- Trip এবং seat management, payment-এর সময় seat lock করে double-booking prevent করা
- Trip creation fully admin-controlled (manual trigger); কোনো auto-generated বা hardcoded schedule system-এ থাকবে না
- Plan management: active plan tracking, expiry-তে auto-deactivation, daily ride-limit (২) validation
- Payment gateway integration (bKash/Nagad) — one-time booking এবং plan purchase দুইটার জন্যই
- Notification service (SMS & push)
- OTP-based authentication system

## ৪. UI Screens & Key Buttons/Actions

### ৪.১ Rider App

| Screen | Main Buttons/Actions |
|---|---|
| Splash/Login | "Login with Phone Number", "Send OTP", "Verify OTP" |
| Home | "Book a Trip", trip list-এ প্রতিটা card-এ "View Details", filter (date/direction) icon, "My Plan" (active plan থাকলে status card দেখাবে) |
| Trip Details | Stop select dropdown (NSU/IUB/AIUB), Seat select grid, "Continue to Payment" / "Book with Plan" (plan active থাকলে) |
| Payment | "Pay with bKash", "Pay with Nagad", "Cancel" |
| Booking Confirmation | "View Booking", "Back to Home" |
| My Bookings | Tabs: "Upcoming" / "History", প্রতিটা booking-এ "Cancel Booking" (eligible হলে), "View Details" |
| Plans | Plan card গুলোতে (Weekly/15-day/Monthly) "Buy Plan", active plan থাকলে "View Plan Details" (remaining days, today's ride count) |
| Profile | "Edit Profile", "Default Stop" set, "Logout" |

### ৪.২ Admin Panel

| Screen | Main Buttons/Actions |
|---|---|
| Login | "Login" (admin credential দিয়ে) |
| Dashboard | Summary cards (today's trips, bookings, revenue), "Create New Trip" |
| Trip Management | "+ Create Trip" (date, time, direction, vehicle, capacity form), প্রতিটা trip row-এ "Edit", "Cancel Trip" |
| Booking Overview | Trip select করলে booking list + seat map, "Export"/"View Details" per booking |
| Vehicle & Driver | "+ Add Vehicle", প্রতিটা row-এ "Edit", "Remove" |
| Plans Management | "+ Create Plan" (name, price, duration, daily_ride_limit), "Edit", "Deactivate" |
| Reports | Date range filter, "Generate Report" / "Export CSV" |

## ৫. Data Model (High-level)

| Entity | Fields |
|---|---|
| User | id, phone, name, default_stop |
| Trip | id, date, departure_time, direction (to_varsity \| from_varsity), vehicle_id, total_seats, available_seats |
| Booking | id, trip_id, user_id, stop (NSU \| IUB \| AIUB), seat_no, payment_status, booking_status (confirmed \| cancelled), booking_type (per_seat \| plan) |
| Plan | id, name (weekly \| 15_day \| monthly), price, duration_days, daily_ride_limit (default: 2) |
| UserPlan | id, user_id, plan_id, start_date, end_date, status (active \| expired), rides_used_today, last_ride_date |
| Vehicle | id, plate_no, capacity, driver_name, driver_phone |

## ৬. Booking Flow

### ৬.১ One-time (per-seat) booking
1. Rider app-এ available trip-এর list দেখে (date/time/direction অনুযায়ী filtered)
2. Trip select → stop (NSU/IUB/AIUB) select → seat select
3. bKash/Nagad দিয়ে payment complete করে
4. Payment success হলে booking confirm হয়, seat lock হয়, এবং confirmation notification পাঠানো হয়
5. Trip-এর আগে reminder notification পাঠানো হয়

### ৬.২ Plan holder-এর booking
1. Rider active plan দিয়ে trip select → stop select → seat select
2. System validate করে: plan active আছে কিনা, এবং আজকের daily ride-limit (২) exceed করেনাই কিনা
3. Condition satisfy হলে payment ছাড়াই booking confirm হয়, seat lock হয়
4. Daily ride counter update হয়; confirmation এবং trip-আগে reminder notification পাঠানো হয়

## ৭. Error Handling / Edge Cases

| Scenario | Solution |
|---|---|
| Double booking prevention | Payment window-এ seat ৫ মিনিটের জন্য lock থাকবে; payment fail/timeout হলে seat release হবে |
| Payment failure | Booking pending state-এ থাকবে, seat auto-release হবে |
| Cancellation policy | Trip-এর ২ ঘণ্টা আগে cancel করলে full refund; তারপর refund নাই (admin panel থেকে configurable) |
| Trip full | MVP-তে waitlist থাকবে না; "sold out" show হবে |

## ৮. Testing Approach

- **Backend:** Seat-lock এবং double-booking race condition-এর unit test
- **Payment:** bKash sandbox environment দিয়ে integration test
- **App:** Manual end-to-end QA (Expo Go) — full booking flow (login → book → pay → confirm → cancel)

## ৯. Future Scope (Out of MVP)

- Multiple area, multiple route support
- Driver-side app (live location sharing)
- Distance-based dynamic fare structure
- Waitlist system for full trips

## ১০. MVP Scope Summary

**In scope:** Rider app (React Native/Expo), admin web panel, backend API, single route (মোহাম্মদপুর ↔ NSU/IUB/AIUB), bKash/Nagad payment, OTP auth, pre-booked fixed-seat system, one-time booking এবং duration-based plan (weekly/15-day/monthly) — উভয় option।

**Out of scope (MVP):** Driver app, multi-route support, dynamic pricing, waitlist system।
