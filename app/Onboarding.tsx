import { useAuth } from '@/contexts/AuthContext';
import { useNavigation, useRouter } from 'expo-router';
import React, { useLayoutEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const data = [
  {
    id: 1,
    image: "https://images.pexels.com/photos/416528/pexels-photo-416528.jpeg?auto=compress&cs=tinysrgb&w=800",
    title: 'Pure Water for Healthy Living',
    text: "Experience crystal-clear, purified water delivered directly to your home. Our advanced filtration technology ensures every drop meets the highest quality standards.",
  },
  {
    id: 2,
    image: "https://images.pexels.com/photos/3768911/pexels-photo-3768911.jpeg?auto=compress&cs=tinysrgb&w=800",
    title: 'Smart Subscription Management',
    text: 'Effortlessly manage your water delivery schedule with our intelligent app. Pause, modify, or customize your subscription with just a few taps.',
  },
  {
    id: 3,
    image: "https://images.pexels.com/photos/4099354/pexels-photo-4099354.jpeg?auto=compress&cs=tinysrgb&w=800",
    title: 'Reliable Service & Support',
    text: 'Our dedicated team ensures timely deliveries and provides 24/7 customer support. Enjoy peace of mind with our comprehensive service guarantee.',
  },
];

export default function OnboardingScreen() {
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const flatListRef = useAnimatedRef(null);
  const x = useSharedValue(0);
  const flatListIndex = useSharedValue(0);
  const navigation = useNavigation();
  const router = useRouter();
  const { completeOnboarding } = useAuth();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const onViewableItemsChanged = ({ viewableItems }) => {
    if (viewableItems[0]?.index !== null) {
      flatListIndex.value = viewableItems[0].index;
    }
  };

  const onScroll = useAnimatedScrollHandler({
    onScroll: event => {
      x.value = event.contentOffset.x;
    },
  });

  const handleGetStarted = async () => {
    await completeOnboarding();
    router.replace('/(auth)');
  };

  const handleNext = () => {
    if (flatListIndex.value < data.length - 1) {
      flatListRef.current?.scrollToIndex({ index: flatListIndex.value + 1 });
    } else {
      handleGetStarted();
    }
  };

  const RenderItem = ({ item, index }) => {
    const imageAnimationStyle = useAnimatedStyle(() => {
      const opacityAnimation = interpolate(
        x.value,
        [
          (index - 1) * SCREEN_WIDTH,
          index * SCREEN_WIDTH,
          (index + 1) * SCREEN_WIDTH,
        ],
        [0, 1, 0],
        Extrapolation.CLAMP,
      );
      const translateYAnimation = interpolate(
        x.value,
        [
          (index - 1) * SCREEN_WIDTH,
          index * SCREEN_WIDTH,
          (index + 1) * SCREEN_WIDTH,
        ],
        [100, 0, 100],
        Extrapolation.CLAMP,
      );
      return {
        opacity: opacityAnimation,
        width: SCREEN_WIDTH,
        height: SCREEN_WIDTH * 0.8,
        transform: [{ translateY: translateYAnimation }],
      };
    });

    const textAnimationStyle = useAnimatedStyle(() => {
      const opacityAnimation = interpolate(
        x.value,
        [
          (index - 1) * SCREEN_WIDTH,
          index * SCREEN_WIDTH,
          (index + 1) * SCREEN_WIDTH,
        ],
        [0, 1, 0],
        Extrapolation.CLAMP,
      );
      const translateYAnimation = interpolate(
        x.value,
        [
          (index - 1) * SCREEN_WIDTH,
          index * SCREEN_WIDTH,
          (index + 1) * SCREEN_WIDTH,
        ],
        [100, 0, 100],
        Extrapolation.CLAMP,
      );

      return {
        opacity: opacityAnimation,
        transform: [{ translateY: translateYAnimation }],
      };
    });

    return (
      <View style={[styles.itemContainer, { width: SCREEN_WIDTH }]}>
        <Animated.Image 
          source={{ uri: item.image }} 
          style={[imageAnimationStyle, styles.image]} 
          resizeMode="cover"
        />
        <Animated.View style={[textAnimationStyle, styles.textContainer]}>
          <Text style={styles.itemTitle}>{item.title}</Text>
          <Text style={styles.itemText}>{item.text}</Text>
        </Animated.View>
      </View>
    );
  };

  const PaginationComponent = () => {
    return (
      <View style={styles.paginationContainer}>
        {data.map((_, i) => {
          const animatedDotStyle = useAnimatedStyle(() => {
            const widthAnimation = interpolate(
              x.value,
              [(i - 1) * SCREEN_WIDTH, i * SCREEN_WIDTH, (i + 1) * SCREEN_WIDTH],
              [10, 20, 10],
              Extrapolation.CLAMP,
            );
            const opacityAnimation = interpolate(
              x.value,
              [(i - 1) * SCREEN_WIDTH, i * SCREEN_WIDTH, (i + 1) * SCREEN_WIDTH],
              [0.5, 1, 0.5],
              Extrapolation.CLAMP,
            );
            return {
              width: widthAnimation,
              opacity: opacityAnimation,
            };
          });
          return <Animated.View key={i} style={[styles.dots, animatedDotStyle]} />;
        })}
      </View>
    );
  };

  const CustomButton = () => {
    const buttonAnimationStyle = useAnimatedStyle(() => {
      return {
        width: flatListIndex.value === data.length - 1 ? withSpring(140) : withSpring(60),
        height: 60,
      };
    });

    const arrowAnimationStyle = useAnimatedStyle(() => {
      return {
        width: 30,
        height: 30,
        opacity: flatListIndex.value === data.length - 1 ? withTiming(0) : withTiming(1),
        transform: [
          {
            translateX: flatListIndex.value === data.length - 1 ? withTiming(100) : withTiming(0),
          },
        ],
      };
    });

    const textAnimationStyle = useAnimatedStyle(() => {
      return {
        opacity: flatListIndex.value === data.length - 1 ? withTiming(1) : withTiming(0),
        transform: [
          {
            translateX: flatListIndex.value === data.length - 1 ? withTiming(0) : withTiming(-100),
          },
        ],
      };
    });

    return (
      <TouchableOpacity onPress={handleNext}>
        <Animated.View style={[styles.buttonContainer, buttonAnimationStyle]}>
          <Animated.Text style={[styles.arrow, arrowAnimationStyle]}>
            →
          </Animated.Text>
          <Animated.Text style={[styles.textButton, textAnimationStyle]}>
            Get Started
          </Animated.Text>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.FlatList
        ref={flatListRef}
        onScroll={onScroll}
        data={data}
        renderItem={({ item, index }) => <RenderItem item={item} index={index} />}
        keyExtractor={item => item.id.toString()}
        scrollEventThrottle={16}
        horizontal={true}
        bounces={false}
        pagingEnabled={true}
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{
          minimumViewTime: 300,
          viewAreaCoveragePercentThreshold: 10,
        }}
      />
      <View style={styles.bottomContainer}>
        <PaginationComponent />
        <CustomButton />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  itemContainer: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 40,
  },
  image: {
    borderRadius: 20,
    marginHorizontal: 20,
  },
  textContainer: {
    paddingHorizontal: 35,
    alignItems: 'center',
  },
  itemTitle: {
    textAlign: 'center',
    fontSize: 32,
    marginBottom: 16,
    color: '#121516',
    fontFamily: 'Outfit_700Bold',
    lineHeight: 38,
  },
  itemText: {
    textAlign: 'center',
    color: '#687b82',
    lineHeight: 24,
    fontSize: 16,
    fontFamily: 'Outfit_400Regular',
  },
  bottomContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    paddingVertical: 20,
  },
  paginationContainer: {
    flexDirection: 'row',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dots: {
    height: 10,
    backgroundColor: '#4fa3c4',
    marginHorizontal: 10,
    borderRadius: 5,
  },
  buttonContainer: {
    backgroundColor: '#4fa3c4',
    padding: 10,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  arrow: {
    position: 'absolute',
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  textButton: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    position: 'absolute',
    fontFamily: 'Outfit_600SemiBold',
  },
});