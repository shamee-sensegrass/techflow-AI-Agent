import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { apiRequest } from "./queryClient";

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  company?: string;
  plan: string;
  username: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: any) => Promise<void>;
  logout: () => void;
  token: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps): JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(
    typeof window !== 'undefined' ? localStorage.getItem('token') : null
  );

  useEffect(() => {
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
        }
        setToken(null);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
      }
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await apiRequest('POST', '/api/auth/login', { email, password });
    const data = await response.json();
    
    setUser(data.user);
    setToken(data.token);
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', data.token);
    }
  };

  const signup = async (userData: any) => {
    const response = await apiRequest('POST', '/api/auth/signup', userData);
    const data = await response.json();
    
    setUser(data.user);
    setToken(data.token);
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', data.token);
    }
  };

  const logout = () => {
    if (token) {
      apiRequest('POST', '/api/auth/logout').catch(console.error);
    }
    setUser(null);
    setToken(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
