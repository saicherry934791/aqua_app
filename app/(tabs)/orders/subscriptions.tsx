import { View, Text, ScrollView, Pressable, Image } from 'react-native'
import React from 'react'
import { useNavigation } from 'expo-router';

const subscriptions = () => {
    const navigation = useNavigation();
    return (
        <ScrollView className="flex-1 bg-white">
            <Text className="text-primary text-2xl font-grotesk-bold px-4 pb-2 pt-4">
                Active Subscriptions
            </Text>
            <Pressable onPress={() => {
                navigation.navigate("subscriptions/[id]", { id: "12345" });

            }} className="flex-row gap-4 bg-white px-4 py-3">
                <Image
                    source={{
                        uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuC57u2ZwtDGJGKk0YZUS3y1twH9YzNDIFCR-dYHLepgrWNwlgRKkMtSfxf-aNgvig6j8lQe1rjLLw65Fuoz17e4i6_9PMIKeqiysBuOvYM2XxnvJYhZuNKQ2SXEhxv2P-V3lshBTbC4PBHEL9rexsuZpBw0Q82diziO2PILE_vHW6Hi7rlm2vGCzMV1HATvJpqlKKvFUfw1sM6Tvo0aapa9sroG6wVxRPnJP8ZgBR4rmmoYLAAmMYvGCPBdMqxBH7QxWT9jWn3NAw"
                    }}
                    className="rounded-lg w-[80px] h-[80px]"
                    resizeMode="cover"
                />
                <View className="flex-1 justify-center">
                    <Text className="text-xl text-primary font-grotesk-bold">
                        AquaHome Filter Replacement
                    </Text>
                    <Text className="text-secondary text-lg font-grotesk">
                        Next Renewal: Aug 15, 2024
                    </Text>
                    <Text className="text-secondary text-lg font-grotesk">
                        Started: Feb 15, 2024 · Monthly
                    </Text>
                </View>
            </Pressable>


        </ScrollView>
    )
}

export default subscriptions