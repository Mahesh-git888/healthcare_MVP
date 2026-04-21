export type PartnerRole = 'Nurse' | 'Paramedic' | 'Physiotherapist';

export interface Partner {
  id: string;
  name: string;
  phone: string;
  role: PartnerRole;
  city: string;
  area: string;
  organizationName: string;
  address: string;
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
  city: string;
  area: string;
  serviceType: string;
  shiftType?: string;
}

export interface CreatePartnerPayload {
  name: string;
  phone: string;
  role: PartnerRole;
  city: string;
  area: string;
  organizationName: string;
  address: string;
}

