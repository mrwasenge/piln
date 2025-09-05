import React, { useState } from 'react';
import { useData } from '@/context/DataContext';
import { Case } from '@/types';
import { toast } from 'sonner';

const PublicPage: React.FC = () => {
  const { addCase } = useData();
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

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.email || form.description.length < 20 || !form.consent) {
      toast.error('Please fill required fields and provide consent.');
      return;
    }
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
      status: 'NEW',
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
  };

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Submit a Case</h1>
      <form onSubmit={submit} className="space-y-3">
        <input
          className="w-full border rounded p-2"
          placeholder="Full name"
          value={form.fullName}
          onChange={(e) => setForm({ ...form, fullName: e.target.value })}
        />
        <input
          className="w-full border rounded p-2"
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          className="w-full border rounded p-2"
          placeholder="Phone (optional)"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
        <input
          className="w-full border rounded p-2"
          placeholder="Location (optional)"
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
        />
        <input
          className="w-full border rounded p-2"
          placeholder="Incident Date (optional)"
          type="date"
          value={form.incidentDate}
          onChange={(e) => setForm({ ...form, incidentDate: e.target.value })}
        />
        <input
          className="w-full border rounded p-2"
          placeholder="Injury Type"
          value={form.injuryType}
          onChange={(e) => setForm({ ...form, injuryType: e.target.value })}
        />
        <textarea
          className="w-full border rounded p-2"
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.consent}
            onChange={(e) => setForm({ ...form, consent: e.target.checked })}
          />
          <span>I consent to submit this information.</span>
        </label>
        <button className="px-4 py-2 bg-blue-600 text-white rounded" type="submit">
          Submit
        </button>
      </form>
    </div>
  );
};

export default PublicPage;
