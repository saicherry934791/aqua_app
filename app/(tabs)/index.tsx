import { apiService } from '@/api/api';
import HomeSkeleton from '@/components/skeletons/HomeSkeleton';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigation, useRouter } from 'expo-router';
import { Search, MapPin, Clock, Bell } from 'lucide-react-native';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Dimensions
} from 'react-native';

const { width } = Dimensions.get('window');

const AquaHomeApp = () => {
  const navigation = useNavigation();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const { user } = useAuth();

  useLayoutEffect(() => {
    console.log('user in homescreen ', user);
    navigation.setOptions({
      headerTitle: () => (
        <Text className="text-2xl font-grotesk-bold text-[#121516]">AQUA HOME</Text>
      ),
      headerTitleAlign: 'center',
    });
  }, [navigation]);

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      setLoading(true);

      const response = await apiService.get('/homescreen');

      if (response.success) {
        console.log('data homescreen is ', response.data);
        setProducts(response.data.popularProducts);
        setOrders(response.data.recentOrders);
      }
    } catch (error) {
      console.log('Error loading home data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Component for location not available
  const LocationNotAvailable = () => (
    <View className="flex-1 bg-white items-center justify-center px-4">
      <View className="bg-[#e8f4f8] rounded-2xl p-6 items-center w-full">
        <View className="w-20 h-20 bg-[#4fa3c4] rounded-full items-center justify-center mb-4">
          <MapPin size={40} color="white" />
        </View>

        <Text className="text-2xl font-grotesk-bold text-[#121516] text-center mb-2">
          We're Coming Soon!
        </Text>

        <Text className="text-base text-[#6a7a81] font-grotesk-medium text-center mb-6 leading-relaxed">
          AquaHome services aren't available in your area yet, but we're working hard to expand our reach.
        </Text>

        <View className="bg-white rounded-xl p-4 w-full mb-6">
          <View className="flex-row items-center mb-2">
            <MapPin size={16} color="#4fa3c4" />
            <Text className="text-sm text-[#4fa3c4] font-grotesk-medium ml-2">
              Current Location
            </Text>
          </View>
          <Text className="text-base text-[#121516] font-grotesk-medium">
            {user?.address || 'Chennai, Tamil Nadu'}
          </Text>
        </View>
      </View>
    </View>
  );


  if (loading) {
    return <HomeSkeleton />;
  }

  // Check if user has no franchise area assigned
  if (!user?.franchiseAreaId) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <LocationNotAvailable />
      </SafeAreaView>
    );
  }

  // Regular home screen for users with franchise area
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View className="px-4 py-3">
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/products')}
            className="flex-row h-14 bg-[#f1f3f4] rounded-xl items-center"
          >
            <View className="pl-4 pr-2">
              <Search size={24} color="#607e8a" />
            </View>
            <Text className="flex-1 text-[#607e8a] text-base px-2 font-grotesk-medium">
              Search products
            </Text>
          </TouchableOpacity>
        </View>

        {/* Popular Products */}
        <Text className="text-3xl font-grotesk-bold text-[#121516] px-4 pb-3 pt-5">
          Popular Products
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="pl-4"
          contentContainerStyle={{ paddingRight: 16 }}
        >
          {products.map((product) => (
            <TouchableOpacity
              key={product.id}
              onPress={() => router.push(`/products/${product.id}`)}
              className="w-60 mr-3"
            >
              <Image
                source={{ uri: product.image }}
                className="w-full aspect-square rounded-xl mb-4"
                resizeMode="cover"
              />
              <View className="gap-1">
                <Text className="text-xl font-grotesk-bold text-[#121516]">
                  {product.name}
                </Text>
                {/* <Text className="text-sm text-[#6a7a81] font-grotesk-medium">
                  {product.description}
                </Text> */}
                <Text className="text-lg font-grotesk-bold text-[#4fa3c4] mt-2">
                  ₹{product.price.toLocaleString()}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Coupons & Promotions */}
        <Text className="text-3xl font-grotesk-bold text-[#121516] px-4 pb-3 pt-12">
          Coupons & Promotions
        </Text>
        <View className="p-4">
          <View className="flex-row items-stretch justify-between gap-4 rounded-xl bg-[#e8f4f8] p-4">
            <View className="flex-[2] gap-4">
              <View className="gap-1">
                <Text className="text-sm text-[#4fa3c4] font-grotesk-medium">
                  Limited Time Offer
                </Text>
                <Text className="text-lg font-grotesk-bold text-[#121516]">
                  Save 20% on Your Next Filter
                </Text>
                <Text className="text-sm text-[#6a7a81]">
                  Use code: FRESH20 at checkout
                </Text>
              </View>
              <TouchableOpacity className="bg-[#4fa3c4] px-4 py-2 rounded-full self-start">
                <Text className="text-base font-grotesk-medium text-white">
                  Shop Now
                </Text>
              </TouchableOpacity>
            </View>
            <Image
              source={{
                uri: 'https://images.pexels.com/photos/1001897/pexels-photo-1001897.jpeg?auto=compress&cs=tinysrgb&w=400'
              }}
              className="flex-1 h-full rounded-xl min-h-[100px]"
              resizeMode="cover"
            />
          </View>
        </View>

        <View className="p-4">
          <View className="flex-row items-stretch justify-between gap-4 rounded-xl bg-[#f8f4e8] p-4">
            <View className="flex-[2] gap-4">
              <View className="gap-1">
                <Text className="text-sm text-[#d4a574] font-grotesk-medium">
                  New Customer Special
                </Text>
                <Text className="text-lg font-grotesk-bold text-[#121516]">
                  Free Installation & Setup
                </Text>
                <Text className="text-sm text-[#6a7a81]">
                  For all new AquaHome purchases
                </Text>
              </View>
              <TouchableOpacity className="bg-[#d4a574] px-4 py-2 rounded-full self-start">
                <Text className="text-base font-grotesk-medium text-white">
                  Learn More
                </Text>
              </TouchableOpacity>
            </View>
            <Image
              source={{
                uri: 'https://images.pexels.com/photos/3964736/pexels-photo-3964736.jpeg?auto=compress&cs=tinysrgb&w=400'
              }}
              className="flex-1 h-full rounded-xl min-h-[100px]"
              resizeMode="cover"
            />
          </View>
        </View>

        {/* Recent Orders */}
        {orders.length > 0 && (
          <>
            <Text className="text-3xl font-grotesk-bold text-[#121516] px-4 pb-3 pt-12">
              Recent Orders
            </Text>
            {orders.map((order) => (
              <TouchableOpacity
                key={order.id}
                onPress={() => router.push(`/orders/${order.id}`)}
                className="flex-row items-center gap-4 bg-white px-4 min-h-[72px] py-2 justify-between"
              >
                <View className="flex-row items-center gap-4 flex-1">
                  <Image
                    source={{ uri: order.items[0]?.image }}
                    className="w-14 h-14 rounded-lg"
                    resizeMode="cover"
                  />
                  <View className="flex-1 justify-center gap-0.5">
                    <Text className="text-xl font-grotesk-bold text-[#121516] leading-normal">
                      {order.items[0]?.name}
                    </Text>
                    <Text className="text-base text-[#6a7a81] font-grotesk-medium leading-normal">
                      Order #{order.id} • {order.status}
                    </Text>
                  </View>
                </View>
                <Text className="text-xl font-grotesk-bold text-[#121516]">
                  ₹{order.total.toLocaleString()}
                </Text>
              </TouchableOpacity>
            ))}
          </>
        )}

        {/* Bottom spacing */}
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default AquaHomeApp;