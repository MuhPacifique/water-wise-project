import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoginInProgress, setIsLoginInProgress] = useState(false);

  useEffect(() => {
    // Check if user is logged in on app start
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await fetch('/api/auth/me', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (response.ok) {
            try {
              const data = await response.json();
              setUser(data.data.user);
            } catch (jsonError) {
              console.error('Failed to parse JSON response from /api/auth/me:', jsonError);
              localStorage.removeItem('token');
            }
          } else {
            localStorage.removeItem('token');
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('token');
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    // Prevent concurrent login attempts
    if (isLoginInProgress) {
      console.warn('Login already in progress');
      return;
    }

    setIsLoginInProgress(true);
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        let errorMessage = 'Login failed';
        try {
          const error = await response.json();
          errorMessage = error.message || errorMessage;
        } catch (jsonError) {
          console.error('Failed to parse error JSON response from login:', jsonError);
          // Try to get text response for better error message
          try {
            const errorText = await response.text();
            errorMessage = errorText || errorMessage;
          } catch (textError) {
            console.error('Failed to get error text response:', textError);
          }
        }
        throw new Error(errorMessage);
      }

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('Failed to parse JSON response from login:', jsonError);
        throw new Error('Login succeeded but received invalid response format');
      }
      
      const { token, data: responseData } = data;
      const userData = responseData?.user;

      if (!token || !userData) {
        throw new Error('Invalid response structure from server');
      }

      localStorage.setItem('token', token);
      setUser(userData);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      throw error;
    } finally {
      setIsLoginInProgress(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        let errorMessage = 'Registration failed';
        try {
          const error = await response.json();
          errorMessage = error.message || (error.error && error.error.message) || errorMessage;
        } catch (jsonError) {
          console.error('Failed to parse error JSON response from register:', jsonError);
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      const { token, data: responseData } = data;
      const userData = responseData?.user;

      if (!token || !userData) {
        throw new Error('Invalid response structure from server');
      }

      localStorage.setItem('token', token);
      setUser(userData);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
