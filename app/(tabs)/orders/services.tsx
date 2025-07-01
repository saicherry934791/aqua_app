import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, Pressable, RefreshControl, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useNavigation, useRouter } from 'expo-router';
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
    assignedAgent?: {
        name: string;
        phone: string;
    };
}

const ServiceRequests = () => {
    const navigation = useNavigation();
    const router = useRouter();
    const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchServiceRequests = async () => {
        try {
            setError(null);
            const response = await apiService.get('/service-requests');
            
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

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed':
                return '#4ade80';
            case 'in_progress':
            case 'assigned':
                return '#3b82f6';
            case 'scheduled':
                return '#8b5cf6';
            case 'created':
            case 'pending':
                return '#f59e0b';
            case 'cancelled':
                return '#ef4444';
            default:
                return '#6b7280';
        }
    };

    const getStatusText = (status: string) => {
        switch (status.toLowerCase()) {
            case 'created':
                return 'Created';
            case 'assigned':
                return 'Assigned';
            case 'scheduled':
                return 'Scheduled';
            case 'in_progress':
                return 'In Progress';
            case 'completed':
                return 'Completed';
            case 'cancelled':
                return 'Cancelled';
            default:
                return status;
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority.toLowerCase()) {
            case 'high':
                return '#ef4444';
            case 'medium':
                return '#f59e0b';
            case 'low':
                return '#4ade80';
            default:
                return '#6b7280';
        }
    };

    const getServiceTypeIcon = (type: string) => {
        switch (type.toLowerCase()) {
            case 'maintenance':
                return '🔧';
            case 'repair':
                return '🛠️';
            case 'installation':
                return '⚙️';
            case 'filter_replacement':
                return '🔄';
            case 'cleaning':
                return '🧽';
            default:
                return '📋';
        }
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
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
                <ActivityIndicator size="large" color="#4fa3c4" />
                <Text style={{ 
                    marginTop: 16, 
                    fontSize: 16, 
                    fontFamily: 'SpaceGrotesk_500Medium',
                    color: '#687b82' 
                }}>
                    Loading your service requests...
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
                    onPress={fetchServiceRequests}
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
            {serviceRequests.length === 0 ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, minHeight: 400 }}>
                    <Text style={{ 
                        fontSize: 24, 
                        fontFamily: 'SpaceGrotesk_700Bold',
                        color: '#121516',
                        textAlign: 'center',
                        marginBottom: 8
                    }}>
                        No Service Requests
                    </Text>
                    <Text style={{ 
                        fontSize: 16, 
                        fontFamily: 'SpaceGrotesk_400Regular',
                        color: '#687b82',
                        textAlign: 'center',
                        marginBottom: 24
                    }}>
                        When you need service, your requests will appear here
                    </Text>
                </View>
            ) : (
                <>
                    {/* Active Requests Section */}
                    {activeRequests.length > 0 && (
                        <>
                            <Text style={{ 
                                fontSize: 24, 
                                fontFamily: 'SpaceGrotesk_700Bold',
                                color: '#121516',
                                paddingHorizontal: 16,
                                paddingBottom: 8,
                                paddingTop: 16
                            }}>
                                Active Requests ({activeRequests.length})
                            </Text>

                            {activeRequests.map((request) => (
                                <Pressable 
                                    key={request.id}
                                    onPress={() => {
                                        router.push(`/services/${request.id}`);
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
                                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                                                <Text style={{ fontSize: 20, marginRight: 8 }}>
                                                    {getServiceTypeIcon(request.type)}
                                                </Text>
                                                <Text style={{ 
                                                    fontSize: 18, 
                                                    fontFamily: 'SpaceGrotesk_700Bold',
                                                    color: '#121516',
                                                    flex: 1
                                                }}>
                                                    Request #{request.id.slice(-6)}
                                                </Text>
                                            </View>
                                            <Text style={{ 
                                                fontSize: 14, 
                                                fontFamily: 'SpaceGrotesk_400Regular',
                                                color: '#687b82'
                                            }}>
                                                {formatDate(request.createdAt)}
                                            </Text>
                                        </View>
                                        <View style={{ alignItems: 'flex-end' }}>
                                            <View style={{
                                                backgroundColor: getStatusColor(request.status),
                                                paddingHorizontal: 12,
                                                paddingVertical: 4,
                                                borderRadius: 12,
                                                marginBottom: 4,
                                            }}>
                                                <Text style={{ 
                                                    fontSize: 12, 
                                                    fontFamily: 'SpaceGrotesk_600SemiBold',
                                                    color: 'white'
                                                }}>
                                                    {getStatusText(request.status)}
                                                </Text>
                                            </View>
                                            <View style={{
                                                backgroundColor: getPriorityColor(request.priority),
                                                paddingHorizontal: 8,
                                                paddingVertical: 2,
                                                borderRadius: 8,
                                            }}>
                                                <Text style={{ 
                                                    fontSize: 10, 
                                                    fontFamily: 'SpaceGrotesk_600SemiBold',
                                                    color: 'white',
                                                    textTransform: 'uppercase'
                                                }}>
                                                    {request.priority}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>

                                    <View style={{ marginBottom: 12 }}>
                                        <Text style={{ 
                                            fontSize: 16, 
                                            fontFamily: 'SpaceGrotesk_600SemiBold',
                                            color: '#121516',
                                            marginBottom: 4,
                                            textTransform: 'capitalize'
                                        }}>
                                            {request.type.replace('_', ' ')}
                                        </Text>
                                        <Text style={{ 
                                            fontSize: 14, 
                                            fontFamily: 'SpaceGrotesk_400Regular',
                                            color: '#687b82',
                                            lineHeight: 20
                                        }}>
                                            {request.description}
                                        </Text>
                                    </View>

                                    {request.scheduledDate && (
                                        <View style={{ 
                                            backgroundColor: '#e8f4f8', 
                                            padding: 12, 
                                            borderRadius: 8,
                                            marginBottom: 8
                                        }}>
                                            <Text style={{ 
                                                fontSize: 14, 
                                                fontFamily: 'SpaceGrotesk_600SemiBold',
                                                color: '#4fa3c4'
                                            }}>
                                                📅 Scheduled for: {formatDate(request.scheduledDate)}
                                            </Text>
                                        </View>
                                    )}

                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                        {request.productName && (
                                            <Text style={{ 
                                                fontSize: 14, 
                                                fontFamily: 'SpaceGrotesk_500Medium',
                                                color: '#687b82'
                                            }}>
                                                Product: {request.productName}
                                            </Text>
                                        )}
                                        <Text style={{ 
                                            fontSize: 14, 
                                            fontFamily: 'SpaceGrotesk_500Medium',
                                            color: '#4fa3c4'
                                        }}>
                                            View Details →
                                        </Text>
                                    </View>
                                </Pressable>
                            ))}
                        </>
                    )}

                    {/* Past Requests Section */}
                    {completedRequests.length > 0 && (
                        <>
                            <Text style={{ 
                                fontSize: 24, 
                                fontFamily: 'SpaceGrotesk_700Bold',
                                color: '#121516',
                                paddingHorizontal: 16,
                                paddingBottom: 8,
                                paddingTop: activeRequests.length > 0 ? 32 : 16
                            }}>
                                Past Requests ({completedRequests.length})
                            </Text>

                            {completedRequests.map((request) => (
                                <Pressable 
                                    key={request.id}
                                    onPress={() => {
                                        router.push(`/services/${request.id}`);
                                    }} 
                                    style={{
                                        backgroundColor: '#f8f9fa',
                                        marginHorizontal: 16,
                                        marginVertical: 8,
                                        borderRadius: 12,
                                        padding: 16,
                                        borderWidth: 1,
                                        borderColor: '#e1e5e7',
                                    }}
                                >
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                        <View style={{ flex: 1 }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                                                <Text style={{ fontSize: 18, marginRight: 8 }}>
                                                    {getServiceTypeIcon(request.type)}
                                                </Text>
                                                <Text style={{ 
                                                    fontSize: 16, 
                                                    fontFamily: 'SpaceGrotesk_600SemiBold',
                                                    color: '#121516',
                                                    flex: 1
                                                }}>
                                                    Request #{request.id.slice(-6)}
                                                </Text>
                                            </View>
                                            <Text style={{ 
                                                fontSize: 14, 
                                                fontFamily: 'SpaceGrotesk_400Regular',
                                                color: '#687b82',
                                                textTransform: 'capitalize'
                                            }}>
                                                {request.type.replace('_', ' ')} • {formatDate(request.createdAt)}
                                            </Text>
                                        </View>
                                        <View style={{
                                            backgroundColor: getStatusColor(request.status),
                                            paddingHorizontal: 10,
                                            paddingVertical: 3,
                                            borderRadius: 10,
                                        }}>
                                            <Text style={{ 
                                                fontSize: 11, 
                                                fontFamily: 'SpaceGrotesk_600SemiBold',
                                                color: 'white'
                                            }}>
                                                {getStatusText(request.status)}
                                            </Text>
                                        </View>
                                    </View>

                                    {request.completedAt && (
                                        <Text style={{ 
                                            fontSize: 12, 
                                            fontFamily: 'SpaceGrotesk_400Regular',
                                            color: '#687b82'
                                        }}>
                                            Completed: {formatDate(request.completedAt)}
                                        </Text>
                                    )}
                                </Pressable>
                            ))}
                        </>
                    )}
                </>
            )}
        </ScrollView>
    );
};

export default ServiceRequests;