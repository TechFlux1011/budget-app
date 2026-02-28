import { useBudget } from "../context/BudgetContext";
import type { Frequency } from "../types/budget";
import { FREQUENCY_LABELS } from "../types/budget";

const SCALES: Frequency[] = ["daily", "weekly", "biweekly", "monthly"];

export default function TimeScaleSelector() {
  const { state, dispatch } = useBudget();

  return (
    <div className="inline-flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 gap-1">
      {SCALES.map((scale) => (
        <button
          key={scale}
          onClick={() =>
            dispatch({ type: "SET_VIEW_SCALE", payload: scale })
          }
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            state.viewScale === scale
              ? "bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          {FREQUENCY_LABELS[scale]}
        </button>
      ))}
    </div>
  );
}
