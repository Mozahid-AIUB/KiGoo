import { createSupabaseServiceClient } from "@/lib/supabase/server";
import RoutesClient from "./routes-client";

export const dynamic = "force-dynamic";

export type VehicleRow = {
  id: string;
  plate_no: string;
  capacity: number;
};

export type LocationRow = {
  id: string;
  name: string;
  type: "pickup_point" | "campus";
  active: boolean;
};

export type SlotRow = {
  id: string;
  route_id: string;
  direction: "to_varsity" | "from_varsity";
  departure_time: string;
  arrival_time: string;
  vehicle_id: string | null;
  total_seats: number;
  fare: number;
  active: boolean;
};

export type RouteRow = {
  id: string;
  origin_id: string;
  destination_id: string;
  active: boolean;
  slots: SlotRow[];
};

export default async function RoutesPage() {
  const supabase = createSupabaseServiceClient();

  const [
    { data: routes, error: routesError },
    { data: slots, error: slotsError },
    { data: vehicles, error: vehiclesError },
    { data: locations, error: locationsError },
  ] = await Promise.all([
    supabase.from("routes").select("*").order("created_at", { ascending: true }),
    supabase.from("route_slots").select("*").order("departure_time", { ascending: true }),
    supabase.from("vehicles").select("id, plate_no, capacity").order("plate_no", { ascending: true }),
    supabase.from("locations").select("*").order("name", { ascending: true }),
  ]);

  if (routesError) throw new Error(routesError.message);
  if (slotsError) throw new Error(slotsError.message);
  if (vehiclesError) throw new Error(vehiclesError.message);
  if (locationsError) throw new Error(locationsError.message);

  const routesWithSlots: RouteRow[] = (routes ?? []).map((r) => ({
    ...r,
    slots: (slots ?? []).filter((s) => s.route_id === r.id),
  }));

  return (
    <RoutesClient
      initialRoutes={routesWithSlots}
      vehicles={(vehicles ?? []) as VehicleRow[]}
      locations={(locations ?? []) as LocationRow[]}
    />
  );
}
