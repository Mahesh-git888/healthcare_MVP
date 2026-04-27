'use client';

import { SITE_LANGUAGE_OPTIONS, SiteLanguage } from '@/lib/site-language';

export function SiteLanguageSelect({
  value,
  onChange,
}: {
  value: SiteLanguage;
  onChange: (language: SiteLanguage) => void;
}) {
  return (
    <select
      aria-label="Choose language"
      value={value}
      onChange={(event) => onChange(event.target.value as SiteLanguage)}
      className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
    >
      {SITE_LANGUAGE_OPTIONS.map((option) => (
        <option key={option.code} value={option.code}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
