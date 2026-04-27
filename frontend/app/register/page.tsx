'use client';

import Link from 'next/link';
import { FormEvent, Suspense, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PageShell } from '@/components/layout/page-shell';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Notice } from '@/components/ui/notice';
import { SiteLanguageSelect } from '@/components/site-language-select';
import { registerPartner } from '@/lib/api';
import { setPartnerSession } from '@/lib/auth';
import { ALL_CITIES, STATE_CITY_OPTIONS, getCitiesForState } from '@/lib/location-options';
import { SiteLanguage, useSiteLanguage } from '@/lib/site-language';
import { PartnerRole } from '@/lib/types';

const roles: PartnerRole[] = ['Nurse', 'Paramedic', 'Physiotherapist'];

const copy: Record<
  SiteLanguage,
  {
    title: string;
    description: string;
    admin: string;
    footerLabel: string;
    footerLink: string;
    name: string;
    phone: string;
    role: string;
    state: string;
    statePlaceholder: string;
    city: string;
    cityPlaceholder: string;
    org: string;
    submit: string;
    loading: string;
    referralLinked: string;
    invalidPhone: string;
    invalidCity: string;
  }
> = {
  en: {
    title: 'Join as Health Angel',
    description: 'Just share your details once. After that, referring a patient is quick.',
    admin: 'Admin',
    footerLabel: 'Already joined?',
    footerLink: 'Log in',
    name: 'Full name',
    phone: 'Phone number',
    role: 'Role',
    state: 'State (optional helper)',
    statePlaceholder: 'Show all cities',
    city: 'City',
    cityPlaceholder: 'Select city',
    org: 'Organization name (optional)',
    submit: 'Create account',
    loading: 'Creating account...',
    referralLinked: 'Referral ID linked:',
    invalidPhone: 'Please enter a valid 10-digit phone number.',
    invalidCity: 'Please choose a city.',
  },
  hi: {
    title: 'हेल्थ एंजल के रूप में जुड़ें',
    description: 'एक बार अपनी जानकारी दें। उसके बाद रोगी रेफर करना आसान रहेगा।',
    admin: 'एडमिन',
    footerLabel: 'पहले से जुड़े हैं?',
    footerLink: 'लॉग इन करें',
    name: 'पूरा नाम',
    phone: 'फोन नंबर',
    role: 'भूमिका',
    state: 'राज्य (वैकल्पिक)',
    statePlaceholder: 'सभी शहर दिखाएँ',
    city: 'शहर',
    cityPlaceholder: 'शहर चुनें',
    org: 'संगठन का नाम (वैकल्पिक)',
    submit: 'अकाउंट बनाएं',
    loading: 'अकाउंट बनाया जा रहा है...',
    referralLinked: 'रेफरल आईडी जुड़ी हुई है:',
    invalidPhone: 'कृपया सही 10 अंकों का फोन नंबर दर्ज करें।',
    invalidCity: 'कृपया एक शहर चुनें।',
  },
  kn: {
    title: 'ಹೆಲ್ತ್ ಏಂಜಲ್ ಆಗಿ ಸೇರಿ',
    description: 'ಒಮ್ಮೆ ನಿಮ್ಮ ವಿವರಗಳನ್ನು ಹಂಚಿದರೆ ಸಾಕು. ನಂತರ ರೋಗಿಯನ್ನು ಪರಿಚಯಿಸುವುದು ಸುಲಭ.',
    admin: 'ಅಡ್ಮಿನ್',
    footerLabel: 'ಈಗಾಗಲೇ ಸೇರಿದ್ದೀರಾ?',
    footerLink: 'ಲಾಗಿನ್',
    name: 'ಪೂರ್ಣ ಹೆಸರು',
    phone: 'ಫೋನ್ ಸಂಖ್ಯೆ',
    role: 'ಪಾತ್ರ',
    state: 'ರಾಜ್ಯ (ಐಚ್ಛಿಕ)',
    statePlaceholder: 'ಎಲ್ಲಾ ನಗರಗಳನ್ನು ತೋರಿಸಿ',
    city: 'ನಗರ',
    cityPlaceholder: 'ನಗರ ಆಯ್ಕೆಮಾಡಿ',
    org: 'ಸಂಸ್ಥೆಯ ಹೆಸರು (ಐಚ್ಛಿಕ)',
    submit: 'ಖಾತೆ ರಚಿಸಿ',
    loading: 'ಖಾತೆ ರಚಿಸಲಾಗುತ್ತಿದೆ...',
    referralLinked: 'ರೆಫರಲ್ ಐಡಿ ಜೋಡಿಸಲಾಗಿದೆ:',
    invalidPhone: 'ದಯವಿಟ್ಟು ಸರಿಯಾದ 10 ಅಂಕಿಗಳ ಫೋನ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ.',
    invalidCity: 'ದಯವಿಟ್ಟು ಒಂದು ನಗರವನ್ನು ಆಯ್ಕೆಮಾಡಿ.',
  },
  ta: {
    title: 'ஹெல்த் ஏஞ்சலாக சேருங்கள்',
    description: 'ஒருமுறை உங்கள் விவரங்களை அளிக்கவும். அதன் பிறகு நோயாளியை பரிந்துரைப்பது எளிது.',
    admin: 'அட்மின்',
    footerLabel: 'ஏற்கனவே சேர்ந்துவிட்டீர்களா?',
    footerLink: 'உள்நுழைவு',
    name: 'முழு பெயர்',
    phone: 'தொலைபேசி எண்',
    role: 'பங்கு',
    state: 'மாநிலம் (விருப்பம்)',
    statePlaceholder: 'அனைத்து நகரங்களையும் காட்டு',
    city: 'நகரம்',
    cityPlaceholder: 'நகரத்தை தேர்ந்தெடுக்கவும்',
    org: 'அமைப்பின் பெயர் (விருப்பம்)',
    submit: 'கணக்கு உருவாக்கவும்',
    loading: 'கணக்கு உருவாகிறது...',
    referralLinked: 'ரெஃபரல் ஐடி இணைக்கப்பட்டுள்ளது:',
    invalidPhone: 'சரியான 10 இலக்க தொலைபேசி எண்ணை உள்ளிடவும்.',
    invalidCity: 'ஒரு நகரத்தைத் தேர்ந்தெடுக்கவும்.',
  },
  te: {
    title: 'హెల్త్ ఏంజెల్‌గా చేరండి',
    description: 'ఒక్కసారి మీ వివరాలు ఇవ్వండి. తర్వాత రోగిని రిఫర్ చేయడం సులభం.',
    admin: 'అడ్మిన్',
    footerLabel: 'ఇప్పటికే చేరారా?',
    footerLink: 'లాగిన్',
    name: 'పూర్తి పేరు',
    phone: 'ఫోన్ నంబర్',
    role: 'పాత్ర',
    state: 'రాష్ట్రం (ఐచ్ఛికం)',
    statePlaceholder: 'అన్ని నగరాలు చూపించండి',
    city: 'నగరం',
    cityPlaceholder: 'నగరాన్ని ఎంచుకోండి',
    org: 'సంస్థ పేరు (ఐచ్ఛికం)',
    submit: 'ఖాతా సృష్టించండి',
    loading: 'ఖాతా సృష్టిస్తోంది...',
    referralLinked: 'రిఫరల్ ఐడి లింక్ అయింది:',
    invalidPhone: 'దయచేసి సరైన 10 అంకెల ఫోన్ నంబర్ ఇవ్వండి.',
    invalidCity: 'దయచేసి ఒక నగరాన్ని ఎంచుకోండి.',
  },
};

const initialState = {
  name: '',
  phone: '',
  role: 'Nurse' as PartnerRole,
  state: '',
  city: '',
  organizationName: '',
};

function normalizePhone(value: string) {
  return value.replace(/\D+/g, '').slice(0, 10);
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<RegisterFallback />}>
      <RegisterContent />
    </Suspense>
  );
}

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language, setLanguage } = useSiteLanguage();
  const text = copy[language];
  const bdoId = searchParams.get('bdo_id')?.trim() || '';
  const [form, setForm] = useState(initialState);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const cities = useMemo(
    () => (form.state ? getCitiesForState(form.state) : ALL_CITIES),
    [form.state],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (form.phone.length !== 10) {
      setError(text.invalidPhone);
      return;
    }

    if (!form.city) {
      setError(text.invalidCity);
      return;
    }

    setLoading(true);

    try {
      const response = await registerPartner({
        name: form.name.trim(),
        phone: form.phone,
        role: form.role,
        city: form.city,
        organizationName: form.organizationName.trim() || undefined,
        ...(bdoId ? { bdoId } : {}),
      });
      setPartnerSession(response.accessToken, response.partner);
      router.push('/submit-lead');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to register partner');
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageShell
      title={text.title}
      description={text.description}
      headerAction={
        <div className="flex items-center gap-2">
          <SiteLanguageSelect value={language} onChange={setLanguage} />
          <Link
            href="/admin/login"
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
          >
            {text.admin}
          </Link>
        </div>
      }
      footer={
        <>
          {text.footerLabel}{' '}
          <Link href="/login" className="font-semibold text-brand-700">
            {text.footerLink}
          </Link>
        </>
      }
    >
      <Card className="rounded-[28px] border-0 bg-white/92 p-6 shadow-[0_24px_80px_rgba(16,55,74,0.10)] sm:p-8">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            label={text.name}
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            placeholder={text.name}
            required
          />

          <Input
            label={text.phone}
            value={form.phone}
            onChange={(event) =>
              setForm({ ...form, phone: normalizePhone(event.target.value) })
            }
            placeholder="10-digit phone number"
            inputMode="numeric"
            pattern="\d{10}"
            maxLength={10}
            required
          />

          <Select
            label={text.role}
            value={form.role}
            onChange={(event) =>
              setForm({ ...form, role: event.target.value as PartnerRole })
            }
          >
            {roles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </Select>

          <Select
            label={text.state}
            value={form.state}
            onChange={(event) => setForm({ ...form, state: event.target.value, city: '' })}
          >
            <option value="">{text.statePlaceholder}</option>
            {STATE_CITY_OPTIONS.map((entry) => (
              <option key={entry.state} value={entry.state}>
                {entry.state}
              </option>
            ))}
          </Select>

          <Select
            label={text.city}
            value={form.city}
            onChange={(event) => setForm({ ...form, city: event.target.value })}
            required
          >
            <option value="">{text.cityPlaceholder}</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </Select>

          <Input
            label={text.org}
            value={form.organizationName}
            onChange={(event) =>
              setForm({ ...form, organizationName: event.target.value })
            }
            placeholder={text.org}
          />

          {bdoId ? <Notice tone="success">{text.referralLinked} {bdoId}</Notice> : null}
          {error ? <Notice tone="error">{error}</Notice> : null}

          <Button type="submit" disabled={loading}>
            {loading ? text.loading : text.submit}
          </Button>
        </form>
      </Card>
    </PageShell>
  );
}

function RegisterFallback() {
  return (
    <PageShell
      title="Health Angel registration"
      description="Loading registration form."
    >
      <Card className="text-center">
        <div className="mx-auto h-14 w-14 animate-pulse rounded-full bg-brand-100" />
      </Card>
    </PageShell>
  );
}
