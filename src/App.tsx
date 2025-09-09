// App shell
// - Sticky header with role switcher and theme toggle
// - Renders Public/Admin/Partner pages with light motion transitions
import React, { useEffect, useState } from 'react';
import RoleSwitcher, { Role } from '@/components/RoleSwitcher';
import PublicPage from '@/pages/Public';
import AdminPage from '@/pages/Admin';
import PartnerPage from '@/pages/Partner';
import { DataProvider } from '@/context/DataContext';
import { motion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';

const App: React.FC = () => {
  const [role, setRole] = useState<Role>('PUBLIC');
  // Theme state: remembers last choice and falls back to system preference
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const stored = localStorage.getItem('theme');
    if (stored === 'light' || stored === 'dark') return stored;
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  });

  // Apply selected theme to <html> class and persist
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);
  return (
    <DataProvider>
      <div className="min-h-screen flex flex-col">
        <header className="sticky top-0 z-20 bg-white/70 dark:bg-gray-950/70 backdrop-blur border-b border-gray-200/70 dark:border-gray-800">
          <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between">
            <div className="text-sm font-semibold tracking-tight text-gray-700 dark:text-gray-300">PILN Demo</div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                className="btn-muted w-9 px-0"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                aria-pressed={theme === 'dark'}
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <RoleSwitcher role={role} setRole={setRole} />
            </div>
          </div>
        </header>
        <main className="flex-1">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }} key={role}>
              {role === 'PUBLIC' && <PublicPage />}
              {role === 'ADMIN' && <AdminPage />}
              {role === 'PARTNER' && <PartnerPage />}
            </motion.div>
          </div>
        </main>
      </div>
    </DataProvider>
  );
};

export default App;
