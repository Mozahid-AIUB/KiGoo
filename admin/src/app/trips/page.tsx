import { createSupabaseServiceClient } from "@/lib/supabase/server";
import TripsClient from "./trips-client";

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
};

export default async function TripsPage() {
  const supabase = createSupabaseServiceClient();

  const [{ data: trips, error: tripsError }, { data: vehicles, error: vehiclesError }] =
    await Promise.all([
      supabase
        .from("trips")
        .select("*, vehicle:vehicles(*)")
        .order("trip_date", { ascending: true })
        .order("departure_time", { ascending: true }),
      supabase.from("vehicles").select("*").order("plate_no", { ascending: true }),
    ]);

  if (tripsError) throw new Error(tripsError.message);
  if (vehiclesError) throw new Error(vehiclesError.message);

  return (
    <TripsClient
      initialTrips={(trips ?? []) as unknown as TripRow[]}
      vehicles={(vehicles ?? []) as VehicleRow[]}
    />
  );
}
