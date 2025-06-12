import { View, Text, Platform } from 'react-native'
import React, { useEffect, useLayoutEffect } from 'react'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import OrdersScreen from './index';
import ServicesScreen from './services';
import { HapticTab } from '@/components/HapticTab';
import SubscriptionsScreen from './subscriptions';
import { useLocalSearchParams, useNavigation } from 'expo-router';


const Tab = createMaterialTopTabNavigator();


const _layout = () => {
    const { tab } = useLocalSearchParams();
    const navigation = useNavigation();
    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: () => (

                <Text className="text-2xl font-grotesk-bold text-[#121516]">ORDERS</Text>

            ),
            headerTitleAlign: 'center',
        });
    }, [navigation]);

    useEffect(() => {
        if (tab && typeof tab === 'string') {
            navigation.navigate(tab); // this should match the name in Tab.Screen
            console.log('tab here ', tab);
        }
    }, [tab]);
    return (
        <Tab.Navigator
            screenOptions={{
                tabBarScrollEnabled: true,
                tabBarActiveTintColor: '#121517', // active tab text color
                tabBarInactiveTintColor: '#121517', // inactive tab text color
                tabBarIndicatorStyle: {
                    backgroundColor: '#121517', // underline color for active tab
                    height: 3,
                    borderRadius: 999,
                },
                tabBarLabelStyle: {
                    fontSize: 18,
                    fontFamily: 'SpaceGrotesk_600SemiBold', // 👈 use your custom font here
                    textTransform: 'none',
                },
                tabBarStyle: {
                    backgroundColor: 'white',
                    borderBottomWidth: 1,
                    borderColor: '#dde2e4',
                    elevation: 0,
                },
                tabBarItemStyle: {
                    width: 'auto',           // ✅ Don’t force equal width
                },
            }}
        >
            <Tab.Screen name="Orders" component={OrdersScreen} />
            <Tab.Screen name="Subscriptions" component={SubscriptionsScreen} />
            <Tab.Screen name="Services" component={ServicesScreen} />
        </Tab.Navigator>

    )
}

export default _layout