export type Booking = {
  id: string;
  date: string;
  time: string;
  route: string;
  stop: string;
  seatNo: string;
  status: 'confirmed' | 'completed' | 'cancelled';
  isToday?: boolean;
};

export const upcomingBookings: Booking[] = [
  {
    id: 'b0',
    date: 'Today, Jul 11',
    time: '5:00 PM',
    route: 'AIUB → Mohammadpur',
    stop: 'Mohammadpur',
    seatNo: 'A2',
    status: 'confirmed',
    isToday: true,
  },
  {
    id: 'b1',
    date: 'Tomorrow, Jul 12',
    time: '9:00 AM',
    route: 'Mohammadpur → AIUB',
    stop: 'AIUB',
    seatNo: 'A4',
    status: 'confirmed',
  },
];

export const pastBookings: Booking[] = [
  {
    id: 'b2',
    date: 'Jul 8, 2026',
    time: '5:00 PM',
    route: 'AIUB → Mohammadpur',
    stop: 'Mohammadpur',
    seatNo: 'B2',
    status: 'completed',
  },
];

export const cancelledBookings: Booking[] = [
  {
    id: 'b3',
    date: 'Jul 5, 2026',
    time: '7:00 AM',
    route: 'Mohammadpur → NSU',
    stop: 'NSU',
    seatNo: 'C1',
    status: 'cancelled',
  },
];
