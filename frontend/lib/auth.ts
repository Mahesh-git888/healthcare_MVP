'use client';

import { AdminUser, Partner } from './types';

const storageKeys = {
  partnerToken: 'healthcare_partner_token',
  partnerProfile: 'healthcare_partner_profile',
  adminToken: 'healthcare_admin_token',
  adminProfile: 'healthcare_admin_profile',
};

export function setPartnerSession(token: string, partner: Partner) {
  localStorage.setItem(storageKeys.partnerToken, token);
  localStorage.setItem(storageKeys.partnerProfile, JSON.stringify(partner));
}

export function getPartnerSession() {
  if (typeof window === 'undefined') {
    return null;
  }

  const token = localStorage.getItem(storageKeys.partnerToken);
  const rawProfile = localStorage.getItem(storageKeys.partnerProfile);

  if (!token || !rawProfile) {
    return null;
  }

  return {
    token,
    partner: JSON.parse(rawProfile) as Partner,
  };
}

export function clearPartnerSession() {
  localStorage.removeItem(storageKeys.partnerToken);
  localStorage.removeItem(storageKeys.partnerProfile);
}

export function setAdminSession(token: string, admin: AdminUser) {
  localStorage.setItem(storageKeys.adminToken, token);
  localStorage.setItem(storageKeys.adminProfile, JSON.stringify(admin));
}

export function getAdminSession() {
  if (typeof window === 'undefined') {
    return null;
  }

  const token = localStorage.getItem(storageKeys.adminToken);
  const rawProfile = localStorage.getItem(storageKeys.adminProfile);

  if (!token || !rawProfile) {
    return null;
  }

  return {
    token,
    admin: JSON.parse(rawProfile) as AdminUser,
  };
}

export function clearAdminSession() {
  localStorage.removeItem(storageKeys.adminToken);
  localStorage.removeItem(storageKeys.adminProfile);
}

