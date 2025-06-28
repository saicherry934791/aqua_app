import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { mockApiService } from '@/services/mockApi';

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  address?: string;
  alternatePhone?: string;
  latitude?: number;
  longitude?: number;
  isFirstTime?: boolean;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;
  hasCompletedDetails: boolean;
}

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_AUTHENTICATED'; payload: boolean }
  | { type: 'SET_ONBOARDING_COMPLETED'; payload: boolean }
  | { type: 'SET_DETAILS_COMPLETED'; payload: boolean }
  | { type: 'LOGOUT' };

const AuthContext = createContext<{
  state: AuthState;
  dispatch: React.Dispatch<AuthAction>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithOTP: (phone: string, otp: string) => Promise<{ success: boolean; error?: string }>;
  sendOTP: (phone: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  completeUserDetails: (details: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  checkAuthStatus: () => Promise<void>;
} | null>(null);

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_USER':
      return { 
        ...state, 
        user: action.payload,
        isAuthenticated: !!action.payload 
      };
    case 'SET_AUTHENTICATED':
      return { ...state, isAuthenticated: action.payload };
    case 'SET_ONBOARDING_COMPLETED':
      return { ...state, hasCompletedOnboarding: action.payload };
    case 'SET_DETAILS_COMPLETED':
      return { ...state, hasCompletedDetails: action.payload };
    case 'LOGOUT':
      return {
        user: null,
        isLoading: false,
        isAuthenticated: false,
        hasCompletedOnboarding: false,
        hasCompletedDetails: false,
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    isLoading: true,
    isAuthenticated: false,
    hasCompletedOnboarding: false,
    hasCompletedDetails: false,
  });

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const [token, onboardingCompleted, userProfile] = await Promise.all([
        AsyncStorage.getItem('accessToken'),
        AsyncStorage.getItem('onboardingCompleted'),
        AsyncStorage.getItem('userProfile'),
      ]);

      if (token && userProfile) {
        const user = JSON.parse(userProfile);
        dispatch({ type: 'SET_USER', payload: user });
        dispatch({ type: 'SET_ONBOARDING_COMPLETED', payload: onboardingCompleted === 'true' });
        dispatch({ type: 'SET_DETAILS_COMPLETED', payload: !user.isFirstTime });
      } else {
        // Check if onboarding was completed even without auth
        dispatch({ type: 'SET_ONBOARDING_COMPLETED', payload: onboardingCompleted === 'true' });
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const sendOTP = async (phone: string) => {
    try {
      const response = await mockApiService.sendOTP(phone);
      return { success: response.success, error: response.error };
    } catch (error) {
      return { success: false, error: 'Failed to send OTP' };
    }
  };

  const loginWithOTP = async (phone: string, otp: string) => {
    try {
      const response = await mockApiService.verifyOTP(phone, otp);
      
      if (response.success) {
        const { user, accessToken, refreshToken } = response.data;
        
        await Promise.all([
          AsyncStorage.setItem('accessToken', accessToken),
          AsyncStorage.setItem('refreshToken', refreshToken),
          AsyncStorage.setItem('userProfile', JSON.stringify(user)),
        ]);

        dispatch({ type: 'SET_USER', payload: user });
        dispatch({ type: 'SET_DETAILS_COMPLETED', payload: !user.isFirstTime });
        
        console.log('Login successful, user:', user);
        return { success: true };
      }
      
      return { success: false, error: response.error };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed' };
    }
  };

  const login = async (email: string, password: string) => {
    try {
      // For now, redirect to OTP login
      return { success: false, error: 'Please use OTP login' };
    } catch (error) {
      return { success: false, error: 'Login failed' };
    }
  };

  const logout = async () => {
    try {
      // Call mock logout API
      await mockApiService.logout();
      
      // Clear local storage
      await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'userProfile']);
      
      // Update state
      dispatch({ type: 'LOGOUT' });
      
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Error during logout:', error);
      // Even if API call fails, clear local data
      await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'userProfile']);
      dispatch({ type: 'LOGOUT' });
    }
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem('onboardingCompleted', 'true');
      dispatch({ type: 'SET_ONBOARDING_COMPLETED', payload: true });
      console.log('Onboarding completed');
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  const completeUserDetails = async (details: Partial<User>) => {
    try {
      const response = await mockApiService.completeProfile(details);
      
      if (response.success) {
        const updatedUser = { ...state.user, ...details, isFirstTime: false };
        await AsyncStorage.setItem('userProfile', JSON.stringify(updatedUser));
        dispatch({ type: 'SET_USER', payload: updatedUser });
        dispatch({ type: 'SET_DETAILS_COMPLETED', payload: true });
        console.log('User details completed:', updatedUser);
        return { success: true };
      }
      
      return { success: false, error: response.error };
    } catch (error) {
      console.error('Error completing user details:', error);
      return { success: false, error: 'Failed to update profile' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        state,
        dispatch,
        login,
        loginWithOTP,
        sendOTP,
        logout,
        completeOnboarding,
        completeUserDetails,
        checkAuthStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};