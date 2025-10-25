// Admin dashboard page
// - Summary stats, searchable/filterable cases with actions
// - Partner grid and Add Partner form
// - Assign Case modal and read-only Case Details modal
import React, { useEffect, useMemo, useState } from 'react';
import { useData } from '@/context/DataContext';
import Select from '@/components/Select';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  FileText,
  BarChart3,
  CheckCircle2,
  Users as UsersIcon,
  RotateCcw,
  FlaskConical,
  UserCheck,
  X,
} from 'lucide-react';

const AdminPage: React.FC = () => {
  const { cases, partners, analyzeCase, assignCase, createPartner, togglePartner, resetDemo } = useData();

  // Filters and UI state for cases list
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [injuryFilter, setInjuryFilter] = useState<string | undefined>();
  const [assigning, setAssigning] = useState<string | null>(null);
  const [selectedPartner, setSelectedPartner] = useState<string | undefined>();
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);

  // Preselect first active partner when dialog opens
  useEffect(() => {
    if (assigning) {
      const firstActive = partners.find((p) => p.active)?.id;
      setSelectedPartner(firstActive);
    }
  }, [assigning, partners]);

  // Derived cases filtered by search and selects
  const filtered = cases.filter((c) => {
    return (
      c.fullName.toLowerCase().includes(search.toLowerCase()) &&
      (!statusFilter || c.status === statusFilter) &&
      (!injuryFilter || c.injuryType === injuryFilter)
    );
  });

  // Local form state for creating a new partner
  const partnerFormInitial = { name: '', email: '', specialties: '', coverage: '', capacity: 0 };
  const [partnerForm, setPartnerForm] = useState(partnerFormInitial);

  // Create partner; saved via DataContext
  const create = (e: React.FormEvent) => {
    e.preventDefault();
    const p = {
      id: `partner-${Date.now()}`,
      name: partnerForm.name,
      email: partnerForm.email,
      specialties: partnerForm.specialties.split(',').map((s) => s.trim()).filter(Boolean),
      coverage: partnerForm.coverage.split(',').map((s) => s.trim()).filter(Boolean),
      capacity: Number(partnerForm.capacity),
      active: true,
    };
    createPartner(p);
    toast.success('Partner created');
    setPartnerForm(partnerFormInitial);
  };

  // Assign selected partner to a case and close modal
  const assign = () => {
    if (assigning && selectedPartner) {
      assignCase(assigning, selectedPartner);
      toast.success('Case assigned');
      setAssigning(null);
      setSelectedPartner(undefined);
    }
  };

  // Reset all filters in one click
  const clearFilters = () => {
    setSearch('');
    setStatusFilter(undefined);
    setInjuryFilter(undefined);
  };

  // Unique injury types for filter select
  const injuryOptions = Array.from(new Set(cases.map((c) => c.injuryType))).map((i) => ({ value: i, label: i }));
  // Dashboard counters (memoized)
  const stats = useMemo(() => {
    const totalNew = cases.filter((c) => c.status === 'NEW').length;
    const totalAnalyzed = cases.filter((c) => c.status === 'ANALYZED').length;
    const totalAssigned = cases.filter((c) => c.status === 'ASSIGNED').length;
    const activePartners = partners.filter((p) => p.active).length;
    return { totalNew, totalAnalyzed, totalAssigned, activePartners };
  }, [cases, partners]);

  return (
    <div className="space-y-10">
      {/* Header + Stats */}
      <section>
        <div className="mb-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h1 className="page-title">Admin Dashboard</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Manage cases and partner relationships</p>
            </div>
            <button className="btn-ghost text-red-600" onClick={resetDemo}>
              <RotateCcw className="w-4 h-4" />
              <span className="ml-2">Reset Demo Data</span>
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="card"><div className="card-padding flex items-center gap-3"><div className="h-9 w-9 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center"><FileText className="w-4 h-4"/></div><div><div className="text-sm text-gray-600 dark:text-gray-400">New Cases</div><div className="text-xl font-semibold">{stats.totalNew}</div></div></div></div>
            <div className="card"><div className="card-padding flex items-center gap-3"><div className="h-9 w-9 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center"><BarChart3 className="w-4 h-4"/></div><div><div className="text-sm text-gray-600 dark:text-gray-400">Analyzed</div><div className="text-xl font-semibold">{stats.totalAnalyzed}</div></div></div></div>
            <div className="card"><div className="card-padding flex items-center gap-3"><div className="h-9 w-9 rounded-md bg-green-50 text-green-600 flex items-center justify-center"><CheckCircle2 className="w-4 h-4"/></div><div><div className="text-sm text-gray-600 dark:text-gray-400">Assigned</div><div className="text-xl font-semibold">{stats.totalAssigned}</div></div></div></div>
            <div className="card"><div className="card-padding flex items-center gap-3"><div className="h-9 w-9 rounded-md bg-gray-100 text-gray-700 flex items-center justify-center dark:bg-gray-800 dark:text-gray-300"><UsersIcon className="w-4 h-4"/></div><div><div className="text-sm text-gray-600 dark:text-gray-400">Active Partners</div><div className="text-xl font-semibold">{stats.activePartners}</div></div></div></div>
          </div>
        </div>

      {/* Partners */}
      <section>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
          <div className="lg:col-span-2 space-y-4">
            <div className="card">
              <div className="card-padding">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="section-title">Partner Firms</h2>
                  <a href="#add-partner" className="btn-primary">+ Add Partner</a>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {partners.map((p) => (
                    <div key={p.id} className="card">
                      <div className="card-padding space-y-2">
                        <div className="font-medium">{p.name}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{p.email}</div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Status</span>
                          <label className="inline-flex items-center gap-2">
                            <input type="checkbox" checked={p.active} onChange={() => togglePartner(p.id)} />
                            <span>{p.active ? 'Active' : 'Inactive'}</span>
                          </label>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Specialties: {p.specialties.join(', ') || '—'}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Coverage: {p.coverage.join(', ') || '—'}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Capacity: {p.capacity}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="mt-4 text-sm text-red-600 hover:underline" onClick={resetDemo}>Reset demo data</button>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div id="add-partner" className="card">
              <div className="card-padding">
                <h2 className="section-title mb-4">Add Partner</h2>
                <form onSubmit={create} className="flex flex-col gap-3">
                  <input className="input" placeholder="Name" value={partnerForm.name} onChange={(e) => setPartnerForm({ ...partnerForm, name: e.target.value })} />
                  <input className="input" placeholder="Email" value={partnerForm.email} onChange={(e) => setPartnerForm({ ...partnerForm, email: e.target.value })} />
                  <input className="input" placeholder="Specialties (comma)" value={partnerForm.specialties} onChange={(e) => setPartnerForm({ ...partnerForm, specialties: e.target.value })} />
                  <input className="input" placeholder="Coverage (comma)" value={partnerForm.coverage} onChange={(e) => setPartnerForm({ ...partnerForm, coverage: e.target.value })} />
                  <input className="input" type="number" placeholder="Capacity" value={partnerForm.capacity} onChange={(e) => setPartnerForm({ ...partnerForm, capacity: Number(e.target.value) })} />
                  <div>
                    <button className="btn-primary" type="submit">Add</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Case Management */}
        <div className="card">
          <div className="card-padding">
            <h2 className="section-title mb-4">Case Management</h2>
            <div className="flex gap-2 mb-3 flex-wrap items-center">
              <div className="relative flex-1 min-w-[240px]">
                {/* <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /> */}
                <input className="input w-full pl-9" placeholder="Search cases..." value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <Select value={statusFilter} onChange={setStatusFilter} placeholder="ALL">
                <Select.Trigger className="pill-trigger" />
                <Select.Content>
                  <Select.Item value="NEW">NEW</Select.Item>
                  <Select.Item value="ANALYZED">ANALYZED</Select.Item>
                  <Select.Item value="ASSIGNED">ASSIGNED</Select.Item>
                  <Select.Item value="DECLINED">DECLINED</Select.Item>
                </Select.Content>
              </Select>
              <Select value={injuryFilter} onChange={setInjuryFilter} placeholder="ALL">
                <Select.Trigger className="pill-trigger" />
                <Select.Content>
                  {injuryOptions.map((opt) => (
                    <Select.Item key={opt.value} value={opt.value}>
                      {opt.label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
              <button type="button" onClick={clearFilters} className="btn-muted" aria-label="Clear filters">
                <X className="w-4 h-4" />
                <span className="hidden sm:inline">Clear</span>
              </button>
              <div className="ml-auto text-sm text-gray-600 dark:text-gray-400">{filtered.length} of {cases.length} cases</div>
            </div>
            <div className="overflow-auto rounded-md border border-gray-200 dark:border-gray-800">
              <table className="table-base">
                <thead>
                  <tr>
                    <th className="th">Client</th>
                    <th className="th">Type</th>
                    <th className="th">Status</th>
                    <th className="th">Submitted</th>
                    <th className="th">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 && (
                    <tr>
                      <td className="td" colSpan={5}>No cases match the current filters.</td>
                    </tr>
                  )}
                  {filtered.map((c) => (
                    <tr
                      key={c.id}
                      className="tr-hover cursor-pointer"
                      tabIndex={0}
                      onClick={() => setSelectedCaseId(c.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelectedCaseId(c.id);
                        }
                      }}
                      aria-label={`View details for ${c.fullName}`}
                    >
                      <td className="td">
                        <div className="font-medium">{c.fullName}</div>
                        <div className="text-xs text-gray-500">{c.email}</div>
                      </td>
                      <td className="td"><span className="chip-muted">{c.injuryType || '—'}</span></td>
                      <td className="td">
                        {c.status === 'NEW' && <span className="chip-muted">NEW</span>}
                        {c.status === 'ANALYZED' && <span className="chip-blue">ANALYZED</span>}
                        {c.status === 'ASSIGNED' && <span className="chip-green">ASSIGNED</span>}
                        {c.status === 'DECLINED' && <span className="chip-red">DECLINED</span>}
                      </td>
                      <td className="td">{new Date(c.submittedAt).toLocaleDateString()}</td>
                      <td className="td space-x-2" onClick={(e) => e.stopPropagation()}>
                        <button title="Analyze" className="icon-btn" disabled={c.status !== 'NEW'} onClick={() => analyzeCase(c.id)}>
                          <FlaskConical className="w-4 h-4" />
                        </button>
                        <button title="Assign" className="icon-btn" disabled={c.status !== 'ANALYZED'} onClick={() => setAssigning(c.id)}>
                          <UserCheck className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Assign Case modal */}
      <AnimatePresence>
        {assigning && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="card w-80"
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <div className="card-padding space-y-4">
                <h3 className="font-semibold">Assign case</h3>
                <Select value={selectedPartner} onChange={setSelectedPartner} placeholder="Partner">
                  <Select.Trigger className="pill-trigger w-full justify-between" />
                  <Select.Content>
                    {partners
                      .filter((p) => p.active)
                      .map((p) => (
                        <Select.Item key={p.id} value={p.id}>
                          {p.name}
                        </Select.Item>
                      ))}
                  </Select.Content>
                </Select>
                <div className="flex justify-end gap-2">
                  <button className="btn-ghost" onClick={() => setAssigning(null)}>
                    Cancel
                  </button>
                  <button className="btn-primary disabled:opacity-50" disabled={!selectedPartner} onClick={assign}>
                    Assign
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* View Case Details modal */}
      <AnimatePresence>
        {selectedCaseId && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="card max-w-xl w-[92vw]"
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <CaseDetails caseId={selectedCaseId} onClose={() => setSelectedCaseId(null)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPage;

const CaseDetails: React.FC<{ caseId: string; onClose: () => void }> = ({ caseId, onClose }) => {
  const { cases, partners } = useData();
  const c = cases.find((x) => x.id === caseId);
  const partner = c?.assignedPartnerId ? partners.find((p) => p.id === c.assignedPartnerId) : undefined;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey as any);
    return () => document.removeEventListener('keydown', onKey as any);
  }, [onClose]);

  if (!c) return null;
  return (
    <div className="card-padding">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="section-title">Case Details</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{c.fullName} • {c.email}</p>
        </div>
        <button className="icon-btn" aria-label="Close" onClick={onClose}>
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 text-sm">
        <div className="card-padding rounded-md muted-surface">
          <div><span className="text-gray-600 dark:text-gray-400">Submitted:</span> {new Date(c.submittedAt).toLocaleString()}</div>
          {c.phone && <div><span className="text-gray-600 dark:text-gray-400">Phone:</span> {c.phone}</div>}
          {c.location && <div><span className="text-gray-600 dark:text-gray-400">Location:</span> {c.location}</div>}
          {c.incidentDate && <div><span className="text-gray-600 dark:text-gray-400">Incident:</span> {c.incidentDate}</div>}
          <div><span className="text-gray-600 dark:text-gray-400">Type:</span> {c.injuryType || '—'}</div>
          <div><span className="text-gray-600 dark:text-gray-400">Status:</span> {c.status}</div>
          {partner && <div><span className="text-gray-600 dark:text-gray-400">Assigned:</span> {partner.name}</div>}
        </div>
        <div className="card-padding rounded-md muted-surface">
          <div className="font-medium mb-1">Analysis</div>
          {c.analysis ? (
            <div className="space-y-1">
              <div><span className="text-gray-600 dark:text-gray-400">Score:</span> {c.analysis.score}</div>
              <div><span className="text-gray-600 dark:text-gray-400">Est. Value:</span> ${c.analysis.estimatedValue.toLocaleString()}</div>
              <div><span className="text-gray-600 dark:text-gray-400">Recommendation:</span> {c.analysis.recommendation}</div>
              <div className="flex flex-wrap gap-1"><span className="text-gray-600 dark:text-gray-400">Risks:</span> {c.analysis.riskFactors.map((r, i) => (<span key={i} className="chip-muted">{r}</span>))}</div>
              <div className="text-xs text-gray-500">{new Date(c.analysis.timestamp).toLocaleString()}</div>
            </div>
          ) : (
            <div className="text-gray-600 dark:text-gray-400">No analysis attached yet.</div>
          )}
        </div>
      </div>

      <div className="mb-2">
        <div className="label mb-1">Description</div>
        <div className="card-padding rounded-md muted-surface whitespace-pre-line text-sm leading-relaxed">{c.description}</div>
      </div>

      <div className="flex justify-end mt-4">
        <button className="btn-muted" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};
