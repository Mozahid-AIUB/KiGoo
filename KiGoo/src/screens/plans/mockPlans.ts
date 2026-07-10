export type Plan = {
  id: string;
  name: string;
  durationLabel: string;
  price: number;
  perDay: number;
  highlighted?: boolean;
};

export const mockPlans: Plan[] = [
  { id: 'p1', name: 'Weekly', durationLabel: '7 days', price: 450, perDay: 64 },
  { id: 'p2', name: '15-Day', durationLabel: '15 days', price: 850, perDay: 57, highlighted: true },
  { id: 'p3', name: 'Monthly', durationLabel: '30 days', price: 1500, perDay: 50 },
];
