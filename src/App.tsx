import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Dashboard from "./pages/Dashboard";
import NewCase from "./pages/NewCase";
import CaseDetails from "./pages/CaseDetails";
import { HeartPulse } from "lucide-react";

// Initialize TanStack React Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Prevent aggressive refetches
      retry: 1, // Retry failed requests once
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen bg-slate-50 flex flex-col">
          {/* Main Top Navigation Header */}
          <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HeartPulse className="h-6 w-6 text-teal-600" />
                <span className="font-extrabold text-slate-800 text-lg tracking-tight">
                  Cardio<span className="text-teal-600">Compass</span>
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <span className="h-2 w-2 bg-emerald-500 rounded-full"></span>
                  Decision Support Engine Online
                </span>
              </div>
            </div>
          </header>

          {/* Page Routing */}
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/new-case" element={<NewCase />} />
              <Route path="/cases/:caseId" element={<CaseDetails />} />
            </Routes>
          </main>

          {/* Footer disclaimer */}
          <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-400">
            <div className="max-w-7xl mx-auto px-4">
              <p className="font-medium text-slate-500 mb-1">
                CardioCompass Decision Support Prototype. Not for Diagnostic Use.
              </p>
              <p>
                This system is intended as a clinical decision-support assistant to provide risk calculations, alerts, and evidence-based guidance.
              </p>
            </div>
          </footer>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
