import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/auth';
import { authApi } from '../api/auth.api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isCareExpert: boolean;
  login: (email: string, password: string) => Promise<void>;
  adminPasswordLogin: (password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchUser = async () => {
    const token = localStorage.getItem('ktm_access_token');
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const profile = await authApi.getProfile();
      setUser(profile);
    } catch {
      localStorage.removeItem('ktm_access_token');
      localStorage.removeItem('ktm_refresh_token');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authApi.login({ email, password });
    localStorage.setItem('ktm_access_token', response.accessToken);
    localStorage.setItem('ktm_refresh_token', response.refreshToken);
    setUser(response.user);
  };

  const adminPasswordLogin = async (password: string) => {
    const res = await fetch('/api/auth/admin-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Incorrect admin password');
    }
    const { accessToken, refreshToken, user: authUser } = data.data;
    localStorage.setItem('ktm_access_token', accessToken);
    localStorage.setItem('ktm_refresh_token', refreshToken);
    setUser(authUser);
  };

  const register = async (data: any) => {
    const response = await authApi.register(data);
    localStorage.setItem('ktm_access_token', response.accessToken);
    localStorage.setItem('ktm_refresh_token', response.refreshToken);
    setUser(response.user);
  };

  const logout = () => {
    localStorage.removeItem('ktm_access_token');
    localStorage.removeItem('ktm_refresh_token');
    setUser(null);
  };

  const refreshProfile = async () => {
    await fetchUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'ADMIN',
        isCareExpert: user?.role === 'CARE_EXPERT' || user?.role === 'ADMIN',
        login,
        adminPasswordLogin,
        register,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
