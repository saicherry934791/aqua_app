import React, { useEffect, useLayoutEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native';
import { Search } from 'lucide-react-native';
import { useNavigation } from 'expo-router';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Animated from 'react-native-reanimated';
import SkeletonWrapper from '@/components/skeltons/SkeletonWrapper';
import ProductSkeleton from '@/components/skeltons/ProductsSkeleton';

const ProductsScreen = () => {
  const navigation = useNavigation();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProducts = async () => {
    try {
      // Simulate network call
      setLoading(true);
      const res = await new Promise((resolve) =>
        setTimeout(() => resolve(MOCK_PRODUCTS), 1000)
      );
      setProducts(res);
    } catch (err) {
      console.error('Fetch failed', err);
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

  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1 bg-white px-4">


        {/* Products */}
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
              />
            </View>
          </View>

          <View className="flex-row flex-wrap justify-between pb-20">
            {products.map((product) => (
              <Pressable
                key={product.id}
                className="w-[48%] mb-6"
                onPress={() =>
                  navigation.navigate('products/[id]', { id: product.id })
                }
              >
                <View className="mb-3">
                  <Animated.Image
                    sharedTransitionTag="productImage"
                    source={{ uri: product.image }}
                    className="w-full aspect-square rounded-xl"
                    resizeMode="cover"
                  />
                </View>
                <View>
                  <Text className="text-[#111618] font-grotesk-bold text-lg mb-1">
                    {product.name}
                  </Text>
                  <Text className="text-[#607e8a] font-grotesk text-sm">
                    {product.description}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>

        </SkeletonWrapper>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const MOCK_PRODUCTS = [
  {
    id: 1,
    name: 'AquaPure 500',
    description: 'Compact, 5-stage filtration',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDWRIe6YddTT8igQx6jGJ672DgF50_CHFkACKphjZ6cyGhAgUrcwYydxKxDuORzjDMhmxSK4WvL4nKGKaIA_mQJDrSKMO4a7nOY45RNEHyg8xrQobJp9Xn8-D19oaVNyLTmmQVXkJZkKcw1rV1jPTimwxCvckd6hf_p6LW3qLj-Ll3RiK6Xm3r3PxANRXNkgUX2lPTbrYGMFXvbJjxa-8-2xdpIZDEcZLE-pzjunUUD8eIR-amq9f9OYL3L3Y6qfkGKqRhFZbHlbQ'
  },
  {
    id: 2,
    name: 'AquaStream 750',
    description: 'High capacity, 7-stage filtration',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDtKAxQ9mo2SlCwBPr_kzhj0rOhwt2nUPWTC7UEPblbBClJUVP3-d1CD--dRCxvBue6aHudxBlYPbkUWEEdBzCbFbxU6a0kbPY5YZN-TTp8uim5daABjgt3m_4hQYhGfblor6py4QtXIGxhlvIxnQ07l70EaQh46Tng6fhRfVR16MXPm4-59oF4hi89pI3UnDkQdOIDgss882N2CmnuSRBQAc6xpMbc0TUrMJVqxGMel2_pDHlw2JRpoKlxfppfwwYOUV_JzZoA_Q'
  },
  {
    id: 3,
    name: 'AquaClear 1000',
    description: 'Advanced, 9-stage filtration',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBrNBfI5vk0EAlvSVvFOTiVOXnx0Fm8aGJsHf3WZ2Mxe_S254ILrLxP_yW2Tr_MeGVkWkVNQrx3DYUaowaxCuDkQJI-05ctzLWTX64ac1UcrfsJCmJ51DHGcwOr31bfhV4cVR3l1NzJ6okcfQzohXE4NY9iFDRV76k3PU7PxSXzz39FR5_H_Km5gIOoNl5kwuPdkpQPbxn3kLsrPcrqDGcP2fW7hVbUJArEQtscnh15Jv_Z_K35r06Puz9JJ5tauHOYAojzwoiSmw'
  },
  {
    id: 4,
    name: 'AquaLife 1500',
    description: 'Ultra-pure, 11-stage filtration',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAMJmZqe1R89JWS6csjEv0NRq2cNgDA0D4GDMhx9eI7mJTvxiHk7UAgOe8MyvmyqknzZ4x_5Koyk7aLuV5ak0wlmNWtvAmKC3byjtZHBCeAmF6Mvc0REDApNl-cbtrhThBhIaOXp8v8-vM1npCVLhg87EVVKr7OYJvHoxWwqNB2YY21Z8_hq4uHjV0con7pYoVIJ8iiXVekCk3wAjBuzmjkRCpoSO71-HPTZpqUZjUeccggH5hRMJRIuSBNk2SukSqXhRHdDlAQKA'
  },
  {
    id: 5,
    name: 'AquaLife 1500',
    description: 'Ultra-pure, 11-stage filtration',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAMJmZqe1R89JWS6csjEv0NRq2cNgDA0D4GDMhx9eI7mJTvxiHk7UAgOe8MyvmyqknzZ4x_5Koyk7aLuV5ak0wlmNWtvAmKC3byjtZHBCeAmF6Mvc0REDApNl-cbtrhThBhIaOXp8v8-vM1npCVLhg87EVVKr7OYJvHoxWwqNB2YY21Z8_hq4uHjV0con7pYoVIJ8iiXVekCk3wAjBuzmjkRCpoSO71-HPTZpqUZjUeccggH5hRMJRIuSBNk2SukSqXhRHdDlAQKA'
  }, {
    id: 6,
    name: 'AquaPure 500',
    description: 'Compact, 5-stage filtration',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDWRIe6YddTT8igQx6jGJ672DgF50_CHFkACKphjZ6cyGhAgUrcwYydxKxDuORzjDMhmxSK4WvL4nKGKaIA_mQJDrSKMO4a7nOY45RNEHyg8xrQobJp9Xn8-D19oaVNyLTmmQVXkJZkKcw1rV1jPTimwxCvckd6hf_p6LW3qLj-Ll3RiK6Xm3r3PxANRXNkgUX2lPTbrYGMFXvbJjxa-8-2xdpIZDEcZLE-pzjunUUD8eIR-amq9f9OYL3L3Y6qfkGKqRhFZbHlbQ'
  },
  {
    id: 7,
    name: 'AquaStream 750',
    description: 'High capacity, 7-stage filtration',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDtKAxQ9mo2SlCwBPr_kzhj0rOhwt2nUPWTC7UEPblbBClJUVP3-d1CD--dRCxvBue6aHudxBlYPbkUWEEdBzCbFbxU6a0kbPY5YZN-TTp8uim5daABjgt3m_4hQYhGfblor6py4QtXIGxhlvIxnQ07l70EaQh46Tng6fhRfVR16MXPm4-59oF4hi89pI3UnDkQdOIDgss882N2CmnuSRBQAc6xpMbc0TUrMJVqxGMel2_pDHlw2JRpoKlxfppfwwYOUV_JzZoA_Q'
  },
  {
    id: 8,
    name: 'AquaClear 1000',
    description: 'Advanced, 9-stage filtration',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBrNBfI5vk0EAlvSVvFOTiVOXnx0Fm8aGJsHf3WZ2Mxe_S254ILrLxP_yW2Tr_MeGVkWkVNQrx3DYUaowaxCuDkQJI-05ctzLWTX64ac1UcrfsJCmJ51DHGcwOr31bfhV4cVR3l1NzJ6okcfQzohXE4NY9iFDRV76k3PU7PxSXzz39FR5_H_Km5gIOoNl5kwuPdkpQPbxn3kLsrPcrqDGcP2fW7hVbUJArEQtscnh15Jv_Z_K35r06Puz9JJ5tauHOYAojzwoiSmw'
  },
  {
    id: 9,
    name: 'AquaLife 1500',
    description: 'Ultra-pure, 11-stage filtration',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAMJmZqe1R89JWS6csjEv0NRq2cNgDA0D4GDMhx9eI7mJTvxiHk7UAgOe8MyvmyqknzZ4x_5Koyk7aLuV5ak0wlmNWtvAmKC3byjtZHBCeAmF6Mvc0REDApNl-cbtrhThBhIaOXp8v8-vM1npCVLhg87EVVKr7OYJvHoxWwqNB2YY21Z8_hq4uHjV0con7pYoVIJ8iiXVekCk3wAjBuzmjkRCpoSO71-HPTZpqUZjUeccggH5hRMJRIuSBNk2SukSqXhRHdDlAQKA'
  },
  {
    id: 10,
    name: 'AquaLife 1500',
    description: 'Ultra-pure, 11-stage filtration',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAMJmZqe1R89JWS6csjEv0NRq2cNgDA0D4GDMhx9eI7mJTvxiHk7UAgOe8MyvmyqknzZ4x_5Koyk7aLuV5ak0wlmNWtvAmKC3byjtZHBCeAmF6Mvc0REDApNl-cbtrhThBhIaOXp8v8-vM1npCVLhg87EVVKr7OYJvHoxWwqNB2YY21Z8_hq4uHjV0con7pYoVIJ8iiXVekCk3wAjBuzmjkRCpoSO71-HPTZpqUZjUeccggH5hRMJRIuSBNk2SukSqXhRHdDlAQKA'
  },
];


export default ProductsScreen;
