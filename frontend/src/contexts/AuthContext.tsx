'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, RegisterData, LoginData, UpdateProfileData } from '@/types/user.types';
import { authService } from '@/services/auth.service';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  register: (data: RegisterData) => Promise<void>;
  login: (data: LoginData) => Promise<void>;
  logout: () => void;
  updateProfile: (data: UpdateProfileData) => Promise<void>;
  deleteAccount: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refreshUser = useCallback(async () => {
    try {
      if (authService.isAuthenticated()) {
        const userData = await authService.getProfile();
        setUser(userData);
      }
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const register = async (data: RegisterData) => {
    try {
      setError(null);
      setLoading(true);
      const response = await authService.register(data);
      setUser(response.data.user);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Registration failed';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const login = async (data: LoginData) => {
    try {
      setError(null);
      setLoading(true);
      const response = await authService.login(data);
      setUser(response.data.user);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Login failed';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const updateProfile = async (data: UpdateProfileData) => {
    try {
      setError(null);
      setLoading(true);
      const updatedUser = await authService.updateProfile(data);
      setUser(updatedUser);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Update failed';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const deleteAccount = async () => {
    try {
      setError(null);
      setLoading(true);
      await authService.deleteAccount();
      setUser(null);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Account deletion failed';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        register,
        login,
        logout,
        updateProfile,
        deleteAccount,
        refreshUser,
      }}
    >
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
