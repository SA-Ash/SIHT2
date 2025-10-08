import { useState, useEffect, createContext, useContext } from 'react';
import { authService } from '../services/auth.js';

// Create Auth Context
const AuthContext = createContext();

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated on app load
    const currentUser = authService.getCurrentUser();
    if (currentUser && authService.isAuthenticated()) {
      setUser(currentUser);
    }
    setLoading(false);
  }, []);

  const login = async (loginData) => {
    try {
      let result;
      
      if (loginData.type === 'phone') {
        if (loginData.step === 'initiate') {
          result = await authService.initiatePhoneOTP(loginData.phone);
        } else if (loginData.step === 'verify') {
          result = await authService.verifyPhoneOTP(loginData.phone, loginData.code, loginData.college);
          setUser(result.user);
        }
      } else if (loginData.type === 'google') {
        result = await authService.googleAuth(loginData.idToken);
        setUser(result.user);
      } else if (loginData.type === 'college') {
        if (loginData.step === 'initiate') {
          result = await authService.initiateCollegeAuth(loginData.email);
        } else if (loginData.step === 'verify') {
          result = await authService.verifyCollegeAuth(loginData.email, loginData.code);
          setUser(result.user);
        }
      }
      
      return result;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear user state even if API call fails
      setUser(null);
    }
  };

  const value = {
    user,
    setUser,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
