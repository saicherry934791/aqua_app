import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function IndexScreen() {
  const router = useRouter();
  const { state } = useAuth();

  useEffect(() => {
    if (!state.isLoading) {
      if (!state.hasCompletedOnboarding) {
        router.replace('/Onboarding');
      } else if (!state.isAuthenticated) {
        router.replace('/(auth)');
      } else if (state.user?.isFirstTime || !state.hasCompletedDetails) {
        router.replace('/OnboardDetails');
      } else {
        router.replace('/(tabs)');
      }
    }
  }, [state.isLoading, state.hasCompletedOnboarding, state.isAuthenticated, state.hasCompletedDetails, state.user]);

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