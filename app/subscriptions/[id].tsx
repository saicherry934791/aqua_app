import { apiService } from '@/api/api'
import BackArrowIcon from '@/components/icons/BackArrowIcon'
import * as ImagePicker from 'expo-image-picker'
import { useLocalSearchParams, useNavigation } from 'expo-router'
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import ActionSheet from 'react-native-actions-sheet'

const SubscriptionDetails = () => {
    const cancelActionSheetRef = useRef(null)
    const serviceActionSheetRef = useRef(null)
    const { id } = useLocalSearchParams()

    // Rental data state
    const [rentalData, setRentalData] = useState(null)
    const [loading, setLoading] = useState(true)

    // Service request state
    const [serviceStep, setServiceStep] = useState(1)
    const [selectedServiceType, setSelectedServiceType] = useState('')
    const [serviceDescription, setServiceDescription] = useState('')
    const [uploadedImages, setUploadedImages] = useState([])
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [isServiceSheetOpening, setIsServiceSheetOpening] = useState(false)
    const [isCancelSheetOpening, setIsCancelSheetOpening] = useState(false)

    const navigation = useNavigation();

    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: () => (
                <Text className="text-2xl font-grotesk-bold text-[#121516]">RENTAL DETAILS</Text>
            ),
            headerTitleAlign: 'center',
            headerLeft: () => (
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <BackArrowIcon />
                </TouchableOpacity>
            ),
        });
    }, [navigation]);

    // Fetch rental data on component mount
    useEffect(() => {
        if (id) {
            fetchRentalData();
        }
    }, [id]);

    // API service functions
    const fetchRentalData = async () => {
        try {
            setLoading(true);
            const response = await apiService.get(`/rentals/${id}`)

            console.log('repsone in subscription details ', response)
            if (!response.success) {
                throw new Error(`HTTP error! status: ${response.error}`);
            }

            const result = response.data;
            setRentalData(result.rental);

        } catch (error) {
            console.log('Error fetching rental data:', error);
            Alert.alert('Error', 'Failed to load rental details. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const createServiceRequest = async (serviceRequestData) => {
        try {
            const formData = new FormData();

            // Add basic service request data using rental information
            formData.append('customerId', rentalData?.customerId);
            formData.append('productId', rentalData?.productId);
            formData.append('orderId', rentalData?.orderId);
            formData.append('type', mapServiceTypeToAPI(serviceRequestData.type));
            formData.append('description', serviceRequestData.description);

            // Add images if any
            if (serviceRequestData.images && serviceRequestData.images.length > 0) {
                serviceRequestData.images.forEach((image, index) => {
                    formData.append(`images`, {
                        uri: image.uri,
                        type: image.type || 'image/jpeg',
                        name: image.name || `image_${index}.jpg`,
                    });
                });
            }

            const response = await apiService.post('/service-requests', formData, {

                headers: {
                    'Content-Type': 'multipart/form-data',
                    // Add authorization header if needed
                    // 'Authorization': `Bearer ${your-auth-token}`
                },

            });

            if (!response.success) {
                throw new Error(`HTTP error! status: ${response.error}`);
            }

            const result = response.data
            return result;
        } catch (error) {
            console.log('Error creating service request:', error);
            throw error;
        }
    };

    // Map UI service types to API types
    const mapServiceTypeToAPI = (uiServiceType) => {
        const typeMapping = {
            'Filter Replacement': 'maintenance',
            'Maintenance': 'maintenance',
            'Technical Support': 'support',
            'Installation': 'installation'
        };
        return typeMapping[uiServiceType] || 'maintenance';
    };

    // Format date helper
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Format status helper
    const formatStatus = (status) => {
        return status.charAt(0).toUpperCase() + status.slice(1);
    };

    const handleCancelSubscription = useCallback(async () => {
        if (isCancelSheetOpening) return;

        try {
            setIsCancelSheetOpening(true);
            setTimeout(() => {
                cancelActionSheetRef.current?.show();
                setIsCancelSheetOpening(false);
            }, 100);
        } catch (error) {
            console.log('Error opening cancel sheet:', error);
            setIsCancelSheetOpening(false);
        }
    }, [isCancelSheetOpening]);

    const handleServiceRequest = useCallback(async () => {
        if (isServiceSheetOpening) return;

        try {
            setIsServiceSheetOpening(true);
            // Reset service request state
            setServiceStep(1);
            setSelectedServiceType('');
            setServiceDescription('');
            setUploadedImages([]);
            setIsSubmitting(false);

            setTimeout(() => {
                serviceActionSheetRef.current?.show();
                setIsServiceSheetOpening(false);
            }, 100);
        } catch (error) {
            console.log('Error opening service sheet:', error);
            setIsServiceSheetOpening(false);
        }
    }, [isServiceSheetOpening]);

    const onCancelConfirm = useCallback(async () => {
        try {
            // API call to cancel/pause rental
            const response = await apiService.patch(`/rentals/${id}/pause`, {}

            );

            if (response.success) {
                Alert.alert('Success', 'Your rental has been cancelled successfully!');
                await fetchRentalData(); // Refresh data
            } else {
                throw new Error('Failed to cancel rental');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to cancel rental. Please try again.');
        }

        cancelActionSheetRef.current?.hide();
    }, [id]);

    const onServiceTypeSelect = useCallback((serviceType) => {
        setSelectedServiceType(serviceType);
    }, []);

    const handleServiceNext = useCallback(async () => {
        if (serviceStep === 1 && selectedServiceType) {
            setServiceStep(2);
        } else if (serviceStep === 2 && serviceDescription.trim()) {
            setServiceStep(3);
        } else if (serviceStep === 3) {
            // Submit service request
            setIsSubmitting(true);
            try {
                const serviceRequestData = {
                    type: selectedServiceType,
                    description: serviceDescription,
                    images: uploadedImages
                };

                const result = await createServiceRequest(serviceRequestData);

                Alert.alert(
                    'Success',
                    `Your service request has been submitted successfully! Request ID: ${result.serviceRequest?.id}`,
                    [
                        {
                            text: 'OK',
                            onPress: () => {
                                serviceActionSheetRef.current?.hide();
                            }
                        }
                    ]
                );
            } catch (error) {
                Alert.alert(
                    'Error',
                    'Failed to submit service request. Please try again.',
                    [{ text: 'OK' }]
                );
            } finally {
                setIsSubmitting(false);
            }
        }
    }, [serviceStep, selectedServiceType, serviceDescription, uploadedImages, rentalData]);

    const handleServiceCancel = useCallback(() => {
        serviceActionSheetRef.current?.hide();
    }, []);

    const handleServiceBack = useCallback(() => {
        if (serviceStep > 1) {
            setServiceStep(serviceStep - 1);
        }
    }, [serviceStep]);

    const handleImageUpload = useCallback(async () => {
        try {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (permissionResult.granted === false) {
                Alert.alert('Permission required', 'Permission to access camera roll is required!');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
                allowsMultipleSelection: false,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const asset = result.assets[0];
                const newImage = {
                    uri: asset.uri,
                    type: asset.type || 'image/jpeg',
                    name: asset.fileName || `image_${Date.now()}.jpg`,
                    size: asset.fileSize,
                };
                setUploadedImages(prev => [...prev, newImage]);
            }
        } catch (error) {
            console.log('Error picking image:', error);
            Alert.alert('Error', 'Failed to pick image. Please try again.');
        }
    }, []);

    const removeImage = useCallback((index) => {
        setUploadedImages(prev => prev.filter((_, i) => i !== index));
    }, []);

    if (loading) {
        return (
            <View className="flex-1 bg-white items-center justify-center">
                <ActivityIndicator size="large" color="#4fa3c4" />
                <Text className="text-[#687b82] font-grotesk mt-4">Loading rental details...</Text>
            </View>
        );
    }

    if (!rentalData) {
        return (
            <View className="flex-1 bg-white items-center justify-center p-4">
                <Text className="text-[#121517] font-grotesk-bold text-xl mb-2">Rental Not Found</Text>
                <Text className="text-[#687b82] font-grotesk text-center">Unable to load rental details. Please try again.</Text>
                <Pressable
                    className="bg-[#4fa3c4] rounded-full px-6 py-3 mt-4"
                    onPress={() => navigation.goBack()}
                >
                    <Text className="text-white font-grotesk-bold">Go Back</Text>
                </Pressable>
            </View>
        );
    }

    return (
        <ScrollView className="flex-1 bg-white">
            <View className="flex-row items-center gap-4 bg-white px-4 min-h-[72px] py-4">
                <Image
                    source={{
                        uri: rentalData.product?.images?.[0] || "https://lh3.googleusercontent.com/aida-public/AB6AXuDmJr6YBpzOW5UKsdHWsF5wjD-Ltorx-khZQmg84meJCePFPp-vgUakUK1ujuCEulWdNixPjBao3zUlBsW0Qsejue1k_qVAlEPq9A-NexgX021aD7TOMfaEXsuuD-MWv4Fl0fviZQk8SoA5Z15rzrXAubXlBS439ODIJVg5vLKXd7XtVNS-HYdlaLqX-HW96NloMESS-0yu9mEw3ik52qV3WP_JVMVpHOlsVbvRZMDsYcJv_ShLOCJgQ8blLOlIhJCoFVqJUfBq5g"
                    }}
                    className="w-16 h-16 rounded-lg"
                    resizeMode="cover"
                />
                <View className="flex-col justify-center flex-1">
                    <Text className="text-[#121517] font-grotesk-bold text-xl" numberOfLines={1}>
                        Rented Product
                    </Text>
                    <Text className="text-[#687b82] font-grotesk text-md" numberOfLines={2}>
                        {rentalData.product?.name || 'Product Name'}
                    </Text>
                </View>
            </View>

            <Text className="text-[#121517] text-2xl font-grotesk-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">
                Rental Details
            </Text>

            <View className="p-4">
                <View className="flex-row justify-between border-t border-t-[#dde2e4] py-5">
                    <Text className="text-[#687b82] text-lg font-grotesk font-normal leading-normal w-2/3">
                        Rental Start Date
                    </Text>
                    <Text className="text-[#121517] text-lg font-grotesk-bold font-normal leading-normal flex-1">
                        {formatDate(rentalData.startDate)}
                    </Text>
                </View>
                <View className="flex-row justify-between border-t border-t-[#dde2e4] py-5">
                    <Text className="text-[#687b82] text-lg font-grotesk font-normal leading-normal w-2/3">
                        Current Period
                    </Text>
                    <Text className="text-[#121517] text-lg font-grotesk-bold font-normal leading-normal flex-1">
                        {formatDate(rentalData.currentPeriodStartDate)} - {formatDate(rentalData.currentPeriodEndDate)}
                    </Text>
                </View>
                <View className="flex-row justify-between border-t border-t-[#dde2e4] py-5">
                    <Text className="text-[#687b82] text-lg font-grotesk font-normal leading-normal w-2/3">
                        Monthly Amount
                    </Text>
                    <Text className="text-[#121517] text-lg font-grotesk-bold font-normal leading-normal flex-1">
                        ₹{rentalData.monthlyAmount}
                    </Text>
                </View>
                <View className="flex-row justify-between border-t border-t-[#dde2e4] py-5">
                    <Text className="text-[#687b82] text-lg font-grotesk font-normal leading-normal w-2/3">
                        Deposit Amount
                    </Text>
                    <Text className="text-[#121517] text-lg font-grotesk-bold font-normal leading-normal flex-1">
                        ₹{rentalData.depositAmount}
                    </Text>
                </View>
                {rentalData.endDate && (
                    <View className="flex-row justify-between border-t border-t-[#dde2e4] py-5">
                        <Text className="text-[#687b82] text-lg font-grotesk font-normal leading-normal w-2/3">
                            End Date
                        </Text>
                        <Text className="text-[#121517] text-lg font-grotesk-bold font-normal leading-normal flex-1">
                            {formatDate(rentalData.endDate)}
                        </Text>
                    </View>
                )}
                {rentalData.pausedAt && (
                    <View className="flex-row justify-between border-t border-t-[#dde2e4] py-5">
                        <Text className="text-[#687b82] text-lg font-grotesk font-normal leading-normal w-2/3">
                            Paused Date
                        </Text>
                        <Text className="text-[#121517] text-lg font-grotesk-bold font-normal leading-normal flex-1">
                            {formatDate(rentalData.pausedAt)}
                        </Text>
                    </View>
                )}
            </View>

            <View className='p-4'>
                <Text className="text-[#121517] text-2xl font-grotesk-bold leading-tight tracking-[-0.015em] pb-2">
                    Rental Status
                </Text>
                <View className="flex-row justify-between py-5">
                    <Text className="text-[#687b82] text-lg font-grotesk font-normal leading-normal w-2/3">
                        Status
                    </Text>
                    <View className="flex-1">
                        <Text className={`text-lg font-grotesk-bold font-normal leading-normal ${rentalData.status === 'active' ? 'text-green-600' :
                            rentalData.status === 'paused' ? 'text-yellow-600' :
                                'text-red-600'
                            }`}>
                            {formatStatus(rentalData.status)}
                        </Text>
                    </View>
                </View>

                <View className="flex-row justify-between gap-6 py-5">
                    <Pressable
                        className={`flex-1 h-14 rounded-full items-center justify-center ${isCancelSheetOpening || rentalData.status !== 'active' ? 'bg-[#e5e7eb]' : 'bg-[#f1f3f4]'
                            }`}
                        onPress={handleCancelSubscription}
                        disabled={isCancelSheetOpening || rentalData.status !== 'active'}
                    >
                        <Text className={`text-lg font-grotesk-bold ${isCancelSheetOpening || rentalData.status !== 'active' ? 'text-[#687b82]' : 'text-[#121516]'
                            }`}>
                            {rentalData.status === 'paused' ? 'Resume Rental' : 'Cancel Rental'}
                        </Text>
                    </Pressable>
                    <Pressable
                        className={`flex-1 h-14 rounded-full items-center justify-center ${isServiceSheetOpening ? 'bg-[#e5e7eb]' : 'bg-[#f1f3f4]'
                            }`}
                        onPress={handleServiceRequest}
                        disabled={isServiceSheetOpening}
                    >
                        <Text className={`text-lg font-grotesk-bold ${isServiceSheetOpening ? 'text-[#687b82]' : 'text-[#121516]'
                            }`}>
                            Service Request
                        </Text>
                    </Pressable>
                </View>
            </View>

            {/* Cancel Rental Action Sheet */}
            <ActionSheet
                ref={cancelActionSheetRef}
                gestureEnabled={true}
                defaultOverlayOpacity={0.3}
            >
                <View className="p-6">
                    <Text className="text-[#121517] text-xl font-grotesk-bold text-center mb-4">
                        {rentalData?.status === 'paused' ? 'Resume Rental' : 'Cancel Rental'}
                    </Text>
                    <Text className="text-[#687b82] text-lg font-grotesk text-center mb-6">
                        {rentalData?.status === 'paused'
                            ? 'Are you sure you want to resume your rental subscription?'
                            : 'Are you sure you want to cancel your rental? This action cannot be undone.'
                        }
                    </Text>
                    <View className="gap-3">
                        <Pressable
                            className={`h-12 rounded-full items-center justify-center ${rentalData?.status === 'paused' ? 'bg-[#4fa3c4]' : 'bg-[#ff4444]'
                                }`}
                            onPress={onCancelConfirm}
                        >
                            <Text className="text-lg font-grotesk-bold text-white">
                                {rentalData?.status === 'paused' ? 'Yes, Resume Rental' : 'Yes, Cancel Rental'}
                            </Text>
                        </Pressable>
                        <Pressable
                            className="h-12 rounded-full items-center justify-center bg-[#f1f3f4]"
                            onPress={() => cancelActionSheetRef.current?.hide()}
                        >
                            <Text className="text-lg font-grotesk-bold text-[#121516]">
                                {rentalData?.status === 'paused' ? 'Keep Paused' : 'Keep Rental'}
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </ActionSheet>

            {/* Service Request Action Sheet */}
            <ActionSheet
                ref={serviceActionSheetRef}
                gestureEnabled={true}
                defaultOverlayOpacity={0.3}
            >
                <View className="p-6">
                    {/* Step 1: Service Type Selection */}
                    {serviceStep === 1 && (
                        <>
                            <Text className="text-[#121517] text-xl font-grotesk-bold text-center mb-2">
                                Service Request
                            </Text>
                            <Text className="text-[#687b82] text-sm font-grotesk text-center mb-6">
                                Step 1 of 3 - Select Service Type
                            </Text>
                            <Text className="text-[#687b82] text-lg font-grotesk text-center mb-6">
                                What type of service do you need?
                            </Text>
                            <View className="gap-3 mb-6">
                                {['Filter Replacement', 'Maintenance', 'Technical Support', 'Installation'].map((serviceType) => (
                                    <Pressable
                                        key={serviceType}
                                        className={`h-12 rounded-full items-center justify-center border ${selectedServiceType === serviceType
                                            ? 'bg-[#4fa3c4] border-[#4fa3c4]'
                                            : 'bg-[#f1f3f4] border-[#dde2e4]'
                                            }`}
                                        onPress={() => onServiceTypeSelect(serviceType)}
                                    >
                                        <Text className={`text-lg font-grotesk-bold ${selectedServiceType === serviceType ? 'text-white' : 'text-[#121516]'
                                            }`}>
                                            {serviceType}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>
                            <View className="flex-row gap-3">
                                <Pressable
                                    className="flex-1 h-12 rounded-full items-center justify-center bg-[#e5e7eb]"
                                    onPress={handleServiceCancel}
                                >
                                    <Text className="text-lg font-grotesk text-[#687b82]">Cancel</Text>
                                </Pressable>
                                <Pressable
                                    className={`flex-1 h-12 rounded-full items-center justify-center ${selectedServiceType ? 'bg-[#4fa3c4]' : 'bg-[#e5e7eb]'
                                        }`}
                                    onPress={handleServiceNext}
                                    disabled={!selectedServiceType}
                                >
                                    <Text className={`text-lg font-grotesk-bold ${selectedServiceType ? 'text-white' : 'text-[#687b82]'
                                        }`}>
                                        Next
                                    </Text>
                                </Pressable>
                            </View>
                        </>
                    )}

                    {/* Step 2: Description */}
                    {serviceStep === 2 && (
                        <>
                            <Text className="text-[#121517] text-xl font-grotesk-bold text-center mb-2">
                                Service Request
                            </Text>
                            <Text className="text-[#687b82] text-sm font-grotesk text-center mb-6">
                                Step 2 of 3 - Describe the Issue
                            </Text>
                            <View className="mb-4">
                                <Text className="text-[#121517] text-lg font-grotesk-bold mb-2">
                                    Service Type: {selectedServiceType}
                                </Text>
                                <Text className="text-[#687b82] text-lg font-grotesk mb-4">
                                    Please describe the issue or details about your service request:
                                </Text>
                                <TextInput
                                    className="bg-[#f1f3f4] rounded-lg p-4 h-32 text-[#121517] font-grotesk text-lg border border-[#dde2e4]"
                                    placeholder="Enter your description here..."
                                    placeholderTextColor="#687b82"
                                    multiline
                                    textAlignVertical="top"
                                    value={serviceDescription}
                                    onChangeText={setServiceDescription}
                                />
                            </View>
                            <View className="flex-row gap-3">
                                <Pressable
                                    className="flex-1 h-12 rounded-full items-center justify-center bg-[#e5e7eb]"
                                    onPress={handleServiceBack}
                                >
                                    <Text className="text-lg font-grotesk text-[#687b82]">Back</Text>
                                </Pressable>
                                <Pressable
                                    className={`flex-1 h-12 rounded-full items-center justify-center ${serviceDescription.trim() ? 'bg-[#4fa3c4]' : 'bg-[#e5e7eb]'
                                        }`}
                                    onPress={handleServiceNext}
                                    disabled={!serviceDescription.trim()}
                                >
                                    <Text className={`text-lg font-grotesk-bold ${serviceDescription.trim() ? 'text-white' : 'text-[#687b82]'
                                        }`}>
                                        Next
                                    </Text>
                                </Pressable>
                            </View>
                        </>
                    )}

                    {/* Step 3: Pictures */}
                    {serviceStep === 3 && (
                        <>
                            <Text className="text-[#121517] text-xl font-grotesk-bold text-center mb-2">
                                Service Request
                            </Text>
                            <Text className="text-[#687b82] text-sm font-grotesk text-center mb-6">
                                Step 3 of 3 - Add Pictures (Optional)
                            </Text>
                            <View className="mb-4">
                                <Text className="text-[#121517] text-lg font-grotesk-bold mb-2">
                                    Service Type: {selectedServiceType}
                                </Text>
                                <Text className="text-[#687b82] text-lg font-grotesk mb-4">
                                    Add pictures to help us better understand the issue:
                                </Text>

                                {/* Upload Button */}
                                <Pressable
                                    className="bg-[#f1f3f4] border-2 border-dashed border-[#4fa3c4] rounded-lg p-6 items-center justify-center mb-4"
                                    onPress={handleImageUpload}
                                >
                                    <Text className="text-[#4fa3c4] text-lg font-grotesk-bold mb-2">📷 Upload Pictures</Text>
                                    <Text className="text-[#687b82] text-sm font-grotesk text-center">
                                        Tap to add photos from your gallery or camera
                                    </Text>
                                </Pressable>

                                {/* Uploaded Images */}
                                {uploadedImages.length > 0 && (
                                    <View className="mb-4">
                                        <Text className="text-[#121517] text-lg font-grotesk-bold mb-2">
                                            Uploaded Images ({uploadedImages.length})
                                        </Text>
                                        <View className="flex-row flex-wrap gap-2">
                                            {uploadedImages.map((image, index) => (
                                                <View key={index} className="bg-[#e5e7eb] rounded-lg p-3 flex-row items-center">
                                                    <Text className="text-[#121517] font-grotesk mr-2">📷 {image.name}</Text>
                                                    <Pressable onPress={() => removeImage(index)}>
                                                        <Text className="text-red-500 font-grotesk-bold">✕</Text>
                                                    </Pressable>
                                                </View>
                                            ))}
                                        </View>
                                    </View>
                                )}
                            </View>
                            <View className="flex-row gap-3">
                                <Pressable
                                    className="flex-1 h-12 rounded-full items-center justify-center bg-[#e5e7eb]"
                                    onPress={handleServiceBack}
                                    disabled={isSubmitting}
                                >
                                    <Text className="text-lg font-grotesk text-[#687b82]">Back</Text>
                                </Pressable>
                                <Pressable
                                    className={`flex-1 h-12 rounded-full items-center justify-center ${isSubmitting ? 'bg-[#e5e7eb]' : 'bg-[#4fa3c4]'
                                        }`}
                                    onPress={handleServiceNext}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <ActivityIndicator color="#687b82" size="small" />
                                    ) : (
                                        <Text className="text-lg font-grotesk-bold text-white">Submit Request</Text>
                                    )}
                                </Pressable>
                            </View>
                        </>
                    )}
                </View>
            </ActionSheet>
        </ScrollView>
    )
}

export default SubscriptionDetails