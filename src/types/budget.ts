export type Frequency = "monthly" | "biweekly" | "weekly" | "daily";

export interface IncomeSource {
  id: string;
  name: string;
  amount: number;
  frequency: Frequency;
}

export interface Expense {
  id: string;
  name: string;
  amount: number;
  frequency: Frequency;
  category: string;
}

export interface Budget {
  id: string;
  incomeSources: IncomeSource[];
  expenses: Expense[];
  payFrequency: Frequency;
  nextPayDate: string;
}

export const FREQUENCY_LABELS: Record<Frequency, string> = {
  monthly: "Monthly",
  biweekly: "Bi-Weekly",
  weekly: "Weekly",
  daily: "Daily",
};

export const EXPENSE_CATEGORIES = [
  "Housing",
  "Utilities",
  "Groceries",
  "Transportation",
  "Insurance",
  "Subscriptions",
  "Entertainment",
  "Dining Out",
  "Health",
  "Savings",
  "Debt",
  "Other",
] as const;
