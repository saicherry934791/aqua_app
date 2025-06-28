import React, { useEffect, useLayoutEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, ImageBackground, Dimensions, Share, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    useAnimatedScrollHandler,
    interpolate,
    runOnJS,
} from "react-native-reanimated";
import { useNavigation, useRouter } from "expo-router";
import BackArrowIcon from "@/components/icons/BackArrowIcon";
import { Share as ShareIcon, ShoppingCart } from "lucide-react-native";
import SkeletonWrapper from "@/components/skeltons/SkeletonWrapper";
import ProductSkeleton from "@/components/skeltons/ProductSkeleton";
import { useCart } from "@/contexts/CartContext";

const { width: screenWidth } = Dimensions.get("window");

// Sample product images
const productImages = [
    "https://images.pexels.com/photos/416528/pexels-photo-416528.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/3768911/pexels-photo-3768911.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/4099354/pexels-photo-4099354.jpeg?auto=compress&cs=tinysrgb&w=800",
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
                { text: 'View Cart', onPress: () => router.push('/cart') },
            ]
        );
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
                <Text style={{ fontSize: 20, fontFamily: 'SpaceGrotesk_700Bold', color: '#121516' }}>
                    PRODUCT DETAILS
                </Text>
            ),
            headerTitleAlign: 'center',
            headerLeft: () => (
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <BackArrowIcon />
                </TouchableOpacity>
            ),
            headerRight: () => (
                <TouchableOpacity onPress={shareListing} style={{ marginRight: 16 }}>
                    <ShareIcon size={24} color="#121516" />
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
        <SafeAreaView style={{ flex: 1 }}>
            <SkeletonWrapper
                loading={loading}
                refreshing={refreshing}
                onRefresh={onRefresh}
                skeleton={<ProductSkeleton />}
                style={{ paddingBottom: 120 }}
            >
                {/* Banner Image Carousel */}
                <Animated.View style={[headerAnimatedStyle, { marginBottom: 24 }]}>
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
                                style={{
                                    minHeight: 320,
                                    width: screenWidth,
                                    justifyContent: 'flex-end',
                                }}
                            />
                        ))}
                    </Animated.ScrollView>
                </Animated.View>

                <View style={{ paddingHorizontal: 16 }}>
                    {/* Title */}
                    <Text style={{
                        fontSize: 28,
                        fontFamily: 'SpaceGrotesk_700Bold',
                        color: '#121516',
                        marginBottom: 16,
                    }}>
                        {productData.name}
                    </Text>

                    {/* Purchase Options */}
                    <View style={{ marginBottom: 24 }}>
                        <Text style={{
                            fontSize: 20,
                            fontFamily: 'SpaceGrotesk_700Bold',
                            color: '#121516',
                            marginBottom: 16,
                        }}>
                            Choose Your Option
                        </Text>
                        
                        <View style={{ flexDirection: 'row', marginBottom: 16 }}>
                            <TouchableOpacity
                                onPress={() => setSelectedOption('product')}
                                style={{
                                    flex: 1,
                                    padding: 16,
                                    borderTopLeftRadius: 12,
                                    borderBottomLeftRadius: 12,
                                    borderWidth: 2,
                                    borderColor: selectedOption === 'product' ? '#4fa3c4' : '#e1e5e7',
                                    backgroundColor: selectedOption === 'product' ? '#e8f4f8' : 'white',
                                }}
                            >
                                <Text style={{
                                    fontSize: 16,
                                    fontFamily: 'SpaceGrotesk_700Bold',
                                    textAlign: 'center',
                                    color: selectedOption === 'product' ? '#4fa3c4' : '#687b82',
                                }}>
                                    Buy Product
                                </Text>
                                <Text style={{
                                    fontSize: 20,
                                    fontFamily: 'SpaceGrotesk_700Bold',
                                    textAlign: 'center',
                                    color: '#121516',
                                    marginTop: 4,
                                }}>
                                    ₹{productData.price.toFixed(2)}
                                </Text>
                                <Text style={{
                                    fontSize: 12,
                                    fontFamily: 'SpaceGrotesk_400Regular',
                                    textAlign: 'center',
                                    color: '#687b82',
                                }}>
                                    One-time payment
                                </Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity
                                onPress={() => setSelectedOption('subscription')}
                                style={{
                                    flex: 1,
                                    padding: 16,
                                    borderTopRightRadius: 12,
                                    borderBottomRightRadius: 12,
                                    borderWidth: 2,
                                    borderColor: selectedOption === 'subscription' ? '#4fa3c4' : '#e1e5e7',
                                    backgroundColor: selectedOption === 'subscription' ? '#e8f4f8' : 'white',
                                }}
                            >
                                <Text style={{
                                    fontSize: 16,
                                    fontFamily: 'SpaceGrotesk_700Bold',
                                    textAlign: 'center',
                                    color: selectedOption === 'subscription' ? '#4fa3c4' : '#687b82',
                                }}>
                                    Rent Product
                                </Text>
                                <Text style={{
                                    fontSize: 20,
                                    fontFamily: 'SpaceGrotesk_700Bold',
                                    textAlign: 'center',
                                    color: '#121516',
                                    marginTop: 4,
                                }}>
                                    ₹{productData.subscriptionPrices[selectedPlan].toFixed(2)}
                                </Text>
                                <Text style={{
                                    fontSize: 12,
                                    fontFamily: 'SpaceGrotesk_400Regular',
                                    textAlign: 'center',
                                    color: '#687b82',
                                }}>
                                    {selectedPlan} billing
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Subscription Plans */}
                        {selectedOption === 'subscription' && (
                            <View style={{ gap: 12 }}>
                                {(['monthly', 'quarterly', 'yearly'] as const).map((plan) => {
                                    const discount = getDiscountPercentage(plan);
                                    return (
                                        <TouchableOpacity
                                            key={plan}
                                            onPress={() => setSelectedPlan(plan)}
                                            style={{
                                                padding: 16,
                                                borderRadius: 12,
                                                borderWidth: 2,
                                                borderColor: selectedPlan === plan ? '#4fa3c4' : '#e1e5e7',
                                                backgroundColor: selectedPlan === plan ? '#e8f4f8' : 'white',
                                            }}
                                        >
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <View style={{ flex: 1 }}>
                                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                        <Text style={{
                                                            fontSize: 16,
                                                            fontFamily: 'SpaceGrotesk_700Bold',
                                                            color: '#121516',
                                                            textTransform: 'capitalize',
                                                        }}>
                                                            {plan} Plan
                                                        </Text>
                                                        {discount > 0 && (
                                                            <View style={{
                                                                backgroundColor: '#4fa3c4',
                                                                paddingHorizontal: 8,
                                                                paddingVertical: 4,
                                                                borderRadius: 4,
                                                                marginLeft: 8,
                                                            }}>
                                                                <Text style={{
                                                                    fontSize: 10,
                                                                    fontFamily: 'SpaceGrotesk_700Bold',
                                                                    color: 'white',
                                                                }}>
                                                                    {discount}% OFF
                                                                </Text>
                                                            </View>
                                                        )}
                                                    </View>
                                                    <Text style={{
                                                        fontSize: 12,
                                                        fontFamily: 'SpaceGrotesk_400Regular',
                                                        color: '#687b82',
                                                    }}>
                                                        Billed {plan}
                                                    </Text>
                                                </View>
                                                <Text style={{
                                                    fontSize: 18,
                                                    fontFamily: 'SpaceGrotesk_700Bold',
                                                    color: '#121516',
                                                }}>
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
                    <Text style={{
                        fontSize: 16,
                        fontFamily: 'SpaceGrotesk_400Regular',
                        color: '#121516',
                        lineHeight: 24,
                        marginBottom: 32,
                    }}>
                        {productData.description}
                    </Text>

                    {/* Key Features */}
                    <Text style={{
                        fontSize: 20,
                        fontFamily: 'SpaceGrotesk_700Bold',
                        color: '#121516',
                        marginBottom: 16,
                    }}>
                        Key Features
                    </Text>
                    {[
                        ["Filtration Technology", "Multi-stage filtration system"],
                        ["Capacity", "10 liters"],
                        ["Dimensions", "30cm x 20cm x 40cm"],
                        ["Warranty", "2 years"],
                    ].map(([label, value], i) => (
                        <View key={i} style={{
                            paddingVertical: 20,
                            borderTopWidth: 1,
                            borderTopColor: '#dde2e3',
                        }}>
                            <View style={{ flexDirection: 'row', gap: 16 }}>
                                <Text style={{
                                    fontSize: 16,
                                    width: '50%',
                                    fontFamily: 'SpaceGrotesk_400Regular',
                                    color: '#6a7a81',
                                }}>
                                    {label}
                                </Text>
                                <Text style={{
                                    fontSize: 16,
                                    width: '50%',
                                    fontFamily: 'SpaceGrotesk_500Medium',
                                    color: '#121516',
                                }}>
                                    {value}
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>
            </SkeletonWrapper>

            {/* Sticky CTA Button */}
            <View style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: 'white',
                borderTopWidth: 1,
                borderTopColor: '#dde2e3',
                paddingHorizontal: 16,
                paddingVertical: 24,
            }}>
                <Animated.View style={addToCartAnimatedStyle}>
                    <TouchableOpacity
                        style={{
                            height: 56,
                            borderRadius: 28,
                            backgroundColor: '#4fa3c4',
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                        onPress={handleAddToCartPress}
                    >
                        <ShoppingCart size={20} color="white" />
                        <Text style={{
                            fontSize: 18,
                            fontFamily: 'SpaceGrotesk_700Bold',
                            color: 'white',
                            marginLeft: 8,
                        }}>
                            Add to Cart
                        </Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </SafeAreaView>
    );
}