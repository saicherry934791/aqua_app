import { useNavigation } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, Pressable, RefreshControl, ActivityIndicator, TouchableOpacity } from 'react-native';
import { apiService } from '@/api/api';

interface ServiceRequest {
    id: string;
    type: string;
    description: string;
    status: string;
    priority: string;
    createdAt: string;
    updatedAt: string;
    scheduledDate?: string;
    completedAt?: string;
    productName?: string;
    productImage?: string;
}

const ServiceRequests = () => {
    const navigation = useNavigation();
    const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchServiceRequests = async () => {
        try {
            setError(null);
            const response = await apiService.get('/service-requests');
            console.log('service requires ',response)
            if (response.success) {
                setServiceRequests(response.data.serviceRequests || []);
            } else {
                setError(response.error || 'Failed to fetch service requests');
            }
        } catch (err: any) {
            console.log('Error fetching service requests:', err);
            setError('Failed to load service requests. Please try again.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchServiceRequests();
    };

    useEffect(() => {
        fetchServiceRequests();
    }, []);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Separate active and completed requests
    const activeRequests = serviceRequests.filter(req => 
        !['completed', 'cancelled'].includes(req.status.toLowerCase())
    );
    const completedRequests = serviceRequests.filter(req => 
        ['completed', 'cancelled'].includes(req.status.toLowerCase())
    );

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" color="#4fa3c4" />
                <Text className="mt-4 text-base font-grotesk-medium text-[#687b82]">
                    Loading service requests...
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
                    onPress={fetchServiceRequests}
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
            {/* Open Requests Section */}
            {activeRequests.length > 0 && (
                <>
                    <Text className="text-primary text-2xl font-grotesk-bold px-4 pb-2 pt-4">
                        Open Requests
                    </Text>

                    {activeRequests.map((request) => (
                        <Pressable 
                            key={request.id}
                            onPress={() => {
                                navigation.navigate("services/[id]", { id: request.id });
                            }} 
                            className="flex-row gap-4 bg-white px-4 py-3"
                        >
                            <Image
                                source={{
                                    uri: request.productImage || "https://lh3.googleusercontent.com/aida-public/AB6AXuC57u2ZwtDGJGKk0YZUS3y1twH9YzNDIFCR-dYHLepgrWNwlgRKkMtSfxf-aNgvig6j8lQe1rjLLw65Fuoz17e4i6_9PMIKeqiysBuOvYM2XxnvJYhZuNKQ2SXEhxv2P-V3lshBTbC4PBHEL9rexsuZpBw0Q82diziO2PILE_vHW6Hi7rlm2vGCzMV1HATvJpqlKKvFUfw1sM6Tvo0aapa9sroG6wVxRPnJP8ZgBR4rmmoYLAAmMYvGCPBdMqxBH7QxWT9jWn3NAw"
                                }}
                                className="rounded-lg w-[80px] h-[80px]"
                                resizeMode="cover"
                            />
                            <View className="flex-1 justify-center">
                                <Text className="text-xl text-primary font-grotesk-bold">
                                    Request ID: {request.id.slice(-6)}
                                </Text>
                                <Text className="text-secondary text-lg font-grotesk">
                                    Issue: {request.description}
                                </Text>
                                <Text className="text-secondary text-lg font-grotesk">
                                    Submitted: {formatDate(request.createdAt)} · Status: {request.status}
                                </Text>
                            </View>
                        </Pressable>
                    ))}
                </>
            )}

            {/* Past Requests Section */}
            {completedRequests.length > 0 && (
                <>
                    <Text className="text-primary text-2xl font-grotesk-bold px-4 pb-2 pt-4">
                        Past Requests
                    </Text>

                    {completedRequests.map((request) => (
                        <View key={request.id} className="flex-row gap-4 bg-white px-4 py-3">
                            <Image
                                source={{
                                    uri: request.productImage || "https://lh3.googleusercontent.com/aida-public/AB6AXuDI2Y2UJ03ygEWrin5ev9-QEeJCu3JI59KBLIwXCfzEWvUEoL6AqRcjSV3MJxYmeDXc529dh5ayN8WvAHZN9LflMdJUrpTjjLAxOc8WzBRYJgJzt3_aaiDrfir5EhPwuDx7nfKYktMy6GHc2iQ04ZLUASZFCbt7afk2m76U55MxJKNABappth9Go4XCMP1ptwdxqb4gzmz7Atl-B0FB5h0XgeyH1YHPXWMzo_yKUsaCbRyl1lb-CQgffpzyT5-Q7qgvFJxvVC1w7w"
                                }}
                                className="rounded-lg w-[80px] h-[80px]"
                                resizeMode="cover"
                            />
                            <View className="flex-1 justify-center">
                                <Text className="text-xl text-primary font-grotesk-bold">
                                    Request ID: {request.id.slice(-6)}
                                </Text>
                                <Text className="text-secondary text-lg font-grotesk">
                                    Issue: {request.description}
                                </Text>
                                <Text className="text-secondary text-lg font-grotesk">
                                    Submitted: {formatDate(request.createdAt)} · Status: {request.status}
                                </Text>
                            </View>
                        </View>
                    ))}
                </>
            )}

            {/* Empty State */}
            {serviceRequests.length === 0 && (
                <View className="flex-1 justify-center items-center py-20">
                    <Text className="text-xl font-grotesk-bold text-primary mb-2">
                        No Service Requests
                    </Text>
                    <Text className="text-base font-grotesk text-secondary text-center">
                        Your service requests will appear here
                    </Text>
                </View>
            )}
        </ScrollView>
    );
};

export default ServiceRequests;