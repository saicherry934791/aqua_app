import React, { useLayoutEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useRouter, useLocalSearchParams } from 'expo-router';
import { CircleCheck as CheckCircle, Package, Chrome as Home, FileText } from 'lucide-react-native';

export default function OrderConfirmationScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const { paymentId, orderId, amount } = useLocalSearchParams();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <Text className="text-2xl font-grotesk-bold text-[#121516]">ORDER CONFIRMED</Text>
      ),
      headerTitleAlign: 'center',
      headerLeft: () => null, // Remove back button
    });
  }, [navigation]);

  const orderNumber = `AH${Date.now().toString().slice(-6)}`;
  const estimatedDelivery = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Success Header */}
        <View className="items-center px-4 py-8">
          <View className="w-24 h-24 bg-[#e8f5e8] rounded-full items-center justify-center mb-6">
            <CheckCircle size={48} color="#4caf50" />
          </View>
          <Text className="text-3xl font-grotesk-bold text-[#121516] text-center mb-2">
            Order Confirmed!
          </Text>
          <Text className="text-lg font-grotesk text-[#687b82] text-center mb-6">
            Thank you for your purchase. Your order has been successfully placed.
          </Text>
        </View>

        {/* Order Details */}
        <View className="px-4 py-6 bg-[#f8f9fa] mx-4 rounded-xl mb-6">
          <Text className="text-xl font-grotesk-bold text-[#121516] mb-4">
            Order Details
          </Text>
          
          <View className="space-y-3">
            <View className="flex-row justify-between items-center">
              <Text className="text-base font-grotesk text-[#687b82]">Order Number</Text>
              <Text className="text-base font-grotesk-bold text-[#121516]">#{orderNumber}</Text>
            </View>
            
            <View className="flex-row justify-between items-center">
              <Text className="text-base font-grotesk text-[#687b82]">Payment ID</Text>
              <Text className="text-base font-grotesk-bold text-[#121516]">
                {typeof paymentId === 'string' ? paymentId.slice(-8) : 'N/A'}
              </Text>
            </View>
            
            <View className="flex-row justify-between items-center">
              <Text className="text-base font-grotesk text-[#687b82]">Amount Paid</Text>
              <Text className="text-base font-grotesk-bold text-[#121516]">
                ₹{typeof amount === 'string' ? parseFloat(amount).toFixed(2) : '0.00'}
              </Text>
            </View>
            
            <View className="flex-row justify-between items-center">
              <Text className="text-base font-grotesk text-[#687b82]">Order Date</Text>
              <Text className="text-base font-grotesk-bold text-[#121516]">
                {new Date().toLocaleDateString('en-IN')}
              </Text>
            </View>
          </View>
        </View>

        {/* Delivery Information */}
        <View className="px-4 py-6 bg-[#e8f4f8] mx-4 rounded-xl mb-6">
          <View className="flex-row items-center mb-4">
            <Package size={24} color="#4fa3c4" />
            <Text className="text-xl font-grotesk-bold text-[#121516] ml-2">
              Delivery Information
            </Text>
          </View>
          
          <Text className="text-base font-grotesk text-[#687b82] mb-2">
            Estimated Delivery Date
          </Text>
          <Text className="text-lg font-grotesk-bold text-[#121516] mb-4">
            {estimatedDelivery}
          </Text>
          
          <Text className="text-sm font-grotesk text-[#687b82]">
            You will receive a tracking number via SMS and email once your order is shipped.
          </Text>
        </View>

        {/* What's Next */}
        <View className="px-4 py-6">
          <Text className="text-xl font-grotesk-bold text-[#121516] mb-4">
            What's Next?
          </Text>
          
          <View className="space-y-4">
            <View className="flex-row items-start">
              <View className="w-8 h-8 bg-[#4fa3c4] rounded-full items-center justify-center mr-3 mt-1">
                <Text className="text-white font-grotesk-bold text-sm">1</Text>
              </View>
              <View className="flex-1">
                <Text className="text-base font-grotesk-bold text-[#121516] mb-1">
                  Order Processing
                </Text>
                <Text className="text-sm font-grotesk text-[#687b82]">
                  We're preparing your order for shipment. This usually takes 1-2 business days.
                </Text>
              </View>
            </View>
            
            <View className="flex-row items-start">
              <View className="w-8 h-8 bg-[#4fa3c4] rounded-full items-center justify-center mr-3 mt-1">
                <Text className="text-white font-grotesk-bold text-sm">2</Text>
              </View>
              <View className="flex-1">
                <Text className="text-base font-grotesk-bold text-[#121516] mb-1">
                  Shipping
                </Text>
                <Text className="text-sm font-grotesk text-[#687b82]">
                  Your order will be shipped and you'll receive tracking information.
                </Text>
              </View>
            </View>
            
            <View className="flex-row items-start">
              <View className="w-8 h-8 bg-[#4fa3c4] rounded-full items-center justify-center mr-3 mt-1">
                <Text className="text-white font-grotesk-bold text-sm">3</Text>
              </View>
              <View className="flex-1">
                <Text className="text-base font-grotesk-bold text-[#121516] mb-1">
                  Delivery
                </Text>
                <Text className="text-sm font-grotesk text-[#687b82]">
                  Your AquaHome products will be delivered to your doorstep.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Support Information */}
        <View className="px-4 py-6 bg-[#f8f9fa] mx-4 rounded-xl mb-8">
          <Text className="text-lg font-grotesk-bold text-[#121516] mb-3">
            Need Help?
          </Text>
          <Text className="text-base font-grotesk text-[#687b82] mb-4">
            If you have any questions about your order, feel free to contact our customer support team.
          </Text>
          <TouchableOpacity className="bg-[#4fa3c4] py-3 px-6 rounded-full self-start">
            <Text className="text-base font-grotesk-bold text-white">
              Contact Support
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View className="bg-white border-t border-[#f1f3f4] px-4 py-6">
        <View className="flex-row space-x-3">
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/orders')}
            className="flex-1 bg-[#f1f3f4] h-14 rounded-full items-center justify-center flex-row"
          >
            <FileText size={20} color="#121516" />
            <Text className="text-base font-grotesk-bold text-[#121516] ml-2">
              View Orders
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/')}
            className="flex-1 bg-[#4fa3c4] h-14 rounded-full items-center justify-center flex-row"
          >
            <Home size={20} color="white" />
            <Text className="text-base font-grotesk-bold text-white ml-2">
              Continue Shopping
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}