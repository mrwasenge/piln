import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Case, Partner } from '@/types';
import { load, save } from '@/lib/storage';
import { seedCases, seedPartners } from '@/data/seed';

interface DataContextType {
  cases: Case[];
  partners: Partner[];
  currentPartnerId?: string;
  setCurrentPartnerId: (id?: string) => void;
  addCase: (c: Case) => void;
  analyzeCase: (id: string) => void;
  assignCase: (id: string, partnerId: string) => void;
  createPartner: (p: Partner) => void;
  togglePartner: (id: string) => void;
  resetDemo: () => void;
}

const DataContext = createContext<DataContextType>(null!);
export const useData = () => useContext(DataContext);

function generateAnalysis(id: string) {
  const seed = Array.from(id).reduce((a, c) => a + c.charCodeAt(0), 0);
  const score = (seed % 50) + 50;
  const estimatedValue = score * 1000;
  const riskFactors = score > 80 ? ['Low risk'] : ['Moderate risk'];
  const recommendation = score > 80 ? 'High priority' : 'Review carefully';
  return { score, estimatedValue, riskFactors, recommendation, timestamp: new Date().toISOString() };
}

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cases, setCases] = useState<Case[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [currentPartnerId, setCurrentPartnerId] = useState<string | undefined>();

  useEffect(() => {
    const storedCases = load<Case[]>('cases', []);
    const storedPartners = load<Partner[]>('partners', []);
    const storedPartnerId = load<string | undefined>('currentPartnerId', undefined);
    if (storedCases.length === 0 && storedPartners.length === 0) {
      setCases(seedCases);
      setPartners(seedPartners);
    } else {
      setCases(storedCases);
      setPartners(storedPartners);
    }
    setCurrentPartnerId(storedPartnerId);
  }, []);

  useEffect(() => save('cases', cases), [cases]);
  useEffect(() => save('partners', partners), [partners]);
  useEffect(() => save('currentPartnerId', currentPartnerId), [currentPartnerId]);

  const addCase = (c: Case) => setCases((prev) => [...prev, c]);

  const analyzeCase = (id: string) =>
    setCases((prev) =>
      prev.map((c) => (c.id === id ? { ...c, analysis: generateAnalysis(c.id), status: 'ANALYZED' } : c))
    );

  const assignCase = (id: string, partnerId: string) =>
    setCases((prev) =>
      prev.map((c) => (c.id === id ? { ...c, assignedPartnerId: partnerId, status: 'ASSIGNED' } : c))
    );

  const createPartner = (p: Partner) => setPartners((prev) => [...prev, p]);

  const togglePartner = (id: string) =>
    setPartners((prev) => prev.map((p) => (p.id === id ? { ...p, active: !p.active } : p)));

  const resetDemo = () => {
    localStorage.clear();
    setCases(seedCases);
    setPartners(seedPartners);
    setCurrentPartnerId(undefined);
  };

  return (
    <DataContext.Provider
      value={{
        cases,
        partners,
        currentPartnerId,
        setCurrentPartnerId,
        addCase,
        analyzeCase,
        assignCase,
        createPartner,
        togglePartner,
        resetDemo,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
