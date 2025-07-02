import { apiService } from '@/api/api';
import ProductSkeleton from '@/components/skeltons/ProductsSkeleton';
import SkeletonWrapper from '@/components/skeltons/SkeletonWrapper';
import { useNavigation } from 'expo-router';
import { Search } from 'lucide-react-native';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

const ProductsScreen = () => {
  const navigation = useNavigation();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/products')
      console.log('products are in fetch ',JSON.stringify(response.data.products))
      if (response.success) {
        setProducts(response.data.products);
      }
    } catch (err) {
      console.log('Fetch failed', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts();
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <Text className="text-2xl font-grotesk-bold text-[#121516]">PRODUCTS</Text>
      ),
      headerTitleAlign: 'center',
    });
  }, [navigation]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = products?.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1 bg-white px-4">
        <SkeletonWrapper
          loading={loading}
          refreshing={refreshing}
          onRefresh={onRefresh}
          skeleton={<ProductSkeleton />}
          stickyHeaderIndices={[0]}
        >
          {/* Search Bar (Sticky) */}
          <View className="py-3 bg-white z-[999]">
            <View className="flex-row h-14 bg-[#f1f3f4] rounded-xl items-center px-4">
              <Search size={24} color="#607e8a" />
              <TextInput
                placeholder="Search products"
                placeholderTextColor="#607e8a"
                className="flex-1 text-[#111618] text-base px-2 font-grotesk-medium"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>

          <View className="flex-row flex-wrap justify-between pb-20">
            {filteredProducts.map((product) => (
              <Pressable
                key={product.id}
                className="w-[48%] mb-6"
                onPress={() =>
                  navigation.navigate('products/[id]', { id: product.id })
                }
              >
                <View className="mb-3">
                  <Animated.Image
               
                    source={{ uri: product.images[0] }}
                    className="w-full aspect-square rounded-xl"
                    resizeMode="cover"
                  />
                </View>
                <View>
                  <Text className="text-[#111618] font-grotesk-bold text-lg mb-1">
                    {product.name}
                  </Text>
                  {/* <Text className="text-[#607e8a] font-grotesk text-sm mb-2">
                    {product.description}
                  </Text> */}
                  <Text className="text-[#4fa3c4] font-grotesk-bold text-lg">
                    ₹{product.rentPrice}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>

          {filteredProducts.length === 0 && !loading && (
            <View className="flex-1 justify-center items-center py-20">
              <Text className="text-xl font-grotesk-bold text-[#121516] mb-2">
                No products found
              </Text>
              <Text className="text-base font-grotesk text-[#687b82] text-center">
                Try adjusting your search terms
              </Text>
            </View>
          )}
        </SkeletonWrapper>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default ProductsScreen;