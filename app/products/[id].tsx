import { apiService } from "@/api/api";
import BackArrowIcon from "@/components/icons/BackArrowIcon";
import ProductSkeleton from "@/components/skeltons/ProductSkeleton";
import SkeletonWrapper from "@/components/skeltons/SkeletonWrapper";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { Share as ShareIcon, ShoppingCart } from "lucide-react-native";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { Alert, Dimensions, ImageBackground, Share, Text, TouchableOpacity, View } from "react-native";
import Animated, {
    interpolate,
    runOnJS,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";

const { width: screenWidth } = Dimensions.get("window");

// API base URL - update this to match your backend

// TypeScript interfaces based on your API response
interface ProductFeature {
    id: string;
    productId: string;
    name: string;
    value: string;
    createdAt: string;
    updatedAt: string;
}

interface Product {
    id: string;
    name: string;
    description: string;
    images: string[];
    rentPrice: number;
    buyPrice: number;
    deposit: number;
    isRentable: boolean;
    isPurchasable: boolean;
    createdAt: string;
    updatedAt: string;
    isActive: boolean;
    productFeatures: ProductFeature[];
}

interface ApiResponse {
    product: Product;
}

export default function AquaHomeProductScreen() {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<'product' | 'subscription'>('product');
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const scrollX = useSharedValue(0);
    const scrollY = useSharedValue(0);
    const buyNowScale = useSharedValue(1);

    const navigation = useNavigation();
    const router = useRouter();
    const params = useLocalSearchParams();
    
    // Get product ID from route params
    const productId = params.id as string;

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

    const buyNowAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: buyNowScale.value }],
    }));

    const fetchProduct = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await apiService.get(`/products/${productId}`);

            if (!response.success) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

      
            
            
            setProduct(response.data.product);
            
            // Set initial option based on product availability
            if (response.data.product.isPurchasable) {
                setSelectedOption('product');
            } else if (response.data.product.isRentable) {
                setSelectedOption('subscription');
            }
            
        } catch (err) {
            console.log('Fetch product failed:', err);
            setError(err instanceof Error ? err.message : 'Failed to load product');
            Alert.alert('Error', 'Failed to load product details. Please try again.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchProduct();
    };

    const handleBuyNowPress = () => {
        if (!product) return;

        buyNowScale.value = withSpring(0.95, {}, () => {
            buyNowScale.value = withSpring(1);
        });

        const price = selectedOption === 'product' ? product.buyPrice : product.rentPrice;
        
        // Navigate directly to checkout with product details
        const checkoutData = {
            items: [{
                id: product.id,
                name: product.name,
                price: price,
                image: product.images[0] || '',
                type: selectedOption,
                quantity: 1,
                deposit: selectedOption === 'subscription' ? product.deposit : 0,
            }],
            total: price,
            deposit: selectedOption === 'subscription' ? product.deposit : 0,
        };

        router.push({
            pathname: '/checkout',
            params: {
                directCheckout: 'true',
                checkoutData: JSON.stringify(checkoutData),
            },
        });
    };

    const shareListing = async () => {
        if (!product) return;
        
        try {
            await Share.share({
                title: product.name,
                message: `Check out this amazing product: ${product.name}`,
                url: `https://aqua-home.com/products/${product.id}`,
            });
        } catch (err) {
            console.log("Share Error: ", err);
        }
    };

    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: () => (
                <Text style={{ fontSize: 20, fontFamily: 'Outfit_700Bold', color: '#121516' }}>
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
    }, [navigation, product]);

    useEffect(() => {
        if (productId) {
            fetchProduct();
        } else {
            setError('Product ID is required');
            Alert.alert('Error', 'Product ID is missing');
        }
    }, [productId]);

    // Show error state
    if (error && !loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                <Text style={{ fontSize: 18, fontFamily: 'Outfit_600SemiBold', color: '#e74c3c', textAlign: 'center', marginBottom: 20 }}>
                    {error}
                </Text>
                <TouchableOpacity
                    onPress={fetchProduct}
                    style={{
                        backgroundColor: '#4fa3c4',
                        paddingHorizontal: 24,
                        paddingVertical: 12,
                        borderRadius: 8,
                    }}
                >
                    <Text style={{ color: 'white', fontFamily: 'Outfit_600SemiBold' }}>
                        Retry
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={{ flex: 1 }}>
            <SkeletonWrapper
                loading={loading}
                refreshing={refreshing}
                onRefresh={onRefresh}
                skeleton={<ProductSkeleton />}
                style={{ paddingBottom: 120,backgroundColor:'white' }}
            >
                {product && (
                    <>
                        {/* Banner Image Carousel */}
                        <Animated.View style={[headerAnimatedStyle, { marginBottom: 24 }]}>
                            <Animated.ScrollView
                                horizontal
                                pagingEnabled
                                showsHorizontalScrollIndicator={false}
                                onScroll={imageScrollHandler}
                                scrollEventThrottle={16}
                            >
                                {product.images.map((imageUri, index) => (
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
                            
                            {/* Image Indicator Dots */}
                            {product.images?.length > 1 && (
                                <View style={{
                                    flexDirection: 'row',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    marginTop: 12,
                                }}>
                                    {product.images.map((_, index) => (
                                        <View
                                            key={index}
                                            style={{
                                                width: 8,
                                                height: 8,
                                                borderRadius: 4,
                                                backgroundColor: currentImageIndex === index ? '#4fa3c4' : '#e1e5e7',
                                                marginHorizontal: 4,
                                            }}
                                        />
                                    ))}
                                </View>
                            )}
                        </Animated.View>

                        <View style={{ paddingHorizontal: 16 }}>
                            {/* Title */}
                            <Text style={{
                                fontSize: 28,
                                fontFamily: 'Outfit_700Bold',
                                color: '#121516',
                                marginBottom: 16,
                            }}>
                                {product.name}
                            </Text>

                            {/* Purchase Options */}
                            {(product.isPurchasable || product.isRentable) && (
                                <View style={{ marginBottom: 24 }}>
                                    <Text style={{
                                        fontSize: 20,
                                        fontFamily: 'Outfit_700Bold',
                                        color: '#121516',
                                        marginBottom: 16,
                                    }}>
                                        Choose Your Option
                                    </Text>
                                    
                                    <View style={{ flexDirection: 'row', marginBottom: 16 }}>
                                        {product.isPurchasable && (
                                            <TouchableOpacity
                                                onPress={() => setSelectedOption('product')}
                                                style={{
                                                    flex: 1,
                                                    padding: 16,
                                                    borderTopLeftRadius: 12,
                                                    borderBottomLeftRadius: product.isRentable ? 0 : 12,
                                                    borderTopRightRadius: product.isRentable ? 0 : 12,
                                                    borderBottomRightRadius: product.isRentable ? 0 : 12,
                                                    borderWidth: 2,
                                                    borderColor: selectedOption === 'product' ? '#4fa3c4' : '#e1e5e7',
                                                    backgroundColor: selectedOption === 'product' ? '#e8f4f8' : 'white',
                                                }}
                                            >
                                                <Text style={{
                                                    fontSize: 16,
                                                    fontFamily: 'Outfit_700Bold',
                                                    textAlign: 'center',
                                                    color: selectedOption === 'product' ? '#4fa3c4' : '#687b82',
                                                }}>
                                                    Buy Product
                                                </Text>
                                                <Text style={{
                                                    fontSize: 20,
                                                    fontFamily: 'Outfit_700Bold',
                                                    textAlign: 'center',
                                                    color: '#121516',
                                                    marginTop: 4,
                                                }}>
                                                    ₹{product.buyPrice.toFixed(2)}
                                                </Text>
                                                <Text style={{
                                                    fontSize: 12,
                                                    fontFamily: 'Outfit_400Regular',
                                                    textAlign: 'center',
                                                    color: '#687b82',
                                                }}>
                                                    One-time payment
                                                </Text>
                                            </TouchableOpacity>
                                        )}
                                        
                                        {product.isRentable && (
                                            <TouchableOpacity
                                                onPress={() => setSelectedOption('subscription')}
                                                style={{
                                                    flex: 1,
                                                    padding: 16,
                                                    borderTopRightRadius: 12,
                                                    borderBottomRightRadius: 12,
                                                    borderTopLeftRadius: product.isPurchasable ? 0 : 12,
                                                    borderBottomLeftRadius: product.isPurchasable ? 0 : 12,
                                                    borderWidth: 2,
                                                    borderColor: selectedOption === 'subscription' ? '#4fa3c4' : '#e1e5e7',
                                                    backgroundColor: selectedOption === 'subscription' ? '#e8f4f8' : 'white',
                                                }}
                                            >
                                                <Text style={{
                                                    fontSize: 16,
                                                    fontFamily: 'Outfit_700Bold',
                                                    textAlign: 'center',
                                                    color: selectedOption === 'subscription' ? '#4fa3c4' : '#687b82',
                                                }}>
                                                    Rent Product
                                                </Text>
                                                <Text style={{
                                                    fontSize: 20,
                                                    fontFamily: 'Outfit_700Bold',
                                                    textAlign: 'center',
                                                    color: '#121516',
                                                    marginTop: 4,
                                                }}>
                                                    ₹{product.rentPrice.toFixed(2)}
                                                </Text>
                                                <Text style={{
                                                    fontSize: 12,
                                                    fontFamily: 'Outfit_400Regular',
                                                    textAlign: 'center',
                                                    color: '#687b82',
                                                }}>
                                                    Monthly billing
                                                </Text>
                                                {product.deposit > 0 && (
                                                    <Text style={{
                                                        fontSize: 10,
                                                        fontFamily: 'Outfit_400Regular',
                                                        textAlign: 'center',
                                                        color: '#687b82',
                                                        marginTop: 2,
                                                    }}>
                                                        + ₹{product.deposit} deposit
                                                    </Text>
                                                )}
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </View>
                            )}

                            {/* Description */}
                            <Text style={{
                                fontSize: 16,
                                fontFamily: 'Outfit_400Regular',
                                color: '#121516',
                                lineHeight: 24,
                                marginBottom: 32,
                            }}>
                                {product.description}
                            </Text>

                            {/* Key Features */}
                            {[0,1]?.length > 0 && (
                                <>
                                    <Text style={{
                                        fontSize: 20,
                                        fontFamily: 'Outfit_700Bold',
                                        color: '#121516',
                                        marginBottom: 16,
                                    }}>
                                        Key Features
                                    </Text>
                                    {[
                            ["Filtration Technology dddd", "Multi-stage filtration fdjbfud  fff ffff dfhboduhfd dhfduhoffdifjdof"],
                            ["Capacity", "10 liters"],
                            ["Dimensions", "30cm x 20cm x 40cm"],
                            ["Warranty", "2 years"],
                        ].map((feature, index) => (
                                        <View key={feature.id} style={{
                                            paddingVertical: 20,
                                            borderTopWidth: 1,
                                            borderTopColor: '#dde2e3',
                                        }}>
                                            <View style={{ flexDirection: 'row', gap: 16 }}>
                                                <Text style={{
                                                    fontSize: 16,
                                                    width: '50%',
                                                    fontFamily: 'Outfit_400Regular',
                                                    color: '#6a7a81',
                                                }}>
                                                    {feature[0]}
                                                </Text>
                                                <Text style={{
                                                    fontSize: 16,
                                                    width: '50%',
                                                    fontFamily: 'Outfit_500Medium',
                                                    color: '#121516',
                                                }}>
                                                    {feature[1]}
                                                </Text>
                                            </View>
                                        </View>
                                    ))}
                                </>
                            )}
                        </View>
                    </>
                )}
            </SkeletonWrapper>

            {/* Sticky CTA Button */}
            {product && (product.isPurchasable || product.isRentable) && (
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
                    <Animated.View style={buyNowAnimatedStyle}>
                        <TouchableOpacity
                            style={{
                                height: 56,
                                borderRadius: 28,
                                backgroundColor: '#4fa3c4',
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                            onPress={handleBuyNowPress}
                        >
                            <ShoppingCart size={20} color="white" />
                            <Text style={{
                                fontSize: 18,
                                fontFamily: 'Outfit_700Bold',
                                color: 'white',
                                marginLeft: 8,
                            }}>
                                {selectedOption === 'product' ? 'Buy Now' : 'Rent Now'} - ₹{(selectedOption === 'product' ? product.buyPrice : product.rentPrice).toFixed(2)}
                            </Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            )}
        </View>
    );
}