import React from 'react';
import { View, StyleSheet } from 'react-native';
import LoadingSkeleton from './LoadingSkeleton';

export default function AuthSkeleton() {
  return (
    <View style={styles.container}>
      {/* Header */}
      <LoadingSkeleton width="60%" height={32} style={styles.header} />
      
      {/* Form Fields */}
      <View style={styles.form}>
        <LoadingSkeleton width="40%" height={20} style={styles.label} />
        <LoadingSkeleton width="100%" height={56} style={styles.input} />
        
        <LoadingSkeleton width="40%" height={20} style={styles.label} />
        <LoadingSkeleton width="100%" height={56} style={styles.input} />
      </View>
      
      {/* Button */}
      <LoadingSkeleton width="100%" height={48} borderRadius={24} style={styles.button} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: 'white',
  },
  header: {
    marginTop: 20,
    marginBottom: 32,
  },
  form: {
    gap: 16,
    marginBottom: 32,
  },
  label: {
    marginBottom: 8,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 'auto',
    marginBottom: 20,
  },
});