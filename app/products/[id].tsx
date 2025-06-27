import React, { useEffect, useLayoutEffect, useState } from "react";
import { View, Text, ScrollView, Pressable, ImageBackground, Dimensions, TouchableOpacity, Share, Alert } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    useAnimatedScrollHandler,
    interpolate,
    runOnJS,
} from "react-native-reanimated";
import { Svg, Path } from "react-native-svg";
import { useNavigation, useRouter } from "expo-router";
import BackArrowIcon from "@/components/icons/BackArrowIcon";
import { Share as ShareIcon, ShoppingCart } from "lucide-react-native";
import SkeletonWrapper from "@/components/skeltons/SkeletonWrapper";
import ProductSkeleton from "@/components/skeltons/ProductSkeleton";
import { useCart } from "@/contexts/CartContext";

const { width: screenWidth } = Dimensions.get("window");

// Sample product images
const productImages = [
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCcLl3fm5M50mJ0APveerg7cWdkkb8AcwYjplCOPdfxwNtIDYwrPUWUsv631WaC5JVMr6PGaCQRG5D2e4Qduqr1PBcFxa1NwbTssnNsSgfTN_sDETTRMBAbyAVVvsBelPPc7u21uisWJZJUKwfPxC2-A9k4Z-j1RNYxv3uCBemOSyKDSOp3IzO6QedN9lTqxIaK2qw109k4HWsHlbznJhD0ae_gJ7kXvSeut9Fsvq5NZCSj0mPOmZtul3DfEjdr2J0O1IwAWhQ2aQ",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCcLl3fm5M50mJ0APveerg7cWdkkb8AcwYjplCOPdfxwNtIDYwrPUWUsv631WaC5JVMr6PGaCQRG5D2e4Qduqr1PBcFxa1NwbTssnNsSgfTN_sDETTRMBAbyAVVvsBelPPc7u21uisWJZJUKwfPxC2-A9k4Z-j1RNYxv3uCBemOSyKDSOp3IzO6QedN9lTqxIaK2qw109k4HWsHlbznJhD0ae_gJ7kXvSeut9Fsvq5NZCSj0mPOmZtul3DfEjdr2J0O1IwAWhQ2aQ",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCcLl3fm5M50mJ0APveerg7cWdkkb8AcwYjplCOPdfxwNtIDYwrPUWUsv631WaC5JVMr6PGaCQRG5D2e4Qduqr1PBcFxa1NwbTssnNsSgfTN_sDETTRMBAbyAVVvsBelPPc7u21uisWJZJUKwfPxC2-A9k4Z-j1RNYxv3uCBemOSyKDSOp3IzO6QedN9lTqxIaK2qw109k4HWsHlbznJhD0ae_gJ7kXvSeut9Fsvq5NZCSj0mPOmZtul3DfEjdr2J0O1IwAWhQ2aQ",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCcLl3fm5M50mJ0APveerg7cWdkkb8AcwYjplCOPdfxwNtIDYwrPUWUsv631WaC5JVMr6PGaCQRG5D2e4Qduqr1PBcFxa1NwbTssnNsSgfTN_sDETTRMBAbyAVVvsBelPPc7u21uisWJZJUKwfPxC2-A9k4Z-j1RNYxv3uCBemOSyKDSOp3IzO6QedN9lTqxIaK2qw109k4HWsHlbznJhD0ae_gJ7kXvSeut9Fsvq5NZCSj0mPOmZtul3DfEjdr2J0O1IwAWhQ2aQ",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCcLl3fm5M50mJ0APveerg7cWdkkb8AcwYjplCOPdfxwNtIDYwrPUWUsv631WaC5JVMr6PGaCQRG5D2e4Qduqr1PBcFxa1NwbTssnNsSgfTN_sDETTRMBAbyAVVvsBelPPc7u21uisWJZJUKwfPxC2-A9k4Z-j1RNYxv3uCBemOSyKDSOp3IzO6QedN9lTqxIaK2qw109k4HWsHlbznJhD0ae_gJ7kXvSeut9Fsvq5NZCSj0mPOmZtul3DfEjdr2J0O1IwAWhQ2aQ",
];

// Product data
const productData = {
    id: '1',
    name: 'AquaHome Pro',
    description: 'The AquaHome Pro is a state-of-the-art water purifier designed to provide clean, safe, and great-tasting water for your home. With its advanced filtration system, it removes impurities, contaminants, and odors, ensuring your family\'s health and well-being.',
    price: 2999,
    subscriptionPrices: {
        monthly: 299,
        quarterly: 799, // 10% discount
        yearly: 2879, // 20% discount
    },
    image: productImages[0],
};

export default function AquaHomeProductScreen() {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<'product' | 'subscription'>('product');
    const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
    const scrollX = useSharedValue(0);
    const scrollY = useSharedValue(0);
    const addToCartScale = useSharedValue(1);
    const subscriptionScale = useSharedValue(1);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const navigation = useNavigation();
    const router = useRouter();
    const { addToCart } = useCart();

    const imageScrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollX.value = event.contentOffset.x;
            const index = Math.round(event.contentOffset.x / (screenWidth - 32));
            runOnJS(setCurrentImageIndex)(index);
        },
    });

    const mainScrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.value = event.contentOffset.y;
        },
    });

    const headerAnimatedStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            scrollY.value,
            [0, 100, 200],
            [1, 0.95, 0.9],
            'clamp'
        );

        return {
            opacity,
        };
    });

    const addToCartAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: addToCartScale.value }],
    }));

    const subscriptionAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: subscriptionScale.value }],
    }));

    const handleAddToCartPress = () => {
        addToCartScale.value = withSpring(0.95, {}, () => {
            addToCartScale.value = withSpring(1);
        });

        const item = {
            id: productData.id,
            name: productData.name,
            price: selectedOption === 'product' ? productData.price : productData.subscriptionPrices[selectedPlan],
            image: productData.image,
            type: selectedOption,
            ...(selectedOption === 'subscription' && { subscriptionPlan: selectedPlan }),
        };

        addToCart(item);
        
        Alert.alert(
            'Added to Cart',
            `${productData.name} has been added to your cart.`,
            [
                { text: 'Continue Shopping', style: 'cancel' },
                { text: 'View Cart', onPress: () => router.push('/(tabs)/cart') },
            ]
        );
    };

    const handleSubscriptionPress = () => {
        subscriptionScale.value = withSpring(0.95, {}, () => {
            subscriptionScale.value = withSpring(1);
        });
        setSelectedOption('subscription');
    };

    const shareListing = async () => {
        try {
            await Share.share({
                title: "AquaHome",
                url: "https://aqua-home.com",
            });
        } catch (err) {
            console.log("Share Error: ", err);
        }
    };

    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: () => (
                <Text className="text-2xl font-grotesk-bold text-[#121516]">PRODUCT DETAILS</Text>
            ),
            headerTitleAlign: 'center',
            headerLeft: () => (
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <BackArrowIcon />
                </TouchableOpacity>
            ),
            headerRight: () => (
                <TouchableOpacity onPress={shareListing}>
                    <ShareIcon />
                </TouchableOpacity>
            ),
        });
    }, [navigation]);

    const fetchProduct = async () => {
        try {
            setLoading(true);
            const res = await new Promise((resolve) =>
                setTimeout(() => resolve({}), 1000)
            );
        } catch (err) {
            console.error('Fetch failed', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchProduct();
    };

    useEffect(() => {
        fetchProduct();
    }, []);

    const getDiscountPercentage = (plan: string) => {
        switch (plan) {
            case 'quarterly': return 10;
            case 'yearly': return 20;
            default: return 0;
        }
    };

    return (
        <SafeAreaProvider>
            <SafeAreaView className="flex-1">
                <SkeletonWrapper
                    loading={loading}
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    skeleton={<ProductSkeleton />}
                    style={{ paddingBottom: 120 }}
                >
                    {/* Banner Image Carousel */}
                    <Animated.View sharedTransitionTag='productImage' style={headerAnimatedStyle} className="mb-6">
                        <Animated.ScrollView
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            onScroll={imageScrollHandler}
                            scrollEventThrottle={16}
                        >
                            {productImages.map((imageUri, index) => (
                                <ImageBackground
                                    key={index}
                                    source={{ uri: imageUri }}
                                    resizeMode="cover"
                                    className="min-h-[320px] w-screen overflow-hidden justify-end"
                                />
                            ))}
                        </Animated.ScrollView>
                    </Animated.View>

                    <View className='px-4'>
                        {/* Title */}
                        <Text className="text-3xl font-grotesk-bold text-[#121516] pt-2 pb-2 mb-4">
                            {productData.name}
                        </Text>

                        {/* Purchase Options */}
                        <View className="mb-6">
                            <Text className="text-xl font-grotesk-bold text-[#121516] mb-4">
                                Choose Your Option
                            </Text>
                            
                            <View className="flex-row mb-4">
                                <TouchableOpacity
                                    onPress={() => setSelectedOption('product')}
                                    className={`flex-1 p-4 rounded-l-xl border-2 ${
                                        selectedOption === 'product' 
                                            ? 'border-[#4fa3c4] bg-[#e8f4f8]' 
                                            : 'border-[#e1e5e7] bg-white'
                                    }`}
                                >
                                    <Text className={`text-lg font-grotesk-bold text-center ${
                                        selectedOption === 'product' ? 'text-[#4fa3c4]' : 'text-[#687b82]'
                                    }`}>
                                        Buy Product
                                    </Text>
                                    <Text className="text-2xl font-grotesk-bold text-center text-[#121516] mt-1">
                                        ₹{productData.price.toFixed(2)}
                                    </Text>
                                    <Text className="text-sm font-grotesk text-center text-[#687b82]">
                                        One-time payment
                                    </Text>
                                </TouchableOpacity>
                                
                                <TouchableOpacity
                                    onPress={() => setSelectedOption('subscription')}
                                    className={`flex-1 p-4 rounded-r-xl border-2 ${
                                        selectedOption === 'subscription' 
                                            ? 'border-[#4fa3c4] bg-[#e8f4f8]' 
                                            : 'border-[#e1e5e7] bg-white'
                                    }`}
                                >
                                    <Text className={`text-lg font-grotesk-bold text-center ${
                                        selectedOption === 'subscription' ? 'text-[#4fa3c4]' : 'text-[#687b82]'
                                    }`}>
                                        Rent Product
                                    </Text>
                                    <Text className="text-2xl font-grotesk-bold text-center text-[#121516] mt-1">
                                        ₹{productData.subscriptionPrices[selectedPlan].toFixed(2)}
                                    </Text>
                                    <Text className="text-sm font-grotesk text-center text-[#687b82]">
                                        {selectedPlan} billing
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {/* Subscription Plans */}
                            {selectedOption === 'subscription' && (
                                <View className="space-y-3">
                                    {(['monthly', 'quarterly', 'yearly'] as const).map((plan) => {
                                        const discount = getDiscountPercentage(plan);
                                        return (
                                            <TouchableOpacity
                                                key={plan}
                                                onPress={() => setSelectedPlan(plan)}
                                                className={`p-4 rounded-xl border-2 ${
                                                    selectedPlan === plan 
                                                        ? 'border-[#4fa3c4] bg-[#e8f4f8]' 
                                                        : 'border-[#e1e5e7] bg-white'
                                                }`}
                                            >
                                                <View className="flex-row justify-between items-center">
                                                    <View className="flex-1">
                                                        <View className="flex-row items-center">
                                                            <Text className="text-lg font-grotesk-bold text-[#121516] capitalize">
                                                                {plan} Plan
                                                            </Text>
                                                            {discount > 0 && (
                                                                <View className="bg-[#4fa3c4] px-2 py-1 rounded ml-2">
                                                                    <Text className="text-xs font-grotesk-bold text-white">
                                                                        {discount}% OFF
                                                                    </Text>
                                                                </View>
                                                            )}
                                                        </View>
                                                        <Text className="text-sm font-grotesk text-[#687b82]">
                                                            Billed {plan}
                                                        </Text>
                                                    </View>
                                                    <Text className="text-xl font-grotesk-bold text-[#121516]">
                                                        ₹{productData.subscriptionPrices[plan].toFixed(2)}
                                                    </Text>
                                                </View>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            )}
                        </View>

                        {/* Description */}
                        <Text className="text-lg font-grotesk text-[#121516] pb-3 mb-8">
                            {productData.description}
                        </Text>

                        {/* Key Features */}
                        <Text className="text-2xl font-grotesk-bold text-[#121516] pt-4 pb-2 mb-4">
                            Key Features
                        </Text>
                        {[
                            ["Filtration Technology", "Multi-stage filtration system"],
                            ["Capacity", "10 liters"],
                            ["Dimensions", "30cm x 20cm x 40cm"],
                            ["Warranty", "2 years"],
                        ].map(([label, value], i) => (
                            <View key={i} className="py-5 border-t border-[#dde2e3]">
                                <View className="flex-row gap-4">
                                    <Text className="text-xl w-1/2 font-grotesk text-[#6a7a81]">{label}</Text>
                                    <Text className="text-xl w-1/2 font-grotesk-medium text-[#121516]">{value}</Text>
                                </View>
                            </View>
                        ))}

                        {/* Reviews */}
                        <Text className="text-2xl font-grotesk-bold text-[#121516] pt-8 pb-2 mb-4">
                            Product Reviews
                        </Text>
                        <View className="flex-row flex-wrap items-center justify-center gap-x-8 gap-y-6 pb-4 mb-8">
                            <View className="flex gap-2 items-center justify-center">
                                <Text className="text-8xl font-grotesk-bold text-[#121516]">4.5</Text>
                                <View className="flex-row gap-0.5">
                                    {[1, 2, 3, 4].map((i) => (
                                        <Svg key={i} width={18} height={18} viewBox="0 0 256 256" fill="#FFD700">
                                            <Path d="M234.5,114.38l-45.1,39.36,13.51,58.6a16,16,0,0,1-23.84,17.34l-51.11-31-51,31a16,16,0,0,1-23.84-17.34L66.61,153.8,21.5,114.38a16,16,0,0,1,9.11-28.06l59.46-5.15,23.21-55.36a15.95,15.95,0,0,1,29.44,0h0L165.93,81.17l59.46,5.15a16,16,0,0,1,9.11,28.06Z" />
                                        </Svg>
                                    ))}
                                    <Svg width={18} height={18} viewBox="0 0 256 256" fill="#E5E7EB">
                                        <Path d="M234.5,114.38l-45.1,39.36,13.51,58.6a16,16,0,0,1-23.84,17.34l-51.11-31-51,31a16,16,0,0,1-23.84-17.34L66.61,153.8,21.5,114.38a16,16,0,0,1,9.11-28.06l59.46-5.15,23.21-55.36a15.95,15.95,0,0,1,29.44,0h0L165.93,81.17l59.46,5.15a16,16,0,0,1,9.11,28.06Z" />
                                    </Svg>
                                </View>
                                <Text className="text-base font-grotesk text-center text-[#121516]">125 reviews</Text>
                            </View>
                        </View>
                    </View>
                </SkeletonWrapper>

                {/* Sticky CTA Buttons */}
                <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-[#dde2e3] shadow-lg px-4">
                    <View className="flex-row py-6 gap-3 w-full">
                        <Animated.View style={addToCartAnimatedStyle} className="flex-1">
                            <Pressable
                                className="flex-1 h-14 rounded-full items-center justify-center bg-[#4fa3c4] flex-row"
                                onPress={handleAddToCartPress}
                            >
                                <ShoppingCart size={20} color="white" />
                                <Text className="text-lg font-grotesk-bold text-white ml-2">
                                    Add to Cart
                                </Text>
                            </Pressable>
                        </Animated.View>
                    </View>
                </View>
            </SafeAreaView>
        </SafeAreaProvider>
    );
}