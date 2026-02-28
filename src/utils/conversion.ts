import type { Frequency } from "../types/budget";

const PER_YEAR: Record<Frequency, number> = {
  daily: 365,
  weekly: 52,
  biweekly: 26,
  monthly: 12,
};

export function convertAmount(
  amount: number,
  from: Frequency,
  to: Frequency
): number {
  if (from === to) return amount;
  return amount * (PER_YEAR[from] / PER_YEAR[to]);
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
