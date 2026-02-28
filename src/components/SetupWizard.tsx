import { useState } from "react";
import { useBudget } from "../context/BudgetContext";
import type { Frequency } from "../types/budget";
import { FREQUENCY_LABELS } from "../types/budget";

const FREQUENCIES: Frequency[] = ["weekly", "biweekly", "monthly"];

const DAYS_OF_WEEK = [
  { label: "Sun", value: 0 },
  { label: "Mon", value: 1 },
  { label: "Tue", value: 2 },
  { label: "Wed", value: 3 },
  { label: "Thu", value: 4 },
  { label: "Fri", value: 5 },
  { label: "Sat", value: 6 },
] as const;

function nextOccurrenceOfDay(dayIndex: number): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayDay = today.getDay();
  const daysAhead = (dayIndex - todayDay + 7) % 7 || 7;
  const target = new Date(today);
  target.setDate(today.getDate() + daysAhead);
  return target.toISOString().split("T")[0];
}

export default function SetupWizard() {
  const { dispatch } = useBudget();
  const [step, setStep] = useState(0);
  const [payFrequency, setPayFrequency] = useState<Frequency>("biweekly");
  const [nextPayDate, setNextPayDate] = useState("");
  const [selectedPayDay, setSelectedPayDay] = useState<number | null>(null);
  const [incomeName, setIncomeName] = useState("Paycheck");
  const [incomeAmount, setIncomeAmount] = useState("");

  function handleFinish() {
    dispatch({
      type: "INIT_BUDGET",
      payload: { payFrequency, nextPayDate },
    });

    if (incomeAmount && Number(incomeAmount) > 0) {
      dispatch({
        type: "ADD_INCOME",
        payload: {
          name: incomeName || "Paycheck",
          amount: Number(incomeAmount),
          frequency: payFrequency,
        },
      });
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">BudgetFlow</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Let&apos;s set up your budget in a few quick steps.
          </p>
        </div>

        {/* Step indicators */}
        <div className="flex gap-2 mb-8">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i <= step
                  ? "bg-indigo-500"
                  : "bg-gray-200 dark:bg-gray-700"
              }`}
            />
          ))}
        </div>

        {step === 0 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-3">
                How often do you get paid?
              </label>
              <div className="grid grid-cols-3 gap-3">
                {FREQUENCIES.map((f) => (
                  <button
                    key={f}
                    onClick={() => setPayFrequency(f)}
                    className={`py-3 px-4 rounded-xl text-sm font-medium border-2 transition-all ${
                      payFrequency === f
                        ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                  >
                    {FREQUENCY_LABELS[f]}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={() => setStep(1)}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors"
            >
              Continue
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-3">
                What day of the week do you get paid?
              </label>
              <div className="grid grid-cols-7 gap-2">
                {DAYS_OF_WEEK.map((day) => (
                  <button
                    key={day.value}
                    onClick={() => {
                      setSelectedPayDay(day.value);
                      setNextPayDate(nextOccurrenceOfDay(day.value));
                    }}
                    className={`py-3 rounded-xl text-sm font-medium border-2 transition-all ${
                      selectedPayDay === day.value
                        ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setStep(0)}
                className="flex-1 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep(2)}
                disabled={selectedPayDay === null}
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Income name
              </label>
              <input
                type="text"
                value={incomeName}
                onChange={(e) => setIncomeName(e.target.value)}
                placeholder="e.g. Paycheck"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-transparent focus:border-indigo-500 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                How much per {FREQUENCY_LABELS[payFrequency].toLowerCase()} paycheck?
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  $
                </span>
                <input
                  type="number"
                  value={incomeAmount}
                  onChange={(e) => setIncomeAmount(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full pl-8 pr-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-transparent focus:border-indigo-500 focus:outline-none transition-colors"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleFinish}
                disabled={!incomeAmount || Number(incomeAmount) <= 0}
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors"
              >
                Finish Setup
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
