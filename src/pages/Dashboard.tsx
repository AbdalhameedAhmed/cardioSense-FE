import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getCases } from "../services/caseService";
import {
  Activity,
  Heart,
  AlertTriangle,
  Plus,
  User,
  ArrowRight,
  RefreshCw
} from "lucide-react";

export default function Dashboard() {
  // Fetch cases using React Query
  const { data: cases = [], isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["cases"],
    queryFn: getCases,
    refetchInterval: 15000, // Auto refresh every 15s to keep dashboard alive
  });

  // Calculate statistics from cases
  const totalCases = cases.length;
  
  const highRiskCases = cases.filter(c => {
    const sys = c.systolic_bp || 0;
    const dia = c.diastolic_bp || 0;
    return sys >= 140 || dia >= 90 || c.previous_cvd || c.diabetes;
  }).length;

  const averageSystolic = totalCases > 0 
    ? Math.round(cases.reduce((sum, c) => sum + (c.systolic_bp || 0), 0) / totalCases) 
    : 0;

  const averageDiastolic = totalCases > 0 
    ? Math.round(cases.reduce((sum, c) => sum + (c.diastolic_bp || 0), 0) / totalCases) 
    : 0;

  // Helper to categorize BP for visual indicators
  const getBPCategory = (sys?: number, dia?: number) => {
    if (!sys || !dia) return { label: "N/A", color: "text-slate-400 bg-slate-100 border-slate-200" };
    if (sys >= 140 || dia >= 90) return { label: "Stage 2 HTN", color: "text-red-700 bg-red-50 border-red-200" };
    if (sys >= 130 || dia >= 80) return { label: "Stage 1 HTN", color: "text-amber-700 bg-amber-50 border-amber-200" };
    if (sys >= 120 && sys < 130 && dia < 80) return { label: "Elevated BP", color: "text-yellow-700 bg-yellow-50 border-yellow-200" };
    return { label: "Normal BP", color: "text-emerald-700 bg-emerald-50 border-emerald-200" };
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <img src="/cardio-logo.jpeg" alt="CardioSense" className=" w-8 rounded-md" />
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Cardio<span className="text-teal-600">Sense</span>
            </h1>
          </div>
          <p className="text-slate-500 text-sm md:text-base">
            Clinical Decision-Support & Medical Risk Assessment Dashboard
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center gap-3">
          <button 
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition duration-200 flex items-center gap-2 text-sm font-medium shadow-sm hover:shadow active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
            Sync Data
          </button>
          
          <Link
            to="/new-case"
            className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold transition duration-200 flex items-center gap-2 text-sm shadow-md hover:shadow-lg active:scale-95"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            New Assessment
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Active Cases */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-premium hover:shadow-premium-hover transition duration-300">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-400 text-sm font-semibold tracking-wide uppercase">Active Cases</span>
            <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
              <User className="h-5 w-5" />
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-800">{totalCases}</h2>
          <p className="text-xs text-slate-400 mt-2">Currently registered patient cases</p>
        </div>

        {/* High Risk Cases */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-premium hover:shadow-premium-hover transition duration-300">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-400 text-sm font-semibold tracking-wide uppercase">High Concern</span>
            <div className="p-3 bg-red-50 text-red-500 rounded-xl">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-800">{highRiskCases}</h2>
          <p className="text-xs text-red-500 font-semibold mt-2">Requires clinical evaluation</p>
        </div>

        {/* Avg Blood Pressure */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-premium hover:shadow-premium-hover transition duration-300">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-400 text-sm font-semibold tracking-wide uppercase">Avg Blood Pressure</span>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <Activity className="h-5 w-5" />
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-800">
            {totalCases > 0 ? `${averageSystolic}/${averageDiastolic}` : "N/A"}
          </h2>
          <p className="text-xs text-slate-400 mt-2">Systolic/Diastolic averages (mmHg)</p>
        </div>

        {/* AI System Status */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-premium hover:shadow-premium-hover transition duration-300">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-400 text-sm font-semibold tracking-wide uppercase">Decision Engine</span>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Heart className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 bg-emerald-500 rounded-full animate-pulse"></span>
            <span className="text-xl font-bold text-slate-800">Operational</span>
          </div>
          <p className="text-xs text-slate-400 mt-3">Evidence-based RAG active</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-premium overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-lg">Registered Clinical Cases</h3>
          <span className="px-3 py-1 bg-slate-200 text-slate-600 rounded-full text-xs font-semibold">
            {cases.length} Patients
          </span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center">
            <RefreshCw className="h-8 w-8 text-teal-600 animate-spin mx-auto mb-4" />
            <p className="text-slate-500 font-medium">Loading clinical cases...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center text-red-500">
            <AlertTriangle className="h-8 w-8 mx-auto mb-4" />
            <p className="font-semibold">Failed to load patient cases</p>
            <p className="text-sm text-slate-400 mt-1">{(error as Error).message}</p>
          </div>
        ) : cases.length === 0 ? (
          <div className="py-20 px-6 text-center max-w-lg mx-auto">
            <div className="h-16 w-16 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <User className="h-8 w-8 stroke-[1.5]" />
            </div>
            <h4 className="text-xl font-bold text-slate-800 mb-2">No Active Cases Found</h4>
            <p className="text-slate-500 mb-8 text-sm">
              Launch a new evaluation to calculate cardiovascular risk, evaluate blood pressure, and verify evidence-backed guidelines.
            </p>
            <Link
              to="/new-case"
              className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold shadow-md transition duration-200 inline-flex items-center gap-2 text-sm"
            >
              <Plus className="h-4 w-4 stroke-[3]" />
              Start Intake Assessment
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-50/20">
                  <th className="px-6 py-4">Patient Profile</th>
                  <th className="px-6 py-4">Blood Pressure</th>
                  <th className="px-6 py-4">BP Classification</th>
                  <th className="px-6 py-4 text-center">Risk Factors</th>
                  <th className="px-6 py-4">Created Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cases.map((patientCase) => {
                  const bp = getBPCategory(patientCase.systolic_bp, patientCase.diastolic_bp);
                  return (
                    <tr key={patientCase.id} className="hover:bg-slate-50/60 transition duration-150">
                      {/* Patient profile */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-semibold text-sm">
                            {patientCase.patient?.sex === "male" ? "♂" : patientCase.patient?.sex === "female" ? "♀" : "•"}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-sm">Case #{patientCase.id.slice(0, 8)}</p>
                            <p className="text-xs text-slate-400">
                              Age: {patientCase.patient?.age || "N/A"} | Sex: {patientCase.patient?.sex || "N/A"}
                            </p>
                          </div>
                        </div>
                      </td>
                      {/* Blood Pressure values */}
                      <td className="px-6 py-5 font-semibold text-slate-800 text-sm">
                        {patientCase.systolic_bp && patientCase.diastolic_bp 
                          ? `${Math.round(patientCase.systolic_bp)}/${Math.round(patientCase.diastolic_bp)}`
                          : "Pending measurement"
                        }
                      </td>
                      {/* BP category tag */}
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${bp.color}`}>
                          {bp.label}
                        </span>
                      </td>
                      {/* Risk factors indicators */}
                      <td className="px-6 py-5">
                        <div className="flex justify-center items-center gap-1.5">
                          {patientCase.diabetes && (
                            <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 rounded text-[10px] font-bold">DM</span>
                          )}
                          {patientCase.smoking && (
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 rounded text-[10px] font-bold">SMOKE</span>
                          )}
                          {patientCase.kidney_disease && (
                            <span className="px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-100 rounded text-[10px] font-bold">CKD</span>
                          )}
                          {patientCase.previous_cvd && (
                            <span className="px-2 py-0.5 bg-red-50 text-red-700 border border-red-100 rounded text-[10px] font-bold">CVD</span>
                          )}
                          {!patientCase.diabetes && !patientCase.smoking && !patientCase.kidney_disease && !patientCase.previous_cvd && (
                            <span className="text-xs text-slate-400">—</span>
                          )}
                        </div>
                      </td>
                      {/* Created date */}
                      <td className="px-6 py-5 text-slate-500 text-xs">
                        {new Date(patientCase.created_at).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric"
                        })}
                      </td>
                      {/* Actions */}
                      <td className="px-6 py-5 text-right">
                        <Link
                          to={`/cases/${patientCase.id}`}
                          className="inline-flex items-center gap-1 px-3.5 py-1.5 border border-slate-200 hover:border-teal-500 bg-white hover:bg-teal-50 text-slate-700 hover:text-teal-700 rounded-lg text-xs font-semibold shadow-sm transition duration-150"
                        >
                          Evaluate
                          <ArrowRight className="h-3 w-3 stroke-[2.5]" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
