'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageShell } from '@/components/layout/page-shell';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Notice } from '@/components/ui/notice';
import { EarningsWidget } from '@/components/earnings-widget';
import { SiteLanguageSelect } from '@/components/site-language-select';
import { clearPartnerSession, getPartnerSession } from '@/lib/auth';
import { submitLead } from '@/lib/api';
import { SiteLanguage, useSiteLanguage } from '@/lib/site-language';

const serviceOptions = [
  '',
  'Nurse attendant',
  'Physio therapist',
  'Nurse resident',
  'Visiting nurse',
  'Equipment sale',
  'Equipment rental',
];

const copy: Record<
  SiteLanguage,
  {
    title: string;
    description: string;
    healthAngel: string;
    logout: string;
    patientName: string;
    patientPhone: string;
    service: string;
    servicePlaceholder: string;
    invalidPhone: string;
    submitting: string;
    submit: string;
    restoringTitle: string;
    restoringDescription: string;
  }
> = {
  en: {
    title: 'Share a patient lead',
    description: 'Enter the patient name and phone number. Service can be added now or later.',
    healthAngel: 'Health Angel',
    logout: 'Logout',
    patientName: 'Patient name',
    patientPhone: 'Patient phone',
    service: 'Service type (optional)',
    servicePlaceholder: 'Select later / skip for now',
    invalidPhone: 'Please enter a valid 10-digit patient phone number.',
    submitting: 'Submitting...',
    submit: 'Send lead',
    restoringTitle: 'Opening your lead form',
    restoringDescription: 'Please wait while we restore your session.',
  },
  hi: {
    title: 'रोगी की जानकारी साझा करें',
    description: 'रोगी का नाम और फोन नंबर दर्ज करें। सेवा अभी या बाद में जोड़ सकते हैं।',
    healthAngel: 'हेल्थ एंजल',
    logout: 'लॉगआउट',
    patientName: 'रोगी का नाम',
    patientPhone: 'रोगी का फोन',
    service: 'सेवा प्रकार (वैकल्पिक)',
    servicePlaceholder: 'बाद में चुनें / अभी छोड़ें',
    invalidPhone: 'कृपया सही 10 अंकों का रोगी फोन नंबर दर्ज करें।',
    submitting: 'भेजा जा रहा है...',
    submit: 'लीड भेजें',
    restoringTitle: 'आपका लीड फॉर्म खुल रहा है',
    restoringDescription: 'कृपया इंतजार करें, आपका सेशन बहाल किया जा रहा है।',
  },
  kn: {
    title: 'ರೋಗಿಯ ವಿವರವನ್ನು ಹಂಚಿ',
    description: 'ರೋಗಿಯ ಹೆಸರು ಮತ್ತು ಫೋನ್ ಸಂಖ್ಯೆ ನಮೂದಿಸಿ. ಸೇವೆಯನ್ನು ಈಗ ಅಥವಾ ನಂತರ ಸೇರಿಸಬಹುದು.',
    healthAngel: 'ಹೆಲ್ತ್ ಏಂಜಲ್',
    logout: 'ಲಾಗೌಟ್',
    patientName: 'ರೋಗಿಯ ಹೆಸರು',
    patientPhone: 'ರೋಗಿಯ ಫೋನ್',
    service: 'ಸೇವೆಯ ವಿಧ (ಐಚ್ಛಿಕ)',
    servicePlaceholder: 'ನಂತರ ಆಯ್ಕೆಮಾಡಿ / ಈಗ ಬಿಡಿ',
    invalidPhone: 'ದಯವಿಟ್ಟು ಸರಿಯಾದ 10 ಅಂಕಿಗಳ ರೋಗಿಯ ಫೋನ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ.',
    submitting: 'ಕಳುಹಿಸಲಾಗುತ್ತಿದೆ...',
    submit: 'ಲೀಡ್ ಕಳುಹಿಸಿ',
    restoringTitle: 'ನಿಮ್ಮ ಲೀಡ್ ಫಾರ್ಮ್ ತೆರೆಯುತ್ತಿದೆ',
    restoringDescription: 'ದಯವಿಟ್ಟು ಕ್ಷಣಕಾಲ ಕಾಯಿರಿ, ನಿಮ್ಮ ಸೆಷನ್ ಮರುಸ್ಥಾಪಿಸಲಾಗುತ್ತಿದೆ.',
  },
  ta: {
    title: 'நோயாளர் விவரத்தை பகிருங்கள்',
    description: 'நோயாளர் பெயரும் தொலைபேசி எண்ணும் மட்டும் போதும். சேவையை இப்போது அல்லது பின்னர் சேர்க்கலாம்.',
    healthAngel: 'ஹெல்த் ஏஞ்சல்',
    logout: 'வெளியேறு',
    patientName: 'நோயாளர் பெயர்',
    patientPhone: 'நோயாளர் தொலைபேசி',
    service: 'சேவை வகை (விருப்பம்)',
    servicePlaceholder: 'பிறகு தேர்வு செய்யவும் / இப்போது தவிர்க்கவும்',
    invalidPhone: 'சரியான 10 இலக்க நோயாளர் தொலைபேசி எண்ணை உள்ளிடவும்.',
    submitting: 'அனுப்பப்படுகிறது...',
    submit: 'லீடு அனுப்பவும்',
    restoringTitle: 'உங்கள் லீடு படிவம் திறக்கப்படுகிறது',
    restoringDescription: 'தயவு செய்து காத்திருக்கவும், உங்கள் அமர்வு மீட்டெடுக்கப்படுகிறது.',
  },
  te: {
    title: 'రోగి వివరాలు పంచండి',
    description: 'రోగి పేరు మరియు ఫోన్ నంబర్ చాలు. సేవను ఇప్పుడు లేదా తర్వాత చేర్చవచ్చు.',
    healthAngel: 'హెల్త్ ఏంజెల్',
    logout: 'లాగౌట్',
    patientName: 'రోగి పేరు',
    patientPhone: 'రోగి ఫోన్',
    service: 'సేవ రకం (ఐచ్ఛికం)',
    servicePlaceholder: 'తర్వాత ఎంచుకోండి / ఇప్పుడు వదిలేయండి',
    invalidPhone: 'దయచేసి సరైన 10 అంకెల రోగి ఫోన్ నంబర్ ఇవ్వండి.',
    submitting: 'పంపిస్తోంది...',
    submit: 'లీడ్ పంపండి',
    restoringTitle: 'మీ లీడ్ ఫారం తెరుచుకుంటోంది',
    restoringDescription: 'దయచేసి వేచి ఉండండి, మీ సెషన్ పునరుద్ధరించబడుతోంది.',
  },
};

const initialLead = {
  patientName: '',
  phone: '',
  serviceType: '',
};

function normalizePhone(value: string) {
  return value.replace(/\D+/g, '').slice(0, 10);
}

export default function SubmitLeadPage() {
  const router = useRouter();
  const { language, setLanguage } = useSiteLanguage();
  const text = copy[language];
  const [ready, setReady] = useState(false);
  const [lead, setLead] = useState(initialLead);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [partnerName, setPartnerName] = useState('');
  const [partnerToken, setPartnerToken] = useState('');

  useEffect(() => {
    const session = getPartnerSession();

    if (!session) {
      router.replace('/login');
      return;
    }

    setPartnerName(session.partner.name);
    setPartnerToken(session.token);
    setReady(true);
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const session = getPartnerSession();

    if (!session) {
      router.replace('/login');
      return;
    }

    if (lead.phone.length !== 10) {
      setError(text.invalidPhone);
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await submitLead(session.token, {
        patientName: lead.patientName.trim(),
        phone: lead.phone,
        serviceType: lead.serviceType || undefined,
      });
      setMessage(`${response.message}. Status: ${response.status}`);
      setLead(initialLead);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to submit lead');
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    clearPartnerSession();
    router.replace('/login');
  }

  if (!ready) {
    return (
      <PageShell title={text.restoringTitle} description={text.restoringDescription}>
        <Card className="text-center">
          <div className="mx-auto h-14 w-14 animate-pulse rounded-full bg-brand-100" />
        </Card>
      </PageShell>
    );
  }

  return (
    <PageShell
      title={text.title}
      description={text.description}
      headerAction={<SiteLanguageSelect value={language} onChange={setLanguage} />}
    >
      <div className="space-y-4">
        {partnerToken ? <EarningsWidget token={partnerToken} /> : null}

        <Card className="space-y-3 rounded-[28px] border-0 bg-white/92 p-6 shadow-[0_24px_80px_rgba(16,55,74,0.10)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">
                {text.healthAngel}
              </p>
              <p className="mt-1 font-display text-xl font-semibold text-ink">
                {partnerName}
              </p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600"
            >
              {text.logout}
            </button>
          </div>
        </Card>

        <Card className="rounded-[28px] border-0 bg-white/92 p-6 shadow-[0_24px_80px_rgba(16,55,74,0.10)]">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              label={text.patientName}
              value={lead.patientName}
              onChange={(event) =>
                setLead({ ...lead, patientName: event.target.value })
              }
              placeholder={text.patientName}
              required
            />

            <Input
              label={text.patientPhone}
              value={lead.phone}
              onChange={(event) =>
                setLead({ ...lead, phone: normalizePhone(event.target.value) })
              }
              placeholder="10-digit patient phone number"
              inputMode="numeric"
              pattern="\d{10}"
              maxLength={10}
              required
            />

            <Select
              label={text.service}
              value={lead.serviceType}
              onChange={(event) =>
                setLead({ ...lead, serviceType: event.target.value })
              }
            >
              <option value="">{text.servicePlaceholder}</option>
              {serviceOptions
                .filter(Boolean)
                .map((service) => (
                  <option key={service} value={service}>
                    {service}
                  </option>
                ))}
            </Select>

            {message ? <Notice tone="success">{message}</Notice> : null}
            {error ? <Notice tone="error">{error}</Notice> : null}

            <Button type="submit" disabled={loading}>
              {loading ? text.submitting : text.submit}
            </Button>
          </form>
        </Card>
      </div>
    </PageShell>
  );
}
