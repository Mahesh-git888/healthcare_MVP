'use client';

import { useEffect, useState } from 'react';

export type SiteLanguage = 'en' | 'hi' | 'kn' | 'ta' | 'te';

export const SITE_LANGUAGE_OPTIONS: Array<{
  code: SiteLanguage;
  label: string;
}> = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'kn', label: 'ಕನ್ನಡ' },
  { code: 'ta', label: 'தமிழ்' },
  { code: 'te', label: 'తెలుగు' },
];

const STORAGE_KEY = 'healthcare_site_language';

export function useSiteLanguage() {
  const [language, setLanguage] = useState<SiteLanguage>('en');

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as SiteLanguage | null;
    if (stored && SITE_LANGUAGE_OPTIONS.some((item) => item.code === stored)) {
      setLanguage(stored);
    }
  }, []);

  function updateLanguage(nextLanguage: SiteLanguage) {
    setLanguage(nextLanguage);
    window.localStorage.setItem(STORAGE_KEY, nextLanguage);
  }

  return {
    language,
    setLanguage: updateLanguage,
  };
}
