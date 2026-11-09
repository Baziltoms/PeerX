import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api.js';

const AuthContext = createContext(null);

export const DEMO_ACCOUNTS = {
  admin: { email: 'sngce@gmail.com', password: '1234567890', label: 'SNGCE Admin (sngce@gmail.com)' },
  faculty: { email: 'sandhya@gmail.com', password: '1234567890', label: 'MCA HOD (Dr. Sandhya R)' },
  student: { email: 'alan@gmail.com', password: '1234567890', label: 'Student (Alan Santu - MCA S3)' },
  company: { email: 'recruiter@techcorp.com', password: 'Company@123', label: 'Company (Nexus Tech)' },
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('peerx_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('peerx_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('peerx_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          setUser({ ...res.data.user, profile: res.data.profile });
          localStorage.setItem('peerx_user', JSON.stringify({ ...res.data.user, profile: res.data.profile }));
        } catch (err) {
          console.warn('Session expired or invalid:', err);
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password, role) => {
    const res = await api.post('/auth/login', { email, password, role });
    const { token: receivedToken, user: receivedUser } = res.data;

    localStorage.setItem('peerx_token', receivedToken);
    localStorage.setItem('peerx_user', JSON.stringify(receivedUser));

    setToken(receivedToken);
    setUser(receivedUser);

    return receivedUser;
  };

  const quickDemoLogin = async (role) => {
    const creds = DEMO_ACCOUNTS[role];
    if (!creds) throw new Error(`Unknown role: ${role}`);
    return await login(creds.email, creds.password, role);
  };

  const logout = () => {
    localStorage.removeItem('peerx_token');
    localStorage.removeItem('peerx_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token && !!user,
        role: user?.role,
        login,
        quickDemoLogin,
        logout,
        setUser,
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
