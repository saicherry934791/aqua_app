import React, { useLayoutEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image } from 'react-native';
import { ArrowLeft, Search, ChevronDown, Home, Grid3x3, ShoppingCart, User } from 'lucide-react-native';
import { Link, useNavigation } from 'expo-router';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Animated from 'react-native-reanimated';

const ProductsScreen = () => {

  const navigation = useNavigation();



  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (

        <Text className="text-2xl font-grotesk-bold text-[#121516]">PRODUCTS</Text>

      ),
      headerTitleAlign: 'center',
    });
  }, [navigation]);
  const products = [
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

  const filters = ['Capacity', 'Filtration', 'Price'];

  // useLayoutEffect(() => {
  //   navigation.setOptions({
  //     headerTitle: 'Products',
  //     headerRight: () => (
  //       <TouchableOpacity onPress={() => navigation.navigate('cart')}>
  //         <ShoppingCart size={24} color="#111618" />
  //       </TouchableOpacity>
  //     )
  //   })
  // }, [])

  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-between">
          {/* Header */}
          <View>


            {/* Search Bar */}
            <View className="px-4 py-3">
              <View className="flex-row h-14 bg-[#f1f3f4] rounded-xl items-center">
                <View className="pl-4 pr-2">
                  <Search size={24} color="#607e8a" />
                </View>
                <TextInput
                  placeholder="Search products"
                  placeholderTextColor="#607e8a"
                  className="flex-1 text-[#111618] text-base px-2 font-grotesk-medium"
                />
              </View>
            </View>

            {/* Filter Buttons */}
            {/* <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="px-3 py-3"
            >
              <View className="flex-row gap-3">
                {filters.map((filter, index) => (
                  <TouchableOpacity
                    key={index}
                    className="flex-row items-center bg-[#f0f3f5] rounded-xl px-4 py-2 h-8"
                  >
                    <Text className="text-[#111618] text-sm font-medium mr-2">{filter}</Text>
                    <ChevronDown size={20} color="#111618" />
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView> */}

            {/* Products Grid */}
            <ScrollView className="px-4">
              <View className="flex-row flex-wrap justify-between">
                {products.map((product) => (

                  <TouchableOpacity key={product.id} className="w-[48%] mb-6" onPress={() => navigation.navigate('products/[id]', { id: product.id })}>
                    <View className="mb-3">
                      <Animated.Image
                        sharedTransitionTag='productImage'
                        source={{ uri: product.image }}
                        className="w-full aspect-square rounded-xl"
                        resizeMode="cover"
                      />
                    </View>
                    <View>
                      <Text className="text-[#111618] font-grotesk-bold text-lg  mb-1">
                        {product.name}
                      </Text>
                      <Text className="text-[#607e8a] font-grotesk  text-">
                        {product.description}
                      </Text>
                    </View>
                  </TouchableOpacity>

                ))}
              </View>
            </ScrollView>
          </View>



        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default ProductsScreen;