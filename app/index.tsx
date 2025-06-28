import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function IndexScreen() {
  const router = useRouter();
  const { state } = useAuth();

  useEffect(() => {
    if (!state.isLoading) {
      console.log('Navigation check:', {
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        isAuthenticated: state.isAuthenticated,
        hasCompletedDetails: state.hasCompletedDetails,
        userIsFirstTime: state.user?.isFirstTime,
      });

      if (!state.hasCompletedOnboarding) {
        console.log('Navigating to Onboarding');
        router.replace('/Onboarding');
      } else if (!state.isAuthenticated) {
        console.log('Navigating to Auth');
        router.replace('/(auth)');
      } else if (state.user?.isFirstTime || !state.hasCompletedDetails) {
        console.log('Navigating to OnboardDetails');
        router.replace('/OnboardDetails');
      } else {
        console.log('Navigating to Tabs');
        router.replace('/(tabs)');
      }
    }
  }, [
    state.isLoading, 
    state.hasCompletedOnboarding, 
    state.isAuthenticated, 
    state.hasCompletedDetails, 
    state.user?.isFirstTime,
    router
  ]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#4fa3c4" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
});