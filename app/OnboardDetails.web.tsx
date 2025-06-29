import React, { useState, useLayoutEffect, useCallback, useRef, useEffect } from 'react';
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
  FlatList,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRouter } from 'expo-router';
import { MapPin, User, Phone, Mail, Navigation, Check, Search } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSkeleton from '@/components/skeletons/LoadingSkeleton';

interface UserDetails {
  name: string;
  email: string;
  alternatePhone: string;
  address: string;
  latitude?: number;
  longitude?: number;
}

interface SearchResult {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function OnboardDetailsScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const { completeUserDetails } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [locationSelected, setLocationSelected] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [initialLocationSet, setInitialLocationSet] = useState(false);
  
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  
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

  // Initialize with current location on component mount
  useEffect(() => {
    const initializeLocation = async () => {
      try {
        setPageLoading(true);
        await getCurrentLocationSilently();
      } catch (error) {
        console.log('Could not get initial location, using default');
      } finally {
        setPageLoading(false);
      }
    };

    initializeLocation();
  }, []);

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

  const getCurrentLocationSilently = async () => {
    try {
      // For web, use browser geolocation API
      if (navigator.geolocation) {
        return new Promise<void>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords;
              setInitialLocationSet(true);
              resolve();
            },
            (error) => {
              console.log('Geolocation error:', error);
              resolve(); // Don't reject, just continue with default location
            },
            { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
          );
        });
      }
      return;
    } catch (error) {
      console.log('Silent location fetch failed:', error);
      // Continue with default location
    }
  };

  const getCurrentLocation = async () => {
    try {
      setLocationLoading(true);
      
      // For web, use browser geolocation API
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            await handleLocationUpdate(latitude, longitude);
            setLocationLoading(false);
            Alert.alert('Success', 'Current location detected and address updated!');
          },
          (error) => {
            console.error('Geolocation error:', error);
            setLocationLoading(false);
            Alert.alert('Error', 'Failed to get current location. Please enter your address manually.');
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
      } else {
        setLocationLoading(false);
        Alert.alert('Error', 'Geolocation is not supported by this browser.');
      }
      return;
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get current location. Please enter your address manually.');
    } finally {
      setLocationLoading(false);
    }
  };

  const handleLocationUpdate = async (latitude: number, longitude: number) => {
    setLocationSelected(true);
    // Reverse geocode to get address
    await reverseGeocode(latitude, longitude);
  };

  const reverseGeocode = async (latitude: number, longitude: number) => {
    try {
      // For web, use Google Geocoding API
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyDBFyJk1ZsnnqxLC43WT_-OSCFZaG0OaNM`
      );
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        const address = data.results[0].formatted_address;
        setUserDetails(prev => ({
          ...prev,
          address,
          latitude,
          longitude,
        }));
      } else {
        // Fallback to a generic address
        const genericAddress = `Selected Location, ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        setUserDetails(prev => ({
          ...prev,
          address: genericAddress,
          latitude,
          longitude,
        }));
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      // Still update with coordinates even if reverse geocoding fails
      setUserDetails(prev => ({
        ...prev,
        latitude,
        longitude,
      }));
    }
  };

  const searchPlaces = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&key=AIzaSyDBFyJk1ZsnnqxLC43WT_-OSCFZaG0OaNM&components=country:in&types=address`
      );
      const data = await response.json();
      
      if (data.predictions) {
        setSearchResults(data.predictions);
        setShowSearchResults(true);
      }
    } catch (error) {
      console.error('Error searching places:', error);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleSearchQueryChange = (text: string) => {
    setSearchQuery(text);
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Set new timeout for search
    searchTimeoutRef.current = setTimeout(() => {
      searchPlaces(text);
    }, 300); // Reduced delay for better responsiveness
  };

  const selectSearchResult = async (result: SearchResult) => {
    try {
      setSearchQuery(result.description);
      setShowSearchResults(false);
      Keyboard.dismiss();
      
      // Get place details
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${result.place_id}&fields=geometry,formatted_address&key=AIzaSyDBFyJk1ZsnnqxLC43WT_-OSCFZaG0OaNM`
      );
      const data = await response.json();
      
      if (data.result?.geometry?.location) {
        const { lat, lng } = data.result.geometry.location;
        
        // Update address immediately with the formatted address from search
        setUserDetails(prev => ({
          ...prev,
          address: data.result.formatted_address || result.description,
          latitude: lat,
          longitude: lng,
        }));
        
        setLocationSelected(true);
      }
    } catch (error) {
      console.error('Error selecting search result:', error);
    }
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

  const renderSearchResult = ({ item }: { item: SearchResult }) => (
    <TouchableOpacity
      style={styles.searchResultItem}
      onPress={() => selectSearchResult(item)}
    >
      <MapPin size={16} color="#4fa3c4" style={styles.searchResultIcon} />
      <View style={styles.searchResultText}>
        <Text style={styles.searchResultMain}>{item.structured_formatting.main_text}</Text>
        <Text style={styles.searchResultSecondary}>{item.structured_formatting.secondary_text}</Text>
      </View>
    </TouchableOpacity>
  );

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

            {/* Address with Search */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Address</Text>
              <View style={styles.addressContainer}>
                {/* Search Bar for Address */}
                <View style={styles.addressSearchContainer}>
                  <View style={styles.addressSearchBar}>
                    <Search size={20} color="#687b82" />
                    <TextInput
                      style={styles.addressSearchInput}
                      placeholder="Search for your address..."
                      placeholderTextColor="#687b82"
                      value={searchQuery}
                      onChangeText={handleSearchQueryChange}
                    />
                    {isSearching && (
                      <ActivityIndicator size="small" color="#4fa3c4" />
                    )}
                  </View>
                  
                  {/* Search Results */}
                  {showSearchResults && searchResults.length > 0 && (
                    <View style={styles.addressSearchResults}>
                      <FlatList
                        data={searchResults.slice(0, 5)} // Limit to 5 results
                        renderItem={renderSearchResult}
                        keyExtractor={(item) => item.place_id}
                        keyboardShouldPersistTaps="handled"
                      />
                    </View>
                  )}
                </View>

                {/* Address Input */}
                <View style={[styles.inputWrapper, styles.addressInputWrapper]}>
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
  addressSearchContainer: {
    position: 'relative',
  },
  addressSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f3f4',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  addressSearchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'SpaceGrotesk_400Regular',
    color: '#121516',
  },
  addressSearchResults: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 1000,
    maxHeight: 200,
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
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  searchResultIcon: {
    marginRight: 12,
  },
  searchResultText: {
    flex: 1,
  },
  searchResultMain: {
    fontSize: 16,
    fontFamily: 'SpaceGrotesk_500Medium',
    color: '#121516',
    marginBottom: 2,
  },
  searchResultSecondary: {
    fontSize: 14,
    fontFamily: 'SpaceGrotesk_400Regular',
    color: '#687b82',
  },
});