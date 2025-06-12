import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const ServiceRequestDetails = () => {
  const CircleIcon = () => (
    <Svg width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
      <Path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Z" />
    </Svg>
  );

  const PhoneIcon = () => (
    <Svg width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
      <Path d="M222.37,158.46l-47.11-21.11-.13-.06a16,16,0,0,0-15.17,1.4,8.12,8.12,0,0,0-.75.56L134.87,160c-15.42-7.49-31.34-23.29-38.83-38.51l20.78-24.71c.2-.25.39-.5.57-.77a16,16,0,0,0,1.32-15.06l0-.12L97.54,33.64a16,16,0,0,0-16.62-9.52A56.26,56.26,0,0,0,32,80c0,79.4,64.6,144,144,144a56.26,56.26,0,0,0,55.88-48.92A16,16,0,0,0,222.37,158.46ZM176,208A128.14,128.14,0,0,1,48,80,40.2,40.2,0,0,1,82.87,40a.61.61,0,0,0,0,.12l21,47L83.2,111.86a6.13,6.13,0,0,0-.57.77,16,16,0,0,0-1,15.7c9.06,18.53,27.73,37.06,46.46,46.11a16,16,0,0,0,15.75-1.14,8.44,8.44,0,0,0,.74-.56L168.89,152l47,21.05h0s.08,0,.11,0A40.21,40.21,0,0,1,176,208Z" />
    </Svg>
  );

  const statusUpdates = [
    { status: 'Open', date: 'July 20, 2024, 10:00 AM' },
    { status: 'Assigned', date: 'July 20, 2024, 11:30 AM' },
    { status: 'In Progress', date: 'July 21, 2024, 2:00 PM' },
    { status: 'Resolved', date: 'July 22, 2024, 9:00 AM' },
    { status: 'Closed', date: 'July 22, 2024, 10:00 AM' },
  ];

  return (
    <ScrollView className="flex-1 bg-white">
      {/* Request Details Section */}
      <Text className="text-[#121517] text-2xl font-grotesk-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">
        Request Details
      </Text>
      
      <View className="p-4">
        {/* Request ID */}
        <View className="flex-row justify-between border-t border-t-[#dde2e4] py-5">
          <Text className="text-[#687b82] text-lg font-grotesk font-normal leading-normal w-1/3">
            Request ID
          </Text>
          <Text className="text-[#121517] text-lg font-grotesk-bold font-normal leading-normal flex-1">
            #123456789
          </Text>
        </View>
        
        {/* Product */}
        <View className="flex-row justify-between border-t border-t-[#dde2e4] py-5">
          <Text className="text-[#687b82] text-lg font-grotesk font-normal leading-normal w-1/3">
            Product
          </Text>
          <Text className="text-[#121517] text-lg font-grotesk-bold font-normal leading-normal flex-1">
            AquaHome Filter Replacement
          </Text>
        </View>
        
        {/* Submitted */}
        <View className="flex-row justify-between border-t border-t-[#dde2e4] py-5">
          <Text className="text-[#687b82] text-lg font-grotesk font-normal leading-normal w-1/3">
            Submitted
          </Text>
          <Text className="text-[#121517] text-lg font-grotesk-bold font-normal leading-normal flex-1">
            July 20, 2024
          </Text>
        </View>
        
        {/* Description */}
        <View className="flex-row justify-between border-t border-t-[#dde2e4] py-5">
          <Text className="text-[#687b82] text-lg font-grotesk font-normal leading-normal w-1/3">
            Description
          </Text>
          <Text className="text-[#121517] text-lg font-grotesk-bold font-normal leading-normal flex-1">
            Filter replacement needed due to unusual taste in water. Suspect filter may be clogged or expired.
          </Text>
        </View>
      </View>

      {/* Status Updates Section */}
      <Text className="text-[#121517] text-2xl font-grotesk-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">
        Status Updates
      </Text>
      
      <View className="px-4">
        {statusUpdates.map((update, index) => (
          <View key={index} className="flex-row">
            {/* Timeline Icon and Line */}
            <View className="items-center mr-2">
              {index > 0 && (
                <View className="w-[1.5px] bg-[#dde2e4] h-2" />
              )}
              <View className="pt-3">
                <CircleIcon />
              </View>
              {index < statusUpdates.length - 1 && (
                <View className="w-[1.5px] bg-[#dde2e4] flex-1 mt-1" />
              )}
            </View>
            
            {/* Status Content */}
            <View className="flex-1 py-3">
              <Text className="text-[#121517] text-lg font-grotesk-bold leading-normal">
                {update.status}
              </Text>
              <Text className="text-[#687b82] text-lg font-grotesk leading-normal">
                {update.date}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Assigned Agent Section */}
      <Text className="text-[#121517] text-2xl font-grotesk-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">
        Assigned Agent
      </Text>
      
      <View className="flex-row items-center justify-between bg-white px-4 min-h-[72px] py-2">
        <View className="flex-row items-center flex-1">
          <View className="w-14 h-14 bg-gray-200 rounded-full mr-4" />
          <View className="flex-1">
            <Text className="text-[#121517] text-lg font-grotesk-bold leading-normal">
              Ethan Carter
            </Text>
            <Text className="text-[#687b82] text-lg font-grotesk leading-normal">
              Service Agent
            </Text>
          </View>
        </View>
        <TouchableOpacity className="w-7 h-7 items-center justify-center">
          <PhoneIcon />
        </TouchableOpacity>
      </View>

      {/* Notes Section */}
      <Text className="text-[#121517] text-2xl font-grotesk-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">
        Notes
      </Text>
      
      <Text className="text-[#121517] text-lg font-grotesk leading-normal pb-3 pt-1 px-4">
        Agent's Note: Please ensure access to the water filter unit is clear for easy replacement. Contact me if any issues arise.
      </Text>
    </ScrollView>
  );
};

export default ServiceRequestDetails;