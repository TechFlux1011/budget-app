import { useState } from "react";
import type { Frequency } from "../types/budget";
import { FREQUENCY_LABELS, EXPENSE_CATEGORIES } from "../types/budget";

const FREQUENCIES: Frequency[] = ["daily", "weekly", "biweekly", "monthly"];

interface AddItemFormProps {
  kind: "income" | "expense";
  defaultFrequency: Frequency;
  onAdd: (item: {
    name: string;
    amount: number;
    frequency: Frequency;
    category?: string;
  }) => void;
  onCancel: () => void;
}

export default function AddItemForm({
  kind,
  defaultFrequency,
  onAdd,
  onCancel,
}: AddItemFormProps) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [frequency, setFrequency] = useState<Frequency>(defaultFrequency);
  const [category, setCategory] = useState<string>(EXPENSE_CATEGORIES[0]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !amount || Number(amount) <= 0) return;
    onAdd({
      name: name.trim(),
      amount: Number(amount),
      frequency,
      ...(kind === "expense" ? { category } : {}),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="text"
        placeholder={kind === "income" ? "Income name" : "Expense name"}
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoFocus
        className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-sm focus:border-indigo-500 focus:outline-none transition-colors"
      />

      <div className="flex gap-2">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
            $
          </span>
          <input
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="0"
            step="0.01"
            className="w-full pl-7 pr-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-sm focus:border-indigo-500 focus:outline-none transition-colors"
          />
        </div>
        <select
          value={frequency}
          onChange={(e) => setFrequency(e.target.value as Frequency)}
          className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-sm focus:border-indigo-500 focus:outline-none transition-colors"
        >
          {FREQUENCIES.map((f) => (
            <option key={f} value={f}>
              {FREQUENCY_LABELS[f]}
            </option>
          ))}
        </select>
      </div>

      {kind === "expense" && (
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-sm focus:border-indigo-500 focus:outline-none transition-colors"
        >
          {EXPENSE_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
        >
          Add {kind === "income" ? "Income" : "Expense"}
        </button>
      </div>
    </form>
  );
}
