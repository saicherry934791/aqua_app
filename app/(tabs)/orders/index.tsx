import React, { useLayoutEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Image,
} from 'react-native';
import { useNavigation } from 'expo-router';

export default function OrdersScreen() {

    const navigation = useNavigation();
   

    const orders = [
        {
            id: 1,
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDI2Y2UJ03ygEWrin5ev9-QEeJCu3JI59KBLIwXCfzEWvUEoL6AqRcjSV3MJxYmeDXc529dh5ayN8WvAHZN9LflMdJUrpTjjLAxOc8WzBRYJgJzt3_aaiDrfir5EhPwuDx7nfKYktMy6GHc2iQ04ZLUASZFCbt7afk2m76U55MxJKNABappth9Go4XCMP1ptwdxqb4gzmz7Atl-B0FB5h0XgeyH1YHPXWMzo_yKUsaCbRyl1lb-CQgffpzyT5-Q7qgvFJxvVC1w7w',
            name: 'AquaHome Water Purifier',
            status: 'Shipped',
            orderNumber: '#123456',
            price: '$299.99'
        },
        {
            id: 2,
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC57u2ZwtDGJGKk0YZUS3y1twH9YzNDIFCR-dYHLepgrWNwlgRKkMtSfxf-aNgvig6j8lQe1rjLLw65Fuoz17e4i6_9PMIKeqiysBuOvYM2XxnvJYhZuNKQ2SXEhxv2P-V3lshBTbC4PBHEL9rexsuZpBw0Q82diziO2PILE_vHW6Hi7rlm2vGCzMV1HATvJpqlKKvFUfw1sM6Tvo0aapa9sroG6wVxRPnJP8ZgBR4rmmoYLAAmMYvGCPBdMqxBH7QxWT9jWn3NAw',
            name: 'AquaHome Filter Replacement',
            status: 'Delivered',
            orderNumber: '#789012',
            price: '$49.99'
        },
        {
            id: 3,
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBOPYKGNZoiUwCzpEKpO-PZipEDaxjHwJWA98DdqhFneXkatFD4XcH58CMyUg2owMhmFZ7R6ps4brWrSgce2evueeiOKUCrhYM6UHmOHE6b7hIQ4Tz68WLn7G-CaFEyJ3BykjiYWUTveM7LVm0lMXSZy-Qn10qlII0eSTms9wkimy0rda137GkwBz3sm1ZZaheFXocuIBx2VimqYx7l-JcNsv3FzsFivOVJiGJRgBGECAeLI25fd_cSFX55_2R5qzVngn9GOYn6yQ',
            name: 'AquaHome Water Purifier',
            status: 'Cancelled',
            orderNumber: '#345678',
            price: '$299.99'
        },
        {
            id: 4,
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDHukcB-NHgLq5ls9G4hIj68Q6zlM7QUIViZxk5Wnq9_4ya_g1pl4I6E2C1gUI19n8aZxvPiBQhDk9ncuYnLcxgP5cWa26GFJ8S7bUDLA6_iAGfSzzri9_ruGrlWFFZ3ZKFPqm_2Bf_voPIw7WPRr8e9ozJt-dnDoViyC3-Oz-5PuIMFFKc87I6aXuBEP0po4R-42YDEHXdeF7Bu2UP9uSa8TxcvulcFRFvPygA6geU4CuJpRuvF3UwKnUyVY1yaDBkRnM79kb2AA',
            name: 'AquaHome Filter Replacement',
            status: 'Processing',
            orderNumber: '#901234',
            price: '$49.99'
        }
    ];



    return (
        <ScrollView className="flex-1 bg-white">


            {/* Past Orders Section */}
            <Text className="text-primary text-2xl font-grotesk-bold px-4 pb-2 pt-4">
                Past Orders
            </Text>

            {/* Orders List */}
            {orders.map((order) => (
                <TouchableOpacity
                    key={order.id}
                    onPress={() => navigation.navigate('orders/[id]', { id: order.id })}

                    className="flex-row gap-4 bg-white px-4 py-3 justify-between"
                >
                    <View className="flex-row items-start gap-4 flex-1">
                        <Image
                            source={{ uri: order.image }}
                            className="w-[80px] h-[80px] rounded-lg"
                            resizeMode="cover"
                        />
                        <View className="flex-1 flex-col justify-center">
                            <Text className="text-xl text-primary font-grotesk-bold">
                                {order.name}
                            </Text>
                            <Text className="text-secondary text-lg font-grotesk">
                                Status: {order.status}
                            </Text>
                            <Text className="text-secondary text-lg font-grotesk">
                                Order {order.orderNumber}
                            </Text>
                        </View>
                    </View>
                    <View className="justify-center">
                        <Text className="text-primary text-xl font-grotesk-medium">
                            {order.price}
                        </Text>
                    </View>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );
}