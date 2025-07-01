import React, { useState, useLayoutEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  SafeAreaView,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  StyleSheet,
} from 'react-native';
import { useNavigation, useRouter, useLocalSearchParams } from 'expo-router';
import { CreditCard, MapPin, User, Phone, Navigation, Check } from 'lucide-react-native';
import { razorpayService } from '@/services/razorpay';
import BackArrowIcon from '@/components/icons/BackArrowIcon';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/api/api';

interface ShippingInfo {
  fullName: string;
  phone: string;
  address: string;
  latitude?: number;
  longitude?: number;
}

interface CheckoutItem {
  id: string;
  name: string;
  price: number;
  image: string;
  type: 'product' | 'subscription';
  quantity: number;
}

function CheckoutScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const { directCheckout, checkoutData, locationData } = useLocalSearchParams();
  const { user } = useAuth();

  console.log('user checkout is', user);
  
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [items, setItems] = useState<CheckoutItem[]>([]);
  const [total, setTotal] = useState(0);
  const [locationSelected, setLocationSelected] = useState(false);

  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    fullName: user?.name || '',
    phone: user?.phone?.split('+91')[1] || '',
    address: user?.address || '',
    latitude: user?.latitude,
    longitude: user?.longitude,
  });

  // Check if user already has location coordinates
  React.useEffect(() => {
    if (user?.latitude && user?.longitude && user?.address) {
      setShippingInfo(prev => ({
        ...prev,
        address: user.address,
        latitude: user.latitude,
        longitude: user.longitude,
      }));
      setLocationSelected(true);
    }
  }, [user]);

  // Initialize checkout data
  React.useEffect(() => {
    if (directCheckout === 'true' && checkoutData) {
      try {
        const data = JSON.parse(checkoutData as string);
        setItems(data.items);
        setTotal(data.total);
      } catch (error) {
        console.error('Error parsing checkout data:', error);
        Alert.alert('Error', 'Invalid checkout data');
        router.back();
      }
    }
  }, [directCheckout, checkoutData]);

  // Handle location data from map picker
  React.useEffect(() => {
    if (locationData) {
      try {
        const data = JSON.parse(locationData as string);
        console.log('Received location data:', data);
        
        setShippingInfo(prev => ({
          ...prev,
          address: data.address,
          latitude: data.latitude,
          longitude: data.longitude,
        }));
        setLocationSelected(true);
      } catch (error) {
        console.error('Error parsing location data:', error);
        Alert.alert('Error', 'Failed to parse location data');
      }
    }
  }, [locationData]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <Text style={styles.headerTitle}>
          CHECKOUT
        </Text>
      ),
      headerTitleAlign: 'center',
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <BackArrowIcon />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const validateForm = () => {
    if (!shippingInfo.fullName.trim()) {
      Alert.alert('Error', 'Please enter your full name');
      return false;
    }

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(shippingInfo.phone)) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number');
      return false;
    }

    if (!shippingInfo.address.trim()) {
      Alert.alert('Error', 'Please enter your delivery address');
      return false;
    }

    if (!locationSelected || !shippingInfo.latitude || !shippingInfo.longitude) {
      Alert.alert('Error', 'Please select your delivery address from the map to ensure accurate delivery');
      return false;
    }

    return true;
  };

  const getCurrentLocation = async () => {
    try {
      setLocationLoading(true);

      if (Platform.OS === 'web') {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords;
              await reverseGeocode(latitude, longitude);
              setLocationLoading(false);
              Alert.alert('Success', 'Current location detected and address updated!');
            },
            (error) => {
              console.error('Geolocation error:', error);
              setLocationLoading(false);
              Alert.alert('Error', 'Failed to get current location. Please use map picker instead.');
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
          );
        } else {
          setLocationLoading(false);
          Alert.alert('Error', 'Geolocation is not supported by this browser. Please use map picker.');
        }
      } else {
        Alert.alert('Info', 'Please use the map picker to select your location.');
        setLocationLoading(false);
      }
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get current location. Please use map picker.');
      setLocationLoading(false);
    }
  };

  const reverseGeocode = async (latitude: number, longitude: number) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyDBFyJk1ZsnnqxLC43WT_-OSCFZaG0OaNM`
      );
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const address = data.results[0].formatted_address;
        setShippingInfo(prev => ({
          ...prev,
          address,
          latitude,
          longitude,
        }));
        setLocationSelected(true);
      } else {
        throw new Error('No address found for the coordinates');
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      Alert.alert('Error', 'Failed to get address for the selected location');
    }
  };

  const openMapPicker = () => {
    router.push({
      pathname: '/map-picker',
      params: {
        returnTo: '/checkout',
        currentLatitude: shippingInfo.latitude?.toString() || '',
        currentLongitude: shippingInfo.longitude?.toString() || '',
        currentAddress: shippingInfo.address || '',
      },
    });
  };

  const handlePayment = async () => {
    if (!validateForm()) return;

    console.log('Starting payment process with shipping info:', shippingInfo);

    setLoading(true);
    try {
      // Mock payment process for now
      Alert.alert(
        'Payment Successful',
        'Your order has been placed successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              router.replace({
                pathname: '/order-confirmation',
                params: {
                  orderId: Date.now().toString(),
                  paymentId: 'mock_payment_' + Date.now(),
                  amount: total.toString(),
                  productName: items[0]?.name || 'Product',
                  orderType: items[0]?.type || 'product',
                  shippingInfo: JSON.stringify({
                    fullName: shippingInfo.fullName,
                    phone: `+91${shippingInfo.phone}`,
                    address: shippingInfo.address,
                  }),
                },
              });
            },
          },
        ]
      );
    } catch (error) {
      console.error('Payment process error:', error);
      Alert.alert(
        'Payment Failed', 
        'There was an error processing your payment. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const deliveryFee = total > 500 ? 0 : 50;
  const finalTotal = total + deliveryFee;

  const isFormValid = () => {
    return (
      shippingInfo.fullName.trim() &&
      /^[6-9]\d{9}$/.test(shippingInfo.phone) &&
      shippingInfo.address.trim() &&
      locationSelected &&
      shippingInfo.latitude &&
      shippingInfo.longitude
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Order Summary Card */}
          <View style={styles.orderSummaryCard}>
            <Text style={styles.orderSummaryTitle}>
              Order Summary
            </Text>

            {items.map((item) => (
              <View key={item.id} style={styles.orderItem}>
                <View style={styles.orderItemDetails}>
                  <Text style={styles.orderItemName}>
                    {item.name}
                  </Text>
                  <Text style={styles.orderItemType}>
                    {item.type === 'subscription' ? 'Monthly Rental' : 'One-time Purchase'} • Qty: {item.quantity}
                  </Text>
                </View>
                <Text style={styles.orderItemPrice}>
                  ₹{(item.price * item.quantity).toLocaleString()}
                </Text>
              </View>
            ))}

            <View style={styles.orderSummaryFooter}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>
                  Subtotal
                </Text>
                <Text style={styles.summaryValue}>
                  ₹{total.toLocaleString()}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>
                  Delivery Fee {total > 500 && '(Free above ₹500)'}
                </Text>
                <Text style={[styles.summaryValue, deliveryFee === 0 && styles.freeDelivery]}>
                  {deliveryFee === 0 ? 'Free' : `₹${deliveryFee}`}
                </Text>
              </View>

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>
                  Total
                </Text>
                <Text style={styles.totalValue}>
                  ₹{finalTotal.toLocaleString()}
                </Text>
              </View>
            </View>
          </View>

          {/* Delivery Information */}
          <View style={styles.deliverySection}>
            <Text style={styles.sectionTitle}>
              Delivery Information
            </Text>

            {/* Full Name */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                Full Name
              </Text>
              <View style={styles.inputWrapper}>
                <User size={16} color="#687b82" />
                <TextInput
                  value={shippingInfo.fullName}
                  onChangeText={(text) => setShippingInfo(prev => ({ ...prev, fullName: text }))}
                  placeholder="Enter your full name"
                  placeholderTextColor="#687b82"
                  style={styles.textInput}
                />
              </View>
            </View>

            {/* Phone Number */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                Phone Number
              </Text>
              <View style={styles.inputWrapper}>
                <Phone size={16} color="#687b82" />
                <Text style={styles.countryCode}>
                  +91
                </Text>
                <TextInput
                  value={shippingInfo.phone}
                  onChangeText={(text) => setShippingInfo(prev => ({ ...prev, phone: text }))}
                  placeholder="Enter phone number"
                  placeholderTextColor="#687b82"
                  keyboardType="numeric"
                  maxLength={10}
                  style={styles.textInput}
                />
              </View>
            </View>

            {/* Address - Map Selection Required */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                Delivery Address *
              </Text>

              <View style={[styles.addressContainer, !locationSelected && styles.addressContainerError]}>
                {/* Address Display */}
                <View style={styles.addressDisplay}>
                  <MapPin size={16} color="#687b82" style={styles.addressIcon} />
                  <View style={styles.addressTextContainer}>
                    {shippingInfo.address ? (
                      <>
                        <Text style={styles.addressText}>
                          {shippingInfo.address}
                        </Text>
                        {shippingInfo.latitude && shippingInfo.longitude && (
                          <Text style={styles.coordinatesText}>
                            📍 {shippingInfo.latitude.toFixed(6)}, {shippingInfo.longitude.toFixed(6)}
                          </Text>
                        )}
                      </>
                    ) : (
                      <Text style={styles.addressPlaceholder}>
                        Please select your delivery address on the map
                      </Text>
                    )}
                  </View>
                  {locationSelected && (
                    <View style={styles.locationSelectedIcon}>
                      <Check size={12} color="#4fa3c4" />
                    </View>
                  )}
                </View>

                {/* Location Action Buttons */}
                <View style={styles.locationButtons}>
                  <TouchableOpacity
                    onPress={getCurrentLocation}
                    disabled={locationLoading}
                    style={styles.locationButton}
                  >
                    {locationLoading ? (
                      <ActivityIndicator size="small" color="#4fa3c4" />
                    ) : (
                      <>
                        <Navigation size={14} color="#4fa3c4" />
                        <Text style={styles.locationButtonText}>
                          Current Location
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={openMapPicker}
                    style={[styles.locationButton, styles.mapPickerButton]}
                  >
                    <MapPin size={14} color="#ff9800" />
                    <Text style={[styles.locationButtonText, styles.mapPickerButtonText]}>
                      Select on Map
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Helper Text */}
              <Text style={[styles.helperText, locationSelected ? styles.helperTextSuccess : styles.helperTextError]}>
                {locationSelected 
                  ? '✅ Location confirmed for accurate delivery' 
                  : '⚠️ Map selection required for precise delivery location'
                }
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Fixed Payment Button */}
        <View style={styles.paymentButtonContainer}>
          <TouchableOpacity
            onPress={handlePayment}
            disabled={loading || !isFormValid()}
            style={[styles.paymentButton, (loading || !isFormValid()) && styles.paymentButtonDisabled]}
          >
            {loading ? (
              <>
                <ActivityIndicator color="white" size="small" />
                <Text style={styles.paymentButtonText}>
                  Processing...
                </Text>
              </>
            ) : (
              <>
                <CreditCard size={20} color="white" />
                <Text style={styles.paymentButtonText}>
                  {isFormValid() ? `Pay ₹${finalTotal.toLocaleString()}` : 'Complete Form First'}
                </Text>
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.securePaymentText}>
            🔒 Secure payment powered by Razorpay
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'SpaceGrotesk_700Bold',
    color: '#121516',
  },
  orderSummaryCard: {
    margin: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 20,
  },
  orderSummaryTitle: {
    fontSize: 20,
    fontFamily: 'SpaceGrotesk_700Bold',
    color: '#121516',
    marginBottom: 16,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  orderItemDetails: {
    flex: 1,
  },
  orderItemName: {
    fontSize: 16,
    fontFamily: 'SpaceGrotesk_600SemiBold',
    color: '#121516',
  },
  orderItemType: {
    fontSize: 14,
    fontFamily: 'SpaceGrotesk_400Regular',
    color: '#687b82',
    marginTop: 2,
  },
  orderItemPrice: {
    fontSize: 18,
    fontFamily: 'SpaceGrotesk_700Bold',
    color: '#121516',
  },
  orderSummaryFooter: {
    borderTopWidth: 1,
    borderTopColor: '#e1e5e7',
    marginTop: 16,
    paddingTop: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    fontFamily: 'SpaceGrotesk_400Regular',
    color: '#687b82',
  },
  summaryValue: {
    fontSize: 16,
    fontFamily: 'SpaceGrotesk_600SemiBold',
    color: '#121516',
  },
  freeDelivery: {
    color: '#4fa3c4',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e1e5e7',
  },
  totalLabel: {
    fontSize: 20,
    fontFamily: 'SpaceGrotesk_700Bold',
    color: '#121516',
  },
  totalValue: {
    fontSize: 20,
    fontFamily: 'SpaceGrotesk_700Bold',
    color: '#4fa3c4',
  },
  deliverySection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'SpaceGrotesk_700Bold',
    color: '#121516',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: 'SpaceGrotesk_600SemiBold',
    color: '#121516',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e1e5e7',
    height: 40,
  },
  textInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    fontFamily: 'SpaceGrotesk_400Regular',
    color: '#121516',
  },
  countryCode: {
    fontSize: 14,
    fontFamily: 'SpaceGrotesk_600SemiBold',
    color: '#121516',
    marginLeft: 8,
    marginRight: 4,
  },
  addressContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4fa3c4',
    overflow: 'hidden',
  },
  addressContainerError: {
    borderColor: '#ff6b6b',
  },
  addressDisplay: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 12,
    minHeight: 50,
  },
  addressIcon: {
    marginTop: 2,
  },
  addressTextContainer: {
    flex: 1,
    marginLeft: 8,
  },
  addressText: {
    fontSize: 14,
    fontFamily: 'SpaceGrotesk_400Regular',
    color: '#121516',
    lineHeight: 18,
  },
  coordinatesText: {
    fontSize: 11,
    fontFamily: 'SpaceGrotesk_400Regular',
    color: '#687b82',
    marginTop: 4,
  },
  addressPlaceholder: {
    fontSize: 14,
    fontFamily: 'SpaceGrotesk_400Regular',
    color: '#ff6b6b',
    fontStyle: 'italic',
  },
  locationSelectedIcon: {
    backgroundColor: '#e8f4f8',
    borderRadius: 4,
    padding: 2,
    marginLeft: 6,
    marginTop: 1,
  },
  locationButtons: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#e1e5e7',
  },
  locationButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: '#e8f4f8',
  },
  mapPickerButton: {
    backgroundColor: '#fff3e0',
    borderLeftWidth: 1,
    borderLeftColor: '#e1e5e7',
  },
  locationButtonText: {
    fontSize: 12,
    fontFamily: 'SpaceGrotesk_600SemiBold',
    color: '#4fa3c4',
    marginLeft: 4,
  },
  mapPickerButtonText: {
    color: '#ff9800',
  },
  helperText: {
    fontSize: 11,
    fontFamily: 'SpaceGrotesk_400Regular',
    marginTop: 6,
    textAlign: 'center',
  },
  helperTextSuccess: {
    color: '#4fa3c4',
  },
  helperTextError: {
    color: '#ff6b6b',
  },
  paymentButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#f1f3f4',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  paymentButton: {
    height: 48,
    borderRadius: 12,
    backgroundColor: '#4fa3c4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4fa3c4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  paymentButtonDisabled: {
    backgroundColor: '#e1e5e7',
    shadowOpacity: 0,
    elevation: 0,
  },
  paymentButtonText: {
    fontSize: 16,
    fontFamily: 'SpaceGrotesk_700Bold',
    color: 'white',
    marginLeft: 8,
  },
  securePaymentText: {
    fontSize: 10,
    fontFamily: 'SpaceGrotesk_400Regular',
    color: '#687b82',
    textAlign: 'center',
    marginTop: 4,
  },
});

export default CheckoutScreen;