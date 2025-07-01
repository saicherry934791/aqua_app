import { View, Text, ScrollView, Pressable, Image, RefreshControl, ActivityIndicator, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useNavigation } from 'expo-router';
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

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" color="#4fa3c4" />
                <Text className="mt-4 text-base font-grotesk-medium text-[#687b82]">
                    Loading subscriptions...
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
                    onPress={fetchSubscriptions}
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
            <Text className="text-primary text-2xl font-grotesk-bold px-4 pb-2 pt-4">
                Active Subscriptions
            </Text>
            
            {subscriptions.length === 0 ? (
                <View className="flex-1 justify-center items-center py-20">
                    <Text className="text-xl font-grotesk-bold text-primary mb-2">
                        No Active Subscriptions
                    </Text>
                    <Text className="text-base font-grotesk text-secondary text-center">
                        Your rental subscriptions will appear here
                    </Text>
                </View>
            ) : (
                subscriptions.map((subscription) => (
                    <Pressable 
                        key={subscription.id}
                        onPress={() => {
                            navigation.navigate("subscriptions/[id]", { id: subscription.id });
                        }} 
                        className="flex-row gap-4 bg-white px-4 py-3"
                    >
                        <Image
                            source={{
                                uri: subscription.productImage || "https://lh3.googleusercontent.com/aida-public/AB6AXuC57u2ZwtDGJGKk0YZUS3y1twH9YzNDIFCR-dYHLepgrWNwlgRKkMtSfxf-aNgvig6j8lQe1rjLLw65Fuoz17e4i6_9PMIKeqiysBuOvYM2XxnvJYhZuNKQ2SXEhxv2P-V3lshBTbC4PBHEL9rexsuZpBw0Q82diziO2PILE_vHW6Hi7rlm2vGCzMV1HATvJpqlKKvFUfw1sM6Tvo0aapa9sroG6wVxRPnJP8ZgBR4rmmoYLAAmMYvGCPBdMqxBH7QxWT9jWn3NAw"
                            }}
                            className="rounded-lg w-[80px] h-[80px]"
                            resizeMode="cover"
                        />
                        <View className="flex-1 justify-center">
                            <Text className="text-xl text-primary font-grotesk-bold">
                                {subscription.productName}
                            </Text>
                            <Text className="text-secondary text-lg font-grotesk">
                                Next Renewal: {subscription.nextRenewal ? formatDate(subscription.nextRenewal) : 'N/A'}
                            </Text>
                            <Text className="text-secondary text-lg font-grotesk">
                                Started: {formatDate(subscription.startDate)} · {subscription.plan}
                            </Text>
                        </View>
                    </Pressable>
                ))
            )}
        </ScrollView>
    )
}

export default subscriptions