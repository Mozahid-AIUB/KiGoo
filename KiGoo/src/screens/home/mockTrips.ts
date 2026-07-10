export type RouteId = 'nsu' | 'iub' | 'aiub';

export type Route = {
  id: RouteId;
  university: string;
  label: string;
  pickupPoint: string;
};

export const routes: Route[] = [
  { id: 'nsu', university: 'NSU', label: 'Mohammadpur ↔ NSU', pickupPoint: 'Mohammadpur Bus Stand' },
  { id: 'iub', university: 'IUB', label: 'Mohammadpur ↔ IUB', pickupPoint: 'Mohammadpur Bus Stand' },
  { id: 'aiub', university: 'AIUB', label: 'Mohammadpur ↔ AIUB', pickupPoint: 'Mohammadpur Bus Stand' },
];

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

export const mockTrips: Trip[] = [
  {
    id: 't1',
    routeId: 'nsu',
    date: 'Today, Jul 11',
    time: '7:00 AM',
    direction: 'to_campus',
    busNo: 'KG-101',
    availableSeats: 6,
    totalSeats: 14,
    fare: 80,
  },
  {
    id: 't2',
    routeId: 'nsu',
    date: 'Today, Jul 11',
    time: '5:00 PM',
    direction: 'from_campus',
    busNo: 'KG-101',
    availableSeats: 9,
    totalSeats: 14,
    fare: 80,
  },
  {
    id: 't3',
    routeId: 'iub',
    date: 'Today, Jul 11',
    time: '8:00 AM',
    direction: 'to_campus',
    busNo: 'KG-102',
    availableSeats: 2,
    totalSeats: 14,
    fare: 90,
  },
  {
    id: 't4',
    routeId: 'iub',
    date: 'Today, Jul 11',
    time: '4:30 PM',
    direction: 'from_campus',
    busNo: 'KG-102',
    availableSeats: 0,
    totalSeats: 14,
    fare: 90,
  },
  {
    id: 't5',
    routeId: 'aiub',
    date: 'Today, Jul 11',
    time: '9:00 AM',
    direction: 'to_campus',
    busNo: 'KG-103',
    availableSeats: 5,
    totalSeats: 14,
    fare: 85,
  },
  {
    id: 't6',
    routeId: 'aiub',
    date: 'Today, Jul 11',
    time: '1:00 PM',
    direction: 'from_campus',
    busNo: 'KG-103',
    availableSeats: 11,
    totalSeats: 14,
    fare: 85,
  },
];

export function tripsForRoute(routeId: RouteId): Trip[] {
  return mockTrips.filter((t) => t.routeId === routeId);
}
