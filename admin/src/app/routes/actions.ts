"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

export type ActionState = { error?: string } | null;

export async function createLocation(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const name = formData.get("name");
  const type = formData.get("type");

  if (!name || !type) {
    return { error: "Name and type are required." };
  }

  const supabase = createSupabaseServiceClient();
  const { error } = await supabase.from("locations").insert({
    name: String(name),
    type: String(type),
  });

  if (error) {
    if (error.code === "23505") return { error: "A location with this name already exists." };
    return { error: error.message };
  }
  revalidatePath("/routes");
  return null;
}

export async function toggleLocationActive(id: string, active: boolean) {
  const supabase = createSupabaseServiceClient();
  const { error } = await supabase.from("locations").update({ active }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/routes");
}

export async function createRoute(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const origin_id = formData.get("origin_id");
  const destination_id = formData.get("destination_id");

  if (!origin_id || !destination_id) {
    return { error: "Origin and destination are required." };
  }
  if (origin_id === destination_id) {
    return { error: "Origin and destination must be different locations." };
  }

  const supabase = createSupabaseServiceClient();
  const { error } = await supabase.from("routes").insert({
    origin_id: String(origin_id),
    destination_id: String(destination_id),
  });

  if (error) return { error: error.message };
  revalidatePath("/routes");
  return null;
}

export async function updateRoute(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const id = formData.get("id");
  const origin_id = formData.get("origin_id");
  const destination_id = formData.get("destination_id");

  if (!id || !origin_id || !destination_id) {
    return { error: "Origin and destination are required." };
  }
  if (origin_id === destination_id) {
    return { error: "Origin and destination must be different locations." };
  }

  const supabase = createSupabaseServiceClient();
  const { error } = await supabase
    .from("routes")
    .update({
      origin_id: String(origin_id),
      destination_id: String(destination_id),
    })
    .eq("id", String(id));

  if (error) return { error: error.message };
  revalidatePath("/routes");
  return null;
}

export async function toggleRouteActive(id: string, active: boolean) {
  const supabase = createSupabaseServiceClient();
  const { error } = await supabase.from("routes").update({ active }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/routes");
}

export async function createSlot(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const route_id = formData.get("route_id");
  const direction = formData.get("direction");
  const departure_time = formData.get("departure_time");
  const arrival_time = formData.get("arrival_time");
  const vehicle_id = formData.get("vehicle_id");
  const total_seats = formData.get("total_seats");
  const fare = formData.get("fare");

  if (!route_id || !direction || !departure_time || !arrival_time || !total_seats) {
    return { error: "All fields are required." };
  }

  const supabase = createSupabaseServiceClient();
  const { error } = await supabase.from("route_slots").insert({
    route_id: String(route_id),
    direction: String(direction),
    departure_time: String(departure_time),
    arrival_time: String(arrival_time),
    vehicle_id: vehicle_id ? String(vehicle_id) : null,
    total_seats: Number(total_seats),
    fare: fare ? Number(fare) : 0,
  });

  if (error) return { error: error.message };
  revalidatePath("/routes");
  return null;
}

export async function updateSlot(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const id = formData.get("id");
  const direction = formData.get("direction");
  const departure_time = formData.get("departure_time");
  const arrival_time = formData.get("arrival_time");
  const vehicle_id = formData.get("vehicle_id");
  const total_seats = formData.get("total_seats");
  const fare = formData.get("fare");

  if (!id || !direction || !departure_time || !arrival_time || !total_seats) {
    return { error: "All fields are required." };
  }

  const supabase = createSupabaseServiceClient();
  const { error } = await supabase
    .from("route_slots")
    .update({
      direction: String(direction),
      departure_time: String(departure_time),
      arrival_time: String(arrival_time),
      vehicle_id: vehicle_id ? String(vehicle_id) : null,
      total_seats: Number(total_seats),
      fare: fare ? Number(fare) : 0,
    })
    .eq("id", String(id));

  if (error) return { error: error.message };
  revalidatePath("/routes");
  return null;
}

export async function toggleSlotActive(id: string, active: boolean) {
  const supabase = createSupabaseServiceClient();
  const { error } = await supabase.from("route_slots").update({ active }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/routes");
}

export async function deleteSlot(id: string) {
  const supabase = createSupabaseServiceClient();
  const { error } = await supabase.from("route_slots").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/routes");
}

const DAYS_TO_GENERATE = 7;

export async function generateUpcomingTrips() {
  const supabase = createSupabaseServiceClient();

  const { data: slots, error: slotsError } = await supabase
    .from("route_slots")
    .select("id, direction, departure_time, vehicle_id, total_seats")
    .eq("active", true);

  if (slotsError) throw new Error(slotsError.message);
  if (!slots || slots.length === 0) return { created: 0 };

  const dates: string[] = [];
  for (let i = 0; i < DAYS_TO_GENERATE; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    dates.push(d.toISOString().slice(0, 10));
  }

  const { data: existing, error: existingError } = await supabase
    .from("trips")
    .select("route_slot_id, trip_date")
    .in("trip_date", dates)
    .not("route_slot_id", "is", null);

  if (existingError) throw new Error(existingError.message);

  const existingKeys = new Set((existing ?? []).map((t) => `${t.route_slot_id}_${t.trip_date}`));

  const rowsToInsert = [];
  for (const slot of slots) {
    if (!slot.vehicle_id) continue;
    for (const date of dates) {
      const key = `${slot.id}_${date}`;
      if (existingKeys.has(key)) continue;
      rowsToInsert.push({
        trip_date: date,
        departure_time: slot.departure_time,
        direction: slot.direction,
        vehicle_id: slot.vehicle_id,
        total_seats: slot.total_seats,
        available_seats: slot.total_seats,
        route_slot_id: slot.id,
      });
    }
  }

  if (rowsToInsert.length === 0) return { created: 0 };

  const { error: insertError } = await supabase.from("trips").insert(rowsToInsert);
  if (insertError) throw new Error(insertError.message);

  revalidatePath("/routes");
  revalidatePath("/trips");
  return { created: rowsToInsert.length };
}
