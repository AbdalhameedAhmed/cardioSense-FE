export interface Patient {
  id: string;
  age?: number;
  sex?: 'male' | 'female' | 'other';
  created_at: string;
  updated_at: string;
}

export interface PatientCase {
  id: string;
  patient_id: string;
  status: string;
  systolic_bp?: number;
  diastolic_bp?: number;
  smoking?: boolean;
  diabetes?: boolean;
  kidney_disease?: boolean;
  previous_cvd?: boolean;
  total_cholesterol?: number;
  hdl?: number;
  symptoms: string[];
  medications: string[];
  additional_data: Record<string, any>;
  created_at: string;
  updated_at: string;
  patient?: Patient;
}

export interface CaseCreateRequest {
  patient_id?: string;
  age?: number;
  sex?: 'male' | 'female' | 'other';
  status?: string;
  systolic_bp?: number;
  diastolic_bp?: number;
  smoking?: boolean;
  diabetes?: boolean;
  kidney_disease?: boolean;
  previous_cvd?: boolean;
  total_cholesterol?: number;
  hdl?: number;
  symptoms?: string[];
  medications?: string[];
  additional_data?: Record<string, any>;
}

export interface AgentMessage {
  id: string;
  role: 'human' | 'ai';
  content: string;
  created_at: string;
}

export interface AgentSession {
  id: string;
  case_id: string;
  created_at: string;
  updated_at: string;
  messages: AgentMessage[];
}
