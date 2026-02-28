import { useState } from "react";
import { useBudget } from "../context/BudgetContext";
import { convertAmount, formatCurrency } from "../utils/conversion";
import { FREQUENCY_LABELS } from "../types/budget";
import AddItemForm from "./AddItemForm";

export default function ExpensesSection() {
  const { state, dispatch } = useBudget();
  const { budget, viewScale } = state;
  const [showForm, setShowForm] = useState(false);

  if (!budget) return null;

  const grouped = budget.expenses.reduce<Record<string, typeof budget.expenses>>(
    (acc, expense) => {
      const cat = expense.category || "Other";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(expense);
      return acc;
    },
    {}
  );

  const categories = Object.keys(grouped).sort();

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Expenses</h2>
        <button
          onClick={() => setShowForm(true)}
          className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors"
        >
          + Add
        </button>
      </div>

      {budget.expenses.length === 0 && !showForm && (
        <p className="text-sm text-gray-400 text-center py-4">
          No expenses yet.
        </p>
      )}

      <div className="space-y-4">
        {categories.map((cat) => (
          <div key={cat}>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
              {cat}
            </p>
            <div className="space-y-2">
              {grouped[cat].map((expense) => {
                const converted = convertAmount(
                  expense.amount,
                  expense.frequency,
                  viewScale
                );
                return (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between py-2 group"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">
                        {expense.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatCurrency(expense.amount)}/{FREQUENCY_LABELS[expense.frequency].toLowerCase()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-semibold text-red-500 tabular-nums">
                        {formatCurrency(converted)}
                      </p>
                      <button
                        onClick={() =>
                          dispatch({
                            type: "DELETE_EXPENSE",
                            payload: expense.id,
                          })
                        }
                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all text-lg leading-none"
                        title="Remove"
                      >
                        &times;
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
          <AddItemForm
            kind="expense"
            defaultFrequency="monthly"
            onAdd={(item) => {
              dispatch({
                type: "ADD_EXPENSE",
                payload: {
                  name: item.name,
                  amount: item.amount,
                  frequency: item.frequency,
                  category: item.category || "Other",
                },
              });
              setShowForm(false);
            }}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}
    </div>
  );
}
