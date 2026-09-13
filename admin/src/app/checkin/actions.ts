"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

export type CheckinResult =
  | { ok: true; passenger: string; seat: string; route: string; time: string }
  | { ok: false; error: string };

export async function checkInBooking(bookingCode: string): Promise<CheckinResult> {
  const supabase = createSupabaseServiceClient();

  const { data: booking, error } = await supabase
    .from("bookings")
    .select(
      `id, seat, status,
       profile:profiles(first_name, last_name),
       trip:trips(trip_date, departure_time, direction,
         route_slot:route_slots(route:routes(
           origin:locations!routes_origin_id_fkey(name),
           destination:locations!routes_destination_id_fkey(name)
         )))`
    )
    .eq("booking_code", bookingCode.trim().toUpperCase())
    .maybeSingle();

  if (error) return { ok: false, error: error.message };
  if (!booking) return { ok: false, error: "No booking found with this code." };
  if (booking.status === "cancelled") return { ok: false, error: "This booking was cancelled." };
  if (booking.status === "boarded") return { ok: false, error: "This passenger has already boarded." };

  const { error: updateError } = await supabase
    .from("bookings")
    .update({ status: "boarded", boarded_at: new Date().toISOString() })
    .eq("id", booking.id);

  if (updateError) return { ok: false, error: updateError.message };

  revalidatePath("/trips");

  const profile = Array.isArray(booking.profile) ? booking.profile[0] : booking.profile;
  const trip = Array.isArray(booking.trip) ? booking.trip[0] : booking.trip;
  const slot = trip ? (Array.isArray(trip.route_slot) ? trip.route_slot[0] : trip.route_slot) : null;
  const route = slot ? (Array.isArray(slot.route) ? slot.route[0] : slot.route) : null;
  const origin = route ? (Array.isArray(route.origin) ? route.origin[0] : route.origin) : null;
  const destination = route
    ? Array.isArray(route.destination)
      ? route.destination[0]
      : route.destination
    : null;
  const fromName = trip?.direction === "to_varsity" ? origin?.name : destination?.name;
  const toName = trip?.direction === "to_varsity" ? destination?.name : origin?.name;

  return {
    ok: true,
    passenger: profile ? `${profile.first_name} ${profile.last_name}` : "Unknown passenger",
    seat: booking.seat,
    route: `${fromName ?? "—"} → ${toName ?? "—"}`,
    time: trip ? `${trip.departure_time?.slice(0, 5)} · ${trip.trip_date}` : "—",
  };
}
