import React, { useState, useLayoutEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRouter, useLocalSearchParams } from 'expo-router';
import { CreditCard, MapPin, User, Phone, Mail } from 'lucide-react-native';
import { razorpayService } from '@/services/razorpay';
import BackArrowIcon from '@/components/icons/BackArrowIcon';

interface ShippingInfo {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
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
  const [items, setItems] = useState<CheckoutItem[]>([]);
  const [total, setTotal] = useState(0);
  
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
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

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <Text className="text-2xl font-grotesk-bold text-[#121516]">CHECKOUT</Text>
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
    const required = ['fullName', 'email', 'phone', 'address', 'city', 'state', 'pincode'];
    for (const field of required) {
      if (!shippingInfo[field as keyof ShippingInfo].trim()) {
        Alert.alert('Error', `Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(shippingInfo.email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }

    // Phone validation
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(shippingInfo.phone)) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number');
      return false;
    }

    // Pincode validation
    const pincodeRegex = /^\d{6}$/;
    if (!pincodeRegex.test(shippingInfo.pincode)) {
      Alert.alert('Error', 'Please enter a valid 6-digit pincode');
      return false;
    }

    return true;
  };

  const handlePayment = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const totalAmount = total;
      
      // Create order
      const order = await razorpayService.createOrder(totalAmount);
      
      // Prepare Razorpay options
      const options = {
        description: 'AquaHome Purchase',
        image: 'https://your-logo-url.com/logo.png',
        currency: 'INR',
        key: process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_your_key_here',
        amount: totalAmount * 100, // amount in paise
        name: 'AquaHome',
        order_id: order.order_id,
        prefill: {
          email: shippingInfo.email,
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
          // Payment successful
          router.replace({
            pathname: '/order-confirmation',
            params: {
              paymentId: paymentResult.razorpay_payment_id,
              orderId: paymentResult.razorpay_order_id,
              amount: totalAmount.toString(),
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
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Shipping Information */}
        <View className="px-4 py-6">
          <View className="flex-row items-center mb-4">
            <MapPin size={24} color="#4fa3c4" />
            <Text className="text-xl font-grotesk-bold text-[#121516] ml-2">
              Shipping Information
            </Text>
          </View>

          <View className="space-y-4">
            <View>
              <Text className="text-base font-grotesk-medium text-[#121516] mb-2">Full Name</Text>
              <View className="flex-row items-center bg-[#f1f3f4] rounded-lg px-4 py-3">
                <User size={20} color="#687b82" />
                <TextInput
                  value={shippingInfo.fullName}
                  onChangeText={(text) => setShippingInfo(prev => ({ ...prev, fullName: text }))}
                  placeholder="Enter your full name"
                  placeholderTextColor="#687b82"
                  className="flex-1 ml-3 text-base font-grotesk text-[#121516]"
                />
              </View>
            </View>

            <View>
              <Text className="text-base font-grotesk-medium text-[#121516] mb-2">Email</Text>
              <View className="flex-row items-center bg-[#f1f3f4] rounded-lg px-4 py-3">
                <Mail size={20} color="#687b82" />
                <TextInput
                  value={shippingInfo.email}
                  onChangeText={(text) => setShippingInfo(prev => ({ ...prev, email: text }))}
                  placeholder="Enter your email"
                  placeholderTextColor="#687b82"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  className="flex-1 ml-3 text-base font-grotesk text-[#121516]"
                />
              </View>
            </View>

            <View>
              <Text className="text-base font-grotesk-medium text-[#121516] mb-2">Phone Number</Text>
              <View className="flex-row items-center bg-[#f1f3f4] rounded-lg px-4 py-3">
                <Phone size={20} color="#687b82" />
                <TextInput
                  value={shippingInfo.phone}
                  onChangeText={(text) => setShippingInfo(prev => ({ ...prev, phone: text }))}
                  placeholder="Enter your phone number"
                  placeholderTextColor="#687b82"
                  keyboardType="numeric"
                  maxLength={10}
                  className="flex-1 ml-3 text-base font-grotesk text-[#121516]"
                />
              </View>
            </View>

            <View>
              <Text className="text-base font-grotesk-medium text-[#121516] mb-2">Address</Text>
              <TextInput
                value={shippingInfo.address}
                onChangeText={(text) => setShippingInfo(prev => ({ ...prev, address: text }))}
                placeholder="Enter your complete address"
                placeholderTextColor="#687b82"
                multiline
                numberOfLines={3}
                className="bg-[#f1f3f4] rounded-lg px-4 py-3 text-base font-grotesk text-[#121516]"
                textAlignVertical="top"
              />
            </View>

            <View className="flex-row space-x-3">
              <View className="flex-1">
                <Text className="text-base font-grotesk-medium text-[#121516] mb-2">City</Text>
                <TextInput
                  value={shippingInfo.city}
                  onChangeText={(text) => setShippingInfo(prev => ({ ...prev, city: text }))}
                  placeholder="City"
                  placeholderTextColor="#687b82"
                  className="bg-[#f1f3f4] rounded-lg px-4 py-3 text-base font-grotesk text-[#121516]"
                />
              </View>
              <View className="flex-1">
                <Text className="text-base font-grotesk-medium text-[#121516] mb-2">State</Text>
                <TextInput
                  value={shippingInfo.state}
                  onChangeText={(text) => setShippingInfo(prev => ({ ...prev, state: text }))}
                  placeholder="State"
                  placeholderTextColor="#687b82"
                  className="bg-[#f1f3f4] rounded-lg px-4 py-3 text-base font-grotesk text-[#121516]"
                />
              </View>
            </View>

            <View>
              <Text className="text-base font-grotesk-medium text-[#121516] mb-2">Pincode</Text>
              <TextInput
                value={shippingInfo.pincode}
                onChangeText={(text) => setShippingInfo(prev => ({ ...prev, pincode: text }))}
                placeholder="Enter pincode"
                placeholderTextColor="#687b82"
                keyboardType="numeric"
                maxLength={6}
                className="bg-[#f1f3f4] rounded-lg px-4 py-3 text-base font-grotesk text-[#121516]"
              />
            </View>
          </View>
        </View>

        {/* Order Summary */}
        <View className="px-4 py-6 bg-[#f8f9fa]">
          <Text className="text-xl font-grotesk-bold text-[#121516] mb-4">
            Order Summary
          </Text>

          {items.map((item) => (
            <View key={item.id} className="flex-row justify-between items-center py-2">
              <View className="flex-1">
                <Text className="text-base font-grotesk-medium text-[#121516]">
                  {item.name} x {item.quantity}
                </Text>
                <Text className="text-sm font-grotesk text-[#687b82]">
                  {item.type === 'subscription' ? 'Monthly Rental' : 'One-time Purchase'}
                </Text>
              </View>
              <Text className="text-base font-grotesk-bold text-[#121516]">
                ₹{(item.price * item.quantity).toFixed(2)}
              </Text>
            </View>
          ))}

          <View className="border-t border-[#e1e5e7] mt-4 pt-4">
            <View className="flex-row justify-between items-center py-1">
              <Text className="text-base font-grotesk text-[#687b82]">Subtotal</Text>
              <Text className="text-base font-grotesk text-[#121516]">₹{total.toFixed(2)}</Text>
            </View>
            <View className="flex-row justify-between items-center py-1">
              <Text className="text-base font-grotesk text-[#687b82]">
                Delivery Fee {total > 500 && '(Free for orders above ₹500)'}
              </Text>
              <Text className="text-base font-grotesk text-[#121516]">
                {deliveryFee === 0 ? 'Free' : `₹${deliveryFee.toFixed(2)}`}
              </Text>
            </View>
            <View className="flex-row justify-between items-center py-2 border-t border-[#e1e5e7] mt-2">
              <Text className="text-lg font-grotesk-bold text-[#121516]">Total</Text>
              <Text className="text-lg font-grotesk-bold text-[#121516]">₹{finalTotal.toFixed(2)}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Payment Button */}
      <View className="bg-white border-t border-[#f1f3f4] px-4 py-6">
        <TouchableOpacity
          onPress={handlePayment}
          disabled={loading}
          className={`h-14 rounded-full items-center justify-center flex-row ${
            loading ? 'bg-[#e1e5e7]' : 'bg-[#4fa3c4]'
          }`}
        >
          {loading ? (
            <>
              <ActivityIndicator color="white" size="small" />
              <Text className="text-lg font-grotesk-bold text-white ml-2">
                Processing...
              </Text>
            </>
          ) : (
            <>
              <CreditCard size={24} color="white" />
              <Text className="text-lg font-grotesk-bold text-white ml-2">
                Pay ₹{finalTotal.toFixed(2)}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}