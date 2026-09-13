import { supabase } from '../../lib/supabase';

export type RouteId = string;

export type Route = {
  id: RouteId;
  university: string;
  label: string;
  origin: string;
  destination: string;
  pickupPoint: string;
};

export type Trip = {
  id: string;
  routeId: RouteId;
  date: string;
  time: string;
  direction: 'to_campus' | 'from_campus';
  busNo: string;
  availableSeats: number;
  totalSeats: number;
  fare: number;
};

function formatTripDate(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00`);
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();
  const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return isToday ? `Today, ${label}` : label;
}

function formatTripTime(timeStr: string): string {
  const [h, m] = timeStr.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}

export async function fetchRoutes(): Promise<Route[]> {
  const { data, error } = await supabase
    .from('routes')
    .select(
      'id, origin:locations!routes_origin_id_fkey(name), destination:locations!routes_destination_id_fkey(name)'
    )
    .eq('active', true)
    .order('created_at', { ascending: true });

  if (error) throw error;

  return (data ?? []).map((r) => {
    const origin = Array.isArray(r.origin) ? r.origin[0] : r.origin;
    const destination = Array.isArray(r.destination) ? r.destination[0] : r.destination;
    return {
      id: r.id,
      university: destination?.name ?? '',
      origin: origin?.name ?? '',
      destination: destination?.name ?? '',
      label: `${origin?.name ?? ''} ↔ ${destination?.name ?? ''}`,
      pickupPoint: origin?.name ?? '',
    };
  });
}

export async function fetchTripsForRoute(routeId: RouteId): Promise<Trip[]> {
  const today = new Date().toISOString().slice(0, 10);
  const now = Date.now();

  const { data, error } = await supabase
    .from('trips')
    .select('id, trip_date, departure_time, direction, available_seats, total_seats, vehicle:vehicles(plate_no), route_slot:route_slots!inner(fare, route_id)')
    .eq('route_slot.route_id', routeId)
    .eq('status', 'scheduled')
    .gte('trip_date', today)
    .order('trip_date', { ascending: true })
    .order('departure_time', { ascending: true });

  if (error) throw error;

  return (data ?? [])
    .filter((t) => new Date(`${t.trip_date}T${t.departure_time}`).getTime() > now)
    .map((t) => {
    const vehicle = Array.isArray(t.vehicle) ? t.vehicle[0] : t.vehicle;
    const slot = Array.isArray(t.route_slot) ? t.route_slot[0] : t.route_slot;
    return {
      id: t.id,
      routeId,
      date: formatTripDate(t.trip_date),
      time: formatTripTime(t.departure_time),
      direction: t.direction === 'to_varsity' ? 'to_campus' : 'from_campus',
      busNo: vehicle?.plate_no ?? '—',
      availableSeats: t.available_seats,
      totalSeats: t.total_seats,
      fare: slot?.fare ?? 0,
    };
  });
}
