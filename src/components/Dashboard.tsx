import Header from "./Header";
import TimeScaleSelector from "./TimeScaleSelector";
import BudgetSummaryCard from "./BudgetSummaryCard";
import PayCycleCard from "./PayCycleCard";
import IncomeSection from "./IncomeSection";
import ExpensesSection from "./ExpensesSection";

interface DashboardProps {
  onShowAuth: () => void;
}

export default function Dashboard({ onShowAuth }: DashboardProps) {
  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <Header onShowAuth={onShowAuth} />
        <TimeScaleSelector />
        <BudgetSummaryCard />
        <PayCycleCard />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <IncomeSection />
          <ExpensesSection />
        </div>
      </div>
    </div>
  );
}
