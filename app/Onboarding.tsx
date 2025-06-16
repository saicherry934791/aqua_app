import {StyleSheet, Text, View, useWindowDimensions} from 'react-native';
import React from 'react';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedRef,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import Pagination from '@/components/onboarding/Pagination';
import CustomButton from '@/components/onboarding/CustomButton';
import {SafeAreaView} from 'react-native-safe-area-context';

const data = [
    {
      id: 1,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD48RUwaW4YfZOFOIqLfmZ3ZYqn_a3_TG_zMQCQxpWMWM8uZjyFTPdYceiIaElYwrUY9IW6HaqfqkcLe6Or1nmwrrX_UMuBlm5PsCYbCcNYwo8PT_h9I_UJAwlTOuUqkfOGl-f2yTyXL48APPhr8sf0wtdrJ_yFzAZsY2U0BHlqREvsPzSl6jPC7nJyyDHq8Fv7jJQYQpoZu5JNzFJJtpuXfwqzbggSNJUIGx__6-mnDnBPhfZ9w8-C5W1b5mtjFAQvXrbPC-EpIg",
      title: 'Enjoy pure water for a healthy life',
      text: " AquaHome delivers pure, filtered water directly to your home, ensuring your family's health and well-being",
    },
    {
      id: 2,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBw_5Kt3K-0db1n_0lNI5f8f_3fnIKkDkc4FKNzyMeCe6Wy9H0qPfTHjyKCbARn-Wqtz0rhgpURuFf3kNUvRaolNOGSuVY2phKUXjTdrvk06n3GBlk1Lc9OtAP_t6_toGh27eOKmrvwXYb5Kv3PX0p5vfpGBJQ0RO2yxkp6gCTRa36ZHSyBKj7SwApA492mkj-mu2CyRnmUyq9eBpED5lgY25-IhnIuNgOogbC1w9IYjNlSPfAfqpNiB1-0MvhepLBwQk0CPJbwlg",
      title: 'Effortless Subscription Management',
      text: 'Easily manage your AquaHome subscription, including pausing, resuming, or changing your plan, all within the app.',
    },
    {
      id: 3,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAoQFcTQqIDR24pCVCNzrXLJCMVD_SysE1pYEjP1ruOdsx4LbKP5E9HUg05BPU13fWkjVVq-JOyr2bXyMjvP33c8Ek7MQTAaOifFR7-oqovRYusu_rBkJVVRlS3qsErk6vlPfPd7T_vu0AtCxtqzHjRYYdfZw-V8k2AEbyj5gF_4spGzJhOYxrotbP5TWuBmLVQb1nB3I4mt4HlXDyEoIx3FOQ-KG3es0QnYChS5-48aCxHb7jDv4zLUbtjVajJe0ekNasGyrcfZA",
      title: 'Reliable Service & Support',
      text: 'Our dedicated team is here to assist you with any questions or concerns. Enjoy peace of mind with our comprehensive maintenance and support features.',
    },
  ];

const OnboardingScreen = () => {
  const {width: SCREEN_WIDTH} = useWindowDimensions();
  const flatListRef = useAnimatedRef(null);
  const x = useSharedValue(0);
  const flatListIndex = useSharedValue(0);

  const onViewableItemsChanged = ({viewableItems}) => {
    flatListIndex.value = viewableItems[0].index;
  };

  const onScroll = useAnimatedScrollHandler({
    onScroll: event => {
      x.value = event.contentOffset.x;
    },
  });

  // eslint-disable-next-line react/no-unstable-nested-components
  const RenderItem = ({item, index}) => {
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
        width: SCREEN_WIDTH ,
        height: SCREEN_WIDTH ,
        transform: [{translateY: translateYAnimation}],
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
        transform: [{translateY: translateYAnimation}],
      };
    });
    return (
      <View style={[styles.itemContainer, {width: SCREEN_WIDTH}]}>
        <Animated.Image source={{uri:item.image}} style={imageAnimationStyle} />
        <Animated.View style={textAnimationStyle}>
          <Text style={styles.itemTitle}>{item.title}</Text>
          <Text style={styles.itemText}>{item.text}</Text>
        </Animated.View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.FlatList
        ref={flatListRef}
        onScroll={onScroll}
        data={data}
        renderItem={({item, index}) => {
          return <RenderItem item={item} index={index} />;
        }}
        keyExtractor={item => item.id}
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
        <Pagination data={data} x={x} screenWidth={SCREEN_WIDTH} />
        <CustomButton
          flatListRef={flatListRef}
          flatListIndex={flatListIndex}
          dataLength={data.length}
        />
      </View>
    </SafeAreaView>
  );
};

export default OnboardingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
 
    backgroundColor: '#fff',
  },
  itemContainer: {
    flex: 1,
    // justifyContent: 'space-around',
    // alignItems: 'center',
    // backgroundColor: 'red',
    // backgroundColor: '#4fa3c4',
    gap: 20,
  },
  itemTitle: {
    textAlign: 'center',
    fontSize: 36,
    marginBottom: 10,
    color: 'black',
    fontFamily: 'SpaceGrotesk_700Bold',
  },
  itemText: {
    textAlign: 'center',
    marginHorizontal: 35,
    color: 'black',
    lineHeight: 20,
    fontSize: 18,
    fontFamily: 'SpaceGrotesk_400Regular',
  },
  bottomContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    paddingVertical: 20,
    
  },
});