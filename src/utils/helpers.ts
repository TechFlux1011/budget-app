import type { Frequency } from "../types/budget";

export function generateId(): string {
  return crypto.randomUUID();
}

export function daysUntil(dateStr: string): number {
  const target = new Date(dateStr + "T00:00:00");
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diff = target.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function payPeriodDays(frequency: Frequency): number {
  switch (frequency) {
    case "daily":
      return 1;
    case "weekly":
      return 7;
    case "biweekly":
      return 14;
    case "monthly":
      return 30;
  }
}

export function payPeriodProgress(
  nextPayDate: string,
  frequency: Frequency
): number {
  const totalDays = payPeriodDays(frequency);
  const remaining = daysUntil(nextPayDate);
  const elapsed = totalDays - remaining;
  return Math.min(1, Math.max(0, elapsed / totalDays));
}

export function nextPayDateAfter(
  currentNextPay: string,
  frequency: Frequency
): string {
  const date = new Date(currentNextPay + "T00:00:00");
  const days = payPeriodDays(frequency);
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}
