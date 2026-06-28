import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../api';

const AuthContext = createContext(null);

// Wrapped so a blocked/unavailable localStorage (some mobile browser
// privacy settings, certain locked-down configurations) degrades to
// "not logged in" instead of crashing the entire app on load.
function safeStorage() {
  try {
    const testKey = '__gs_storage_test__';
    window.localStorage.setItem(testKey, '1');
    window.localStorage.removeItem(testKey);
    return window.localStorage;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storage = safeStorage();
    if (!storage) {
      setLoading(false);
      return;
    }

    try {
      const stored = storage.getItem('gs_staff_account');
      const token = storage.getItem('gs_staff_token');
      if (stored && token) {
        setAccount(JSON.parse(stored));
      }
    } catch {
      try {
        storage.removeItem('gs_staff_account');
        storage.removeItem('gs_staff_token');
      } catch {
        // storage unusable - nothing more we can do, just continue logged out
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const result = await api.login(username, password);
    const storage = safeStorage();
    if (storage) {
      storage.setItem('gs_staff_token', result.token);
      storage.setItem('gs_staff_account', JSON.stringify(result.account));
    }
    setAccount(result.account);
    return result.account;
  };

  const logout = () => {
    const storage = safeStorage();
    if (storage) {
      storage.removeItem('gs_staff_token');
      storage.removeItem('gs_staff_account');
    }
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
