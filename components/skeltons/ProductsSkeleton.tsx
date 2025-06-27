// components/ProductSkeleton.tsx
import React from 'react';
import { ScrollView, View } from 'react-native';

const ProductSkeleton = () => {
    return (
        <ScrollView stickyHeaderIndices={[0]} className="">
            
            {/* Skeleton for SearchBar */}
            <View className="py-3 bg-white z-10">
                <View className="flex-row h-14 bg-[#f1f3f4] rounded-xl px-4 items-center">
                    <View className="w-5 h-5 bg-gray-300 rounded-full" />
                    <View className="ml-2 flex-1 h-5 bg-gray-100 rounded-md" />
                </View>
            </View>

            {/* Skeleton for Grid */}
            <View className="flex-row flex-wrap justify-between mt-2">
                {Array(6).fill(0).map((_, i) => (
                    <View key={i} className="w-[48%] mb-6">
                        <View className="w-full aspect-square bg-gray-300 rounded-xl mb-3" />
                        <View className="h-5 bg-gray-300 rounded w-3/4 mb-1" />
                        <View className="h-4 bg-gray-200 rounded w-1/2" />
                    </View>
                ))}
            </View>
        </ScrollView>
    );
};

export default ProductSkeleton;
