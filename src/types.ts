export type CaseStatus = 'NEW' | 'ANALYZED' | 'ASSIGNED' | 'DECLINED';

export interface Case {
  id: string;
  submittedAt: string;
  fullName: string;
  email: string;
  phone?: string;
  location?: string;
  incidentDate?: string;
  injuryType: string;
  description: string;
  status: CaseStatus;
  analysis?: {
    score: number;
    estimatedValue: number;
    riskFactors: string[];
    recommendation: string;
    timestamp: string;
  };
  assignedPartnerId?: string;
}

export interface Partner {
  id: string;
  name: string;
  email: string;
  apiEndpoint?: string;
  specialties: string[];
  coverage: string[];
  capacity: number;
  active: boolean;
}
