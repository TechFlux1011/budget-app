import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
  type Dispatch,
} from "react";
import type {
  Budget,
  Frequency,
  IncomeSource,
  Expense,
} from "../types/budget";
import {
  loadBudget,
  saveBudget,
  loadBudgetFromFirestore,
  saveBudgetToFirestore,
  migrateLocalToFirestore,
} from "../utils/storage";
import { generateId } from "../utils/helpers";
import { useAuth } from "./AuthContext";

interface BudgetState {
  budget: Budget | null;
  viewScale: Frequency;
  isSetupComplete: boolean;
  hydrated: boolean;
}

type BudgetAction =
  | {
      type: "INIT_BUDGET";
      payload: { payFrequency: Frequency; nextPayDate: string };
    }
  | { type: "LOAD_BUDGET"; payload: Budget }
  | { type: "SET_VIEW_SCALE"; payload: Frequency }
  | { type: "ADD_INCOME"; payload: Omit<IncomeSource, "id"> }
  | { type: "UPDATE_INCOME"; payload: IncomeSource }
  | { type: "DELETE_INCOME"; payload: string }
  | { type: "ADD_EXPENSE"; payload: Omit<Expense, "id"> }
  | { type: "UPDATE_EXPENSE"; payload: Expense }
  | { type: "DELETE_EXPENSE"; payload: string }
  | { type: "UPDATE_PAY_SETTINGS"; payload: { payFrequency: Frequency; nextPayDate: string } }
  | { type: "HYDRATED" }
  | { type: "RESET" };

function budgetReducer(state: BudgetState, action: BudgetAction): BudgetState {
  switch (action.type) {
    case "INIT_BUDGET": {
      const budget: Budget = {
        id: generateId(),
        incomeSources: [],
        expenses: [],
        payFrequency: action.payload.payFrequency,
        nextPayDate: action.payload.nextPayDate,
      };
      return { ...state, budget, isSetupComplete: true, viewScale: action.payload.payFrequency };
    }

    case "LOAD_BUDGET":
      return { ...state, budget: action.payload, isSetupComplete: true };

    case "SET_VIEW_SCALE":
      return { ...state, viewScale: action.payload };

    case "ADD_INCOME": {
      if (!state.budget) return state;
      const income: IncomeSource = { ...action.payload, id: generateId() };
      return {
        ...state,
        budget: {
          ...state.budget,
          incomeSources: [...state.budget.incomeSources, income],
        },
      };
    }

    case "UPDATE_INCOME": {
      if (!state.budget) return state;
      return {
        ...state,
        budget: {
          ...state.budget,
          incomeSources: state.budget.incomeSources.map((i) =>
            i.id === action.payload.id ? action.payload : i
          ),
        },
      };
    }

    case "DELETE_INCOME": {
      if (!state.budget) return state;
      return {
        ...state,
        budget: {
          ...state.budget,
          incomeSources: state.budget.incomeSources.filter(
            (i) => i.id !== action.payload
          ),
        },
      };
    }

    case "ADD_EXPENSE": {
      if (!state.budget) return state;
      const expense: Expense = { ...action.payload, id: generateId() };
      return {
        ...state,
        budget: {
          ...state.budget,
          expenses: [...state.budget.expenses, expense],
        },
      };
    }

    case "UPDATE_EXPENSE": {
      if (!state.budget) return state;
      return {
        ...state,
        budget: {
          ...state.budget,
          expenses: state.budget.expenses.map((e) =>
            e.id === action.payload.id ? action.payload : e
          ),
        },
      };
    }

    case "DELETE_EXPENSE": {
      if (!state.budget) return state;
      return {
        ...state,
        budget: {
          ...state.budget,
          expenses: state.budget.expenses.filter(
            (e) => e.id !== action.payload
          ),
        },
      };
    }

    case "UPDATE_PAY_SETTINGS": {
      if (!state.budget) return state;
      return {
        ...state,
        budget: {
          ...state.budget,
          payFrequency: action.payload.payFrequency,
          nextPayDate: action.payload.nextPayDate,
        },
      };
    }

    case "HYDRATED":
      return { ...state, hydrated: true };

    case "RESET":
      return { budget: null, viewScale: "monthly", isSetupComplete: false, hydrated: true };

    default:
      return state;
  }
}

const BudgetContext = createContext<{
  state: BudgetState;
  dispatch: Dispatch<BudgetAction>;
} | null>(null);

export function BudgetProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [state, dispatch] = useReducer(budgetReducer, {
    budget: null,
    viewScale: "monthly",
    isSetupComplete: false,
    hydrated: false,
  });

  const prevUidRef = useRef<string | null>(null);

  // Hydrate budget from the right source when auth state settles
  useEffect(() => {
    if (authLoading) return;

    const uid = user?.uid ?? null;

    // Avoid re-hydrating for the same user
    if (uid === prevUidRef.current && state.hydrated) return;
    prevUidRef.current = uid;

    if (uid) {
      // Logged-in: migrate any local data, then load from Firestore
      (async () => {
        await migrateLocalToFirestore(uid);
        const cloud = await loadBudgetFromFirestore(uid);
        if (cloud) {
          dispatch({ type: "LOAD_BUDGET", payload: cloud });
          dispatch({ type: "SET_VIEW_SCALE", payload: cloud.payFrequency });
        } else {
          dispatch({ type: "RESET" });
        }
        dispatch({ type: "HYDRATED" });
      })();
    } else {
      // Guest: load from localStorage
      const saved = loadBudget();
      if (saved) {
        dispatch({ type: "LOAD_BUDGET", payload: saved });
        dispatch({ type: "SET_VIEW_SCALE", payload: saved.payFrequency });
      } else {
        dispatch({ type: "RESET" });
      }
      dispatch({ type: "HYDRATED" });
    }
  }, [authLoading, user, state.hydrated]);

  // Persist budget changes to the right storage
  const persist = useCallback(
    async (budget: Budget) => {
      if (user?.uid) {
        await saveBudgetToFirestore(user.uid, budget);
      } else {
        saveBudget(budget);
      }
    },
    [user]
  );

  useEffect(() => {
    if (state.budget && state.hydrated) {
      persist(state.budget);
    }
  }, [state.budget, state.hydrated, persist]);

  return (
    <BudgetContext.Provider value={{ state, dispatch }}>
      {children}
    </BudgetContext.Provider>
  );
}

export function useBudget() {
  const ctx = useContext(BudgetContext);
  if (!ctx) throw new Error("useBudget must be used within BudgetProvider");
  return ctx;
}
