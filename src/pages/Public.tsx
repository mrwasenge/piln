// Public intake form
// - Validates required fields (name, email, description >= 20, consent)
// - Optional fields do not block submission
// - Persists new case via DataContext
import React, { useMemo, useState } from 'react';
import { useData } from '@/context/DataContext';
import { Case } from '@/types';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { analyzeIntake } from '@/services/intake';
import { ENABLE_INTAKE_ANALYSIS } from '@/config';

const PublicPage: React.FC = () => {
  const { addCase } = useData();
  // Form state (simple flat object)
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    incidentDate: '',
    injuryType: '',
    description: '',
    consent: false,
  });

  // Track field interaction to show validation feedback on blur or submit
  const [touched, setTouched] = useState<{ fullName?: boolean; email?: boolean; description?: boolean; consent?: boolean }>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isValidEmail = (val: string) => /.+@.+\..+/.test(val);

  // Compute validation errors from current form values
  const errors = useMemo(() => {
    const out: { fullName?: string; email?: string; description?: string; consent?: string } = {};
    if (!form.fullName.trim()) out.fullName = 'Full name is required';
    if (!form.email.trim() || !isValidEmail(form.email)) out.email = 'Valid email is required';
    if (form.description.trim().length < 20) out.description = 'At least 20 characters required';
    if (!form.consent) out.consent = 'Consent is required';
    return out;
  }, [form]);

  const showError = (key: keyof typeof errors) => (submitted || touched[key]) && !!errors[key];

  // Submit handler: guard on errors, then add the new case
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (Object.keys(errors).length > 0) {
      toast.error('Please fix the highlighted fields.');
      return;
    }
    setSubmitting(true);
    // Optional: send to analyzer API before persisting
    const analysis = await analyzeIntake({
      fullName: form.fullName,
      email: form.email,
      phone: form.phone || undefined,
      location: form.location || undefined,
      incidentDate: form.incidentDate || undefined,
      injuryType: form.injuryType,
      description: form.description,
    }).catch(() => undefined);

    const c: Case = {
      id: `case-${Date.now()}`,
      submittedAt: new Date().toISOString(),
      fullName: form.fullName,
      email: form.email,
      phone: form.phone || undefined,
      location: form.location || undefined,
      incidentDate: form.incidentDate || undefined,
      injuryType: form.injuryType,
      description: form.description,
      // If intake analysis is enabled, mark as ANALYZED so Admin can assign immediately.
      // Otherwise keep NEW and allow in-dashboard analysis.
      status: analysis && ENABLE_INTAKE_ANALYSIS ? 'ANALYZED' : 'NEW',
      analysis: analysis || undefined,
    };
    addCase(c);
    toast.success('Case submitted');
    setForm({
      fullName: '',
      email: '',
      phone: '',
      location: '',
      incidentDate: '',
      injuryType: '',
      description: '',
      consent: false,
    });
    setTouched({});
    setSubmitted(false);
    setSubmitting(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="page-title mb-4">Submit a Case</h1>
      <div className="card">
        <form onSubmit={submit} className="card-padding space-y-4">
          <div>
            <label className="label" htmlFor="fullName">Full name</label>
            <input
              id="fullName"
              className={cn('input', showError('fullName') && 'border-red-500 focus-visible:ring-red-500/60')}
              placeholder="John Doe"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              onBlur={() => setTouched((t) => ({ ...t, fullName: true }))}
              aria-invalid={showError('fullName')}
            />
            {showError('fullName') && <p className="helper text-red-600 mt-1">{errors.fullName}</p>}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label" htmlFor="email">Email</label>
              <input
                id="email"
                className={cn('input', showError('email') && 'border-red-500 focus-visible:ring-red-500/60')}
                placeholder="you@example.com"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                aria-invalid={showError('email')}
              />
              {showError('email') && <p className="helper text-red-600 mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="label" htmlFor="phone">Phone (optional)</label>
              <input id="phone" className="input" placeholder="(555) 123-4567" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label" htmlFor="location">Location (optional)</label>
              <input id="location" className="input" placeholder="City, State" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </div>
            <div>
              <label className="label" htmlFor="incidentDate">Incident Date (optional)</label>
              <input id="incidentDate" className="input" type="date" value={form.incidentDate} onChange={(e) => setForm({ ...form, incidentDate: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="injuryType">Injury Type</label>
            <input id="injuryType" className="input" placeholder="Auto, Slip & Fall, etc." value={form.injuryType} onChange={(e) => setForm({ ...form, injuryType: e.target.value })} />
          </div>
          <div>
            <label className="label" htmlFor="description">Description</label>
            <textarea
              id="description"
              className={cn('input min-h-[96px] py-2', showError('description') && 'border-red-500 focus-visible:ring-red-500/60')}
              placeholder="Provide details (at least 20 characters)"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              onBlur={() => setTouched((t) => ({ ...t, description: true }))}
              aria-invalid={showError('description')}
            />
            {showError('description') ? (
              <p className="helper text-red-600 mt-1">{errors.description}</p>
            ) : (
              <p className="helper mt-1">We only use this to evaluate fit with partner firms.</p>
            )}
          </div>
          <label className={cn('flex items-center gap-2', showError('consent') && 'text-red-600')}>
            <input
              className={cn('h-4 w-4 rounded border', showError('consent') && 'border-red-500 ring-1 ring-red-500')}
              type="checkbox"
              checked={form.consent}
              onChange={(e) => setForm({ ...form, consent: e.target.checked })}
              onBlur={() => setTouched((t) => ({ ...t, consent: true }))}
              aria-invalid={showError('consent')}
            />
            <span className="text-sm">I consent to submit this information.</span>
          </label>
          {showError('consent') && <p className="helper text-red-600 mt-1">Consent is required</p>}
          <div className="pt-2">
            <button className="btn-primary disabled:opacity-50" type="submit" disabled={submitting}>
              {submitting ? 'Submitting…' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PublicPage;
