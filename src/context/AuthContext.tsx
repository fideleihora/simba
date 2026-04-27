import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  register: (user: Omit<User, 'id'>, rememberMe: boolean) => Promise<void>;
  login: (phoneNumber: string, password?: string, rememberMe?: boolean) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedSession = localStorage.getItem('simba-session') || sessionStorage.getItem('simba-session');
    return savedSession ? JSON.parse(savedSession) : null;
  });

  const [users, setUsers] = useState<User[]>(() => {
    const savedUsers = localStorage.getItem('simba-users');
    return savedUsers ? JSON.parse(savedUsers) : [];
  });

  useEffect(() => {
    localStorage.setItem('simba-users', JSON.stringify(users));
  }, [users]);

  const register = async (userData: Omit<User, 'id'>, rememberMe: boolean) => {
    // Check if user exists
    const existing = users.find(u => u.phoneNumber === userData.phoneNumber);
    if (existing) {
      throw new Error('A user with this phone number already exists.');
    }

    const newUser: User = {
      ...userData,
      id: `USR-${Date.now()}`
    };

    setUsers(prev => {
      const updated = [...prev, newUser];
      localStorage.setItem('simba-users', JSON.stringify(updated));
      return updated;
    });
    setUser(newUser);

    if (rememberMe) {
      localStorage.setItem('simba-session', JSON.stringify(newUser));
    } else {
      sessionStorage.setItem('simba-session', JSON.stringify(newUser));
    }
  };

  const login = async (phoneNumber: string, password?: string, rememberMe: boolean = true) => {
    const foundUser = users.find(u => u.phoneNumber === phoneNumber);
    if (!foundUser) {
      throw new Error('No account found with this phone number.');
    }

    if (password && foundUser.password && foundUser.password !== password) {
      throw new Error('Incorrect password.');
    }

    setUser(foundUser);
    
    if (rememberMe) {
      localStorage.setItem('simba-session', JSON.stringify(foundUser));
    } else {
      sessionStorage.setItem('simba-session', JSON.stringify(foundUser));
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('simba-session');
    sessionStorage.removeItem('simba-session');
  };

  return (
    <AuthContext.Provider value={{ user, register, login, logout, isAuthenticated: !!user }}>
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
