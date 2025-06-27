import { View, Text, SafeAreaView } from 'react-native'
import React from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'

const OnboardDetails = () => {
  return (
    <SafeAreaProvider>
      <SafeAreaView className='flex-1 bg-white'>
        <Text>OnboardDetails</Text>
      </SafeAreaView>
    </SafeAreaProvider>
  )
}

export default OnboardDetails