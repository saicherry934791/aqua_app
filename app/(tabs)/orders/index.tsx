import { apiService } from '@/api/api';
import { useNavigation } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Image,
    RefreshControl,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function OrdersScreen() {

    const navigation = useNavigation();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fetchOrders = async () => {
        try {
            setError(null);
            const response = await apiService.get('/orders/my-orders');


            if (response.success) {
                setOrders(response.data.orders || []);
                console.log('orders in orders screen ', response.data.orders)
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


    if (error) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white', padding: 20 }}>
                <Text style={{
                    fontSize: 18,
                    fontFamily: 'Outfit_600SemiBold',
                    color: '#ef4444',
                    textAlign: 'center',
                    marginBottom: 16
                }}>
                    {error}
                </Text>
                <TouchableOpacity
                    onPress={fetchOrders}
                    style={{
                        backgroundColor: '#4fa3c4',
                        paddingHorizontal: 24,
                        paddingVertical: 12,
                        borderRadius: 8,
                    }}
                >
                    <Text style={{
                        color: 'white',
                        fontFamily: 'Outfit_600SemiBold',
                        fontSize: 16
                    }}>
                        Try Again
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView className="flex-1 bg-white" refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>


            {/* Past Orders Section */}

            {/* Orders List */}
            {orders.map((order) => (
                <TouchableOpacity
                    key={order.id}
                    onPress={() => navigation.navigate('orders/[id]', { id: order.id })}

                    className="flex-row gap-4 bg-white px-4 py-3 justify-between"
                >
                    <View className="flex-row items-start gap-4 flex-1">
                        <Image
                            source={{ uri: order.product.images[0] }}
                            className="w-[80px] h-[80px] rounded-lg"
                            resizeMode="cover"
                        />
                        <View className="flex-1 flex-col justify-center">
                            <Text className="text-xl text-primary font-grotesk-bold">
                                {order.product.name}
                            </Text>
                            <Text className="text-secondary text-lg font-grotesk">
                                Status: {order.status}
                            </Text>
                            <Text className="text-secondary text-lg font-grotesk">
                                Order {order.id}
                            </Text>
                        </View>
                    </View>
                    <View className="justify-center">
                        <Text className="text-primary text-xl font-grotesk-medium">
                            {order.totalAmount}
                        </Text>
                    </View>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );
}