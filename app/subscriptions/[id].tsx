import BackArrowIcon from '@/components/icons/BackArrowIcon'
import { useNavigation } from 'expo-router'
import React, { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { Alert, Image, Pressable, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import ActionSheet from 'react-native-actions-sheet'

const SubscriptionDetails = () => {
    const cancelActionSheetRef = useRef(null)
    const serviceActionSheetRef = useRef(null)

    // Service request state
    const [serviceStep, setServiceStep] = useState(1)
    const [selectedServiceType, setSelectedServiceType] = useState('')
    const [serviceDescription, setServiceDescription] = useState('')
    const [uploadedImages, setUploadedImages] = useState([])


    const [isServiceSheetOpening, setIsServiceSheetOpening] = useState(false)
    const [isCancelSheetOpening, setIsCancelSheetOpening] = useState(false)

    const navigation = useNavigation();

    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: () => (
                <Text className="text-2xl font-grotesk-bold text-[#121516]">SUBSCRIPTION DETAILS</Text>
            ),
            headerTitleAlign: 'center',
            headerLeft: () => (
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <BackArrowIcon />
                </TouchableOpacity>
            ),
        });
    }, [navigation]);

    // Use useCallback to prevent recreation of functions
    const handleCancelSubscription = useCallback(async () => {
        if (isCancelSheetOpening) return;

        try {
            setIsCancelSheetOpening(true);
            // Add small delay to ensure proper state update
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

            // Add small delay to ensure proper state update
            setTimeout(() => {
                serviceActionSheetRef.current?.show();
                setIsServiceSheetOpening(false);
            }, 100);
        } catch (error) {
            console.log('Error opening service sheet:', error);
            setIsServiceSheetOpening(false);
        }
    }, [isServiceSheetOpening]);

    const onCancelConfirm = useCallback(() => {
        // Handle cancel subscription logic here
        console.log('Subscription cancelled');
        cancelActionSheetRef.current?.hide();
    }, []);

    const onServiceTypeSelect = useCallback((serviceType) => {
        setSelectedServiceType(serviceType);
    }, []);

    const handleServiceNext = useCallback(() => {
        if (serviceStep === 1 && selectedServiceType) {
            setServiceStep(2);
        } else if (serviceStep === 2 && serviceDescription.trim()) {
            setServiceStep(3);
        } else if (serviceStep === 3) {
            // Submit service request
            console.log('Service Request Submitted:', {
                type: selectedServiceType,
                description: serviceDescription,
                images: uploadedImages
            });
            Alert.alert('Success', 'Your service request has been submitted successfully!');
            serviceActionSheetRef.current?.hide();
        }
    }, [serviceStep, selectedServiceType, serviceDescription, uploadedImages]);

    const handleServiceCancel = useCallback(() => {
        serviceActionSheetRef.current?.hide();
    }, []);

    const handleServiceBack = useCallback(() => {
        if (serviceStep > 1) {
            setServiceStep(serviceStep - 1);
        }
    }, [serviceStep]);

    const handleImageUpload = useCallback(() => {
        // Simulate image upload
        const newImage = `image_${Date.now()}.jpg`;
        setUploadedImages(prev => [...prev, newImage]);
    }, []);

    const removeImage = useCallback((index) => {
        setUploadedImages(prev => prev.filter((_, i) => i !== index));
    }, []);

    return (
        <ScrollView className="flex-1 bg-white">
            <View className="flex-row items-center gap-4 bg-white px-4 min-h-[72px] py-4">
                <Image
                    source={{
                        uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuDmJr6YBpzOW5UKsdHWsF5wjD-Ltorx-khZQmg84meJCePFPp-vgUakUK1ujuCEulWdNixPjBao3zUlBsW0Qsejue1k_qVAlEPq9A-NexgX021aD7TOMfaEXsuuD-MWv4Fl0fviZQk8SoA5Z15rzrXAubXlBS439ODIJVg5vLKXd7XtVNS-HYdlaLqX-HW96NloMESS-0yu9mEw3ik52qV3WP_JVMVpHOlsVbvRZMDsYcJv_ShLOCJgQ8blLOlIhJCoFVqJUfBq5g"
                    }}
                    className="w-16 h-16 rounded-lg"
                    resizeMode="cover"
                />
                <View className="flex-col justify-center flex-1">
                    <Text className="text-[#121517] font-grotesk-bold text-xl" numberOfLines={1}>
                        Items Purchased
                    </Text>
                    <Text className="text-[#687b82] font-grotesk text-md" numberOfLines={2}>
                        AquaHome 3-Stage Filtration System
                    </Text>
                </View>
            </View>

            <Text className="text-[#121517] text-2xl font-grotesk-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">
                Subscription Details
            </Text>

            <View className="p-4">
                {/* Request ID */}
                <View className="flex-row justify-between border-t border-t-[#dde2e4] py-5">
                    <Text className="text-[#687b82] text-lg font-grotesk font-normal leading-normal w-2/3">
                        Subscription Start Date
                    </Text>
                    <Text className="text-[#121517] text-lg font-grotesk-bold font-normal leading-normal flex-1">
                        July 20, 2024
                    </Text>
                </View>
                <View className="flex-row justify-between border-t border-t-[#dde2e4] py-5">
                    <Text className="text-[#687b82] text-lg font-grotesk font-normal leading-normal w-2/3">
                        Renewal Frequency
                    </Text>
                    <Text className="text-[#121517] text-lg font-grotesk-bold font-normal leading-normal flex-1">
                        Monthly
                    </Text>
                </View>
                <View className="flex-row justify-between border-t border-t-[#dde2e4] py-5">
                    <Text className="text-[#687b82] text-lg font-grotesk font-normal leading-normal w-2/3">
                        Next Renewal Date
                    </Text>
                    <Text className="text-[#121517] text-lg font-grotesk-bold font-normal leading-normal flex-1">
                        July 20, 2024
                    </Text>
                </View>
                <View className="flex-row justify-between border-t border-t-[#dde2e4] py-5">
                    <Text className="text-[#687b82] text-lg font-grotesk font-normal leading-normal w-2/3">
                        Payment Details
                    </Text>
                    <Text className="text-[#121517] text-lg font-grotesk-bold font-normal leading-normal flex-1">
                        visa***4344
                    </Text>
                </View>
            </View>

            <View className='p-4'>
                <Text className="text-[#121517] text-2xl font-grotesk-bold leading-tight tracking-[-0.015em] pb-2">
                    Subscription Status
                </Text>
                <View className="flex-row justify-between py-5">
                    <Text className="text-[#687b82] text-lg font-grotesk font-normal leading-normal w-2/3">
                        Subscription Status
                    </Text>
                    <Text className="text-[#121517] text-lg font-grotesk-bold font-normal leading-normal flex-1">
                        Active
                    </Text>
                </View>

                <View className="flex-row justify-between gap-6 py-5">
                    <Pressable
                        className={`flex-1 h-14 rounded-full items-center justify-center ${isCancelSheetOpening ? 'bg-[#e5e7eb]' : 'bg-[#f1f3f4]'
                            }`}
                        onPress={handleCancelSubscription}
                        disabled={isCancelSheetOpening}
                    >
                        <Text className={`text-lg font-grotesk-bold ${isCancelSheetOpening ? 'text-[#687b82]' : 'text-[#121516]'
                            }`}>
                            Cancel Subscription
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

            {/* Cancel Subscription Action Sheet */}
            <ActionSheet
                ref={cancelActionSheetRef}
                gestureEnabled={true}
                defaultOverlayOpacity={0.3}
            >
                <View className="p-6">
                    <Text className="text-[#121517] text-xl font-grotesk-bold text-center mb-4">
                        Cancel Subscription
                    </Text>
                    <Text className="text-[#687b82] text-lg font-grotesk text-center mb-6">
                        Are you sure you want to cancel your subscription? This action cannot be undone.
                    </Text>
                    <View className="gap-3">
                        <Pressable
                            className="h-12 rounded-full items-center justify-center bg-[#ff4444]"
                            onPress={onCancelConfirm}
                        >
                            <Text className="text-lg font-grotesk-bold text-white">Yes, Cancel Subscription</Text>
                        </Pressable>
                        <Pressable
                            className="h-12 rounded-full items-center justify-center bg-[#f1f3f4]"
                            onPress={() => cancelActionSheetRef.current?.hide()}
                        >
                            <Text className="text-lg font-grotesk-bold text-[#121516]">Keep Subscription</Text>
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
                                                    <Text className="text-[#121517] font-grotesk mr-2">📷 {image}</Text>
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
                                >
                                    <Text className="text-lg font-grotesk text-[#687b82]">Back</Text>
                                </Pressable>
                                <Pressable
                                    className="flex-1 h-12 rounded-full items-center justify-center bg-[#4fa3c4]"
                                    onPress={handleServiceNext}
                                >
                                    <Text className="text-lg font-grotesk-bold text-white">Submit Request</Text>
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