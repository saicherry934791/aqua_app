import { apiService } from '@/api/api';
import LoadingSkeleton from '@/components/skeletons/LoadingSkeleton';
import { useAuth } from '@/contexts/AuthContext';
import * as Location from 'expo-location';
import { useNavigation, useRouter } from 'expo-router';
import { Check, Mail, MapPin, Navigation, Phone, User } from 'lucide-react-native';
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Conditional import for maps - only import on native platforms
let MapView: any = null;
let Marker: any = null;

if (Platform.OS !== 'web') {
  try {
    const Maps = require('react-native-maps');
    MapView = Maps.default;
    Marker = Maps.Marker;
  } catch (error) {
    console.log('react-native-maps not available');
  }
}

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

export default function OnboardDetailsScreen() {
  // ALL HOOKS MUST BE CALLED AT THE TOP, BEFORE ANY CONDITIONAL LOGIC
  const navigation = useNavigation();
  const router = useRouter();
  const { isAuthenticated, user, isLoading } = useAuth();

  // All useState hooks
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [showMap, setShowMap] = useState(false);
  const [locationSelected, setLocationSelected] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [initialLocationSet, setInitialLocationSet] = useState(false);

  // All useRef hooks
  const mapRef = useRef<any>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  // Default to a major city (Bangalore) but will be updated with current location
  const [mapRegion, setMapRegion] = useState({
    latitude: 12.9716,
    longitude: 77.5946,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  const [selectedLocation, setSelectedLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [userDetails, setUserDetails] = useState<UserDetails | null>({
    name: '',
    email: '',
    alternatePhone: '',
    address: '',
    latitude: 0,
    longitude: 0,
  });

  // All useEffect and useLayoutEffect hooks
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <Text style={styles.headerTitle}>Complete Your Profile</Text>
      ),
      headerTitleAlign: 'center',
      headerLeft: () => null, // Remove back button
    });
  }, [navigation]);

  useEffect(() => {
    console.log('user', user);
    // Don't redirect if still loading
    if (!isLoading && !isAuthenticated) {
      router.replace('/(auth)');
    }
    if(user?.hasOnboarded){
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading, router]);

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

  // All useCallback hooks
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
      console.log('Error searching places:', error);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // NOW ALL CONDITIONAL LOGIC AND EARLY RETURNS CAN HAPPEN
  // Show loading while auth is being determined
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  const validateForm = () => {
    const { name, email, alternatePhone, address, latitude, longitude } = userDetails || {};

    if (!name?.trim()) {
      Alert.alert('Error', 'Please enter your full name');
      return false;
    }

    if (!email?.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email || '')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }

    if (!alternatePhone?.trim()) {
      Alert.alert('Error', 'Please enter an alternate phone number');
      return false;
    }

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(alternatePhone || '')) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number');
      return false;
    }

    if (!address?.trim()) {
      Alert.alert('Error', 'Please enter your address');
      return false;
    }

    if (!latitude || !longitude || latitude === 0 || longitude === 0) {
      Alert.alert('Error', 'Please select a location on the map');
      return false;
    }

    return true;
  };

  const requestLocationPermission = async () => {
    try {
      // First check current permissions
      const { status: currentStatus } = await Location.getForegroundPermissionsAsync();

      if (currentStatus === 'granted') {
        return true;
      }

      // Request permissions if not granted
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Location permission is required to get your current address. Please enable location access in your device settings.',
          [{ text: 'OK' }]
        );
        return false;
      }

      return true;
    } catch (error) {
      console.log('Error requesting location permission:', error);
      Alert.alert('Error', 'Failed to request location permission');
      return false;
    }
  };

  const getCurrentLocationSilently = async () => {
    try {
      if (Platform.OS === 'web') {
        // For web, use browser geolocation API
        if (navigator.geolocation) {
          return new Promise<void>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
              async (position) => {
                const { latitude, longitude } = position.coords;
                await updateMapRegionSmoothly(latitude, longitude);
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
      }

      // For mobile, check permission first
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        const { latitude, longitude } = location.coords;
        await updateMapRegionSmoothly(latitude, longitude);
        setInitialLocationSet(true);
      }
    } catch (error) {
      console.log('Silent location fetch failed:', error);
      // Continue with default location
    }
  };

  const getCurrentLocation = async () => {
    try {
      setLocationLoading(true);

      if (Platform.OS === 'web') {
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
              console.log('Geolocation error:', error);
              setLocationLoading(false);
              Alert.alert('Error', 'Failed to get current location. Please enter your address manually or try the map picker.');
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
          );
        } else {
          setLocationLoading(false);
          Alert.alert('Error', 'Geolocation is not supported by this browser.');
        }
        return;
      }

      // Request permission for mobile
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        setLocationLoading(false);
        return;
      }

      // Get current position
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const { latitude, longitude } = location.coords;

      await handleLocationUpdate(latitude, longitude);
      Alert.alert('Success', 'Location detected successfully!');
    } catch (error) {
      console.log('Error getting location:', error);
      Alert.alert('Error', 'Failed to get current location. Please enter your address manually.');
    } finally {
      setLocationLoading(false);
    }
  };

  const updateMapRegionSmoothly = async (latitude: number, longitude: number) => {
    const newRegion = {
      latitude,
      longitude,
      latitudeDelta: 0.02,
      longitudeDelta: 0.02,
    };
    setMapRegion(newRegion);
  };

  const handleLocationUpdate = async (latitude: number, longitude: number) => {
    // Update map region smoothly
    const newRegion = {
      latitude,
      longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
    setMapRegion(newRegion);
    setSelectedLocation({ latitude, longitude });
    setLocationSelected(true);

    // Reverse geocode to get address
    await reverseGeocode(latitude, longitude);
  };

  const reverseGeocode = async (latitude: number, longitude: number) => {
    try {
      if (Platform.OS === 'web') {
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
      } else {
        // For mobile, ensure we have permission before reverse geocoding
        const { status } = await Location.getForegroundPermissionsAsync();

        if (status !== 'granted') {
          // Try to request permission again
          const permissionResult = await Location.requestForegroundPermissionsAsync();
          if (permissionResult.status !== 'granted') {
            // If still no permission, use generic address with coordinates
            const genericAddress = `Selected Location, ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
            setUserDetails(prev => ({
              ...prev,
              address: genericAddress,
              latitude,
              longitude,
            }));
            return;
          }
        }

        // Use Expo Location for mobile with permission check
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
        } else {
          // Fallback to generic address if reverse geocoding returns no results
          const genericAddress = `Selected Location, ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          setUserDetails(prev => ({
            ...prev,
            address: genericAddress,
            latitude,
            longitude,
          }));
        }
      }
    } catch (error) {
      console.log('Error reverse geocoding:', error);
      // Still update with coordinates even if reverse geocoding fails
      const genericAddress = `Selected Location, ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
      setUserDetails(prev => ({
        ...prev,
        address: genericAddress,
        latitude,
        longitude,
      }));
    }
  };

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

        // Update map region
        const newRegion = {
          latitude: lat,
          longitude: lng,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };
        setMapRegion(newRegion);
        setSelectedLocation({ latitude: lat, longitude: lng });
        setLocationSelected(true);

        // Animate map to new location if map is visible
        if (mapRef.current && showMap && Platform.OS !== 'web') {
          mapRef.current.animateToRegion(newRegion, 1000);
        }
      }
    } catch (error) {
      console.log('Error selecting search result:', error);
    }
  };

  const openMapPicker = async () => {
    if (Platform.OS === 'web') {
      Alert.alert(
        'Map Picker',
        'For the best map experience, please use the mobile app. You can still enter your address manually or use current location.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Check permission before opening map
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      return;
    }

    setShowMap(true);
    setSearchQuery('');
    setShowSearchResults(false);
  };

  const handleMapPress = async (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;

    // Smooth animation to selected location
    const newRegion = {
      latitude,
      longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };

    setSelectedLocation({ latitude, longitude });
    setLocationSelected(true);

    // Animate map smoothly
    if (mapRef.current) {
      mapRef.current.animateToRegion(newRegion, 500);
    }

    // Update address
    await reverseGeocode(latitude, longitude);
  };

  const confirmMapSelection = () => {
    if (selectedLocation) {
      setLocationSelected(true);
      setShowMap(false);
      Alert.alert('Location Selected', 'Address has been updated from your map selection');
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    console.log('userDetails', userDetails);
    try {
      const result = await apiService.post('/auth/onboard', userDetails);

      if (result.success) {
        Alert.alert(
          'Welcome to AquaHome!',
          'Your profile has been completed successfully. You can now enjoy our services.',
          [{ text: 'Get Started', onPress: () => router.replace('/(tabs)') }]
        );
        router.replace('/(tabs)');
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

  if (showMap && Platform.OS !== 'web' && MapView) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.mapContainer}>
          <View style={styles.mapHeader}>
            <View style={styles.mapHeaderContent}>
              <TouchableOpacity
                style={styles.mapCloseButton}
                onPress={() => setShowMap(false)}
              >
                <Text style={{ fontSize: 24, color: '#687b82' }}>✕</Text>
              </TouchableOpacity>
              <View style={styles.mapTitleContainer}>
                <Text style={styles.mapTitle}>Select Your Location</Text>
                <Text style={styles.mapSubtitle}>Tap on the map to select your delivery location</Text>
              </View>
            </View>
          </View>

          {/* Map */}
          <MapView
            ref={mapRef}
            style={styles.map}
            provider={Platform.OS === 'android' ? 'google' : undefined}
            region={mapRegion}
            onPress={handleMapPress}
            showsUserLocation={true}
            showsMyLocationButton={true}
            showsCompass={true}
            showsScale={true}
            mapType="standard"
            onRegionChangeComplete={(region) => setMapRegion(region)}
          >
            {selectedLocation && (
              <Marker
                coordinate={selectedLocation}
                title="Selected Location"
                description="Your delivery address"
                pinColor="#ff0000"
              />
            )}
          </MapView>

          {selectedLocation && (
            <View style={styles.selectedLocationInfo}>
              <Text style={styles.selectedLocationText}>
                📍 Location Selected
              </Text>
              <Text style={styles.coordinatesText}>
                {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
              </Text>
            </View>
          )}

          <View style={styles.mapActions}>
            <TouchableOpacity
              style={styles.mapCancelButton}
              onPress={() => setShowMap(false)}
            >
              <Text style={styles.mapCancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.mapConfirmButton, !selectedLocation && styles.mapConfirmButtonDisabled]}
              onPress={confirmMapSelection}
              disabled={!selectedLocation}
            >
              <Text style={styles.mapConfirmText}>Confirm Location</Text>
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

            {/* Address with Search */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Delivery Address</Text>
              <View style={styles.addressContainer}>
                {/* Search Bar for Address */}
                <View style={styles.addressSearchContainer}>


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
                    <Text style={styles.locationButtonText}>
                      {Platform.OS === 'web' ? 'Map (Mobile Only)' : 'Pick on Map'}
                    </Text>
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
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
    paddingTop: 10,
  },
  mapHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  mapCloseButton: {
    padding: 8,
    marginRight: 12,
  },
  mapTitleContainer: {
    flex: 1,
  },
  mapTitle: {
    fontSize: 20,
    fontFamily: 'SpaceGrotesk_700Bold',
    color: '#121516',
    marginBottom: 4,
  },
  mapSubtitle: {
    fontSize: 14,
    fontFamily: 'SpaceGrotesk_400Regular',
    color: '#687b82',
  },
  map: {
    flex: 1,
  },
  selectedLocationInfo: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedLocationText: {
    fontSize: 16,
    fontFamily: 'SpaceGrotesk_600SemiBold',
    color: '#121516',
    textAlign: 'center',
    marginBottom: 4,
  },
  coordinatesText: {
    fontSize: 14,
    fontFamily: 'SpaceGrotesk_400Regular',
    color: '#687b82',
    textAlign: 'center',
  },
  mapActions: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#f1f3f4',
    gap: 12,
  },
  mapCancelButton: {
    flex: 1,
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
  mapConfirmButton: {
    flex: 1,
    backgroundColor: '#4fa3c4',
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center',
  },
  mapConfirmButtonDisabled: {
    backgroundColor: '#e1e5e7',
  },
  mapConfirmText: {
    fontSize: 16,
    fontFamily: 'SpaceGrotesk_600SemiBold',
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