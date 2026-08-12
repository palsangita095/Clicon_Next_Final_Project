export interface CustomerStats {
  total: number;
  inTransit: number;
  completed: number;
  totalSpent: number;
}

export interface MonthlyPoint {
  month: string;
  value: number;
}
