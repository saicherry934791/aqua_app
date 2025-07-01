import React, { useEffect, useLayoutEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Image,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import { useNavigation, useRouter } from 'expo-router';
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
    const router = useRouter();
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

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'delivered':
                return '#4ade80';
            case 'shipped':
                return '#3b82f6';
            case 'processing':
                return '#f59e0b';
            case 'cancelled':
                return '#ef4444';
            default:
                return '#6b7280';
        }
    };

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
                <ActivityIndicator size="large" color="#4fa3c4" />
                <Text style={{ 
                    marginTop: 16, 
                    fontSize: 16, 
                    fontFamily: 'SpaceGrotesk_500Medium',
                    color: '#687b82' 
                }}>
                    Loading your orders...
                </Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white', padding: 20 }}>
                <Text style={{ 
                    fontSize: 18, 
                    fontFamily: 'SpaceGrotesk_600SemiBold',
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
                        fontFamily: 'SpaceGrotesk_600SemiBold',
                        fontSize: 16
                    }}>
                        Try Again
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView 
            style={{ flex: 1, backgroundColor: 'white' }}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            {orders.length === 0 ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, minHeight: 400 }}>
                    <Text style={{ 
                        fontSize: 24, 
                        fontFamily: 'SpaceGrotesk_700Bold',
                        color: '#121516',
                        textAlign: 'center',
                        marginBottom: 8
                    }}>
                        No Orders Yet
                    </Text>
                    <Text style={{ 
                        fontSize: 16, 
                        fontFamily: 'SpaceGrotesk_400Regular',
                        color: '#687b82',
                        textAlign: 'center',
                        marginBottom: 24
                    }}>
                        Start shopping to see your orders here
                    </Text>
                    <TouchableOpacity
                        onPress={() => router.push('/(tabs)/products')}
                        style={{
                            backgroundColor: '#4fa3c4',
                            paddingHorizontal: 24,
                            paddingVertical: 12,
                            borderRadius: 24,
                        }}
                    >
                        <Text style={{ 
                            color: 'white', 
                            fontFamily: 'SpaceGrotesk_600SemiBold',
                            fontSize: 16
                        }}>
                            Browse Products
                        </Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <>
                    <Text style={{ 
                        fontSize: 24, 
                        fontFamily: 'SpaceGrotesk_700Bold',
                        color: '#121516',
                        paddingHorizontal: 16,
                        paddingBottom: 8,
                        paddingTop: 16
                    }}>
                        Your Orders ({orders.length})
                    </Text>

                    {orders.map((order) => (
                        <TouchableOpacity
                            key={order.id}
                            onPress={() => router.push(`/orders/${order.id}`)}
                            style={{
                                backgroundColor: 'white',
                                marginHorizontal: 16,
                                marginVertical: 8,
                                borderRadius: 12,
                                padding: 16,
                                borderWidth: 1,
                                borderColor: '#f1f3f4',
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.1,
                                shadowRadius: 4,
                                elevation: 3,
                            }}
                        >
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ 
                                        fontSize: 18, 
                                        fontFamily: 'SpaceGrotesk_700Bold',
                                        color: '#121516',
                                        marginBottom: 4
                                    }}>
                                        Order #{order.orderNumber}
                                    </Text>
                                    <Text style={{ 
                                        fontSize: 14, 
                                        fontFamily: 'SpaceGrotesk_400Regular',
                                        color: '#687b82'
                                    }}>
                                        {formatDate(order.createdAt)}
                                    </Text>
                                </View>
                                <View style={{
                                    backgroundColor: getStatusColor(order.status),
                                    paddingHorizontal: 12,
                                    paddingVertical: 4,
                                    borderRadius: 12,
                                }}>
                                    <Text style={{ 
                                        fontSize: 12, 
                                        fontFamily: 'SpaceGrotesk_600SemiBold',
                                        color: 'white',
                                        textTransform: 'capitalize'
                                    }}>
                                        {order.status}
                                    </Text>
                                </View>
                            </View>

                            {order.items && order.items.length > 0 && (
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                                    {order.items[0].image && (
                                        <Image
                                            source={{ uri: order.items[0].image }}
                                            style={{ width: 60, height: 60, borderRadius: 8, marginRight: 12 }}
                                            resizeMode="cover"
                                        />
                                    )}
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ 
                                            fontSize: 16, 
                                            fontFamily: 'SpaceGrotesk_600SemiBold',
                                            color: '#121516',
                                            marginBottom: 2
                                        }}>
                                            {order.items[0].name}
                                        </Text>
                                        {order.items.length > 1 && (
                                            <Text style={{ 
                                                fontSize: 14, 
                                                fontFamily: 'SpaceGrotesk_400Regular',
                                                color: '#687b82'
                                            }}>
                                                +{order.items.length - 1} more item{order.items.length > 2 ? 's' : ''}
                                            </Text>
                                        )}
                                    </View>
                                </View>
                            )}

                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text style={{ 
                                    fontSize: 20, 
                                    fontFamily: 'SpaceGrotesk_700Bold',
                                    color: '#4fa3c4'
                                }}>
                                    ₹{order.total.toLocaleString()}
                                </Text>
                                <Text style={{ 
                                    fontSize: 14, 
                                    fontFamily: 'SpaceGrotesk_500Medium',
                                    color: '#4fa3c4'
                                }}>
                                    View Details →
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </>
            )}
        </ScrollView>
    );
}