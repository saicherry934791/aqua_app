import { StyleSheet, TouchableWithoutFeedback } from 'react-native';
import React from 'react';
import Animated, {
    useAnimatedStyle,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';

const CustomButton = ({ flatListRef, flatListIndex, dataLength }: { flatListRef: any, flatListIndex: any, dataLength: any }) => {
    const navigation = useNavigation();

    const buttonAnimationStyle = useAnimatedStyle(() => {
        return {
            width:
                flatListIndex.value === dataLength - 1
                    ? withSpring(140)
                    : withSpring(60),
            height: 60,
        };
    });

    const arrowAnimationStyle = useAnimatedStyle(() => {
        return {
            width: 30,
            height: 30,
            opacity:
                flatListIndex.value === dataLength - 1 ? withTiming(0) : withTiming(1),
            transform: [
                {
                    translateX:
                        flatListIndex.value === dataLength - 1
                            ? withTiming(100)
                            : withTiming(0),
                },
            ],
        };
    });

    const textAnimationStyle = useAnimatedStyle(() => {
        return {
            opacity:
                flatListIndex.value === dataLength - 1 ? withTiming(1) : withTiming(0),
            transform: [
                {
                    translateX:
                        flatListIndex.value === dataLength - 1
                            ? withTiming(0)
                            : withTiming(-100),
                },
            ],
        };
    });

    return (
        <TouchableWithoutFeedback
            onPress={() => {
                if (flatListIndex.value < dataLength - 1) {
                    flatListRef.current.scrollToIndex({ index: flatListIndex.value + 1 });
                } else {
                    navigation.navigate('(tabs)');
                }
            }}>
            <Animated.View style={[styles.container, buttonAnimationStyle]}>
                {/* Arrow for Next button */}
                <Animated.Text style={[styles.arrow, arrowAnimationStyle]}>
                    →
                </Animated.Text>
                
                {/* Get Started text */}
                <Animated.Text style={[styles.textButton, textAnimationStyle]}>
                    Get Started
                </Animated.Text>
            </Animated.View>
        </TouchableWithoutFeedback>
    );
};

export default CustomButton;

const styles = StyleSheet.create({
    container: {
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
        position: 'absolute' 
    },
});