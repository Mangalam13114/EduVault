import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const applyTheme = useCallback((darkMode) => {
    const nextIsDarkMode = Boolean(darkMode);
    setIsDarkMode(nextIsDarkMode);
    document.body.dataset.theme = nextIsDarkMode ? 'dark' : 'light';
    document.documentElement.dataset.theme = nextIsDarkMode ? 'dark' : 'light';
    localStorage.setItem('themeMode', nextIsDarkMode ? 'dark' : 'light');
  }, []);

  const syncSession = useCallback((newToken, userData) => {
    localStorage.setItem('token', newToken);
    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    setToken(newToken);
    setUser(userData);
    return userData;
  }, []);

  const loadUser = useCallback(async () => {
    if (token) {
      try {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const res = await api.get('/auth/me');
        setUser(res.data.user);
        applyTheme(res.data.user?.settings?.darkMode ?? true);
      } catch (error) {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        delete api.defaults.headers.common['Authorization'];
      }
    }
    if (!token) {
      const storedTheme = localStorage.getItem('themeMode');
      applyTheme(storedTheme !== 'light');
    }
    setLoading(false);
  }, [token, applyTheme]);

  useEffect(() => { loadUser(); }, [loadUser]);

  useEffect(() => {
    if (!token) return;
    applyTheme(user?.settings?.darkMode ?? true);
  }, [token, user, applyTheme]);

  const login = useCallback(async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: newToken, user: userData } = res.data;
    return syncSession(newToken, userData);
  }, [syncSession]);

  const signup = useCallback(async (userData) => {
    const res = await api.post('/auth/signup', userData);
    const { token: newToken, user: newUser } = res.data;
    return syncSession(newToken, newUser);
  }, [syncSession]);

  const googleAuth = useCallback(async (credential, options = {}) => {
    const res = await api.post('/auth/google', {
      credential,
      mode: options.mode || 'login',
      role: options.role
    });
    const { token: newToken, user: userData } = res.data;
    return syncSession(newToken, userData);
  }, [syncSession]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
  }, []);

  const updateUser = useCallback((updatedData) => {
    setUser(prev => ({ ...prev, ...updatedData }));
    if (updatedData?.settings?.darkMode !== undefined) {
      applyTheme(updatedData.settings.darkMode);
    }
  }, [applyTheme]);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, googleAuth, logout, updateUser, loadUser, isDarkMode, applyTheme }}>
      {children}
    </AuthContext.Provider>
  );
};