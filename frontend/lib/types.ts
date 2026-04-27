export type PartnerRole = 'Nurse' | 'Paramedic' | 'Physiotherapist';

export interface Partner {
  id: string;
  name: string;
  phone: string;
  bdoId?: string | null;
  role: PartnerRole;
  city: string;
  organizationName?: string | null;
  createdAt: string;
}

export interface Bdo {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  createdAt: string;
}

export interface AdminUser {
  id: string;
  email: string;
  createdAt: string;
}

export interface PartnerSessionResponse {
  accessToken: string;
  partner: Partner;
  message?: string;
}

export interface AdminSessionResponse {
  accessToken: string;
  admin: AdminUser;
}

export interface LeadPayload {
  patientName: string;
  phone: string;
  serviceType?: string;
  city?: string;
}

export interface CreatePartnerPayload {
  name: string;
  phone: string;
  role: PartnerRole;
  bdoId?: string;
  city: string;
  organizationName?: string;
}

export interface PartnerEarningsResponse {
  coming_soon: boolean;
  message: string;
  summary: {
    total_earned: number | null;
    pending: number | null;
    paid: number | null;
  };
  leads: Array<{
    patient_name: string;
    service: string;
    date: string;
    amount: number;
    status: string;
  }>;
}
