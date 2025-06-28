import React, { useLayoutEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useNavigation, useRouter } from 'expo-router';
import { Minus, Plus, Trash2, ShoppingCart } from 'lucide-react-native';
import { useCart } from '@/contexts/CartContext';

export default function CartScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const { state, removeFromCart, updateQuantity, clearCart } = useCart();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <Text className="text-2xl font-grotesk-bold text-[#121516]">CART</Text>
      ),
      headerTitleAlign: 'center',
      headerRight: () => (
        state.items.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              Alert.alert(
                'Clear Cart',
                'Are you sure you want to remove all items from your cart?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Clear', style: 'destructive', onPress: clearCart },
                ]
              );
            }}
            className="mr-4"
          >
            <Trash2 size={24} color="#ff4444" />
          </TouchableOpacity>
        )
      ),
    });
  }, [navigation, state.items.length, clearCart]);

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity === 0) {
      Alert.alert(
        'Remove Item',
        'Are you sure you want to remove this item from your cart?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Remove', style: 'destructive', onPress: () => removeFromCart(id) },
        ]
      );
    } else {
      updateQuantity(id, newQuantity);
    }
  };

  const getSubscriptionPlanText = (plan?: string) => {
    switch (plan) {
      case 'monthly': return 'Monthly Plan';
      case 'quarterly': return 'Quarterly Plan';
      case 'yearly': return 'Yearly Plan';
      default: return '';
    }
  };

  const getSubscriptionDiscount = (plan?: string) => {
    switch (plan) {
      case 'quarterly': return 10;
      case 'yearly': return 20;
      default: return 0;
    }
  };

  if (state.items.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center px-4">
          <View className="w-32 h-32 bg-[#f1f3f4] rounded-full items-center justify-center mb-6">
            <ShoppingCart size={48} color="#687b82" />
          </View>
          <Text className="text-2xl font-grotesk-bold text-[#121516] mb-2 text-center">
            Your cart is empty
          </Text>
          <Text className="text-lg font-grotesk text-[#687b82] mb-8 text-center">
            Add some products to get started
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/products')}
            className="bg-[#4fa3c4] px-8 py-4 rounded-full"
          >
            <Text className="text-lg font-grotesk-bold text-white">
              Browse Products
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-4 py-4">
          {state.items.map((item) => {
            const discount = getSubscriptionDiscount(item.subscriptionPlan);
            const discountedPrice = discount > 0 ? item.price * (1 - discount / 100) : item.price;
            
            return (
              <View key={`${item.id}-${item.type}-${item.subscriptionPlan}`} className="bg-white border border-[#f1f3f4] rounded-xl p-4 mb-4">
                <View className="flex-row">
                  <Image
                    source={{ uri: item.image }}
                    className="w-20 h-20 rounded-lg"
                    resizeMode="cover"
                  />
                  <View className="flex-1 ml-4">
                    <View className="flex-row justify-between items-start">
                      <View className="flex-1">
                        <Text className="text-lg font-grotesk-bold text-[#121516] mb-1">
                          {item.name}
                        </Text>
                        <View className="flex-row items-center mb-2">
                          <View className={`px-2 py-1 rounded-full ${
                            item.type === 'subscription' ? 'bg-[#e8f4f8]' : 'bg-[#f1f3f4]'
                          }`}>
                            <Text className={`text-xs font-grotesk-medium ${
                              item.type === 'subscription' ? 'text-[#4fa3c4]' : 'text-[#687b82]'
                            }`}>
                              {item.type === 'subscription' ? 'Subscription' : 'One-time Purchase'}
                            </Text>
                          </View>
                        </View>
                        {item.subscriptionPlan && (
                          <Text className="text-sm font-grotesk text-[#687b82] mb-1">
                            {getSubscriptionPlanText(item.subscriptionPlan)}
                          </Text>
                        )}
                        <View className="flex-row items-center">
                          {discount > 0 && (
                            <Text className="text-sm font-grotesk text-[#687b82] line-through mr-2">
                              ₹{item.price.toFixed(2)}
                            </Text>
                          )}
                          <Text className="text-lg font-grotesk-bold text-[#121516]">
                            ₹{discountedPrice.toFixed(2)}
                          </Text>
                          {discount > 0 && (
                            <View className="bg-[#4fa3c4] px-2 py-1 rounded ml-2">
                              <Text className="text-xs font-grotesk-bold text-white">
                                {discount}% OFF
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                      <TouchableOpacity
                        onPress={() => removeFromCart(item.id)}
                        className="p-2"
                      >
                        <Trash2 size={20} color="#ff4444" />
                      </TouchableOpacity>
                    </View>
                    
                    <View className="flex-row items-center justify-between mt-3">
                      <View className="flex-row items-center bg-[#f1f3f4] rounded-full">
                        <TouchableOpacity
                          onPress={() => handleQuantityChange(item.id, item.quantity - 1)}
                          className="w-10 h-10 items-center justify-center"
                        >
                          <Minus size={16} color="#121516" />
                        </TouchableOpacity>
                        <Text className="text-lg font-grotesk-bold text-[#121516] mx-4">
                          {item.quantity}
                        </Text>
                        <TouchableOpacity
                          onPress={() => handleQuantityChange(item.id, item.quantity + 1)}
                          className="w-10 h-10 items-center justify-center"
                        >
                          <Plus size={16} color="#121516" />
                        </TouchableOpacity>
                      </View>
                      <Text className="text-lg font-grotesk-bold text-[#121516]">
                        ₹{(discountedPrice * item.quantity).toFixed(2)}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Cart Summary */}
      <View className="bg-white border-t border-[#f1f3f4] px-4 py-6">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-lg font-grotesk text-[#687b82]">
            Subtotal ({state.itemCount} items)
          </Text>
          <Text className="text-xl font-grotesk-bold text-[#121516]">
            ₹{state.total.toFixed(2)}
          </Text>
        </View>
        
        <TouchableOpacity
          onPress={() => router.push('/checkout')}
          className="bg-[#4fa3c4] h-14 rounded-full items-center justify-center"
        >
          <Text className="text-lg font-grotesk-bold text-white">
            Proceed to Checkout
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}