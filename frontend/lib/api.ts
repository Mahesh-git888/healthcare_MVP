import {
  AdminSessionResponse,
  CreatePartnerPayload,
  LeadPayload,
  PartnerSessionResponse,
  Partner,
} from './types';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ?? 'http://localhost:4000';

interface ApiOptions extends RequestInit {
  token?: string;
}

export async function api<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);

  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  if (options.token) {
    headers.set('Authorization', `Bearer ${options.token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    cache: 'no-store',
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as
      | { message?: string | string[] }
      | null;
    const message = Array.isArray(payload?.message)
      ? payload?.message[0]
      : payload?.message;

    throw new Error(message ?? 'Something went wrong');
  }

  return response.json() as Promise<T>;
}

export function registerPartner(payload: CreatePartnerPayload) {
  return api<PartnerSessionResponse>('/partners/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function loginPartner(phone: string) {
  return api<PartnerSessionResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ phone }),
  });
}

export function exchangeAccessLink(token: string) {
  return api<PartnerSessionResponse>('/auth/access-link-login', {
    method: 'POST',
    body: JSON.stringify({ token }),
  });
}

export function submitLead(token: string, payload: LeadPayload) {
  return api<{ message: string; status: string }>('/leads', {
    method: 'POST',
    body: JSON.stringify(payload),
    token,
  });
}

export function loginAdmin(email: string, password: string) {
  return api<AdminSessionResponse>('/admin/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function getPartners(token: string) {
  return api<Partner[]>('/admin/partners', {
    token,
  });
}

export function createPartnerByAdmin(token: string, payload: CreatePartnerPayload) {
  return api<Partner>('/admin/partners', {
    method: 'POST',
    body: JSON.stringify(payload),
    token,
  });
}

export function generatePartnerLink(token: string, partnerId: string) {
  return api<{ token: string; accessLink: string; expiresIn: string }>(
    `/admin/generate-link/${partnerId}`,
    {
      method: 'POST',
      token,
    },
  );
}

