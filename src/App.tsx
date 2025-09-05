import React, { useState } from 'react';
import RoleSwitcher, { Role } from '@/components/RoleSwitcher';
import PublicPage from '@/pages/Public';
import AdminPage from '@/pages/Admin';
import PartnerPage from '@/pages/Partner';
import { DataProvider } from '@/context/DataContext';
import { motion } from 'framer-motion';

const App: React.FC = () => {
  const [role, setRole] = useState<Role>('PUBLIC');
  return (
    <DataProvider>
      <div className="min-h-screen flex flex-col">
        <header className="sticky top-0 z-10 backdrop-blur bg-white/70 border-b px-4 py-2 flex justify-end">
          <RoleSwitcher role={role} setRole={setRole} />
        </header>
        <main className="p-4 flex-1">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={role}>
            {role === 'PUBLIC' && <PublicPage />}
            {role === 'ADMIN' && <AdminPage />}
            {role === 'PARTNER' && <PartnerPage />}
          </motion.div>
        </main>
      </div>
    </DataProvider>
  );
};

export default App;
