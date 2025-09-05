import React, { useState } from 'react';
import { useData } from '@/context/DataContext';
import Select from '@/components/Select';
import { toast } from 'sonner';

const AdminPage: React.FC = () => {
  const {
    cases,
    partners,
    analyzeCase,
    assignCase,
    createPartner,
    togglePartner,
    resetDemo,
  } = useData();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [injuryFilter, setInjuryFilter] = useState<string | undefined>();
  const [assigning, setAssigning] = useState<string | null>(null);
  const [selectedPartner, setSelectedPartner] = useState<string | undefined>();

  const filtered = cases.filter((c) => {
    return (
      c.fullName.toLowerCase().includes(search.toLowerCase()) &&
      (!statusFilter || c.status === statusFilter) &&
      (!injuryFilter || c.injuryType === injuryFilter)
    );
  });

  const partnerFormInitial = { name: '', email: '', specialties: '', coverage: '', capacity: 0 };
  const [partnerForm, setPartnerForm] = useState(partnerFormInitial);

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

  const assign = () => {
    if (assigning && selectedPartner) {
      assignCase(assigning, selectedPartner);
      toast.success('Case assigned');
      setAssigning(null);
      setSelectedPartner(undefined);
    }
  };

  const injuryOptions = Array.from(new Set(cases.map((c) => c.injuryType))).map((i) => ({ value: i, label: i }));

  return (
    <div className="space-y-10">
      <section>
        <h2 className="text-xl font-semibold mb-4">Cases</h2>
        <div className="flex gap-2 mb-2 flex-wrap">
          <input
            className="border rounded p-1"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select value={statusFilter} onChange={setStatusFilter} placeholder="Status">
            <Select.Trigger className="px-2" />
            <Select.Content>
              <Select.Item value="NEW">NEW</Select.Item>
              <Select.Item value="ANALYZED">ANALYZED</Select.Item>
              <Select.Item value="ASSIGNED">ASSIGNED</Select.Item>
              <Select.Item value="DECLINED">DECLINED</Select.Item>
            </Select.Content>
          </Select>
          <Select value={injuryFilter} onChange={setInjuryFilter} placeholder="Injury">
            <Select.Trigger className="px-2" />
            <Select.Content>
              {injuryOptions.map((opt) => (
                <Select.Item key={opt.value} value={opt.value}>
                  {opt.label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
        </div>
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="p-2">Name</th>
                <th className="p-2">Injury</th>
                <th className="p-2">Status</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-b hover:bg-gray-50">
                  <td className="p-2">{c.fullName}</td>
                  <td className="p-2">{c.injuryType}</td>
                  <td className="p-2">{c.status}</td>
                  <td className="p-2 space-x-2">
                    <button
                      className="px-2 py-1 bg-green-600 text-white rounded disabled:opacity-50"
                      disabled={c.status !== 'NEW'}
                      onClick={() => analyzeCase(c.id)}
                    >
                      Analyze
                    </button>
                    <button
                      className="px-2 py-1 bg-blue-600 text-white rounded disabled:opacity-50"
                      disabled={c.status !== 'ANALYZED'}
                      onClick={() => setAssigning(c.id)}
                    >
                      Assign
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Partners</h2>
        <form onSubmit={create} className="flex flex-wrap gap-2 mb-4 items-end">
          <input
            className="border rounded p-1"
            placeholder="Name"
            value={partnerForm.name}
            onChange={(e) => setPartnerForm({ ...partnerForm, name: e.target.value })}
          />
          <input
            className="border rounded p-1"
            placeholder="Email"
            value={partnerForm.email}
            onChange={(e) => setPartnerForm({ ...partnerForm, email: e.target.value })}
          />
          <input
            className="border rounded p-1"
            placeholder="Specialties (comma)"
            value={partnerForm.specialties}
            onChange={(e) => setPartnerForm({ ...partnerForm, specialties: e.target.value })}
          />
          <input
            className="border rounded p-1"
            placeholder="Coverage (comma)"
            value={partnerForm.coverage}
            onChange={(e) => setPartnerForm({ ...partnerForm, coverage: e.target.value })}
          />
          <input
            className="border rounded p-1 w-20"
            type="number"
            placeholder="Capacity"
            value={partnerForm.capacity}
            onChange={(e) => setPartnerForm({ ...partnerForm, capacity: Number(e.target.value) })}
          />
          <button className="px-3 py-1 bg-blue-600 text-white rounded" type="submit">
            Add
          </button>
        </form>
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="p-2">Name</th>
              <th className="p-2">Email</th>
              <th className="p-2">Active</th>
            </tr>
          </thead>
          <tbody>
            {partners.map((p) => (
              <tr key={p.id} className="border-b hover:bg-gray-50">
                <td className="p-2">{p.name}</td>
                <td className="p-2">{p.email}</td>
                <td className="p-2">
                  <input
                    type="checkbox"
                    checked={p.active}
                    onChange={() => togglePartner(p.id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button className="mt-4 text-sm text-red-600" onClick={resetDemo}>
          Reset demo data
        </button>
      </section>

      {assigning && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-30">
          <div className="bg-white p-4 rounded shadow w-80 space-y-4">
            <h3 className="font-semibold">Assign case</h3>
            <Select value={selectedPartner} onChange={setSelectedPartner} placeholder="Partner">
              <Select.Trigger className="w-full justify-between" />
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
              <button className="px-3 py-1" onClick={() => setAssigning(null)}>
                Cancel
              </button>
              <button
                className="px-3 py-1 bg-blue-600 text-white rounded disabled:opacity-50"
                disabled={!selectedPartner}
                onClick={assign}
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
