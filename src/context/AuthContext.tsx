import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  users: User[];
  lastIdentities: Record<UserRole, string | null>;
  register: (user: Omit<User, 'id'>, rememberMe: boolean) => Promise<void>;
  login: (phoneNumber: string, password: string, role: UserRole, rememberMe?: boolean) => Promise<void>;
  logout: () => void;
  getRequiredDeposit: () => number;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('simba-users');
    return saved ? JSON.parse(saved) : [];
  });

  const [lastIdentities, setLastIdentities] = useState<Record<UserRole, string | null>>(() => {
    const saved = localStorage.getItem('simba-last-identities');
    return saved ? JSON.parse(saved) : { 'customer': null, 'branch_manager': null, 'CEO': null, 'branch_staff': null, 'admin': null };
  });

  useEffect(() => {
    const session = localStorage.getItem('simba-session') || sessionStorage.getItem('simba-session');
    if (session) {
      const parsedSession = JSON.parse(session);
      setUser(parsedSession);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('simba-users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('simba-last-identities', JSON.stringify(lastIdentities));
  }, [lastIdentities]);

  const getRequiredDeposit = () => {
    if (!user) return 0;
    // Base deposit is 2000 RWF. If user has no-show flags, increase it.
    const flags = user.noShowFlags || 0;
    if (flags === 0) return 0; // Trusted user
    return 2000 + (flags * 1000);
  };

  const register = async (userData: Omit<User, 'id'>, rememberMe: boolean) => {
    const existing = users.find(u => u.phoneNumber === userData.phoneNumber);
    if (existing) {
      throw new Error('A user with this phone number already exists.');
    }

    const newUser: User = {
      ...userData,
      id: `USR-${Date.now()}`
    };

    setUsers(prev => [...prev, newUser]);
    setUser(newUser);
    setLastIdentities(prev => ({ ...prev, [newUser.role]: newUser.phoneNumber }));

    if (rememberMe) {
      localStorage.setItem('simba-session', JSON.stringify(newUser));
    } else {
      sessionStorage.setItem('simba-session', JSON.stringify(newUser));
    }
  };

  const login = async (phoneNumber: string, password: string, role: UserRole, rememberMe: boolean = false) => {
    const foundUser = users.find(u => 
      u.phoneNumber === phoneNumber && 
      u.password === password && 
      u.role === role
    );
    
    if (!foundUser) {
      throw new Error('Invalid phone number, password, or role.');
    }

    setUser(foundUser);
    setLastIdentities(prev => ({ ...prev, [role]: phoneNumber }));
    
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
    <AuthContext.Provider value={{ user, users, lastIdentities, register, login, logout, getRequiredDeposit, isAuthenticated: !!user }}>
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
