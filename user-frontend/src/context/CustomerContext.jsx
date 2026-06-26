import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../api';

const CustomerContext = createContext(null);

export function CustomerProvider({ children }) {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('gs_customer');
    if (stored) {
      try {
        setCustomer(JSON.parse(stored));
      } catch {
        localStorage.removeItem('gs_customer');
      }
    }
    setLoading(false);
  }, []);

  const identify = async (phone_number, full_name) => {
    const result = await api.identifyCustomer({ phone_number, full_name });
    setCustomer(result);
    localStorage.setItem('gs_customer', JSON.stringify(result));
    return result;
  };

  const register = async (payload) => {
    const result = await api.registerCustomer(payload);
    setCustomer(result);
    localStorage.setItem('gs_customer', JSON.stringify(result));
    return result;
  };

  const logout = () => {
    setCustomer(null);
    localStorage.removeItem('gs_customer');
  };

  return (
    <CustomerContext.Provider value={{ customer, loading, identify, register, logout }}>
      {children}
    </CustomerContext.Provider>
  );
}

export function useCustomer() {
  const ctx = useContext(CustomerContext);
  if (!ctx) throw new Error('useCustomer must be used within CustomerProvider');
  return ctx;
}
