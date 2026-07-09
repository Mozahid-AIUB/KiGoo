# DirectRide — App-based Direct Bus Service (Mohammadpur → NSU/IUB/AIUB)

**Date:** 2026-07-10
**Status:** Approved for planning

## 1. Overview

Ei project ta ekta app-based bus service ja Mohammadpur theke Bashundhara area-r varsity gulote (NSU, IUB, AIUB) daily commute kora student der jonno banano hocche. Mul problem: peak time e traditional bus/leguna te seat na paoa, direct comfortable ride er ovab. Solution: pre-booked fixed-seat system diye guaranteed seat, direct route.

Pilot phase e single route diye shuru hobe, kintu architecture emonvabe design kora hobe jate future e notun area (e.g. Dhanmondi, Uttara) ebong notun varsity easily add kora jay.

## 2. Business Model

- Own/rent kora vehicle (microbus/coaster) diye service — third-party bus owner der upor depend kora hobe na
- Fixed route, fixed daily schedule
- Revenue: per-seat booking fare (flat fare, prottek stop-er jonno same)
- Pilot: 4+ trips/day (e.g. 7:00, 9:00 AM — varsity-mukhi; 1:00, 5:00 PM — return)

## 3. Route Design

- **Route:** Mohammadpur → NSU → IUB → AIUB (morning direction)
- **Return:** AIUB → IUB → NSU → Mohammadpur (evening direction, reverse stop order)
- Ekta single bus/trip e tinta varsity-i cover hoy (multiple stop, ekta route)
- Booking-er shomoy student nijer drop stop (NSU / IUB / AIUB) select korbe
- Fare: flat, stop onujayi vary kore na (simplicity-r jonno, pore distance-based e migrate kora jete pare)

## 4. Core System Components

### 4.1 Rider App (React Native + Expo, Android + iOS)
- Auth: phone number + OTP
- Home: upcoming/available trip list (date, time, direction, available seat, fare)
- Booking: trip select → stop select (NSU/IUB/AIUB) → seat select → payment
- Payment: bKash/Nagad integration, booking confirm hoy successful payment-er por
- My Bookings: upcoming + history, cancel option
- Notifications: booking confirmation, trip reminder (push/SMS)

### 4.2 Admin Panel (Web dashboard)
- Trip scheduling: create/edit trip (date, time, direction, vehicle, capacity)
- Booking overview: per-trip booking list, seat map, revenue
- Vehicle/driver management: basic CRUD (plate no, driver name/phone) — manual coordination, no driver app in MVP
- Reports: daily booking count, revenue summary

### 4.3 Backend / API
- Trip & seat management, with seat-lock during payment to prevent double-booking
- Payment gateway integration (bKash/Nagad)
- Notification service (SMS + push)
- Auth (OTP-based)

## 5. Data Model (high-level)

- **User**: id, phone, name, default_stop
- **Trip**: id, date, departure_time, direction (to_varsity | from_varsity), vehicle_id, total_seats, available_seats
- **Booking**: id, trip_id, user_id, stop (NSU | IUB | AIUB), seat_no, payment_status, booking_status (confirmed | cancelled)
- **Vehicle**: id, plate_no, capacity, driver_name, driver_phone

## 6. Booking Flow

1. Student app e trip list dekhe (date/time/direction onujayi filter)
2. Trip select → stop (NSU/IUB/AIUB) select → seat select
3. bKash/Nagad diye payment
4. Payment success → booking confirmed, seat locked, confirmation notification
5. Trip-er age reminder notification

## 7. Error Handling / Edge Cases

- **Double booking prevention:** seat 5 minute-er jonno lock thakbe payment window-e; payment fail/timeout hole seat release hobe
- **Payment failure:** booking pending thakbe, seat auto-release
- **Cancellation policy:** trip-er 2 ghonta age cancel korle full refund; tar por refund nai (admin panel theke configurable)
- **Trip full:** MVP-te waitlist thakbe na, "sold out" dekhano hobe

## 8. Testing Approach

- Backend: seat-lock/double-booking race condition unit test
- Payment: bKash sandbox environment diye integration test
- App: manual end-to-end QA (Expo Go), booking flow (login → book → pay → confirm → cancel)

## 9. Future Scope (out of MVP)

- Multiple area, multiple route support
- Driver-side app (live location share)
- Distance-based dynamic fare
- Subscription/pass-based recurring booking
- Waitlist system for full trips

## 10. MVP Scope Summary

**In scope:** Rider app (React Native/Expo) + Admin web panel + Backend API, single route (Mohammadpur ↔ NSU/IUB/AIUB), bKash/Nagad payment, OTP auth, pre-booked fixed seats.

**Out of scope (MVP):** Driver app, multi-route support, dynamic pricing, subscriptions, waitlists.
