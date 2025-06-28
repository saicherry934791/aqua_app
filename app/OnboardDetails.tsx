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
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRouter } from 'expo-router';
import { MapPin, User, Phone, Mail, Navigation, Check } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import * as Location from 'expo-location';
import LoadingSkeleton from '@/components/skeletons/LoadingSkeleton';

interface UserDetails {
  name: string;
  email: string;
  alternatePhone: string;
  address: string;
  latitude?: number;
  longitude?: number;
}

const { width: screenWidth } = Dimensions.get('window');

export default function OnboardDetailsScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const { completeUserDetails } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [showMap, setShowMap] = useState(false);
  const [locationSelected, setLocationSelected] = useState(false);
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
    
    // Simulate page loading
    setTimeout(() => setPageLoading(false), 1000);
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
      
      if (Platform.OS === 'web') {
        // For web, simulate location selection
        setTimeout(() => {
          const mockAddresses = [
            '123 Tech Park, Bangalore, Karnataka 560001',
            '456 Business District, Mumbai, Maharashtra 400001',
            '789 IT Hub, Hyderabad, Telangana 500001',
            '321 Software City, Chennai, Tamil Nadu 600001',
          ];
          
          const randomAddress = mockAddresses[Math.floor(Math.random() * mockAddresses.length)];
          
          setUserDetails(prev => ({
            ...prev,
            address: randomAddress,
            latitude: 12.9716 + (Math.random() - 0.5) * 0.1,
            longitude: 77.5946 + (Math.random() - 0.5) * 0.1,
          }));
          
          setLocationSelected(true);
          setLocationLoading(false);
          Alert.alert('Success', 'Location detected successfully!');
        }, 2000);
        return;
      }
      
      // Request permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to get your current address');
        setLocationLoading(false);
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
        
        setLocationSelected(true);
        Alert.alert('Success', 'Location detected successfully!');
      }
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get current location. Please enter your address manually.');
    } finally {
      setLocationLoading(false);
    }
  };

  const openMapPicker = () => {
    setShowMap(true);
    // Simulate map interaction
    setTimeout(() => {
      const mockLocations = [
        {
          address: '123 Green Valley Apartments, Koramangala, Bangalore 560034',
          latitude: 12.9352,
          longitude: 77.6245,
        },
        {
          address: '456 Sunrise Residency, Bandra West, Mumbai 400050',
          latitude: 19.0596,
          longitude: 72.8295,
        },
        {
          address: '789 Tech Tower, HITEC City, Hyderabad 500081',
          latitude: 17.4485,
          longitude: 78.3908,
        },
      ];
      
      const selectedLocation = mockLocations[Math.floor(Math.random() * mockLocations.length)];
      
      setUserDetails(prev => ({
        ...prev,
        address: selectedLocation.address,
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
      }));
      
      setLocationSelected(true);
      setShowMap(false);
      Alert.alert('Location Selected', 'Address has been updated from map selection');
    }, 3000);
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const result = await completeUserDetails(userDetails);
      
      if (result.success) {
        Alert.alert(
          'Welcome to AquaHome!',
          'Your profile has been completed successfully. You can now enjoy our services.',
          [{ text: 'Get Started', onPress: () => router.replace('/(tabs)') }]
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

  if (pageLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <LoadingSkeleton width="80%" height={32} style={styles.loadingTitle} />
          <LoadingSkeleton width="90%" height={20} style={styles.loadingSubtitle} />
          
          <View style={styles.loadingForm}>
            {[1, 2, 3, 4].map((_, index) => (
              <View key={index} style={styles.loadingField}>
                <LoadingSkeleton width="40%" height={16} style={styles.loadingLabel} />
                <LoadingSkeleton width="100%" height={56} style={styles.loadingInput} />
              </View>
            ))}
          </View>
          
          <LoadingSkeleton width="100%" height={56} borderRadius={28} style={styles.loadingButton} />
        </View>
      </SafeAreaView>
    );
  }

  if (showMap) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.mapContainer}>
          <View style={styles.mapHeader}>
            <Text style={styles.mapTitle}>Select Your Location</Text>
            <Text style={styles.mapSubtitle}>Tap on the map to select your exact location</Text>
          </View>
          
          {/* Mock Map Interface */}
          <View style={styles.mockMap}>
            <View style={styles.mapPin}>
              <MapPin size={32} color="#4fa3c4" />
            </View>
            <Text style={styles.mapInstruction}>Tap anywhere to select location</Text>
            
            {/* Loading overlay */}
            <View style={styles.mapLoading}>
              <ActivityIndicator size="large" color="#4fa3c4" />
              <Text style={styles.mapLoadingText}>Selecting location...</Text>
            </View>
          </View>
          
          <View style={styles.mapActions}>
            <TouchableOpacity
              style={styles.mapCancelButton}
              onPress={() => setShowMap(false)}
            >
              <Text style={styles.mapCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

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
              <Text style={styles.label}>Delivery Address</Text>
              <View style={styles.addressContainer}>
                <View style={[styles.inputWrapper, styles.addressInputWrapper]}>
                  <MapPin size={20} color="#687b82" />
                  <TextInput
                    style={[styles.input, styles.addressInput]}
                    placeholder="Enter your complete delivery address"
                    placeholderTextColor="#687b82"
                    value={userDetails.address}
                    onChangeText={(text) => setUserDetails(prev => ({ ...prev, address: text }))}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                  {locationSelected && (
                    <View style={styles.locationSelectedIcon}>
                      <Check size={16} color="#4fa3c4" />
                    </View>
                  )}
                </View>
                
                <View style={styles.locationButtons}>
                  <TouchableOpacity
                    style={[styles.locationButton, styles.currentLocationButton]}
                    onPress={getCurrentLocation}
                    disabled={locationLoading}
                  >
                    {locationLoading ? (
                      <ActivityIndicator size="small" color="#4fa3c4" />
                    ) : (
                      <>
                        <Navigation size={16} color="#4fa3c4" />
                        <Text style={styles.locationButtonText}>Use Current Location</Text>
                      </>
                    )}
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.locationButton, styles.mapPickerButton]}
                    onPress={openMapPicker}
                  >
                    <MapPin size={16} color="#4fa3c4" />
                    <Text style={styles.locationButtonText}>Pick on Map</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          {/* Benefits Section */}
          <View style={styles.benefitsContainer}>
            <Text style={styles.benefitsTitle}>Why complete your profile?</Text>
            <View style={styles.benefitsList}>
              <View style={styles.benefitItem}>
                <View style={styles.benefitIcon}>
                  <Check size={16} color="#4fa3c4" />
                </View>
                <Text style={styles.benefitText}>Faster delivery to your exact location</Text>
              </View>
              <View style={styles.benefitItem}>
                <View style={styles.benefitIcon}>
                  <Check size={16} color="#4fa3c4" />
                </View>
                <Text style={styles.benefitText}>Personalized service recommendations</Text>
              </View>
              <View style={styles.benefitItem}>
                <View style={styles.benefitIcon}>
                  <Check size={16} color="#4fa3c4" />
                </View>
                <Text style={styles.benefitText}>Easy order tracking and support</Text>
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
            <Text style={styles.submitButtonText}>Complete Profile & Continue</Text>
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
  loadingContainer: {
    flex: 1,
    padding: 16,
  },
  loadingTitle: {
    marginTop: 20,
    marginBottom: 8,
  },
  loadingSubtitle: {
    marginBottom: 32,
  },
  loadingForm: {
    flex: 1,
    gap: 20,
  },
  loadingField: {
    gap: 8,
  },
  loadingLabel: {
    marginBottom: 8,
  },
  loadingInput: {
    marginBottom: 16,
  },
  loadingButton: {
    marginTop: 'auto',
    marginBottom: 20,
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
  addressInputWrapper: {
    alignItems: 'flex-start',
    paddingVertical: 16,
    position: 'relative',
  },
  addressInput: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  locationSelectedIcon: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#e8f4f8',
    borderRadius: 12,
    padding: 4,
  },
  locationButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  locationButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  currentLocationButton: {
    backgroundColor: '#e8f4f8',
  },
  mapPickerButton: {
    backgroundColor: '#f8f4e8',
  },
  locationButtonText: {
    fontSize: 14,
    fontFamily: 'SpaceGrotesk_500Medium',
    color: '#4fa3c4',
  },
  benefitsContainer: {
    marginTop: 32,
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
  },
  benefitsTitle: {
    fontSize: 18,
    fontFamily: 'SpaceGrotesk_700Bold',
    color: '#121516',
    marginBottom: 16,
    textAlign: 'center',
  },
  benefitsList: {
    gap: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  benefitIcon: {
    backgroundColor: '#e8f4f8',
    borderRadius: 12,
    padding: 4,
  },
  benefitText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'SpaceGrotesk_400Regular',
    color: '#687b82',
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
  // Map styles
  mapContainer: {
    flex: 1,
  },
  mapHeader: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  mapTitle: {
    fontSize: 24,
    fontFamily: 'SpaceGrotesk_700Bold',
    color: '#121516',
    textAlign: 'center',
    marginBottom: 8,
  },
  mapSubtitle: {
    fontSize: 16,
    fontFamily: 'SpaceGrotesk_400Regular',
    color: '#687b82',
    textAlign: 'center',
  },
  mockMap: {
    flex: 1,
    backgroundColor: '#e8f4f8',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  mapPin: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mapInstruction: {
    fontSize: 16,
    fontFamily: 'SpaceGrotesk_500Medium',
    color: '#4fa3c4',
    marginTop: 16,
  },
  mapLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  mapLoadingText: {
    fontSize: 16,
    fontFamily: 'SpaceGrotesk_500Medium',
    color: '#4fa3c4',
  },
  mapActions: {
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#f1f3f4',
  },
  mapCancelButton: {
    backgroundColor: '#f1f3f4',
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center',
  },
  mapCancelText: {
    fontSize: 16,
    fontFamily: 'SpaceGrotesk_600SemiBold',
    color: '#687b82',
  },
});