"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

export type ActionState = { error?: string } | null;

export async function createTrip(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const trip_date = formData.get("trip_date");
  const departure_time = formData.get("departure_time");
  const direction = formData.get("direction");
  const vehicle_id = formData.get("vehicle_id");
  const total_seats = formData.get("total_seats");

  if (!trip_date || !departure_time || !direction || !vehicle_id || !total_seats) {
    return { error: "All fields are required." };
  }

  const supabase = createSupabaseServiceClient();
  const { error } = await supabase.from("trips").insert({
    trip_date: String(trip_date),
    departure_time: String(departure_time),
    direction: String(direction),
    vehicle_id: String(vehicle_id),
    total_seats: Number(total_seats),
    available_seats: Number(total_seats),
  });

  if (error) return { error: error.message };

  revalidatePath("/trips");
  return null;
}

export async function updateTrip(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const id = formData.get("id");
  const trip_date = formData.get("trip_date");
  const departure_time = formData.get("departure_time");
  const direction = formData.get("direction");
  const vehicle_id = formData.get("vehicle_id");
  const total_seats = formData.get("total_seats");

  if (!id || !trip_date || !departure_time || !direction || !vehicle_id || !total_seats) {
    return { error: "All fields are required." };
  }

  const supabase = createSupabaseServiceClient();
  const { error } = await supabase
    .from("trips")
    .update({
      trip_date: String(trip_date),
      departure_time: String(departure_time),
      direction: String(direction),
      vehicle_id: String(vehicle_id),
      total_seats: Number(total_seats),
    })
    .eq("id", String(id));

  if (error) return { error: error.message };

  revalidatePath("/trips");
  return null;
}

export async function cancelTrip(tripId: string) {
  const supabase = createSupabaseServiceClient();
  const { error } = await supabase
    .from("trips")
    .update({ status: "cancelled" })
    .eq("id", tripId);

  if (error) throw new Error(error.message);
  revalidatePath("/trips");
}

export type PassengerRow = {
  id: string;
  booking_code: string;
  seat: string;
  status: "booked" | "boarded" | "cancelled";
  profile: { first_name: string; last_name: string; phone: string } | null;
};

export async function fetchPassengers(tripId: string): Promise<PassengerRow[]> {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("bookings")
    .select("id, booking_code, seat, status, profile:profiles(first_name, last_name, phone)")
    .eq("trip_id", tripId)
    .in("status", ["booked", "boarded"])
    .order("seat", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as PassengerRow[];
}

export async function addVehicle(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const plate_no = formData.get("plate_no");
  const capacity = formData.get("capacity");
  const driver_name = formData.get("driver_name");
  const driver_phone = formData.get("driver_phone");

  if (!plate_no || !capacity) {
    return { error: "Plate number and capacity are required." };
  }

  const supabase = createSupabaseServiceClient();
  const { error } = await supabase.from("vehicles").insert({
    plate_no: String(plate_no),
    capacity: Number(capacity),
    driver_name: driver_name ? String(driver_name) : null,
    driver_phone: driver_phone ? String(driver_phone) : null,
  });

  if (error) return { error: error.message };

  revalidatePath("/trips");
  return null;
}
