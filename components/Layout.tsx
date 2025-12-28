import React from 'react';
import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Layout: React.FC = () => {
  const { user, authenticated, onLogout } = useAuth();
  const { theme } = useTheme();
  return (
    <div className="min-h-screen theme-transition text-[var(--text-primary)] flex flex-col selection:bg-[var(--accent-primary)] selection:text-[var(--accent-text)]">
      <Navigation user={user} authenticated={authenticated} onLogout={onLogout} theme={theme} />
      <div className="pt-16"> {/* Add padding to account for fixed navigation */}
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;