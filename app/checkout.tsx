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
} from 'react-native';
import { useNavigation, useRouter, useLocalSearchParams } from 'expo-router';
import { CreditCard, MapPin, User, Phone, Navigation, Check } from 'lucide-react-native';
import { razorpayService } from '@/services/razorpay';
import BackArrowIcon from '@/components/icons/BackArrowIcon';

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

export default function CheckoutScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const { directCheckout, checkoutData } = useLocalSearchParams();
  
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [items, setItems] = useState<CheckoutItem[]>([]);
  const [total, setTotal] = useState(0);
  const [locationSelected, setLocationSelected] = useState(false);
  
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    fullName: '',
    phone: '',
    address: '',
  });

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

  // Listen for location updates from map picker
  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Check if we have location data from map picker
      const locationData = router.params?.locationData;
      if (locationData) {
        const { address, latitude, longitude } = JSON.parse(locationData as string);
        setShippingInfo(prev => ({
          ...prev,
          address,
          latitude,
          longitude,
        }));
        setLocationSelected(true);
      }
    });

    return unsubscribe;
  }, [navigation, router.params]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <Text style={{ fontSize: 20, fontFamily: 'SpaceGrotesk_700Bold', color: '#121516' }}>
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
      Alert.alert('Error', 'Please select your delivery address from the map');
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
              Alert.alert('Success', 'Current location detected!');
            },
            (error) => {
              console.error('Geolocation error:', error);
              setLocationLoading(false);
              Alert.alert('Error', 'Failed to get current location. Please use map picker.');
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
          );
        } else {
          setLocationLoading(false);
          Alert.alert('Error', 'Geolocation is not supported by this browser.');
        }
      }
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get current location. Please use map picker.');
    } finally {
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
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
    }
  };

  const openMapPicker = () => {
    router.push({
      pathname: '/map-picker',
      params: {
        returnTo: '/checkout',
      },
    });
  };

  const handlePayment = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const totalAmount = total;
      const deliveryFee = total > 500 ? 0 : 50;
      const finalTotal = totalAmount + deliveryFee;
      
      // Create order
      const order = await razorpayService.createOrder(finalTotal);
      
      // Prepare Razorpay options
      const options = {
        description: 'AquaHome Purchase',
        image: 'https://your-logo-url.com/logo.png',
        currency: 'INR',
        key: process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_your_key_here',
        amount: finalTotal * 100,
        name: 'AquaHome',
        order_id: order.order_id,
        prefill: {
          email: 'customer@example.com',
          contact: shippingInfo.phone,
          name: shippingInfo.fullName,
        },
        theme: {
          color: '#4fa3c4',
        },
      };

      // Open Razorpay checkout
      const paymentResult = await razorpayService.openCheckout(options);
      
      // Verify payment
      if (paymentResult.razorpay_payment_id) {
        const isVerified = await razorpayService.verifyPayment(
          paymentResult.razorpay_payment_id,
          paymentResult.razorpay_order_id || '',
          paymentResult.razorpay_signature || ''
        );

        if (isVerified) {
          router.replace({
            pathname: '/order-confirmation',
            params: {
              paymentId: paymentResult.razorpay_payment_id,
              orderId: paymentResult.razorpay_order_id,
              amount: finalTotal.toString(),
            },
          });
        } else {
          Alert.alert('Error', 'Payment verification failed. Please contact support.');
        }
      }
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert('Payment Failed', 'There was an error processing your payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const deliveryFee = total > 500 ? 0 : 50;
  const finalTotal = total + deliveryFee;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView 
          style={{ flex: 1 }} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          {/* Order Summary Card */}
          <View style={{
            margin: 16,
            backgroundColor: '#f8f9fa',
            borderRadius: 16,
            padding: 20,
          }}>
            <Text style={{
              fontSize: 20,
              fontFamily: 'SpaceGrotesk_700Bold',
              color: '#121516',
              marginBottom: 16,
            }}>
              Order Summary
            </Text>

            {items.map((item) => (
              <View key={item.id} style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingVertical: 8,
              }}>
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontSize: 16,
                    fontFamily: 'SpaceGrotesk_600SemiBold',
                    color: '#121516',
                  }}>
                    {item.name}
                  </Text>
                  <Text style={{
                    fontSize: 14,
                    fontFamily: 'SpaceGrotesk_400Regular',
                    color: '#687b82',
                    marginTop: 2,
                  }}>
                    {item.type === 'subscription' ? 'Monthly Rental' : 'One-time Purchase'} • Qty: {item.quantity}
                  </Text>
                </View>
                <Text style={{
                  fontSize: 18,
                  fontFamily: 'SpaceGrotesk_700Bold',
                  color: '#121516',
                }}>
                  ₹{(item.price * item.quantity).toLocaleString()}
                </Text>
              </View>
            ))}

            <View style={{
              borderTopWidth: 1,
              borderTopColor: '#e1e5e7',
              marginTop: 16,
              paddingTop: 16,
            }}>
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: 8,
              }}>
                <Text style={{
                  fontSize: 16,
                  fontFamily: 'SpaceGrotesk_400Regular',
                  color: '#687b82',
                }}>
                  Subtotal
                </Text>
                <Text style={{
                  fontSize: 16,
                  fontFamily: 'SpaceGrotesk_600SemiBold',
                  color: '#121516',
                }}>
                  ₹{total.toLocaleString()}
                </Text>
              </View>
              
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: 12,
              }}>
                <Text style={{
                  fontSize: 16,
                  fontFamily: 'SpaceGrotesk_400Regular',
                  color: '#687b82',
                }}>
                  Delivery Fee {total > 500 && '(Free above ₹500)'}
                </Text>
                <Text style={{
                  fontSize: 16,
                  fontFamily: 'SpaceGrotesk_600SemiBold',
                  color: deliveryFee === 0 ? '#4fa3c4' : '#121516',
                }}>
                  {deliveryFee === 0 ? 'Free' : `₹${deliveryFee}`}
                </Text>
              </View>

              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingTop: 12,
                borderTopWidth: 1,
                borderTopColor: '#e1e5e7',
              }}>
                <Text style={{
                  fontSize: 20,
                  fontFamily: 'SpaceGrotesk_700Bold',
                  color: '#121516',
                }}>
                  Total
                </Text>
                <Text style={{
                  fontSize: 20,
                  fontFamily: 'SpaceGrotesk_700Bold',
                  color: '#4fa3c4',
                }}>
                  ₹{finalTotal.toLocaleString()}
                </Text>
              </View>
            </View>
          </View>

          {/* Delivery Information */}
          <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
            <Text style={{
              fontSize: 20,
              fontFamily: 'SpaceGrotesk_700Bold',
              color: '#121516',
              marginBottom: 20,
            }}>
              Delivery Information
            </Text>

            {/* Full Name - Reduced Height */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{
                fontSize: 14,
                fontFamily: 'SpaceGrotesk_600SemiBold',
                color: '#121516',
                marginBottom: 6,
              }}>
                Full Name
              </Text>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#f8f9fa',
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 12,
                borderWidth: 1,
                borderColor: '#e1e5e7',
                height: 44,
              }}>
                <User size={18} color="#687b82" />
                <TextInput
                  value={shippingInfo.fullName}
                  onChangeText={(text) => setShippingInfo(prev => ({ ...prev, fullName: text }))}
                  placeholder="Enter your full name"
                  placeholderTextColor="#687b82"
                  style={{
                    flex: 1,
                    marginLeft: 10,
                    fontSize: 15,
                    fontFamily: 'SpaceGrotesk_400Regular',
                    color: '#121516',
                  }}
                />
              </View>
            </View>

            {/* Phone Number - Reduced Height */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{
                fontSize: 14,
                fontFamily: 'SpaceGrotesk_600SemiBold',
                color: '#121516',
                marginBottom: 6,
              }}>
                Phone Number
              </Text>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#f8f9fa',
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 12,
                borderWidth: 1,
                borderColor: '#e1e5e7',
                height: 44,
              }}>
                <Phone size={18} color="#687b82" />
                <Text style={{
                  fontSize: 15,
                  fontFamily: 'SpaceGrotesk_600SemiBold',
                  color: '#121516',
                  marginLeft: 10,
                  marginRight: 6,
                }}>
                  +91
                </Text>
                <TextInput
                  value={shippingInfo.phone}
                  onChangeText={(text) => setShippingInfo(prev => ({ ...prev, phone: text }))}
                  placeholder="Enter phone number"
                  placeholderTextColor="#687b82"
                  keyboardType="numeric"
                  maxLength={10}
                  style={{
                    flex: 1,
                    fontSize: 15,
                    fontFamily: 'SpaceGrotesk_400Regular',
                    color: '#121516',
                  }}
                />
              </View>
            </View>

            {/* Address - Map Selection Required */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{
                fontSize: 14,
                fontFamily: 'SpaceGrotesk_600SemiBold',
                color: '#121516',
                marginBottom: 6,
              }}>
                Delivery Address
              </Text>
              
              <View style={{
                backgroundColor: '#f8f9fa',
                borderRadius: 8,
                borderWidth: 1,
                borderColor: '#e1e5e7',
                overflow: 'hidden',
              }}>
                {/* Address Display */}
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                  minHeight: 60,
                }}>
                  <MapPin size={18} color="#687b82" style={{ marginTop: 2 }} />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    {shippingInfo.address ? (
                      <Text style={{
                        fontSize: 15,
                        fontFamily: 'SpaceGrotesk_400Regular',
                        color: '#121516',
                        lineHeight: 20,
                      }}>
                        {shippingInfo.address}
                      </Text>
                    ) : (
                      <Text style={{
                        fontSize: 15,
                        fontFamily: 'SpaceGrotesk_400Regular',
                        color: '#687b82',
                        fontStyle: 'italic',
                      }}>
                        Please select your delivery address
                      </Text>
                    )}
                  </View>
                  {locationSelected && (
                    <View style={{
                      backgroundColor: '#e8f4f8',
                      borderRadius: 6,
                      padding: 3,
                      marginLeft: 8,
                      marginTop: 2,
                    }}>
                      <Check size={14} color="#4fa3c4" />
                    </View>
                  )}
                </View>
                
                {/* Location Action Buttons */}
                <View style={{
                  flexDirection: 'row',
                  borderTopWidth: 1,
                  borderTopColor: '#e1e5e7',
                }}>
                  <TouchableOpacity
                    onPress={getCurrentLocation}
                    disabled={locationLoading}
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      paddingVertical: 10,
                      backgroundColor: '#e8f4f8',
                    }}
                  >
                    {locationLoading ? (
                      <ActivityIndicator size="small" color="#4fa3c4" />
                    ) : (
                      <>
                        <Navigation size={14} color="#4fa3c4" />
                        <Text style={{
                          fontSize: 13,
                          fontFamily: 'SpaceGrotesk_600SemiBold',
                          color: '#4fa3c4',
                          marginLeft: 4,
                        }}>
                          Current Location
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    onPress={openMapPicker}
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      paddingVertical: 10,
                      backgroundColor: '#fff3e0',
                      borderLeftWidth: 1,
                      borderLeftColor: '#e1e5e7',
                    }}
                  >
                    <MapPin size={14} color="#ff9800" />
                    <Text style={{
                      fontSize: 13,
                      fontFamily: 'SpaceGrotesk_600SemiBold',
                      color: '#ff9800',
                      marginLeft: 4,
                    }}>
                      Select on Map
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              {/* Helper Text */}
              <Text style={{
                fontSize: 12,
                fontFamily: 'SpaceGrotesk_400Regular',
                color: '#687b82',
                marginTop: 6,
                textAlign: 'center',
              }}>
                📍 Select your exact location for accurate delivery
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Fixed Payment Button */}
        <View style={{
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
        }}>
          <TouchableOpacity
            onPress={handlePayment}
            disabled={loading || !locationSelected}
            style={{
              height: 52,
              borderRadius: 14,
              backgroundColor: loading || !locationSelected ? '#e1e5e7' : '#4fa3c4',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#4fa3c4',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: loading || !locationSelected ? 0 : 0.3,
              shadowRadius: 8,
              elevation: loading || !locationSelected ? 0 : 8,
            }}
          >
            {loading ? (
              <>
                <ActivityIndicator color="white" size="small" />
                <Text style={{
                  fontSize: 17,
                  fontFamily: 'SpaceGrotesk_700Bold',
                  color: 'white',
                  marginLeft: 8,
                }}>
                  Processing...
                </Text>
              </>
            ) : (
              <>
                <CreditCard size={22} color="white" />
                <Text style={{
                  fontSize: 17,
                  fontFamily: 'SpaceGrotesk_700Bold',
                  color: 'white',
                  marginLeft: 8,
                }}>
                  Pay ₹{finalTotal.toLocaleString()}
                </Text>
              </>
            )}
          </TouchableOpacity>
          
          <Text style={{
            fontSize: 11,
            fontFamily: 'SpaceGrotesk_400Regular',
            color: '#687b82',
            textAlign: 'center',
            marginTop: 6,
          }}>
            🔒 Secure payment powered by Razorpay
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}