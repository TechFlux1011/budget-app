import { useBudget } from "../context/BudgetContext";
import { convertAmount, formatCurrency } from "../utils/conversion";
import { FREQUENCY_LABELS } from "../types/budget";

export default function BudgetSummaryCard() {
  const { state } = useBudget();
  const { budget, viewScale } = state;
  if (!budget) return null;

  const totalIncome = budget.incomeSources.reduce(
    (sum, s) => sum + convertAmount(s.amount, s.frequency, viewScale),
    0
  );

  const totalExpenses = budget.expenses.reduce(
    (sum, e) => sum + convertAmount(e.amount, e.frequency, viewScale),
    0
  );

  const remaining = totalIncome - totalExpenses;
  const ratio = totalIncome > 0 ? totalExpenses / totalIncome : 0;

  let statusColor = "text-emerald-500";
  let barColor = "bg-emerald-500";
  let statusLabel = "On Track";

  if (ratio > 1) {
    statusColor = "text-red-500";
    barColor = "bg-red-500";
    statusLabel = "Over Budget";
  } else if (ratio > 0.85) {
    statusColor = "text-amber-500";
    barColor = "bg-amber-500";
    statusLabel = "Tight";
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">
          {FREQUENCY_LABELS[viewScale]} Overview
        </h2>
        <span className={`text-sm font-medium ${statusColor}`}>
          {statusLabel}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-5">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
            Income
          </p>
          <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(totalIncome)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
            Expenses
          </p>
          <p className="text-xl font-bold text-red-500">
            {formatCurrency(totalExpenses)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
            Remaining
          </p>
          <p className={`text-xl font-bold ${remaining >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}>
            {formatCurrency(remaining)}
          </p>
        </div>
      </div>

      <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${Math.min(ratio * 100, 100)}%` }}
        />
      </div>
      <p className="text-xs text-gray-400 mt-2">
        {Math.round(ratio * 100)}% of income allocated to expenses
      </p>
    </div>
  );
}
