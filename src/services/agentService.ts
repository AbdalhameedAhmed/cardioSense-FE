import type { AgentSession } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function parseError(response: Response, fallback: string): Promise<never> {
  const errData = await response.json().catch(() => ({ detail: fallback }));
  throw new Error(
    typeof errData.detail === "string"
      ? errData.detail
      : Array.isArray(errData.detail)
        ? errData.detail.map((e: any) => e.msg).join(", ")
        : fallback
  );
}

export async function createSession(caseId: string): Promise<AgentSession> {
  const response = await fetch(`${API_BASE_URL}/api/agent/sessions/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ case_id: caseId }),
  });
  if (!response.ok) return parseError(response, "Failed to start assistant session");
  return response.json();
}

export async function getSession(sessionId: string): Promise<AgentSession> {
  const response = await fetch(`${API_BASE_URL}/api/agent/sessions/${sessionId}`);
  if (!response.ok) return parseError(response, "Failed to load assistant session");
  return response.json();
}

export async function sendMessage(sessionId: string, content: string): Promise<AgentSession> {
  const response = await fetch(`${API_BASE_URL}/api/agent/sessions/${sessionId}/message`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
  if (!response.ok) return parseError(response, "Failed to send message");
  return response.json();
}
