import { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { BudgetProvider, useBudget } from "./context/BudgetContext";
import { ThemeProvider } from "./context/ThemeContext";
import SetupWizard from "./components/SetupWizard";
import Dashboard from "./components/Dashboard";
import AuthPage from "./components/AuthPage";

function AppContent() {
  const { loading: authLoading } = useAuth();
  const { state } = useBudget();
  const [showAuth, setShowAuth] = useState(false);

  if (authLoading || !state.hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (showAuth) {
    return <AuthPage onClose={() => setShowAuth(false)} />;
  }

  if (!state.isSetupComplete) {
    return <SetupWizard />;
  }

  return <Dashboard onShowAuth={() => setShowAuth(true)} />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BudgetProvider>
          <AppContent />
        </BudgetProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
