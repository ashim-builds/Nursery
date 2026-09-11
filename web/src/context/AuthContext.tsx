import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/auth';
import { authApi } from '../api/auth.api';
import { setAuthToken } from '../api/client';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isCareExpert: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithOtp: (email: string, otp: string) => Promise<void>;
  adminPasswordLogin: (password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  registerWithOtp: (data: any) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchUser = async () => {
    try {
      const profile = await authApi.getProfile();
      setUser(profile);
    } catch {
      setAuthToken(null);
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
    setAuthToken(response.accessToken);
    setUser(response.user);
  };

  const loginWithOtp = async (email: string, otp: string) => {
    const response = await authApi.verifyOtpLogin({ email, otp });
    setAuthToken(response.accessToken);
    setUser(response.user);
  };

  const adminPasswordLogin = async (password: string) => {
    const response = await authApi.adminLogin(password);
    setAuthToken(response.accessToken);
    setUser(response.user);
  };

  const register = async (data: any) => {
    const response = await authApi.register(data);
    setAuthToken(response.accessToken);
    setUser(response.user);
  };

  const registerWithOtp = async (data: any) => {
    const response = await authApi.verifyOtpRegister(data);
    setAuthToken(response.accessToken);
    setUser(response.user);
  };

  const logout = async () => {
    await authApi.logout();
    setAuthToken(null);
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
        loginWithOtp,
        adminPasswordLogin,
        register,
        registerWithOtp,
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
