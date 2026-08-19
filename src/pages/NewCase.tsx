import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCase } from "../services/caseService";
import type { CaseCreateRequest } from "../services/caseService";
import { 
  HeartPulse, 
  ArrowLeft, 
  Activity, 
  User, 
  AlertCircle,
  Sparkles,
  Plus,
  X
} from "lucide-react";

export default function NewCase() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Form State
  const [age, setAge] = useState<number | "">("");
  const [sex, setSex] = useState<"male" | "female" | "other" | "">("");
  const [systolic, setSystolic] = useState<number | "">("");
  const [diastolic, setDiastolic] = useState<number | "">("");
  const [smoking, setSmoking] = useState(false);
  const [diabetes, setDiabetes] = useState(false);
  const [kidneyDisease, setKidneyDisease] = useState(false);
  const [previousCVD, setPreviousCVD] = useState(false);
  const [cholesterol, setCholesterol] = useState<number | "">("");
  const [hdl, setHdl] = useState<number | "">("");
  
  // Tag input helper states
  const [symptomInput, setSymptomInput] = useState("");
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [medicationInput, setMedicationInput] = useState("");
  const [medications, setMedications] = useState<string[]>([]);

  // Local Validation Error
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // TanStack Query Mutation
  const createMutation = useMutation({
    mutationFn: createCase,
    onSuccess: () => {
      // Invalidate queries to reload dashboard
      queryClient.invalidateQueries({ queryKey: ["cases"] });
      // Redirect to cases details (or dashboard for now since detail is phase 6)
      navigate(`/`);
    },
    onError: (error: Error) => {
      setErrorMsg(error.message);
    }
  });

  // Handle adding symptom tag
  const addSymptom = (e: FormEvent) => {
    e.preventDefault();
    if (symptomInput.trim() && !symptoms.includes(symptomInput.trim())) {
      setSymptoms([...symptoms, symptomInput.trim()]);
      setSymptomInput("");
    }
  };

  const removeSymptom = (symptom: string) => {
    setSymptoms(symptoms.filter((s) => s !== symptom));
  };

  // Handle adding medication tag
  const addMedication = (e: FormEvent) => {
    e.preventDefault();
    if (medicationInput.trim() && !medications.includes(medicationInput.trim())) {
      setMedications([...medications, medicationInput.trim()]);
      setMedicationInput("");
    }
  };

  const removeMedication = (med: string) => {
    setMedications(medications.filter((m) => m !== med));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Basic Demographics validation
    if (!age || !sex) {
      setErrorMsg("Patient demographics (Age and Sex) are required.");
      return;
    }

    // BP relation validation
    if (systolic && diastolic && diastolic >= systolic) {
      setErrorMsg("Diastolic blood pressure must be lower than systolic blood pressure.");
      return;
    }

    const payload: CaseCreateRequest = {
      age: Number(age),
      sex: sex as "male" | "female" | "other",
      status: "active",
      systolic_bp: systolic !== "" ? Number(systolic) : undefined,
      diastolic_bp: diastolic !== "" ? Number(diastolic) : undefined,
      smoking,
      diabetes,
      kidney_disease: kidneyDisease,
      previous_cvd: previousCVD,
      total_cholesterol: cholesterol !== "" ? Number(cholesterol) : undefined,
      hdl: hdl !== "" ? Number(hdl) : undefined,
      symptoms,
      medications,
      additional_data: {}
    };

    createMutation.mutate(payload);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-slide-up">
      {/* Back button */}
      <Link 
        to="/" 
        className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 transition duration-150 text-sm font-semibold mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      {/* Header title */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <HeartPulse className="h-8 w-8 text-teal-600" />
          Patient Intake Assessment
        </h1>
        <p className="text-slate-500 mt-2">
          Register a patient case and record clinical variables. CardioCompass will classify findings using evidence-based guidelines.
        </p>
      </div>

      {/* Main Form container */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {errorMsg && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-700 text-sm shadow-sm">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Intake Error: </span>
              {errorMsg}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Section 1: Demographics */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-premium space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <User className="h-5 w-5 text-teal-600" />
              <h2 className="font-bold text-slate-800 text-lg">Patient Demographics</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Age</label>
                <input 
                  type="number"
                  required
                  min="1"
                  max="120"
                  value={age}
                  onChange={(e) => setAge(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="e.g. 52"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition duration-150 text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Sex</label>
                <select 
                  required
                  value={sex}
                  onChange={(e) => setSex(e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition duration-150 text-sm font-medium bg-white"
                >
                  <option value="">Select...</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Blood Pressure */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-premium space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Activity className="h-5 w-5 text-teal-600" />
              <h2 className="font-bold text-slate-800 text-lg">Blood Pressure Profile</h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Systolic (mmHg)</label>
                <input 
                  type="number"
                  min="50"
                  max="250"
                  value={systolic}
                  onChange={(e) => setSystolic(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="e.g. 138"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition duration-150 text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Diastolic (mmHg)</label>
                <input 
                  type="number"
                  min="30"
                  max="150"
                  value={diastolic}
                  onChange={(e) => setDiastolic(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="e.g. 88"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition duration-150 text-sm font-medium"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Risk Factors & Lipids */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-premium space-y-6 md:col-span-2">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <HeartPulse className="h-5 w-5 text-teal-600" />
                <h2 className="font-bold text-slate-800 text-lg">Clinical Risk Factors & Lipids</h2>
              </div>
              <span className="text-xs text-slate-400 italic">Values left blank are treated as unknown</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Checkboxes */}
              <div className="space-y-4">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Comorbidities & Habits</label>
                
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-100 hover:border-teal-100 hover:bg-teal-50/20 cursor-pointer transition duration-150">
                    <input 
                      type="checkbox"
                      checked={diabetes}
                      onChange={(e) => setDiabetes(e.target.checked)}
                      className="h-4.5 w-4.5 rounded border-slate-300 text-teal-600 focus:ring-teal-500/30 accent-teal-600"
                    />
                    <span className="text-sm font-semibold text-slate-700">Diabetes</span>
                  </label>

                  <label className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-100 hover:border-teal-100 hover:bg-teal-50/20 cursor-pointer transition duration-150">
                    <input 
                      type="checkbox"
                      checked={smoking}
                      onChange={(e) => setSmoking(e.target.checked)}
                      className="h-4.5 w-4.5 rounded border-slate-300 text-teal-600 focus:ring-teal-500/30 accent-teal-600"
                    />
                    <span className="text-sm font-semibold text-slate-700">Smoker</span>
                  </label>

                  <label className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-100 hover:border-teal-100 hover:bg-teal-50/20 cursor-pointer transition duration-150">
                    <input 
                      type="checkbox"
                      checked={kidneyDisease}
                      onChange={(e) => setKidneyDisease(e.target.checked)}
                      className="h-4.5 w-4.5 rounded border-slate-300 text-teal-600 focus:ring-teal-500/30 accent-teal-600"
                    />
                    <span className="text-sm font-semibold text-slate-700">Kidney Disease</span>
                  </label>

                  <label className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-100 hover:border-teal-100 hover:bg-teal-50/20 cursor-pointer transition duration-150">
                    <input 
                      type="checkbox"
                      checked={previousCVD}
                      onChange={(e) => setPreviousCVD(e.target.checked)}
                      className="h-4.5 w-4.5 rounded border-slate-300 text-teal-600 focus:ring-teal-500/30 accent-teal-600"
                    />
                    <span className="text-sm font-semibold text-slate-700">Previous CVD</span>
                  </label>
                </div>
              </div>

              {/* Lipid inputs */}
              <div className="space-y-4">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Lipid Panel (mg/dL)</label>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Total Cholesterol</label>
                    <input 
                      type="number"
                      min="50"
                      max="500"
                      value={cholesterol}
                      onChange={(e) => setCholesterol(e.target.value === "" ? "" : Number(e.target.value))}
                      placeholder="e.g. 195"
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition duration-150 text-sm font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-500 mb-1">HDL Cholesterol</label>
                    <input 
                      type="number"
                      min="10"
                      max="150"
                      value={hdl}
                      onChange={(e) => setHdl(e.target.value === "" ? "" : Number(e.target.value))}
                      placeholder="e.g. 48"
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition duration-150 text-sm font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Symptoms & Medications */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-premium space-y-6 md:col-span-2">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Sparkles className="h-5 w-5 text-teal-600" />
              <h2 className="font-bold text-slate-800 text-lg">Current Symptoms & Medications</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Symptoms tag entry */}
              <div className="space-y-4">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Reported Symptoms</label>
                <div className="flex gap-2">
                  <input 
                    type="text"
                    value={symptomInput}
                    onChange={(e) => setSymptomInput(e.target.value)}
                    placeholder="e.g. Chest pain, palpitations"
                    className="flex-1 px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition duration-150 text-sm"
                  />
                  <button 
                    type="button" 
                    onClick={addSymptom}
                    className="px-3 py-2 bg-teal-50 hover:bg-teal-100 text-teal-600 rounded-xl transition duration-150 flex items-center justify-center shadow-sm"
                  >
                    <Plus className="h-5 w-5 stroke-[2.5]" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 min-h-[40px] p-2 rounded-xl border border-dashed border-slate-200 bg-slate-50/30">
                  {symptoms.length === 0 ? (
                    <span className="text-xs text-slate-400 self-center px-2">No symptoms added</span>
                  ) : (
                    symptoms.map((symptom) => (
                      <span key={symptom} className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-50 text-teal-700 border border-teal-100 rounded-full text-xs font-semibold">
                        {symptom}
                        <button type="button" onClick={() => removeSymptom(symptom)} className="hover:text-teal-900 focus:outline-none">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Medications tag entry */}
              <div className="space-y-4">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Current Medications</label>
                <div className="flex gap-2">
                  <input 
                    type="text"
                    value={medicationInput}
                    onChange={(e) => setMedicationInput(e.target.value)}
                    placeholder="e.g. Lisinopril, Atorvastatin"
                    className="flex-1 px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition duration-150 text-sm"
                  />
                  <button 
                    type="button" 
                    onClick={addMedication}
                    className="px-3 py-2 bg-teal-50 hover:bg-teal-100 text-teal-600 rounded-xl transition duration-150 flex items-center justify-center shadow-sm"
                  >
                    <Plus className="h-5 w-5 stroke-[2.5]" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 min-h-[40px] p-2 rounded-xl border border-dashed border-slate-200 bg-slate-50/30">
                  {medications.length === 0 ? (
                    <span className="text-xs text-slate-400 self-center px-2">No medications listed</span>
                  ) : (
                    medications.map((med) => (
                      <span key={med} className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 text-teal-700 border border-teal-100 rounded-full text-xs font-semibold">
                        {med}
                        <button type="button" onClick={() => removeMedication(med)} className="hover:text-teal-900 focus:outline-none">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Submission buttons */}
        <div className="flex items-center justify-end gap-4 border-t border-slate-200 pt-6">
          <Link 
            to="/"
            className="px-6 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold transition duration-150 shadow-sm"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="px-8 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold shadow-md hover:shadow-lg transition duration-150 active:scale-95 flex items-center gap-2 text-sm disabled:opacity-50"
          >
            {createMutation.isPending ? "Creating..." : "Start Intake Evaluation"}
          </button>
        </div>
      </form>
    </div>
  );
}
