import { supabase } from '../lib/supabase';

export type BookingStatus = 'confirmed' | 'completed' | 'cancelled';

export type Booking = {
  id: string;
  bookingCode: string;
  date: string;
  time: string;
  route: string;
  stop: string;
  seatNo: string;
  fare: number;
  status: BookingStatus;
  isToday?: boolean;
  sortAt: Date;
};

function formatDate(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00`);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  if (date.toDateString() === today.toDateString()) {
    return `Today, ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  }
  if (date.toDateString() === tomorrow.toDateString()) {
    return `Tomorrow, ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(timeStr: string): string {
  const [h, m] = timeStr.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}

type LocationRef = { name: string }[] | { name: string } | null;
type RouteRef = { origin: LocationRef; destination: LocationRef };
type RouteSlotRef = { route: RouteRef[] | RouteRef | null };

type BookingRow = {
  id: string;
  booking_code: string;
  seat: string;
  fare: number;
  status: string;
  trip: {
    trip_date: string;
    departure_time: string;
    direction: string;
    route_slot: RouteSlotRef[] | RouteSlotRef | null;
  } | null;
};

function unwrap<T>(value: T[] | T | null | undefined): T | null {
  if (value == null) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
}

export async function fetchBookings(userId: string): Promise<Booking[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select(
      `id, booking_code, seat, fare, status,
       trip:trips(trip_date, departure_time, direction,
         route_slot:route_slots(route:routes(
           origin:locations!routes_origin_id_fkey(name),
           destination:locations!routes_destination_id_fkey(name)
         )))`
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  const today = new Date().toDateString();

  return ((data ?? []) as unknown as BookingRow[])
    .filter((b) => b.trip)
    .map((b) => {
      const trip = b.trip!;
      const slot = unwrap(trip.route_slot);
      const route = unwrap(slot?.route);
      const origin = unwrap(route?.origin);
      const destination = unwrap(route?.destination);

      const fromName = trip.direction === 'to_varsity' ? origin?.name : destination?.name;
      const toName = trip.direction === 'to_varsity' ? destination?.name : origin?.name;
      const isToday = new Date(`${trip.trip_date}T00:00:00`).toDateString() === today;
      const sortAt = new Date(`${trip.trip_date}T${trip.departure_time}`);
      const isPast = sortAt.getTime() < Date.now();

      return {
        id: b.id,
        bookingCode: b.booking_code,
        date: formatDate(trip.trip_date),
        time: formatTime(trip.departure_time),
        route: `${fromName ?? '—'} → ${toName ?? '—'}`,
        stop: toName ?? '—',
        seatNo: b.seat,
        fare: b.fare,
        status: b.status === 'cancelled' ? 'cancelled' : isPast ? 'completed' : 'confirmed',
        isToday,
        sortAt,
      };
    });
}

export async function createBooking(tripId: string, seat: string) {
  return supabase.rpc('create_booking', { p_trip_id: tripId, p_seat: seat });
}

export async function cancelBooking(bookingId: string) {
  return supabase.rpc('cancel_booking', { p_booking_id: bookingId });
}

export async function fetchOccupiedSeats(tripId: string): Promise<Set<string>> {
  const { data } = await supabase
    .from('bookings')
    .select('seat')
    .eq('trip_id', tripId)
    .in('status', ['booked', 'boarded']);

  return new Set((data ?? []).map((b) => b.seat));
}
