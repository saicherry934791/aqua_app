import BackArrowIcon from '@/components/icons/BackArrowIcon';
import { useNavigation } from 'expo-router';
import React, { useLayoutEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    Image,
    TouchableOpacity,
    SafeAreaView,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

// Icon Components
const ArrowLeftIcon = ({ size = 24, color = "#121517" }) => (
    <Svg width={size} height={size} fill={color} viewBox="0 0 256 256">
        <Path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z" />
    </Svg>
);

const CircleIcon = ({ size = 24, color = "#121517" }) => (
    <Svg width={size} height={size} fill={color} viewBox="0 0 256 256">
        <Path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Z" />
    </Svg>
);

const CheckCircleIcon = ({ size = 24, color = "#121517" }) => (
    <Svg width={size} height={size} fill={color} viewBox="0 0 256 256">
        <Path d="M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z" />
    </Svg>
);

const OrderDetails = () => {
    const orderStatusSteps = [
        {
            title: "Order Placed",
            date: "October 15, 2023",
            completed: true,
        },
        {
            title: "Processing",
            date: "October 16, 2023",
            completed: true,
        },
        {
            title: "Shipped",
            date: "October 17, 2023",
            completed: true,
        },
        {
            title: "Delivered",
            date: "October 20, 2023",
            completed: true,
            isLast: true,
        },
    ];

    const navigation = useNavigation();
    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: () => (

                <Text className="text-2xl font-grotesk-bold text-[#121516]">ORDER DETAILS</Text>

            ),
            headerTitleAlign: 'center',

            headerLeft: () => (
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <BackArrowIcon />
                </TouchableOpacity>
            ),
        });
    }, [navigation]);

    return (

        <ScrollView className="flex-1 bg-white">
            {/* Request Details Section */}

            {/* Items Purchased */}
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
                Order Details
            </Text>

            <View className="p-4">
                {/* Request ID */}
                <View className="flex-row justify-between border-t border-t-[#dde2e4] py-5">
                    <Text className="text-[#687b82] text-lg font-grotesk font-normal leading-normal w-1/3">
                        Request ID
                    </Text>
                    <Text className="text-[#121517] text-lg font-grotesk-bold font-normal leading-normal flex-1">
                        #123456789
                    </Text>
                </View>

                {/* Product */}
                <View className="flex-row justify-between border-t border-t-[#dde2e4] py-5">
                    <Text className="text-[#687b82] text-lg font-grotesk font-normal leading-normal w-1/3">
                        Product
                    </Text>
                    <Text className="text-[#121517] text-lg font-grotesk-bold font-normal leading-normal flex-1">
                        AquaHome Filter Replacement
                    </Text>
                </View>
                <View className="flex-row justify-between border-t border-t-[#dde2e4] py-5">
                    <Text className="text-[#687b82] text-lg font-grotesk font-normal leading-normal w-1/3">
                        Total Amount
                    </Text>
                    <Text className="text-[#121517] text-lg font-grotesk-bold font-normal leading-normal flex-1">
                        $49.99
                    </Text>
                </View>
                <View className="flex-row justify-between border-t border-t-[#dde2e4] py-5">
                    <Text className="text-[#687b82] text-lg font-grotesk font-normal leading-normal w-1/3">
                        Shipping Address
                    </Text>
                    <Text className="text-[#121517] text-lg font-grotesk-bold font-normal leading-normal flex-1">
                        123 Clear Stream Ave, Apt 4B, Crystal Springs, CA 91234
                    </Text>
                </View>
            </View>







            <Text className="text-[#121517] text-2xl font-grotesk-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">
                Order Status
            </Text>

            {/* Order Status Timeline */}
            <View className="px-4">
                {orderStatusSteps.map((step, index) => (
                    <View key={index} className="flex-row">
                        {/* Icon and Line Column */}
                        <View className="flex-col items-center gap-1 w-10 mr-2">
                            {/* Top connecting line (except for first item) */}
                            {index > 0 && (
                                <View className="w-[1.5px] bg-[#dde2e4] h-2" />
                            )}

                            {/* Icon */}
                            <View className="pt-3">
                                {step.completed && step.isLast ? (
                                    <CheckCircleIcon />
                                ) : (
                                    <CircleIcon />
                                )}
                            </View>

                            {/* Bottom connecting line (except for last item) */}
                            {!step.isLast && (
                                <View className="w-[1.5px] bg-[#dde2e4] h-2 flex-1" />
                            )}
                        </View>

                        {/* Content Column */}
                        <View className="flex-1 py-3">
                            <Text className="text-[#121517] font-grotesk-bold text-xl ">
                                {step.title}
                            </Text>
                            <Text className="text-[#687b82] font-grotesk text-lg ">
                                {step.date}
                            </Text>
                        </View>
                    </View>
                ))}
            </View>

            {/* Bottom Spacer */}
            <View className="h-5 bg-white" />
        </ScrollView>

    );
};

export default OrderDetails;