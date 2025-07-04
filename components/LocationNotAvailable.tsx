import { View, Text, Alert } from 'react-native'
import React, { useState, useEffect } from 'react'
import { MapPin } from 'lucide-react-native'
import * as Location from 'expo-location'

const LocationNotAvailable = () => {
    const [currentAddress, setCurrentAddress] = useState('Getting location...')
    const [locationError, setLocationError] = useState(false)

    useEffect(() => {
        getCurrentLocation()
    }, [])

    const getCurrentLocation = async () => {
        try {
            // Request location permissions
            const { status } = await Location.requestForegroundPermissionsAsync()
            
            if (status !== 'granted') {
                setCurrentAddress('Location permission denied')
                setLocationError(true)
                return
            }

            // Get current position
            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            })

            // Reverse geocode to get address
            const address = await Location.reverseGeocodeAsync({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            })

            if (address.length > 0) {
                const addr = address[0]
                const formattedAddress = [
                    addr.street,
                    addr.city,
                    addr.region,
                    addr.country
                ].filter(Boolean).join(', ')
                
                setCurrentAddress(formattedAddress || 'Chennai, Tamil Nadu')
            } else {
                setCurrentAddress('Chennai, Tamil Nadu')
            }

        } catch (error) {
            console.error('Error getting location:', error)
            setCurrentAddress('Chennai, Tamil Nadu')
            setLocationError(true)
        }
    }

    return (
        <View className="flex-1 bg-white items-center justify-center px-4">
            <View className="bg-[#e8f4f8] rounded-2xl p-6 items-center w-full">
                <View className="w-20 h-20 bg-[#4fa3c4] rounded-full items-center justify-center mb-4">
                    <MapPin size={40} color="white" />
                </View>

                <Text className="text-2xl font-grotesk-bold text-[#121516] text-center mb-2">
                    We're Coming Soon!
                </Text>

                <Text className="text-base text-[#6a7a81] font-grotesk-medium text-center mb-6 leading-relaxed">
                    AquaHome services aren't available in your area yet, but we're working hard to expand our reach.
                </Text>

                <View className="bg-white rounded-xl p-4 w-full mb-6">
                    <View className="flex-row items-center mb-2">
                        <MapPin size={16} color="#4fa3c4" />
                        <Text className="text-sm text-[#4fa3c4] font-grotesk-medium ml-2">
                            Current Location
                        </Text>
                    </View>
                    <Text className="text-base text-[#121516] font-grotesk-medium">
                        {currentAddress}
                    </Text>
                </View>
            </View>
        </View>
    )
}

export default LocationNotAvailable