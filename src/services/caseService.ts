import type { PatientCase, CaseCreateRequest } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function getCases(): Promise<PatientCase[]> {
  const response = await fetch(`${API_BASE_URL}/api/cases/`);
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to fetch cases: ${errText || response.statusText}`);
  }
  return response.json();
}

export async function getCase(caseId: string): Promise<PatientCase> {
  const response = await fetch(`${API_BASE_URL}/api/cases/${caseId}`);
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to fetch case ${caseId}: ${errText || response.statusText}`);
  }
  return response.json();
}

export async function createCase(data: CaseCreateRequest): Promise<PatientCase> {
  const response = await fetch(`${API_BASE_URL}/api/cases/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errData = await response.json().catch(() => ({ detail: "Unknown validation error" }));
    throw new Error(
      typeof errData.detail === "string" 
        ? errData.detail 
        : Array.isArray(errData.detail)
          ? errData.detail.map((e: any) => e.msg).join(", ")
          : JSON.stringify(errData.detail)
    );
  }
  return response.json();
}

export async function updateCase(caseId: string, data: Partial<CaseCreateRequest>): Promise<PatientCase> {
  const response = await fetch(`${API_BASE_URL}/api/cases/${caseId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errData = await response.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(errData.detail || "Failed to update case");
  }
  return response.json();
}
export type { PatientCase, CaseCreateRequest };
