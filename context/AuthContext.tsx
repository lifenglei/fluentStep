import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { isAuthenticated, logout, getUser } from '../authService';
import { setUnauthorizedHandler } from '../services/apiService';

interface AuthContextType {
  user: { id: string; email: string } | null;
  authenticated: boolean;
  onLogout: () => void;
  login: (user: { id: string; email: string }) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [authenticated, setAuthenticated] = useState(false);

  // 自动登出并跳转到登录页面
  const handleUnauthorized = () => {
    logout();
    setAuthenticated(false);
    setUser(null);
    // 不再直接导航，让路由组件处理
    window.location.href = '/auth';
  };

  // 检查认证状态
  useEffect(() => {
    const checkAuth = () => {
      const authStatus = isAuthenticated();
      const userData = getUser();
      setAuthenticated(authStatus);
      setUser(userData);
    };
    
    checkAuth();
    
    // 设置 401 处理函数
    setUnauthorizedHandler(handleUnauthorized);
  }, []);

  const handleLogout = () => {
    logout();
    setAuthenticated(false);
    setUser(null);
    // 不再直接导航，让路由组件处理
    window.location.href = '/auth';
  };

  const handleLogin = (userData: { id: string; email: string }) => {
    setUser(userData);
    setAuthenticated(true);
  };

  const contextValue: AuthContextType = {
    user,
    authenticated,
    onLogout: handleLogout,
    login: handleLogin,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};