import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "./firebase";
import type { Budget } from "../types/budget";

const STORAGE_KEY = "budgetflow_data";

// ── localStorage (guest mode) ──────────────────────────────

export function loadBudget(): Budget | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Budget;
  } catch {
    return null;
  }
}

export function saveBudget(budget: Budget): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(budget));
}

export function clearBudget(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// ── Firestore (logged-in mode) ─────────────────────────────

function budgetDocRef(uid: string) {
  return doc(db, "users", uid, "budget", "current");
}

export async function loadBudgetFromFirestore(
  uid: string
): Promise<Budget | null> {
  try {
    const snap = await getDoc(budgetDocRef(uid));
    if (!snap.exists()) return null;
    return snap.data() as Budget;
  } catch {
    return null;
  }
}

export async function saveBudgetToFirestore(
  uid: string,
  budget: Budget
): Promise<void> {
  await setDoc(budgetDocRef(uid), budget);
}

export async function clearBudgetFromFirestore(uid: string): Promise<void> {
  await deleteDoc(budgetDocRef(uid));
}

export async function migrateLocalToFirestore(uid: string): Promise<void> {
  const local = loadBudget();
  if (local) {
    await saveBudgetToFirestore(uid, local);
    clearBudget();
  }
}
