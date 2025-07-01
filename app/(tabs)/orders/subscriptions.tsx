import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, Image, RefreshControl, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useNavigation, useRouter } from 'expo-router';
import { apiService } from '@/api/api';

interface RentalSubscription {
    id: string;
    productId: string;
    productName: string;
    productImage?: string;
    plan: string;
    monthlyPrice: number;
    status: string;
    startDate: string;
    nextRenewal?: string;
    endDate?: string;
    createdAt: string;
}

const subscriptions = () => {
    const navigation = useNavigation();
    const router = useRouter();
    const [subscriptions, setSubscriptions] = useState<RentalSubscription[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchSubscriptions = async () => {
        try {
            setError(null);
            const response = await apiService.get('/rentals/my-rentals');
            
            if (response.success) {
                setSubscriptions(response.data.rentals || []);
            } else {
                setError(response.error || 'Failed to fetch subscriptions');
            }
        } catch (err: any) {
            console.log('Error fetching subscriptions:', err);
            setError('Failed to load subscriptions. Please try again.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchSubscriptions();
    };

    useEffect(() => {
        fetchSubscriptions();
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
            case 'active':
                return '#4ade80';
            case 'paused':
                return '#f59e0b';
            case 'cancelled':
                return '#ef4444';
            case 'expired':
                return '#6b7280';
            default:
                return '#6b7280';
        }
    };

    const getStatusText = (status: string) => {
        switch (status.toLowerCase()) {
            case 'active':
                return 'Active';
            case 'paused':
                return 'Paused';
            case 'cancelled':
                return 'Cancelled';
            case 'expired':
                return 'Expired';
            default:
                return status;
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
                    Loading your subscriptions...
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
                    onPress={fetchSubscriptions}
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
            {subscriptions.length === 0 ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, minHeight: 400 }}>
                    <Text style={{ 
                        fontSize: 24, 
                        fontFamily: 'SpaceGrotesk_700Bold',
                        color: '#121516',
                        textAlign: 'center',
                        marginBottom: 8
                    }}>
                        No Active Subscriptions
                    </Text>
                    <Text style={{ 
                        fontSize: 16, 
                        fontFamily: 'SpaceGrotesk_400Regular',
                        color: '#687b82',
                        textAlign: 'center',
                        marginBottom: 24
                    }}>
                        Start a rental subscription to see it here
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
                        Your Subscriptions ({subscriptions.length})
                    </Text>

                    {subscriptions.map((subscription) => (
                        <Pressable 
                            key={subscription.id}
                            onPress={() => {
                                router.push(`/subscriptions/${subscription.id}`);
                            }} 
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
                                        {subscription.productName}
                                    </Text>
                                    <Text style={{ 
                                        fontSize: 14, 
                                        fontFamily: 'SpaceGrotesk_400Regular',
                                        color: '#687b82'
                                    }}>
                                        Started: {formatDate(subscription.startDate)}
                                    </Text>
                                </View>
                                <View style={{
                                    backgroundColor: getStatusColor(subscription.status),
                                    paddingHorizontal: 12,
                                    paddingVertical: 4,
                                    borderRadius: 12,
                                }}>
                                    <Text style={{ 
                                        fontSize: 12, 
                                        fontFamily: 'SpaceGrotesk_600SemiBold',
                                        color: 'white'
                                    }}>
                                        {getStatusText(subscription.status)}
                                    </Text>
                                </View>
                            </View>

                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                                {subscription.productImage && (
                                    <Image
                                        source={{ uri: subscription.productImage }}
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
                                        Monthly Rental
                                    </Text>
                                    {subscription.nextRenewal && subscription.status === 'active' && (
                                        <Text style={{ 
                                            fontSize: 14, 
                                            fontFamily: 'SpaceGrotesk_400Regular',
                                            color: '#687b82'
                                        }}>
                                            Next renewal: {formatDate(subscription.nextRenewal)}
                                        </Text>
                                    )}
                                    {subscription.endDate && subscription.status !== 'active' && (
                                        <Text style={{ 
                                            fontSize: 14, 
                                            fontFamily: 'SpaceGrotesk_400Regular',
                                            color: '#687b82'
                                        }}>
                                            Ended: {formatDate(subscription.endDate)}
                                        </Text>
                                    )}
                                </View>
                            </View>

                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text style={{ 
                                    fontSize: 20, 
                                    fontFamily: 'SpaceGrotesk_700Bold',
                                    color: '#4fa3c4'
                                }}>
                                    ₹{subscription.monthlyPrice.toLocaleString()}/month
                                </Text>
                                <Text style={{ 
                                    fontSize: 14, 
                                    fontFamily: 'SpaceGrotesk_500Medium',
                                    color: '#4fa3c4'
                                }}>
                                    Manage →
                                </Text>
                            </View>
                        </Pressable>
                    ))}
                </>
            )}
        </ScrollView>
    );
};

export default subscriptions;