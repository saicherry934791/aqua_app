import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { apiService } from '@/services/api';

// Firebase imports with platform check
let auth: any = null;
let signInWithPhoneNumber: any = null;
let signOut: any = null;
let FirebaseAuthTypes: any = null;

if (Platform.OS !== 'web') {
  try {
    const firebaseAuth = require('@react-native-firebase/auth');
    auth = firebaseAuth.default;
    signInWithPhoneNumber = firebaseAuth.default().signInWithPhoneNumber;
    signOut = firebaseAuth.default().signOut;
    FirebaseAuthTypes = require('@react-native-firebase/auth').FirebaseAuthTypes;
  } catch (error) {
    console.log('Firebase not available on this platform');
  }
}

export enum UserRole {
  CUSTOMER = 'customer',
  ADMIN = 'admin',
  FRANCHISE_OWNER = 'franchise_owner',
  SERVICE_AGENT = 'service_agent',
}

export enum CustomerType {
  CUSTOMER = 'customer',
  ADMIN = 'admin',
  FRANCHISE = 'franchise_owner',
  AGENT = 'service_agent',
}

export interface User {
  id: string;
  phoneNumber: string;
  role: UserRole;
  customerType: CustomerType;
  franchiseId?: string;
  franchiseName?: string;
  permissions: string[];
  profile: {
    name: string;
    email?: string;
    avatar?: string;
  };
}

export interface ViewAsState {
  isViewingAs: boolean;
  originalUser: User | null;
  currentViewRole: UserRole | null;
  targetFranchiseId?: string;
  targetUserId?: string;
  targetFranchiseName?: string;
  targetUserName?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  viewAsState: ViewAsState;

  // Auth methods
  sendOTP: (phoneNumber: string, customerType: CustomerType) => Promise<any>;
  verifyOTP: (otp: string, role: string) => Promise<boolean>;
  logout: () => Promise<void>;

  // View As functionality (client-side only)
  viewAsFranchiseOwner: (franchiseId: string, franchiseName: string) => void;
  viewAsServiceAgent: (agentId: string, agentName: string, franchiseId: string) => void;
  exitViewAs: () => void;

  // Permission checking
  hasPermission: (permission: string) => boolean;
  canAccessScreen: (screenName: string) => boolean;
  canAccessTab: (tabName: string) => boolean;

  // Refresh user data
  refreshUser: () => Promise<void>;
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
  const [confirmation, setConfirmation] = useState<any>(null);
  const [viewAsState, setViewAsState] = useState<ViewAsState>({
    isViewingAs: false,
    originalUser: null,
    currentViewRole: null,
  });

  const isAuthenticated = !!user;

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const [accessToken, userProfile, viewAsData] = await AsyncStorage.multiGet([
        'accessToken',
        'userProfile',
        'viewAsState'
      ]);

      if (accessToken[1] && userProfile[1]) {
        const parsedUser = JSON.parse(userProfile[1]);
        setUser(parsedUser);

        if (viewAsData[1]) {
          const parsedViewAs = JSON.parse(viewAsData[1]);
          setViewAsState(parsedViewAs);
        }

        // Validate token with backend
        await refreshUser();
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      await clearAuthData();
    } finally {
      setIsLoading(false);
    }
  };

  const sendOTP = async (phoneNumber: string, customerType: CustomerType): Promise<any> => {
    try {
      console.log('=== Starting OTP Process ===');
      console.log('Phone number:', phoneNumber);
      console.log('Customer type:', customerType);
      console.log('Platform:', Platform.OS);

      const formattedPhone = '+91' + phoneNumber.replace(/\D/g, '');
      console.log('Formatted phone:', formattedPhone);

      if (Platform.OS === 'web') {
        // For web, use a mock OTP service or your backend
        console.log('Web platform detected, using mock OTP');
        const mockConfirmation = {
          confirm: async (otp: string) => {
            if (otp === '123456') {
              return {
                user: {
                  getIdToken: async () => 'mock_id_token_' + Date.now()
                }
              };
            }
            throw new Error('Invalid OTP');
          }
        };
        setConfirmation(mockConfirmation);
        return mockConfirmation;
      } else {
        // For native platforms, use Firebase
        if (!auth || !signInWithPhoneNumber) {
          throw new Error('Firebase Auth not available');
        }
        
        const confirmation = await signInWithPhoneNumber(formattedPhone);
        console.log('=== OTP Sent Successfully ===');
        setConfirmation(confirmation);
        return confirmation;
      }
    } catch (error) {
      console.log('=== OTP Error ===');
      console.error('Error details:', error);
      throw error;
    }
  };

  const verifyOTP = async (otp: string, role: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      if (!confirmation) {
        throw new Error('No OTP confirmation found. Please request a new OTP.');
      }

      // Verify OTP
      const result = await confirmation.confirm(otp);
      const idToken = await result.user.getIdToken();

      console.log('OTP verification successful, sending to backend...');

      // Send idToken and role to backend for authentication
      const response = await apiService.post('/auth/login', {
        idToken,
        role, // Send the role that was selected during login
      });

      console.log('Backend login response:', response);

      if (response.success) {
        const { accessToken, refreshToken, user: userData } = response.data;

        // Store tokens and user data
        await AsyncStorage.multiSet([
          ['accessToken', accessToken],
          ['refreshToken', refreshToken],
          ['userProfile', JSON.stringify(userData)],
        ]);

        setUser(userData);
        setConfirmation(null); // Clear confirmation after successful verification
        return true;
      } else {
        throw new Error(response.error || 'Login failed');
      }
    } catch (error: any) {
      console.error('Verify OTP error:', error);
      
      // Clear confirmation on error so user can try again
      setConfirmation(null);
      
      // Re-throw with a user-friendly message
      if (error.code === 'auth/invalid-verification-code') {
        throw new Error('Invalid OTP. Please check the code and try again.');
      } else if (error.code === 'auth/code-expired') {
        throw new Error('OTP has expired. Please request a new code.');
      } else {
        throw new Error(error.message || 'OTP verification failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);

      // Sign out from Firebase (only on native platforms)
      if (Platform.OS !== 'web' && signOut) {
        await signOut();
      }

      // Clear local storage
      await clearAuthData();

      // Reset state
      setUser(null);
      setConfirmation(null);
      setViewAsState({
        isViewingAs: false,
        originalUser: null,
        currentViewRole: null,
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearAuthData = async () => {
    await AsyncStorage.multiRemove([
      'accessToken',
      'refreshToken',
      'userProfile',
      'viewAsState'
    ]);
  };

  // Client-side only view as functionality
  const viewAsFranchiseOwner = (franchiseId: string, franchiseName: string) => {
    if (!user || user.role !== UserRole.ADMIN) {
      return;
    }

    // Create a mock franchise owner user based on the original admin user
    const franchiseUser: User = {
      ...user,
      role: UserRole.FRANCHISE_OWNER,
      customerType: CustomerType.FRANCHISE,
      franchiseId: franchiseId,
      franchiseName: franchiseName,
    };

    const newViewAsState: ViewAsState = {
      isViewingAs: true,
      originalUser: user,
      currentViewRole: UserRole.FRANCHISE_OWNER,
      targetFranchiseId: franchiseId,
      targetFranchiseName: franchiseName,
    };

    setViewAsState(newViewAsState);
    setUser(franchiseUser);

    // Persist view state
    AsyncStorage.setItem('viewAsState', JSON.stringify(newViewAsState));
  };

  const viewAsServiceAgent = (agentId: string, agentName: string, franchiseId: string) => {
    if (!user || (user.role !== UserRole.ADMIN && user.role !== UserRole.FRANCHISE_OWNER)) {
      return;
    }

    // Create a mock service agent user based on the original user
    const agentUser: User = {
      ...user,
      role: UserRole.SERVICE_AGENT,
      customerType: CustomerType.AGENT,
      franchiseId: franchiseId,
      profile: {
        ...user.profile,
        name: agentName,
      }
    };

    const newViewAsState: ViewAsState = {
      isViewingAs: true,
      originalUser: viewAsState.isViewingAs ? viewAsState.originalUser : user,
      currentViewRole: UserRole.SERVICE_AGENT,
      targetFranchiseId: franchiseId,
      targetUserId: agentId,
      targetUserName: agentName,
    };

    setViewAsState(newViewAsState);
    setUser(agentUser);

    // Persist view state
    AsyncStorage.setItem('viewAsState', JSON.stringify(newViewAsState));
  };

  const exitViewAs = () => {
    if (!viewAsState.isViewingAs || !viewAsState.originalUser) {
      return;
    }

    // Restore original user
    setUser(viewAsState.originalUser);
    setViewAsState({
      isViewingAs: false,
      originalUser: null,
      currentViewRole: null,
    });

    // Clear persisted view state
    AsyncStorage.removeItem('viewAsState');
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    
    // If viewing as someone else, check original user's permissions
    const checkUser = viewAsState.isViewingAs ? viewAsState.originalUser : user;
    if (!checkUser) return false;
    
    return checkUser.permissions.includes(permission);
  };

  const canAccessScreen = (screenName: string): boolean => {
    if (!user) return false;

    // Define screen permissions based on roles
    const screenPermissions: Record<string, UserRole[]> = {
      'super-admin-dashboard': [UserRole.ADMIN],
      'franchise-dashboard': [UserRole.ADMIN, UserRole.FRANCHISE_OWNER],
      'agent-dashboard': [UserRole.ADMIN, UserRole.FRANCHISE_OWNER, UserRole.SERVICE_AGENT],
      'franchise-management': [UserRole.ADMIN],
      'user-management': [UserRole.ADMIN, UserRole.FRANCHISE_OWNER],
      'service-requests': [UserRole.ADMIN, UserRole.FRANCHISE_OWNER, UserRole.SERVICE_AGENT],
      'reports': [UserRole.ADMIN, UserRole.FRANCHISE_OWNER],
    };

    const allowedRoles = screenPermissions[screenName];
    return allowedRoles ? allowedRoles.includes(user.role) : true;
  };

  const canAccessTab = (tabName: string): boolean => {
    if (!user) return false;

    // Define tab access based on roles - more restrictive filtering
    const tabPermissions: Record<string, UserRole[]> = {
      'index': [UserRole.ADMIN, UserRole.FRANCHISE_OWNER, UserRole.SERVICE_AGENT], // Dashboard
      'manage': [UserRole.ADMIN, UserRole.FRANCHISE_OWNER], // Manage tab - only admin and franchise
      'orders': [UserRole.ADMIN, UserRole.FRANCHISE_OWNER, UserRole.SERVICE_AGENT], // Orders
      'service': [UserRole.ADMIN, UserRole.FRANCHISE_OWNER, UserRole.SERVICE_AGENT], // Service requests
      'notifications': [UserRole.SERVICE_AGENT], // Notifications - only service agents
      'profile': [UserRole.ADMIN, UserRole.FRANCHISE_OWNER, UserRole.SERVICE_AGENT], // Profile
    };

    const allowedRoles = tabPermissions[tabName];
    return allowedRoles ? allowedRoles.includes(user.role) : false;
  };

  const refreshUser = async () => {
    try {
      const response = await apiService.get('/auth/me');
      if (response.success) {
        // Only update if not in view-as mode
        if (!viewAsState.isViewingAs) {
          setUser(response.data);
          await AsyncStorage.setItem('userProfile', JSON.stringify(response.data));
        }
      }
    } catch (error: any) {
      console.error('Refresh user error:', error);
      // If token is invalid, clear auth data
      if (error?.response?.status === 401) {
        await clearAuthData();
        setUser(null);
      }
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    viewAsState,
    sendOTP,
    verifyOTP,
    logout,
    viewAsFranchiseOwner,
    viewAsServiceAgent,
    exitViewAs,
    hasPermission,
    canAccessScreen,
    canAccessTab,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};