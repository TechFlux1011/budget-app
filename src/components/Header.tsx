import { useState, useRef, useEffect } from "react";
import { useBudget } from "../context/BudgetContext";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { clearBudget, clearBudgetFromFirestore } from "../utils/storage";
import type { Frequency } from "../types/budget";
import { FREQUENCY_LABELS } from "../types/budget";

const FREQUENCIES: Frequency[] = ["weekly", "biweekly", "monthly"];

interface HeaderProps {
  onShowAuth: () => void;
}

export default function Header({ onShowAuth }: HeaderProps) {
  const { state, dispatch } = useBudget();
  const { user, signOut } = useAuth();
  const { theme, toggle: toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const budget = state.budget;

  const [payFrequency, setPayFrequency] = useState<Frequency>(
    budget?.payFrequency ?? "biweekly"
  );
  const [nextPayDate, setNextPayDate] = useState(budget?.nextPayDate ?? "");

  useEffect(() => {
    if (budget) {
      setPayFrequency(budget.payFrequency);
      setNextPayDate(budget.nextPayDate);
    }
  }, [budget]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  function handleSave() {
    dispatch({
      type: "UPDATE_PAY_SETTINGS",
      payload: { payFrequency, nextPayDate },
    });
    setOpen(false);
  }

  async function handleReset() {
    if (window.confirm("Reset all budget data? This cannot be undone.")) {
      if (user?.uid) {
        await clearBudgetFromFirestore(user.uid);
      }
      clearBudget();
      dispatch({ type: "RESET" });
    }
  }

  async function handleSignOut() {
    await signOut();
    setOpen(false);
  }

  const displayName =
    user?.displayName || user?.email?.split("@")[0] || "User";

  return (
    <header className="flex items-center justify-between">
      <h1 className="text-2xl font-bold tracking-tight">BudgetFlow</h1>

      <div className="relative" ref={panelRef}>
        <button
          onClick={() => setOpen(!open)}
          className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center hover:bg-indigo-200 dark:hover:bg-indigo-900 transition-colors"
        >
          {user ? (
            <span className="text-sm font-bold leading-none">
              {(user.displayName || user.email || "U")[0].toUpperCase()}
            </span>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          )}
        </button>

        {open && (
          <div className="absolute right-0 top-12 w-72 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 p-5 z-50 space-y-4">
            {/* Account section */}
            {user ? (
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">
                    {displayName}
                  </p>
                  {user.email && (
                    <p className="text-xs text-gray-400 truncate">
                      {user.email}
                    </p>
                  )}
                </div>
                <button
                  onClick={handleSignOut}
                  className="text-xs text-gray-400 hover:text-red-500 transition-colors whitespace-nowrap ml-3"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setOpen(false);
                  onShowAuth();
                }}
                className="w-full py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-colors"
              >
                Sign in to save your data
              </button>
            )}

            <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1.5">
                Pay Frequency
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {FREQUENCIES.map((f) => (
                  <button
                    key={f}
                    onClick={() => setPayFrequency(f)}
                    className={`py-1.5 rounded-lg text-xs font-medium border transition-all ${
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

            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1.5">
                Next Payday
              </label>
              <input
                type="date"
                value={nextPayDate}
                onChange={(e) => setNextPayDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-sm focus:border-indigo-500 focus:outline-none transition-colors"
              />
            </div>

            <button
              onClick={handleSave}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg font-medium transition-colors"
            >
              Save
            </button>

            <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {theme === "dark" ? "Dark Mode" : "Light Mode"}
              </span>
              <button
                onClick={toggleTheme}
                className={`relative w-10 h-5 rounded-full transition-colors ${
                  theme === "dark" ? "bg-indigo-600" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                    theme === "dark" ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
              <button
                onClick={handleReset}
                className="w-full text-xs text-gray-400 hover:text-red-500 transition-colors text-center"
              >
                Reset All Data
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
