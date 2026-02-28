import { useState } from "react";
import { useBudget } from "../context/BudgetContext";
import { convertAmount, formatCurrency } from "../utils/conversion";
import { FREQUENCY_LABELS } from "../types/budget";
import AddItemForm from "./AddItemForm";

export default function IncomeSection() {
  const { state, dispatch } = useBudget();
  const { budget, viewScale } = state;
  const [showForm, setShowForm] = useState(false);

  if (!budget) return null;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Income</h2>
        <button
          onClick={() => setShowForm(true)}
          className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors"
        >
          + Add
        </button>
      </div>

      {budget.incomeSources.length === 0 && !showForm && (
        <p className="text-sm text-gray-400 text-center py-4">
          No income sources yet.
        </p>
      )}

      <div className="space-y-3">
        {budget.incomeSources.map((income) => {
          const converted = convertAmount(
            income.amount,
            income.frequency,
            viewScale
          );
          return (
            <div
              key={income.id}
              className="flex items-center justify-between py-2 group"
            >
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">{income.name}</p>
                <p className="text-xs text-gray-400">
                  {formatCurrency(income.amount)}/{FREQUENCY_LABELS[income.frequency].toLowerCase()}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {formatCurrency(converted)}
                </p>
                <button
                  onClick={() =>
                    dispatch({ type: "DELETE_INCOME", payload: income.id })
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

      {showForm && (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
          <AddItemForm
            kind="income"
            defaultFrequency={budget.payFrequency}
            onAdd={(item) => {
              dispatch({ type: "ADD_INCOME", payload: item });
              setShowForm(false);
            }}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}
    </div>
  );
}
