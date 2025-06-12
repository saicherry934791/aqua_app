import { useNavigation } from 'expo-router';
import React from 'react';
import { View, Text, ScrollView, Image, Pressable } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const ServiceRequests = () => {
    const navigation = useNavigation();
    return (
        <ScrollView className="flex-1 bg-white">
            {/* Main Content */}

            {/* Open Requests Section */}
            <Text className="text-primary text-2xl font-grotesk-bold px-4 pb-2 pt-4">
                Open Requests
            </Text>

            <Pressable onPress={() => {
                navigation.navigate("services/[id]", { id: "12345" });

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
                        Request ID: 12345
                    </Text>
                    <Text className="text-secondary text-lg font-grotesk">
                        Issue: Filter replacement not received
                    </Text>
                    <Text className="text-secondary text-lg font-grotesk">
                        Submitted: Jul 20, 2024 · Status: Open
                    </Text>
                </View>
            </Pressable>

            {/* Past Requests Section */}
            <Text className="text-primary text-2xl font-grotesk-bold px-4 pb-2 pt-4">
                Past Requests
            </Text>

            <View className="flex-row gap-4 bg-white px-4 py-3">
                <Image
                    source={{
                        uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuDI2Y2UJ03ygEWrin5ev9-QEeJCu3JI59KBLIwXCfzEWvUEoL6AqRcjSV3MJxYmeDXc529dh5ayN8WvAHZN9LflMdJUrpTjjLAxOc8WzBRYJgJzt3_aaiDrfir5EhPwuDx7nfKYktMy6GHc2iQ04ZLUASZFCbt7afk2m76U55MxJKNABappth9Go4XCMP1ptwdxqb4gzmz7Atl-B0FB5h0XgeyH1YHPXWMzo_yKUsaCbRyl1lb-CQgffpzyT5-Q7qgvFJxvVC1w7w"
                    }}
                    className="rounded-lg w-[80px] h-[80px]"
                    resizeMode="cover"
                />
                <View className="flex-1 justify-center">
                    <Text className="text-xl text-primary font-grotesk-bold">
                        Request ID: 67890
                    </Text>
                    <Text className="text-secondary text-lg font-grotesk">
                        Issue: Purifier malfunction
                    </Text>
                    <Text className="text-secondary text-lg font-grotesk">
                        Submitted: Jan 15, 2023 · Status: Resolved
                    </Text>
                </View>
            </View>

            <View className="flex-row gap-4 bg-white px-4 py-3">
                <Image
                    source={{
                        uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuDHukcB-NHgLq5ls9G4hIj68Q6zlM7QUIViZxk5Wnq9_4ya_g1pl4I6E2C1gUI19n8aZxvPiBQhDk9ncuYnLcxgP5cWa26GFJ8S7bUDLA6_iAGfSzzri9_ruGrlWFFZ3ZKFPqm_2Bf_voPIw7WPRr8e9ozJt-dnDoViyC3-Oz-5PuIMFFKc87I6aXuBEP0po4R-42YDEHXdeF7Bu2UP9uSa8TxcvulcFRFvPygA6geU4CuJpRuvF3UwKnUyVY1yaDBkRnM79kb2AA"
                    }}
                    className="rounded-lg w-[80px] h-[80px]"
                    resizeMode="cover"
                />
                <View className="flex-1 justify-center">
                    <Text className="text-xl text-primary font-grotesk-bold">
                        Request ID: 11223
                    </Text>
                    <Text className="text-secondary text-lg font-grotesk">
                        Issue: Filter replacement not received
                    </Text>
                    <Text className="text-secondary text-lg font-grotesk">
                        Submitted: Mar 25, 2023 · Status: Closed
                    </Text>
                </View>
            </View>

        </ScrollView>
    );
};

export default ServiceRequests;