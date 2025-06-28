import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, Text, View, TouchableOpacity } from 'react-native';
import { Grid3x2 as Grid3X3, Grid3x2 as Grid3X3Icon, Chrome as Home, ShoppingCart, ShoppingCart as ShoppingCartIcon, User, User as UserIcon } from 'lucide-react-native';

import { HapticTab } from '@/components/HapticTab';
import HomeIcon from '@/components/icons/HomeIcon';
import HomeActiveIcon from '@/components/icons/HomeActiveIcon';
import ProductsActiveIcon from '@/components/icons/ProductsActiveIcon';
import ProductsIcon from '@/components/icons/ProductsIcon';
import ProfileActiveIcon from '@/components/icons/ProfileActiveIcon';
import ProfileIcon from '@/components/icons/ProfileIcon';
import OrdersIcon from '@/components/icons/OrdersIcon';
import OrdersActiveIcon from '@/components/icons/OrdersActiveIcon';
import { useCart } from '@/contexts/CartContext';
import { useRouter } from 'expo-router';

export default function TabLayout() {
  const { state } = useCart();
  const router = useRouter();

  const CartHeaderButton = () => (
    <TouchableOpacity
      onPress={() => router.push('/cart')}
      style={{ marginRight: 16, position: 'relative' }}
    >
      <ShoppingCart size={24} color="#121516" />
      {state.itemCount > 0 && (
        <View style={{
          position: 'absolute',
          top: -8,
          right: -8,
          backgroundColor: '#ff4444',
          borderRadius: 10,
          minWidth: 20,
          height: 20,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <Text style={{
            color: 'white',
            fontSize: 12,
            fontWeight: 'bold',
          }}>
            {state.itemCount > 99 ? '99+' : state.itemCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: 'white',
          shadowColor: 'transparent',
          elevation: 0,
          borderBottomWidth: 0,
        },
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#f0f3f5',
          paddingBottom: Platform.select({ ios: 20, default: 12 }),
          paddingTop: 8,
          height: Platform.select({ ios: 90, default: 70 }),
          ...Platform.select({
            ios: {
              position: 'absolute',
            },
            default: {},
          }),
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerShown: true,
          headerRight: () => <CartHeaderButton />,
          tabBarIcon: ({ color, size, focused }) =>
            focused ? (
              <HomeActiveIcon />
            ) : (
              <HomeIcon />
            ),
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: 'Products',
          headerRight: () => <CartHeaderButton />,
          tabBarIcon: ({ color, size, focused }) =>
            focused ? (
              <ProductsActiveIcon />
            ) : (
              <ProductsIcon />
            ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          tabBarIcon: ({ color, size, focused }) =>
            focused ? (
              <OrdersActiveIcon/>
            ) : (
              <OrdersIcon/>
            ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          tabBarIcon: ({ color, size, focused }) =>
            focused ? (
              <ProfileActiveIcon />
            ) : (
              <ProfileIcon />
            ),
        }}
      />
    </Tabs>
  );
}