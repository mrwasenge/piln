// Partner dashboard
// - Auto-selects first partner
// - Shows partner summary and assigned cases
// - Click any row to view full case details in a modal
import React, { useEffect, useMemo, useState } from 'react';
import { useData } from '@/context/DataContext';
import Select from '@/components/Select';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const PartnerPage: React.FC = () => {
  const { partners, cases, currentPartnerId, setCurrentPartnerId } = useData();
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);

  // Ensure a partner is selected (first available) for a stable default view
  useEffect(() => {
    if (!currentPartnerId && partners.length > 0) {
      setCurrentPartnerId(partners[0].id);
    }
  }, [currentPartnerId, partners, setCurrentPartnerId]);

  if (partners.length === 0) {
    return <div className="card card-padding"><p>No partners available.</p></div>;
  }

  const partner = partners.find((p) => p.id === currentPartnerId);
  // Memoized list of cases assigned to the current partner
  const assigned = useMemo(() => cases.filter((c) => c.assignedPartnerId === partner?.id), [cases, partner?.id]);
  const avgScore =
    assigned.length > 0
      ? (
          assigned.reduce((sum, c) => sum + (c.analysis?.score || 0), 0) / assigned.length
        ).toFixed(1)
      : 'N/A';

  return (
    <div className="space-y-4">
      <h1 className="page-title">{partner ? partner.name : 'Partners'}</h1>
      <div>
        <Select value={currentPartnerId} onChange={setCurrentPartnerId} placeholder="Select partner">
          <Select.Trigger className="pill-trigger" />
          <Select.Content>
            {partners.map((p) => (
              <Select.Item key={p.id} value={p.id}>
                {p.name}
              </Select.Item>
            ))}
          </Select.Content>
        </Select>
      </div>

      {partner ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="card card-padding">
              <div className="text-sm text-gray-600">Assigned Cases</div>
              <div className="text-2xl font-semibold">{assigned.length}</div>
            </div>
            <div className="card card-padding">
              <div className="text-sm text-gray-600">Average Score</div>
              <div className="text-2xl font-semibold">{avgScore}</div>
            </div>
            <div className="card card-padding">
              <div className="text-sm text-gray-600">Status</div>
              <div className="text-2xl font-semibold">
                {partner.active ? 'Active' : 'Inactive'}
              </div>
            </div>
          </div>

          {assigned.length > 0 ? (
            <div className="overflow-auto rounded-md border border-gray-200 dark:border-gray-800 mt-4">
              <table className="table-base">
                <thead>
                  <tr>
                    <th className="th">Name</th>
                    <th className="th">Injury</th>
                    <th className="th">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {assigned.map((c) => (
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
                      <td className="td">{c.fullName}</td>
                      <td className="td">{c.injuryType}</td>
                      <td className="td">{c.analysis?.score ?? 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="card card-padding mt-4"><p>No cases assigned.</p></div>
          )}

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
                  <CaseDetails
                    caseId={selectedCaseId}
                    onClose={() => setSelectedCaseId(null)}
                  />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      ) : (
        <div className="card card-padding"><p>Select a partner to view assigned cases.</p></div>
      )}
    </div>
  );
};

export default PartnerPage;

// Read‑only case details for Partner view
const CaseDetails: React.FC<{ caseId: string; onClose: () => void }> = ({ caseId, onClose }) => {
  const { cases, partners } = useData();
  const c = cases.find((x) => x.id === caseId);
  const partner = c?.assignedPartnerId ? partners.find((p) => p.id === c.assignedPartnerId) : undefined;

  // Close on Escape key
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
