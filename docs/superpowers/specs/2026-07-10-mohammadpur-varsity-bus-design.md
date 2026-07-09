# DirectRide — App-based Direct Bus Service

## Mohammadpur – Bashundhara Varsity Corridor (NSU / IUB / AIUB)

---

### Document Control

| Item | Detail |
|---|---|
| Document Title | DirectRide — Product Design Specification |
| Version | 1.1 |
| Date | July 10, 2026 |
| Prepared By | Product Planning (with Claude's assistance) |
| Status | Approved — ready for implementation planning |

---

## Executive Summary

DirectRide ekta app-based, pre-booking driven bus service, jar goal Mohammadpur theke Bashundhara area-r tinta varsity-te (NSU, IUB, AIUB) daily commute kora student der jonno ekta reliable, direct, ebong guaranteed-seat transport solution deya.

Bortomane ei route-er student ra mul duita problem face koren — (a) peak time-e traditional bus/leguna-te seat na paoa, ebong (b) direct o comfortable ride-er kono option na thaka. DirectRide ekta pre-booked fixed-seat model diye eita solve korbe, jekhane rider ra ride-er age-i specific seat book kore guarantee peye jabe.

Pilot phase-e ekta single route diye service start hobe. Kintu system architecture emonvabe design kora hobe jate future-e notun area ebong notun varsity easily add kora jay.

---

## 1. Business Model

- **Operational structure:** Company-r nijer/rent kora vehicle (microbus/coaster) use hobe — third-party bus owner-der upor depend korte hobe na, jate service quality ebong schedule-er upor full control thake.
- **Route structure:** Fixed route, fixed daily schedule.
- **Revenue model:** Duita way-te revenue ashbe — (a) per-seat one-time booking fare (flat fare, shob stop-er jonno same), ebong (b) duration-based subscription plan (weekly/15-day/monthly) — details section 3.3-e.
- **Pilot operation:** Pilot phase-e daily approximately 4+ trip expected (jemon shokal 7:00 ebong 9:00 — varsity-mukhi; dupur 1:00 ebong bikal 5:00 — return trip). Eita kono fixed/hardcoded schedule na — actual number ebong time admin panel theke demand onujayi decide hobe (dekhun section 3.2).

## 2. Route Design

| Direction | Order |
|---|---|
| Morning trip | Mohammadpur → NSU → IUB → AIUB |
| Return trip | AIUB → IUB → NSU → Mohammadpur |

- Ekta single trip-e-i tinta varsity cover kora hobe (multiple stop, single route).
- Booking-er shomoy rider nijer drop stop (NSU / IUB / AIUB) select korbe.
- Fare structure: shob stop-er jonno same flat fare; future-e distance-based fare structure-e migrate korar option rakha ache.

## 3. Core System Components

### 3.1 Rider App (React Native + Expo — Android & iOS)

| Feature | Detail |
|---|---|
| Auth | Phone number + OTP based |
| Home screen | Available trip list (date, time, direction, empty seat, fare) |
| Booking flow | Trip select → stop select → seat select → payment |
| Payment | bKash/Nagad integration; payment success hole-i booking confirm hobe |
| Booking management | Upcoming + history, cancel option |
| Notifications | Booking confirmation, trip reminder (push/SMS) |

### 3.2 Admin Panel (Web Dashboard)

| Feature | Detail |
|---|---|
| Trip scheduling | Fully manual control — kono trip pre-defined/hardcoded thakbe na. Admin nijei protyek trip create korben (date, time, direction, vehicle, capacity set kore), dorkar hole edit/cancel korben. Kobe koto-gula ebong kon time-er trip cholbe — ei decision fully admin-er hate thakbe |
| Booking overview | Prottek trip-er booking list, seat map, revenue |
| Vehicle & driver management | Basic CRUD (plate number, driver name/phone); MVP-te alada driver app thakbe na, coordination manually hobe |
| Reporting | Daily booking count, revenue summary |

### 3.3 Plan/Subscription Model

Rider ra dui way-te commute korte parben — per-trip one-time booking (per-seat), othoba duration-based plan kine. Duitai simultaneously available thakbe; rider nijer proyojon onujayi choose korben.

| Item | Detail |
|---|---|
| Plan types | Weekly (7 days), 15-day, Monthly (30 days) — admin panel theke price ebong duration configurable |
| Ride limit | Plan duration-e unlimited ride; tobe misuse prevent korar jonno **daily max 2 trip** (usually ekta jawa, ekta fera) limit applicable |
| Booking method | Plan holder-keo protyek trip-er jonno separately seat book korte hobe (seat count limited thakay confirmation dorkar); difference shudhu ei je booking-er shomoy notun payment lagbe na |
| Expiry | Duration shesh hole plan inactive hoye jabe; re-activate korte notun plan kinte hobe |

### 3.4 Backend/API

- Trip ebong seat management, payment-er shomoy seat lock kore double-booking prevent kora
- Trip creation fully admin-controlled (manual trigger); kono auto-generated ba hardcoded schedule system-e thakbe na
- Plan management: active plan tracking, expiry-te auto-deactivation, daily ride-limit (2) validation
- Payment gateway integration (bKash/Nagad) — one-time booking ebong plan purchase duitar jonno-i
- Notification service (SMS & push)
- OTP-based authentication system

## 4. Data Model (High-level)

| Entity | Fields |
|---|---|
| User | id, phone, name, default_stop |
| Trip | id, date, departure_time, direction (to_varsity \| from_varsity), vehicle_id, total_seats, available_seats |
| Booking | id, trip_id, user_id, stop (NSU \| IUB \| AIUB), seat_no, payment_status, booking_status (confirmed \| cancelled), booking_type (per_seat \| plan) |
| Plan | id, name (weekly \| 15_day \| monthly), price, duration_days, daily_ride_limit (default: 2) |
| UserPlan | id, user_id, plan_id, start_date, end_date, status (active \| expired), rides_used_today, last_ride_date |
| Vehicle | id, plate_no, capacity, driver_name, driver_phone |

## 5. Booking Flow

### 5.1 One-time (per-seat) booking
1. Rider app-e available trip-er list dekhe (date/time/direction onujayi filtered)
2. Trip select → stop (NSU/IUB/AIUB) select → seat select
3. bKash/Nagad diye payment complete kore
4. Payment success hole booking confirm hoy, seat lock hoy, ebong confirmation notification pathano hoy
5. Trip-er age reminder notification pathano hoy

### 5.2 Plan holder's booking
1. Rider active plan diye trip select → stop select → seat select
2. System validate kore: plan active ache kina, ebong ajker daily ride-limit (2) exceed korenai kina
3. Condition satisfy hole payment chara-i booking confirm hoy, seat lock hoy
4. Daily ride counter update hoy; confirmation ebong trip-age reminder notification pathano hoy

## 6. Error Handling / Edge Cases

| Scenario | Solution |
|---|---|
| Double booking prevention | Payment window-e seat 5 minute-er jonno lock thakbe; payment fail/timeout hole seat release hobe |
| Payment failure | Booking pending state-e thakbe, seat auto-release hobe |
| Cancellation policy | Trip-er 2 ghonta age cancel korle full refund; tarpor refund nai (admin panel theke configurable) |
| Trip full | MVP-te waitlist thakbe na; "sold out" show hobe |

## 7. Testing Approach

- **Backend:** Seat-lock ebong double-booking race condition-er unit test
- **Payment:** bKash sandbox environment diye integration test
- **App:** Manual end-to-end QA (Expo Go) — full booking flow (login → book → pay → confirm → cancel)

## 8. Future Scope (Out of MVP)

- Multiple area, multiple route support
- Driver-side app (live location sharing)
- Distance-based dynamic fare structure
- Waitlist system for full trips

## 9. MVP Scope Summary

**In scope:** Rider app (React Native/Expo), admin web panel, backend API, single route (Mohammadpur ↔ NSU/IUB/AIUB), bKash/Nagad payment, OTP auth, pre-booked fixed-seat system, one-time booking ebong duration-based plan (weekly/15-day/monthly) — both options.

**Out of scope (MVP):** Driver app, multi-route support, dynamic pricing, waitlist system.
