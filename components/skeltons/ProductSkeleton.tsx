// components/skeletons/ProductSkeleton.tsx
import React from "react";
import { View } from "react-native";

export default function ProductSkeleton() {
  return (
    <View className="px-4 pt-4">
      <View className="h-[300px] w-full bg-gray-200 rounded-xl mb-6" />

      <View className="h-6 w-2/3 bg-gray-200 rounded mb-4" />
      <View className="h-5 w-full bg-gray-200 rounded mb-3" />
      <View className="h-5 w-3/4 bg-gray-200 rounded mb-8" />

      <View className="h-6 w-1/3 bg-gray-200 rounded mb-4" />
      {[1, 2, 3, 4].map((_, i) => (
        <View key={i} className="h-5 w-full bg-gray-200 rounded mb-3" />
      ))}

      <View className="h-6 w-1/2 bg-gray-200 rounded mb-4 mt-8" />
      <View className="h-[100px] w-full bg-gray-200 rounded mb-10" />
    </View>
  );
}
