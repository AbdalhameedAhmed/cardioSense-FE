import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCase } from "../services/caseService";
import { createSession, getSession, getSessionByCase, sendMessage } from "../services/agentService";
import { ArrowLeft, RefreshCw, AlertTriangle, HeartPulse, Send, Sparkles } from "lucide-react";

function sessionStorageKey(caseId: string) {
  return `cardiocompass:agent-session:${caseId}`;
}

function riskCategoryColor(risk: string): string {
  const normalized = risk.toLowerCase();
  if (normalized.includes("insufficient") || normalized === "unknown") return "text-slate-600 bg-slate-100 border-slate-200";
  if (normalized.includes("very high") || normalized === "high") return "text-red-700 bg-red-50 border-red-200";
  if (normalized.includes("moderate")) return "text-amber-700 bg-amber-50 border-amber-200";
  return "text-emerald-700 bg-emerald-50 border-emerald-200";
}

// Color thresholds mirror the retrieval-confidence calibration in
// BE/app/services/graph.py (CONFIDENCE_DISTANCE_FLOOR/CEIL): scores are
// derived from real cosine-distance measurements, not arbitrary buckets, but
// the color bucketing itself here is a simple, readable convention.
function confidenceColor(confidence: number): string {
  if (confidence >= 80) return "text-emerald-700 bg-emerald-50 border-emerald-200";
  if (confidence >= 50) return "text-amber-700 bg-amber-50 border-amber-200";
  return "text-red-700 bg-red-50 border-red-200";
}

// Lightweight renderer for the small markdown subset the assistant emits
// (### headers, **bold**, - bullet lists) without pulling in a markdown dependency.
function AssistantMessageContent({ content }: { content: string }) {
  const lines = content.split("\n");
  return (
    <div className="space-y-1.5">
      {lines.map((line, i) => {
        const bold = (text: string) =>
          text.split(/(\*\*[^*]+\*\*)/g).map((part, j) =>
            part.startsWith("**") && part.endsWith("**") ? (
              <strong key={j} className="font-bold">{part.slice(2, -2)}</strong>
            ) : (
              <span key={j}>{part}</span>
            )
          );

        if (line.startsWith("### ")) {
          return <h4 key={i} className="font-bold text-slate-800 mt-2">{bold(line.slice(4))}</h4>;
        }
        if (line.trim().startsWith("- ")) {
          return (
            <div key={i} className="flex gap-2 pl-1">
              <span className="text-teal-500">•</span>
              <span>{bold(line.trim().slice(2))}</span>
            </div>
          );
        }
        if (line.trim() === "") return <div key={i} className="h-1" />;
        return <p key={i}>{bold(line)}</p>;
      })}
    </div>
  );
}

export default function CaseDetails() {
  const { caseId } = useParams<{ caseId: string }>();
  const queryClient = useQueryClient();

  const { data: patientCase, isLoading, error } = useQuery({
    queryKey: ["case", caseId],
    queryFn: () => getCase(caseId || ""),
    enabled: !!caseId
  });

  const [sessionId, setSessionId] = useState<string | null>(() =>
    caseId ? localStorage.getItem(sessionStorageKey(caseId)) : null
  );
  const [messageInput, setMessageInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // localStorage only knows about a session if it was started in THIS
  // browser. A fresh browser/device (or cleared storage) has no local record
  // even though a session may already exist on the backend, so fall back to
  // asking the backend directly whenever localStorage came up empty.
  const { data: existingSession } = useQuery({
    queryKey: ["agent-session-by-case", caseId],
    queryFn: () => getSessionByCase(caseId as string),
    enabled: !!caseId && !sessionId,
  });

  // Persist the backend-discovered session id for next time, without
  // funneling it through setState (React Query's cache is already the source
  // of truth for `existingSession`; `resolvedSessionId` below derives from it
  // directly during render instead of needing an extra state + re-render).
  useEffect(() => {
    if (existingSession && caseId) {
      localStorage.setItem(sessionStorageKey(caseId), existingSession.id);
    }
  }, [existingSession, caseId]);

  const resolvedSessionId = sessionId || existingSession?.id || null;

  const { data: session, isLoading: sessionLoading } = useQuery({
    queryKey: ["agent-session", resolvedSessionId],
    queryFn: () => getSession(resolvedSessionId as string),
    enabled: !!resolvedSessionId,
    initialData: existingSession && resolvedSessionId === existingSession.id ? existingSession : undefined,
  });

  const startMutation = useMutation({
    mutationFn: () => createSession(caseId as string),
    onSuccess: (data) => {
      if (caseId) localStorage.setItem(sessionStorageKey(caseId), data.id);
      setSessionId(data.id);
      queryClient.setQueryData(["agent-session", data.id], data);
    },
  });

  const sendMutation = useMutation({
    mutationFn: (content: string) => sendMessage(resolvedSessionId as string, content),
    onSuccess: (data) => {
      queryClient.setQueryData(["agent-session", resolvedSessionId], data);
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [session?.messages.length]);

  const handleSend = (e: FormEvent) => {
    e.preventDefault();
    const content = messageInput.trim();
    if (!content || sendMutation.isPending) return;
    setMessageInput("");
    sendMutation.mutate(content);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      <Link 
        to="/" 
        className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 transition duration-150 text-sm font-semibold mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      {isLoading ? (
        <div className="p-12 text-center">
          <RefreshCw className="h-8 w-8 text-teal-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-500 font-medium">Loading case details...</p>
        </div>
      ) : error ? (
        <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center max-w-md mx-auto shadow-sm">
          <AlertTriangle className="h-10 w-10 text-red-500 mx-auto mb-4" />
          <h4 className="text-lg font-bold text-slate-800">Error Loading Case</h4>
          <p className="text-slate-500 mt-2 text-sm">{(error as Error).message}</p>
        </div>
      ) : !patientCase ? (
        <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center max-w-md mx-auto shadow-sm">
          <AlertTriangle className="h-10 w-10 text-slate-400 mx-auto mb-4" />
          <h4 className="text-lg font-bold text-slate-800">Case Not Found</h4>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-premium space-y-6">
          <div className="flex items-center justify-between pb-6 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold text-teal-600 uppercase tracking-wide">Patient Case File</span>
              <h2 className="text-2xl font-extrabold text-slate-850">Case #{patientCase.id.slice(0, 8)}</h2>
            </div>
            <span className="px-3.5 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-xs font-semibold">
              {patientCase.status}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Demographics</h3>
              <div className="bg-slate-50/50 p-4 rounded-xl space-y-2 border border-slate-100">
                <p className="text-sm"><span className="text-slate-500">Age:</span> <span className="font-bold text-slate-800">{patientCase.patient?.age || "N/A"}</span></p>
                <p className="text-sm"><span className="text-slate-500">Sex:</span> <span className="font-bold text-slate-800 capitalize">{patientCase.patient?.sex || "N/A"}</span></p>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Vital Stats</h3>
              <div className="bg-slate-50/50 p-4 rounded-xl space-y-2 border border-slate-100">
                <p className="text-sm"><span className="text-slate-500">Blood Pressure:</span> <span className="font-bold text-slate-800">
                  {patientCase.systolic_bp && patientCase.diastolic_bp 
                    ? `${Math.round(patientCase.systolic_bp)}/${Math.round(patientCase.diastolic_bp)} mmHg` 
                    : "Not recorded"}
                </span></p>
                <p className="text-sm"><span className="text-slate-500">Lipid Total:</span> <span className="font-bold text-slate-800">
                  {patientCase.total_cholesterol ? `${Math.round(patientCase.total_cholesterol)} mg/dL` : "Not recorded"}
                </span></p>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100">
            {!resolvedSessionId ? (
              <div className="text-center bg-teal-50/30 p-6 rounded-2xl border border-teal-100/50">
                <HeartPulse className="h-10 w-10 text-teal-600 mx-auto mb-3" />
                <h4 className="font-bold text-slate-800 mb-1">AI Clinical Evaluation</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
                  Launch the RAG-backed decision support assistant to analyze this case against WHO/ESC hypertension guidelines.
                </p>
                {startMutation.isError && (
                  <p className="text-xs text-red-600 font-semibold mb-3">{(startMutation.error as Error).message}</p>
                )}
                <button
                  onClick={() => startMutation.mutate()}
                  disabled={startMutation.isPending}
                  className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold shadow-md transition duration-200 inline-flex items-center gap-2 text-sm disabled:opacity-50"
                >
                  <Sparkles className="h-4 w-4" />
                  {startMutation.isPending ? "Starting evaluation..." : "Start AI Evaluation"}
                </button>
              </div>
            ) : (
              <div className="flex flex-col h-[520px] rounded-2xl border border-slate-200 overflow-hidden">
                <div className="px-4 py-3 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-teal-600" />
                    <span className="font-bold text-slate-800 text-sm">CardioSense Assistant</span>
                  </div>
                  {session?.state?.evaluation_complete && (
                    <div className="flex items-center gap-1.5">
                      {session.state.risk_category && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${riskCategoryColor(session.state.risk_category)}`}>
                          {session.state.risk_category}
                        </span>
                      )}
                      {typeof session.state.retrieval_confidence === "number" && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${confidenceColor(session.state.retrieval_confidence)}`}>
                          {session.state.retrieval_confidence}% confidence
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
                  {sessionLoading && !session ? (
                    <div className="text-center py-8">
                      <RefreshCw className="h-6 w-6 text-teal-600 animate-spin mx-auto" />
                    </div>
                  ) : (
                    session?.messages.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.role === "human" ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm ${
                            msg.role === "human"
                              ? "bg-teal-600 text-white rounded-br-sm"
                              : "bg-white border border-slate-200 text-slate-700 rounded-bl-sm shadow-sm"
                          }`}
                        >
                          {msg.role === "ai" ? <AssistantMessageContent content={msg.content} /> : msg.content}
                        </div>
                      </div>
                    ))
                  )}
                  {sendMutation.isPending && (
                    <div className="flex justify-start">
                      <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                        <RefreshCw className="h-4 w-4 text-teal-600 animate-spin" />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {sendMutation.isError && (
                  <p className="px-4 pt-2 text-xs text-red-600 font-semibold bg-white border-t border-slate-100">
                    {(sendMutation.error as Error).message}
                  </p>
                )}

                <form onSubmit={handleSend} className="flex items-center gap-2 p-3 border-t border-slate-100 bg-white">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Reply to the assistant, e.g. 'evaluate' or provide missing values..."
                    disabled={sendMutation.isPending}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition duration-150 text-sm disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={sendMutation.isPending || !messageInput.trim()}
                    className="p-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl transition duration-150 disabled:opacity-50 shrink-0"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
