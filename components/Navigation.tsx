import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { useCheckInStore } from '../store/checkInStore';

interface NavigationProps {
  user: { id: string; email: string } | null;
  authenticated: boolean;
  onLogout: () => void;
  theme: 'light' | 'night' | 'sepia';
}

const Navigation: React.FC<NavigationProps> = ({ user, authenticated, onLogout, theme }) => {
  const navigate = useNavigate();
  const { selectedScenario } = useAppStore();
  const { checkInStatus } = useCheckInStore();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--bg-primary)]/80 backdrop-blur-lg shadow-sm theme-transition">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand Name */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-[var(--accent-primary)] text-2xl font-black">Fluent</span>
              <span className="text-[var(--accent-secondary)] text-2xl font-black">English</span>
            </Link>
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle Buttons */}
            <div className="flex items-center gap-1 bg-[var(--bg-secondary)] p-1 rounded-full">
              {/* Three theme icons: sun (light), moon (night), eye (sepia) */}
              <button
                onClick={() => {
                  (window as any).setTheme?.('light');
                }}
                className={`p-2 rounded-full transition-all ${theme === 'light' ? 'bg-[var(--accent-primary)] text-[var(--accent-text)]' : 'hover:bg-[var(--bg-tertiary)]'}`}
                title="日间模式"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd"></path>
                </svg>
              </button>
              <button
                onClick={() => {
                  (window as any).setTheme?.('night');
                }}
                className={`p-2 rounded-full transition-all ${theme === 'night' ? 'bg-[var(--accent-primary)] text-[var(--accent-text)]' : 'hover:bg-[var(--bg-tertiary)]'}`}
                title="夜间模式"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
                </svg>
              </button>
              <button
                onClick={() => {
                  (window as any).setTheme?.('sepia');
                }}
                className={`p-2 rounded-full transition-all ${theme === 'sepia' ? 'bg-[var(--accent-primary)] text-[var(--accent-text)]' : 'hover:bg-[var(--bg-tertiary)]'}`}
                title="护眼模式"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"></path>
                </svg>
              </button>
            </div>
            
            {/* Check-in Button */}
            <button
              onClick={() => navigate('/check-in')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${checkInStatus === 'already_checked'
                ? 'bg-[var(--success-bg)] text-[var(--success)] hover:bg-[var(--success-bg)]/80'
                : 'bg-[var(--accent-soft)] text-[var(--accent-primary)] hover:bg-[var(--accent-soft)]/80'
              }`}
            >
              {checkInStatus === 'already_checked' ? '已签到' : '签到'}
            </button>

            {/* User Info and Logout */}
            {authenticated && user ? (
              <div className="flex items-center gap-3">
                <div className="bg-[var(--accent-primary)] text-[var(--accent-text)] px-4 py-2 rounded-full text-sm font-medium">
                  {user.email}
                </div>
                <button
                  onClick={onLogout}
                  className="flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]/80 transition-all"
                >
                  <span>→</span>
                  <span>LOGOUT</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate('/auth')}
                className="px-4 py-2 rounded-full text-sm font-medium bg-[var(--accent-primary)] text-[var(--accent-text)] hover:bg-[var(--accent-primary)]/90 transition-all"
              >
                登录
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;