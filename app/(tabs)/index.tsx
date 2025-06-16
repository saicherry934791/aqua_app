import React, { useLayoutEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  SafeAreaView,
} from 'react-native';
import { Search } from 'lucide-react-native';
import { useNavigation } from 'expo-router';

const AquaHomeApp = () => {

  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (

        <Text className="text-2xl font-grotesk-bold text-[#121516]">AQUA HOME</Text>

      ),
      headerTitleAlign: 'center',
    });
  }, [navigation]);
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>


        {/* Search Bar */}
        <View className="px-4 py-3 hidden">
          <View className="flex-row h-14 bg-[#f1f3f4] rounded-xl items-center">
            <View className="pl-4 pr-2">
              <Search size={24} color="#607e8a" />
            </View>
            <TextInput
              placeholder="Search products"
              placeholderTextColor="#607e8a"
              className="flex-1 text-[#111618] text-base px-2 font-grotesk-medium"
            />
          </View>
        </View>

        {/* Popular Products */}
        <Text className="text-3xl font-grotesk-bold text-[#121516] px-4 pb-3 pt-5">
          Popular Products
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="pl-4"
          contentContainerStyle={{ paddingRight: 16 }}
        >
          <View className="w-60 mr-3">
            <Image
              source={{
                uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCn8Xq0NZjLTnruHqThxvgDdGZ72-pTxzgjv101iAqgcS8nLTbdx-6cEVHNnJe-z1_WJ3aPsphBitkQWb25laSSnAhhnfgJ-n3ORNQ8pCFJju8wIHyROOcuIcLvQxHJMg6ijpvWsdeiNKxBVRH_AF1u2ivHOLqrOA23P56PWbbJOirVyHNtO73WdPcdjHsquiPXD9VTYbze4lmBLhOL47CP5k3FKN1h89pl4s_H-ST4SxJJbU3AW7oP-V7Br-IP51QFY3egpE7ntA'
              }}
              className="w-full aspect-square rounded-xl mb-4"
            />
            <View className="gap-1">
              <Text className="text-xl font-grotesk-bold text-[#121516]">
                AquaPure 3000
              </Text>
              <Text className="text-sm text-[#6a7a81] font-grotesk-medium">
                Advanced filtration for ultimate purity
              </Text>
            </View>
          </View>

          <View className="w-60 mr-3">
            <Image
              source={{
                uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCeNZNfVjMgkhHSKOvQyN9T11WD62lrh8xB80nx6nuazPZWxpyNjk7KADSIPd1UX7-M3A95YfjOHAv7-eVRsOkh-9DTlZYJFsGacmDMnaEk6w681sL1hJOJUtA-mPOCpJzwQVxBrwrDgbP2aUHfcNpu3duxe-YQnBdBXLVGM_xKSn7eeK6c0FU2EuNpIkL_WcxEqP3PfruOWQTY3zWBi8AErDDaOJ_gTWIHatWLb5NIkJfnUdWQZvglZBFSpI1F-uoZzdRn3BMr5A'
              }}
              className="w-full aspect-square rounded-xl mb-4"
            />
            <View className="gap-1">
              <Text className="text-xl font-grotesk-bold text-[#121516]">
                AquaStream 2000
              </Text>
              <Text className="text-sm text-[#6a7a81] font-grotesk-medium ">
                Sleek design with efficient filtration
              </Text>
            </View>
          </View>

          <View className="w-60 mr-3">
            <Image
              source={{
                uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBNBVkUGo-P1Cn49C0apFDRFhH3FEfhPj9lIaTh4XbaXXH4eYrVP6_9e7X_LGqHv3ASpOHM9GT6_pMJRupSxbIu516Vuq2K6KqQQr9fju1EOogJ0YVMgInZQJcaugXC5M4lskeOalEKDEyeJLhHDbkyxfxaWw-dRPR0OMobgn6qkTQPz8OM09nbDjitcdYlEzSamox0r8fUcfG9JseVJ0-L-X5OLyJ0QZ2ttaUQcCoudZIUCD6YUXUEWxagjPbhChZAW7Nq-DrCcQ'
              }}
              className="w-full aspect-square rounded-xl mb-4"
            />
            <View className="gap-1">
              <Text className="text-xl font-grotesk-bold text-[#121516]">
                AquaClear 1500
              </Text>
              <Text className="text-sm text-[#6a7a81] font-grotesk-medium">
                Compact and reliable water purification
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Coupons & Promotions */}
        <Text className="text-3xl font-grotesk-bold text-[#121516] px-4 pb-3 pt-12">
          Coupons & Promotions
        </Text>
        <View className="p-4">
          <View className="flex-row items-stretch justify-between gap-4 rounded-xl">
            <View className="flex-[2] gap-4">
              <View className="gap-1">
                <Text className="text-sm text-[#6a7a81] font-grotesk">
                  Limited Time Offer
                </Text>
                <Text className="text-lg font-grotesk-bold text-[#121516]">
                  Save 20% on Your Next Filter
                </Text>
                <Text className="text-sm text-[#6a7a81]">
                  Use code: FRESH20 at checkout
                </Text>
              </View>
              <TouchableOpacity className="bg-[#f1f3f4] px-4 py-2 rounded-full self-start">
                <Text className="text-base font-grotesk-medium text-[#121516]">
                  Shop Now
                </Text>
              </TouchableOpacity>
            </View>
            <Image
              source={{
                uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDBZ61x4RuWJ41wAa5YQoyYlOG8jcKA9npD3Tq4venBfH-bDikXOv36g7xsQ2Qruc3Yv4oVUNRTNvGlIWeQmcSp2lHTRdyGaJoReaCr7Ff180ot9YdbgZ1dJhSBSWxcL5FNzGvIYTShwaE5am8rgMb5TWM3_40sRTuCfrGE7G0L5z1EsLXCCs6-IdL5YheU85zQR9RFiVHtiLY0KAjsjh_BMCDkkPsbIlHhxVUS1rZrWFjB5BqQO5FhfMjppiS66zr84_w_dil_sQ'
              }}
              className="flex-1 h-full rounded-xl"
            />
          </View>
        </View>
        <View className="p-4">
          <View className="flex-row items-stretch justify-between gap-4 rounded-xl">
            <View className="flex-[2] gap-4">
              <View className="gap-1">
                <Text className="text-sm text-[#6a7a81] font-grotesk">
                  Limited Time Offer
                </Text>
                <Text className="text-lg font-grotesk-bold text-[#121516]">
                  Save 20% on Your Next Filter
                </Text>
                <Text className="text-sm text-[#6a7a81]">
                  Use code: FRESH20 at checkout
                </Text>
              </View>
              <TouchableOpacity className="bg-[#f1f3f4] px-4 py-2 rounded-full self-start">
                <Text className="text-base font-grotesk-medium text-[#121516]">
                  Shop Now
                </Text>
              </TouchableOpacity>
            </View>
            <Image
              source={{
                uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDBZ61x4RuWJ41wAa5YQoyYlOG8jcKA9npD3Tq4venBfH-bDikXOv36g7xsQ2Qruc3Yv4oVUNRTNvGlIWeQmcSp2lHTRdyGaJoReaCr7Ff180ot9YdbgZ1dJhSBSWxcL5FNzGvIYTShwaE5am8rgMb5TWM3_40sRTuCfrGE7G0L5z1EsLXCCs6-IdL5YheU85zQR9RFiVHtiLY0KAjsjh_BMCDkkPsbIlHhxVUS1rZrWFjB5BqQO5FhfMjppiS66zr84_w_dil_sQ'
              }}
              className="flex-1 h-full rounded-xl"
            />
          </View>
        </View>

        {/* Recent Orders */}
        <Text className="text-3xl font-grotesk-bold text-[#121516] px-4 pb-3 pt-12">
          Recent Orders
        </Text>
        <View className="flex-row items-center gap-4 bg-white px-4 min-h-[72px] py-2 justify-between">
          <View className="flex-row items-center gap-4 flex-1">
            <Image
              source={{
                uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDBZ61x4RuWJ41wAa5YQoyYlOG8jcKA9npD3Tq4venBfH-bDikXOv36g7xsQ2Qruc3Yv4oVUNRTNvGlIWeQmcSp2lHTRdyGaJoReaCr7Ff180ot9YdbgZ1dJhSBSWxcL5FNzGvIYTShwaE5am8rgMb5TWM3_40sRTuCfrGE7G0L5z1EsLXCCs6-IdL5YheU85zQR9RFiVHtiLY0KAjsjh_BMCDkkPsbIlHhxVUS1rZrWFjB5BqQO5FhfMjppiS66zr84_w_dil_sQ'
              }}
              className="w-14 h-14 rounded-lg"
            />
            <View className="flex-1 justify-center gap-0.5">
              <Text className="text-xl font-grotesk-bold text-[#121516] leading-normal">
                AquaPure 3000
              </Text>
              <Text className="text-base text-[#6a7a81] font-grotesk-medium leading-normal">
                Order #123456
              </Text>
            </View>
          </View>
          <Text className="text-xl font-grotesk-bold text-[#121516]">$199</Text>
        </View>
      </ScrollView>


    </SafeAreaView>
  );
};

export default AquaHomeApp;