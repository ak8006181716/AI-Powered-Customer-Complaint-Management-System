export interface Complaint {
  id?: string;
  complaint_source: string;
  customer_name: string;
  product_name: string;
  strength: string;
  batch_number: string;
  manufacturing_date: string;
  expiry_date: string;
  quantity_affected: string;
  complaint_type: string;
  description: string;
  
  // AI Derived Analytics
  summary: string;
  severity: 'Critical' | 'Major' | 'Minor' | string;
  priority: 'High' | 'Medium' | 'Low' | string;
  root_cause: string;
  recommended_actions: string[];
  
  completeness_score?: number;
  is_duplicate?: boolean;
  duplicate_reference_id?: string | null;
  status?: 'Intake' | 'Under Investigation' | 'CAPA Initiated' | 'Closed' | string;
  created_at?: string;
  updated_at?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  extractionProgress?: string[];
  updatedFields?: string[];
}

export interface ExtractionProgressStep {
  step: 'uploading' | 'extracting' | 'analyzing' | 'risk_assessment' | 'completed';
  label: string;
  status: 'idle' | 'in_progress' | 'completed' | 'error';
}

export interface DocumentUploadResponse {
  status: string;
  document_id: string;
  file_name: string;
  extracted_text: string;
  complaint?: Complaint;
  extraction_progress?: string[];
}

export interface ChatResponse {
  status: string;
  reply: string;
  complaint?: Complaint;
  extraction_progress?: string[];
}
