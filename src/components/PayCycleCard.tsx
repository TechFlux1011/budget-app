import { useBudget } from "../context/BudgetContext";
import { convertAmount, formatCurrency } from "../utils/conversion";
import {
  daysUntil,
  payPeriodProgress,
  formatDate,
} from "../utils/helpers";
import { FREQUENCY_LABELS } from "../types/budget";

export default function PayCycleCard() {
  const { state } = useBudget();
  const { budget } = state;
  if (!budget) return null;

  const days = daysUntil(budget.nextPayDate);
  const progress = payPeriodProgress(budget.nextPayDate, budget.payFrequency);

  const totalIncome = budget.incomeSources.reduce(
    (sum, s) => sum + convertAmount(s.amount, s.frequency, budget.payFrequency),
    0
  );
  const totalExpenses = budget.expenses.reduce(
    (sum, e) => sum + convertAmount(e.amount, e.frequency, budget.payFrequency),
    0
  );
  const remaining = totalIncome - totalExpenses;
  const dailyAllowance = days > 0 ? remaining / days : remaining;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
      <h2 className="text-lg font-semibold mb-4">Pay Cycle</h2>

      <div className="flex items-end justify-between mb-3">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Next payday
          </p>
          <p className="text-lg font-bold">{formatDate(budget.nextPayDate)}</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-extrabold tabular-nums">{days}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {days === 1 ? "day" : "days"} left
          </p>
        </div>
      </div>

      <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5 overflow-hidden mb-4">
        <div
          className="h-full rounded-full bg-indigo-500 transition-all duration-500"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100 dark:border-gray-800">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
            {FREQUENCY_LABELS[budget.payFrequency]} Budget
          </p>
          <p className={`text-lg font-bold ${remaining >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}>
            {formatCurrency(remaining)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
            Daily Allowance
          </p>
          <p className={`text-lg font-bold ${dailyAllowance >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}>
            {formatCurrency(dailyAllowance)}
          </p>
        </div>
      </div>
    </div>
  );
}
