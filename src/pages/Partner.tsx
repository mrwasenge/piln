import React from 'react';
import { useData } from '@/context/DataContext';
import Select from '@/components/Select';

const PartnerPage: React.FC = () => {
  const { partners, cases, currentPartnerId, setCurrentPartnerId } = useData();

  if (partners.length === 0) {
    return <p>No partners available.</p>;
  }

  const partner = partners.find((p) => p.id === currentPartnerId);
  const assigned = cases.filter((c) => c.assignedPartnerId === partner?.id);
  const avgScore =
    assigned.length > 0
      ? (
          assigned.reduce((sum, c) => sum + (c.analysis?.score || 0), 0) / assigned.length
        ).toFixed(1)
      : 'N/A';

  return (
    <div className="space-y-4">
      <Select
        value={currentPartnerId}
        onChange={setCurrentPartnerId}
        placeholder="Select partner"
      >
        <Select.Trigger />
        <Select.Content>
          {partners.map((p) => (
            <Select.Item key={p.id} value={p.id}>
              {p.name}
            </Select.Item>
          ))}
        </Select.Content>
      </Select>

      {partner ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded shadow">
              <div className="text-sm text-gray-600">Assigned Cases</div>
              <div className="text-2xl font-semibold">{assigned.length}</div>
            </div>
            <div className="p-4 bg-white rounded shadow">
              <div className="text-sm text-gray-600">Average Score</div>
              <div className="text-2xl font-semibold">{avgScore}</div>
            </div>
            <div className="p-4 bg-white rounded shadow">
              <div className="text-sm text-gray-600">Status</div>
              <div className="text-2xl font-semibold">
                {partner.active ? 'Active' : 'Inactive'}
              </div>
            </div>
          </div>

          {assigned.length > 0 ? (
            <table className="min-w-full text-sm mt-4">
              <thead>
                <tr className="text-left border-b">
                  <th className="p-2">Name</th>
                  <th className="p-2">Injury</th>
                  <th className="p-2">Score</th>
                </tr>
              </thead>
              <tbody>
                {assigned.map((c) => (
                  <tr key={c.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">{c.fullName}</td>
                    <td className="p-2">{c.injuryType}</td>
                    <td className="p-2">{c.analysis?.score ?? 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No cases assigned.</p>
          )}
        </>
      ) : (
        <p>Select a partner to view assigned cases.</p>
      )}
    </div>
  );
};

export default PartnerPage;
