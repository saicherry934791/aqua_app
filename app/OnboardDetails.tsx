import React, { useState, useLayoutEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRouter } from 'expo-router';
import { MapPin, User, Phone, Mail } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import * as Location from 'expo-location';

interface UserDetails {
  name: string;
  email: string;
  alternatePhone: string;
  address: string;
  latitude?: number;
  longitude?: number;
}

export default function OnboardDetailsScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const { completeUserDetails } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [userDetails, setUserDetails] = useState<UserDetails>({
    name: '',
    email: '',
    alternatePhone: '',
    address: '',
  });

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <Text style={styles.headerTitle}>Complete Your Profile</Text>
      ),
      headerTitleAlign: 'center',
      headerLeft: () => null, // Remove back button
    });
  }, [navigation]);

  const validateForm = () => {
    const { name, email, alternatePhone, address } = userDetails;
    
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your full name');
      return false;
    }
    
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }
    
    if (!alternatePhone.trim()) {
      Alert.alert('Error', 'Please enter an alternate phone number');
      return false;
    }
    
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(alternatePhone)) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number');
      return false;
    }
    
    if (!address.trim()) {
      Alert.alert('Error', 'Please enter your address');
      return false;
    }
    
    return true;
  };

  const getCurrentLocation = async () => {
    try {
      setLocationLoading(true);
      
      // Request permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to get your current address');
        return;
      }

      // Get current position
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      // Reverse geocode to get address
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (reverseGeocode.length > 0) {
        const addressComponents = reverseGeocode[0];
        const fullAddress = [
          addressComponents.name,
          addressComponents.street,
          addressComponents.city,
          addressComponents.region,
          addressComponents.postalCode,
          addressComponents.country,
        ].filter(Boolean).join(', ');

        setUserDetails(prev => ({
          ...prev,
          address: fullAddress,
          latitude,
          longitude,
        }));
      }
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get current location. Please enter your address manually.');
    } finally {
      setLocationLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const result = await completeUserDetails(userDetails);
      
      if (result.success) {
        Alert.alert(
          'Success',
          'Profile completed successfully!',
          [{ text: 'OK', onPress: () => router.replace('/(tabs)') }]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to update profile');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.title}>Welcome to AquaHome!</Text>
          <Text style={styles.subtitle}>
            Let's complete your profile to provide you with the best service experience.
          </Text>

          <View style={styles.form}>
            {/* Full Name */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Full Name</Text>
              <View style={styles.inputWrapper}>
                <User size={20} color="#687b82" />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your full name"
                  placeholderTextColor="#687b82"
                  value={userDetails.name}
                  onChangeText={(text) => setUserDetails(prev => ({ ...prev, name: text }))}
                />
              </View>
            </View>

            {/* Email */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputWrapper}>
                <Mail size={20} color="#687b82" />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email address"
                  placeholderTextColor="#687b82"
                  value={userDetails.email}
                  onChangeText={(text) => setUserDetails(prev => ({ ...prev, email: text }))}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Alternate Phone */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Alternate Phone Number</Text>
              <View style={styles.inputWrapper}>
                <Phone size={20} color="#687b82" />
                <TextInput
                  style={styles.input}
                  placeholder="Enter alternate phone number"
                  placeholderTextColor="#687b82"
                  value={userDetails.alternatePhone}
                  onChangeText={(text) => setUserDetails(prev => ({ ...prev, alternatePhone: text }))}
                  keyboardType="numeric"
                  maxLength={10}
                />
              </View>
            </View>

            {/* Address */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Address</Text>
              <View style={styles.addressContainer}>
                <View style={styles.inputWrapper}>
                  <MapPin size={20} color="#687b82" />
                  <TextInput
                    style={[styles.input, styles.addressInput]}
                    placeholder="Enter your complete address"
                    placeholderTextColor="#687b82"
                    value={userDetails.address}
                    onChangeText={(text) => setUserDetails(prev => ({ ...prev, address: text }))}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                </View>
                
                {Platform.OS !== 'web' && (
                  <TouchableOpacity
                    style={styles.locationButton}
                    onPress={getCurrentLocation}
                    disabled={locationLoading}
                  >
                    {locationLoading ? (
                      <ActivityIndicator size="small" color="#4fa3c4" />
                    ) : (
                      <>
                        <MapPin size={16} color="#4fa3c4" />
                        <Text style={styles.locationButtonText}>Use Current Location</Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={styles.submitButtonText}>Complete Profile</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'SpaceGrotesk_700Bold',
    color: '#121516',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontFamily: 'SpaceGrotesk_700Bold',
    color: '#121516',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'SpaceGrotesk_400Regular',
    color: '#687b82',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  form: {
    gap: 20,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontFamily: 'SpaceGrotesk_500Medium',
    color: '#121516',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f3f4',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'SpaceGrotesk_400Regular',
    color: '#121516',
  },
  addressContainer: {
    gap: 12,
  },
  addressInput: {
    minHeight: 80,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e8f4f8',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  locationButtonText: {
    fontSize: 14,
    fontFamily: 'SpaceGrotesk_500Medium',
    color: '#4fa3c4',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f3f4',
  },
  submitButton: {
    backgroundColor: '#4fa3c4',
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#e1e5e7',
  },
  submitButtonText: {
    fontSize: 18,
    fontFamily: 'SpaceGrotesk_700Bold',
    color: 'white',
  },
});