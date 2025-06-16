import React, { useLayoutEffect, useState } from "react";
import { View, Text, ScrollView, Pressable, ImageBackground, Dimensions, TouchableOpacity, Share } from "react-native";
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
import { useNavigation } from "expo-router";
import BackArrowIcon from "@/components/icons/BackArrowIcon";
import { ShareIcon } from "lucide-react-native";

const { width: screenWidth } = Dimensions.get("window");

// Sample product images
const productImages = [
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCcLl3fm5M50mJ0APveerg7cWdkkb8AcwYjplCOPdfxwNtIDYwrPUWUsv631WaC5JVMr6PGaCQRG5D2e4Qduqr1PBcFxa1NwbTssnNsSgfTN_sDETTRMBAbyAVVvsBelPPc7u21uisWJZJUKwfPxC2-A9k4Z-j1RNYxv3uCBemOSyKDSOp3IzO6QedN9lTqxIaK2qw109k4HWsHlbznJhD0ae_gJ7kXvSeut9Fsvq5NZCSj0mPOmZtul3DfEjdr2J0O1IwAWhQ2aQ",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCcLl3fm5M50mJ0APveerg7cWdkkb8AcwYjplCOPdfxwNtIDYwrPUWUsv631WaC5JVMr6PGaCQRG5D2e4Qduqr1PBcFxa1NwbTssnNsSgfTN_sDETTRMBAbyAVVvsBelPPc7u21uisWJZJUKwfPxC2-A9k4Z-j1RNYxv3uCBemOSyKDSOp3IzO6QedN9lTqxIaK2qw109k4HWsHlbznJhD0ae_gJ7kXvSeut9Fsvq5NZCSj0mPOmZtul3DfEjdr2J0O1IwAWhQ2aQ",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCcLl3fm5M50mJ0APveerg7cWdkkb8AcwYjplCOPdfxwNtIDYwrPUWUsv631WaC5JVMr6PGaCQRG5D2e4Qduqr1PBcFxa1NwbTssnNsSgfTN_sDETTRMBAbyAVVvsBelPPc7u21uisWJZJUKwfPxC2-A9k4Z-j1RNYxv3uCBemOSyKDSOp3IzO6QedN9lTqxIaK2qw109k4HWsHlbznJhD0ae_gJ7kXvSeut9Fsvq5NZCSj0mPOmZtul3DfEjdr2J0O1IwAWhQ2aQ",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCcLl3fm5M50mJ0APveerg7cWdkkb8AcwYjplCOPdfxwNtIDYwrPUWUsv631WaC5JVMr6PGaCQRG5D2e4Qduqr1PBcFxa1NwbTssnNsSgfTN_sDETTRMBAbyAVVvsBelPPc7u21uisWJZJUKwfPxC2-A9k4Z-j1RNYxv3uCBemOSyKDSOp3IzO6QedN9lTqxIaK2qw109k4HWsHlbznJhD0ae_gJ7kXvSeut9Fsvq5NZCSj0mPOmZtul3DfEjdr2J0O1IwAWhQ2aQ",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCcLl3fm5M50mJ0APveerg7cWdkkb8AcwYjplCOPdfxwNtIDYwrPUWUsv631WaC5JVMr6PGaCQRG5D2e4Qduqr1PBcFxa1NwbTssnNsSgfTN_sDETTRMBAbyAVVvsBelPPc7u21uisWJZJUKwfPxC2-A9k4Z-j1RNYxv3uCBemOSyKDSOp3IzO6QedN9lTqxIaK2qw109k4HWsHlbznJhD0ae_gJ7kXvSeut9Fsvq5NZCSj0mPOmZtul3DfEjdr2J0O1IwAWhQ2aQ",
];

export default function AquaHomeProductScreen() {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const scrollX = useSharedValue(0);
    const scrollY = useSharedValue(0);
    const addToCartScale = useSharedValue(1);
    const subscriptionScale = useSharedValue(1);

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
    };

    const handleSubscriptionPress = () => {
        subscriptionScale.value = withSpring(0.95, {}, () => {
            subscriptionScale.value = withSpring(1);
        });
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

    const navigation = useNavigation();
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
                <TouchableOpacity onPress={() => {
                    shareListing()
                }}>
                    <ShareIcon />
                </TouchableOpacity>
            ),
        });
    }, [navigation]);

    return (
        <SafeAreaProvider>
            <SafeAreaView className="flex-1 ">
                <Animated.ScrollView
                    className="flex-1 bg-white "
                    onScroll={mainScrollHandler}
                    scrollEventThrottle={16}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 120 }}
                >
                    {/* Banner Image Carousel */}
                    <Animated.View sharedTransitionTag='productImage' style={headerAnimatedStyle} className=" mb-6">
                        <Animated.ScrollView
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            onScroll={imageScrollHandler}
                            scrollEventThrottle={16}
                        >
                            {/* <View className="flex flex-row  gap-2 p-5 absolute bottom-0 left-0 right-0 z-10 bg-red-500  items-center justify-center">
                                {productImages.map((_, dotIndex) => (
                                    <View
                                        key={dotIndex}
                                        className={`w-1.5 h-1.5 rounded-full bg-green-500 ${dotIndex === currentImageIndex ? 'opacity-100' : 'opacity-50'
                                            }`}
                                    />
                                ))}
                            </View> */}
                            {productImages.map((imageUri, index) => (
                                <ImageBackground
                                    key={index}
                                    source={{ uri: imageUri }}
                                    resizeMode="cover"
                                    className="min-h-[320px] w-screen  overflow-hidden justify-end"
                                // style={{ width: screenWidth, marginRight: index < productImages.length - 1 ? 16 : 0 }}
                                >

                                </ImageBackground>
                            ))}
                        </Animated.ScrollView>
                    </Animated.View>

                    <View className='px-4'>
                        {/* Title */}
                        <Text className="text-3xl font-grotesk-bold text-[#121516]  pt-2 pb-2 mb-4">
                            AquaHome Pro
                        </Text>

                        {/* Description */}
                        <Text className="text-lg font-grotesk text-[#121516]   pb-3 mb-8">
                            The AquaHome Pro is a state-of-the-art water purifier designed to provide clean, safe, and great-tasting water for your home. With its advanced filtration system, it
                            removes impurities, contaminants, and odors, ensuring your family's health and well-being.
                        </Text>

                        {/* Key Features */}
                        <Text className="text-2xl font-grotesk-bold text-[#121516]  pt-4 pb-2 mb-4">
                            Key Features
                        </Text>
                        {[
                            ["Filtration Technology dddd", "Multi-stage filtration fdjbfud  fff ffff dfhboduhfd dhfduhoffdifjdof"],
                            ["Capacity", "10 liters"],
                            ["Dimensions", "30cm x 20cm x 40cm"],
                            ["Warranty", "2 years"],
                        ].map(([label, value], i) => (
                            <View key={i} className=" py-5 border-t border-[#dde2e3]">
                                <View className="flex-row  gap-4">
                                    <Text className="text-xl w-1/2 font-grotesk text-[#6a7a81]">{label}</Text>
                                    <Text className="text-xl w-1/2 font-grotesk-medium text-[#121516]">{value}</Text>
                                </View>
                            </View>
                        ))}

                        {/* Reviews */}
                        <Text className="text-2xl font-grotesk-bold text-[#121516]  pt-8 pb-2 mb-4">
                            Product Reviews
                        </Text>
                        <View className="flex-row flex-wrap items-center justify-center gap-x-8 gap-y-6  pb-4 mb-8">
                            {/* Rating Summary */}
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


                            {/* <View className="flex-1 min-w-[200px] max-w-[400px]">
                            {[
                                [5, 40],
                                [4, 30],
                                [3, 15],
                                [2, 10],
                                [1, 5],
                            ].map(([star, percent]) => (
                                <View key={star} className="flex-row items-center gap-y-3 mb-1">
                                    <Text className="text-sm w-4 font-grotesk-bold text-[#121516]">{star}</Text>
                                    <View className="flex-1 h-2 bg-[#dde2e3] rounded-full overflow-hidden mx-2">
                                        <Animated.View
                                            className="h-2 bg-[#121516] rounded-full"
                                            style={{
                                                width: withSpring(`${percent}%`, { damping: 15, stiffness: 100 }),
                                            }}
                                        />
                                    </View>
                                    <Text className="text-sm font-grotesk-bold text-[#6a7a81]">{percent}%</Text>
                                </View>
                            ))}
                        </View> */}
                        </View>

                    </View>
                </Animated.ScrollView>

                {/* Sticky CTA Buttons */}
                <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-[#dde2e3] shadow-lg px-4">
                    <View className="flex-row  py-6 gap-3 w-full">
                        <Animated.View style={addToCartAnimatedStyle} className="flex-1">
                            <Pressable
                                className="flex-1 h-14 rounded-full items-center justify-center bg-[#4fa3c4]"
                                onPress={handleAddToCartPress}
                            >
                                <Text className="text-lg font-grotesk-bold text-[#121516]">Buy Product</Text>
                            </Pressable>
                        </Animated.View>

                        <Animated.View style={subscriptionAnimatedStyle} className="flex-1">
                            <Pressable
                                className="flex-1 h-14 rounded-full items-center justify-center bg-[#f1f3f4]"
                                onPress={handleSubscriptionPress}
                            >
                                <Text className="text-lg font-grotesk-bold text-[#121516]">Rent Product</Text>
                            </Pressable>
                        </Animated.View>
                    </View>
                </View>
            </SafeAreaView>
        </SafeAreaProvider>
    );
}