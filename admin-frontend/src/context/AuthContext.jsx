import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('gs_staff_account');
    const token = localStorage.getItem('gs_staff_token');
    if (stored && token) {
      try {
        setAccount(JSON.parse(stored));
      } catch {
        localStorage.removeItem('gs_staff_account');
        localStorage.removeItem('gs_staff_token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const result = await api.login(username, password);
    localStorage.setItem('gs_staff_token', result.token);
    localStorage.setItem('gs_staff_account', JSON.stringify(result.account));
    setAccount(result.account);
    return result.account;
  };

  const logout = () => {
    localStorage.removeItem('gs_staff_token');
    localStorage.removeItem('gs_staff_account');
    setAccount(null);
  };

  return (
    <AuthContext.Provider value={{ account, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
