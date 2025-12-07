// context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, AuthContextType } from '../types';
import { authService } from '../services/authService';
import { creditsService } from '../services/creditsService';
import { imageService } from '../services/imageService'; // Import to initialize demo images

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [credits, setCredits] = useState<number>(10);
  const [loading, setLoading] = useState<boolean>(true);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const initializeAuth = async () => {
      // Simulate async loading of auth state
      await new Promise(resolve => setTimeout(resolve, 500));
      const user = authService.getCurrentUser();
      const storedCredits = authService.getCredits();

      if (user) {
        setCurrentUser(user);
        setIsAuthenticated(true);
        setCredits(storedCredits);
        imageService.initializeDemoImages(); // Initialize demo images on successful login
      }
      setLoading(false);
    };

    initializeAuth();
  }, []); // Empty dependency array to run only once on mount

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await authService.login(email, password);
      if (response.success && response.user && response.credits !== undefined) {
        setCurrentUser(response.user);
        setIsAuthenticated(true);
        setCredits(response.credits);
        imageService.initializeDemoImages(); // Initialize demo images for new login
        return true;
      }
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const signup = useCallback(async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await authService.signup(email, password);
      if (response.success && response.user && response.credits !== undefined) {
        setCurrentUser(response.user);
        setIsAuthenticated(true);
        setCredits(response.credits);
        imageService.initializeDemoImages(); // Initialize demo images for new signup
        return true;
      }
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setCurrentUser(null);
    setIsAuthenticated(false);
    setCredits(10); // Reset credits on logout
    // No need to clear gallery, it's user-specific, but local storage is cleared above
  }, []);

  const updateCredits = useCallback((newCredits: number) => {
    setCredits(newCredits);
    localStorage.setItem('vm_image_generator_credits', newCredits.toString());
  }, []);

  const updateUserEmail = useCallback((newEmail: string) => {
    if (currentUser) {
      setCurrentUser(prevUser => (prevUser ? { ...prevUser, email: newEmail } : null));
      // authService.updateUserEmail handles local storage update
    }
  }, [currentUser]);

  const value = React.useMemo(() => ({
    currentUser,
    isAuthenticated,
    credits,
    loading,
    login,
    signup,
    logout,
    updateCredits,
    updateUserEmail,
  }), [currentUser, isAuthenticated, credits, loading, login, signup, logout, updateCredits, updateUserEmail]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
