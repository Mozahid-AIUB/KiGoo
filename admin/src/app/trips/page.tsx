import { createSupabaseServiceClient } from "@/lib/supabase/server";
import TripsClient from "./trips-client";

export const dynamic = "force-dynamic";

export type VehicleRow = {
  id: string;
  plate_no: string;
  capacity: number;
  driver_name: string | null;
  driver_phone: string | null;
};

export type TripRow = {
  id: string;
  trip_date: string;
  departure_time: string;
  direction: "to_varsity" | "from_varsity";
  vehicle_id: string;
  total_seats: number;
  available_seats: number;
  status: "scheduled" | "cancelled" | "completed";
  vehicle: VehicleRow | null;
  booked_count: number;
};

export default async function TripsPage() {
  const supabase = createSupabaseServiceClient();

  const [{ data: trips, error: tripsError }, { data: vehicles, error: vehiclesError }, { data: bookings, error: bookingsError }] =
    await Promise.all([
      supabase
        .from("trips")
        .select("*, vehicle:vehicles(*)")
        .order("trip_date", { ascending: true })
        .order("departure_time", { ascending: true }),
      supabase.from("vehicles").select("*").order("plate_no", { ascending: true }),
      supabase.from("bookings").select("trip_id").in("status", ["booked", "boarded"]),
    ]);

  if (tripsError) throw new Error(tripsError.message);
  if (vehiclesError) throw new Error(vehiclesError.message);
  if (bookingsError) throw new Error(bookingsError.message);

  const bookedCounts = new Map<string, number>();
  for (const b of bookings ?? []) {
    bookedCounts.set(b.trip_id, (bookedCounts.get(b.trip_id) ?? 0) + 1);
  }

  const tripsWithCounts: TripRow[] = ((trips ?? []) as unknown as TripRow[]).map((t) => ({
    ...t,
    booked_count: bookedCounts.get(t.id) ?? 0,
  }));

  return <TripsClient initialTrips={tripsWithCounts} vehicles={(vehicles ?? []) as VehicleRow[]} />;
}
