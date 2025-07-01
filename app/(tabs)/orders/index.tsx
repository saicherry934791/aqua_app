import React, { useLayoutEffect, useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Image,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import { useNavigation } from 'expo-router';
import { apiService } from '@/api/api';

interface OrderItem {
    id: string;
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
}

interface Order {
    id: string;
    orderNumber: string;
    items: OrderItem[];
    total: number;
    status: string;
    createdAt: string;
    deliveryDate?: string;
    shippingAddress: string;
}

export default function OrdersScreen() {
    const navigation = useNavigation();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchOrders = async () => {
        try {
            setError(null);
            const response = await apiService.get('/orders/my-orders?status=payment_completed');
            
            if (response.success) {
                setOrders(response.data.orders || []);
            } else {
                setError(response.error || 'Failed to fetch orders');
            }
        } catch (err: any) {
            console.log('Error fetching orders:', err);
            setError('Failed to load orders. Please try again.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchOrders();
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" color="#4fa3c4" />
                <Text className="mt-4 text-base font-grotesk-medium text-[#687b82]">
                    Loading orders...
                </Text>
            </View>
        );
    }

    if (error) {
        return (
            <View className="flex-1 justify-center items-center bg-white px-4">
                <Text className="text-lg font-grotesk-bold text-red-500 text-center mb-4">
                    {error}
                </Text>
                <TouchableOpacity
                    onPress={fetchOrders}
                    className="bg-[#4fa3c4] px-6 py-3 rounded-lg"
                >
                    <Text className="text-white font-grotesk-bold">Try Again</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView 
            className="flex-1 bg-white"
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            {/* Past Orders Section */}
            <Text className="text-primary text-2xl font-grotesk-bold px-4 pb-2 pt-4">
                Past Orders
            </Text>

            {/* Orders List */}
            {orders.length === 0 ? (
                <View className="flex-1 justify-center items-center py-20">
                    <Text className="text-xl font-grotesk-bold text-primary mb-2">
                        No Orders Yet
                    </Text>
                    <Text className="text-base font-grotesk text-secondary text-center">
                        Your completed orders will appear here
                    </Text>
                </View>
            ) : (
                orders.map((order) => (
                    <TouchableOpacity
                        key={order.id}
                        onPress={() => navigation.navigate('orders/[id]', { id: order.id })}
                        className="flex-row gap-4 bg-white px-4 py-3 justify-between"
                    >
                        <View className="flex-row items-start gap-4 flex-1">
                            {order.items && order.items.length > 0 && order.items[0].image && (
                                <Image
                                    source={{ uri: order.items[0].image }}
                                    className="w-[80px] h-[80px] rounded-lg"
                                    resizeMode="cover"
                                />
                            )}
                            <View className="flex-1 flex-col justify-center">
                                <Text className="text-xl text-primary font-grotesk-bold">
                                    {order.items && order.items.length > 0 ? order.items[0].name : 'Order'}
                                </Text>
                                <Text className="text-secondary text-lg font-grotesk">
                                    Status: {order.status}
                                </Text>
                                <Text className="text-secondary text-lg font-grotesk">
                                    Order #{order.orderNumber}
                                </Text>
                            </View>
                        </View>
                        <View className="justify-center">
                            <Text className="text-primary text-xl font-grotesk-medium">
                                ₹{order.total?.toLocaleString()}
                            </Text>
                        </View>
                    </TouchableOpacity>
                ))
            )}
        </ScrollView>
    );
}