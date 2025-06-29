import React, { useState, useLayoutEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation, useRouter, useLocalSearchParams } from 'expo-router';
import { Check, X } from 'lucide-react-native';
import BackArrowIcon from '@/components/icons/BackArrowIcon';

// For web compatibility, we'll create a simple map placeholder
const MapView = Platform.OS === 'web' ? 
  ({ children, onPress, style }: any) => (
    <View 
      style={[style, { backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' }]}
      onTouchEnd={onPress}
    >
      <Text style={{ fontSize: 16, color: '#666', textAlign: 'center', padding: 20 }}>
        Interactive Map{'\n'}Tap anywhere to select location
      </Text>
      {children}
    </View>
  ) : 
  require('react-native-maps').default;

const Marker = Platform.OS === 'web' ? 
  ({ coordinate }: any) => (
    <View style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: [{ translateX: -12 }, { translateY: -24 }],
      width: 24,
      height: 24,
      backgroundColor: '#ff0000',
      borderRadius: 12,
      borderWidth: 2,
      borderColor: 'white',
    }} />
  ) : 
  require('react-native-maps').Marker;

export default function MapPickerScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const { returnTo } = useLocalSearchParams();
  
  const [selectedLocation, setSelectedLocation] = useState<{latitude: number; longitude: number} | null>(null);
  const [address, setAddress] = useState('');
  
  // Default map region (Bangalore)
  const [mapRegion, setMapRegion] = useState({
    latitude: 12.9716,
    longitude: 77.5946,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <Text style={{ fontSize: 20, fontFamily: 'SpaceGrotesk_700Bold', color: '#121516' }}>
          SELECT LOCATION
        </Text>
      ),
      headerTitleAlign: 'center',
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <BackArrowIcon />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const handleMapPress = async (event: any) => {
    let latitude, longitude;
    
    if (Platform.OS === 'web') {
      // For web, simulate coordinates based on click position
      latitude = mapRegion.latitude + (Math.random() - 0.5) * 0.01;
      longitude = mapRegion.longitude + (Math.random() - 0.5) * 0.01;
    } else {
      const coords = event.nativeEvent.coordinate;
      latitude = coords.latitude;
      longitude = coords.longitude;
    }
    
    setSelectedLocation({ latitude, longitude });
    
    // Reverse geocode to get address
    await reverseGeocode(latitude, longitude);
  };

  const reverseGeocode = async (latitude: number, longitude: number) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyDBFyJk1ZsnnqxLC43WT_-OSCFZaG0OaNM`
      );
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        setAddress(data.results[0].formatted_address);
      } else {
        setAddress(`Location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      setAddress(`Location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
    }
  };

  const confirmLocation = () => {
    if (selectedLocation && address) {
      // Navigate back with the selected address
      router.back();
      // In a real app, you would pass this data back to the checkout screen
      Alert.alert('Location Selected', address);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      {/* Instructions */}
      <View style={{
        backgroundColor: '#e8f4f8',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e1e5e7',
      }}>
        <Text style={{
          fontSize: 16,
          fontFamily: 'SpaceGrotesk_600SemiBold',
          color: '#4fa3c4',
          textAlign: 'center',
        }}>
          Tap on the map to select your delivery location
        </Text>
      </View>

      {/* Map */}
      <MapView
        style={{ flex: 1 }}
        region={mapRegion}
        onPress={handleMapPress}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {selectedLocation && (
          <Marker
            coordinate={selectedLocation}
            pinColor="#ff0000"
          />
        )}
      </MapView>

      {/* Selected Location Info */}
      {selectedLocation && address && (
        <View style={{
          position: 'absolute',
          bottom: 100,
          left: 16,
          right: 16,
          backgroundColor: 'white',
          borderRadius: 12,
          padding: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 5,
        }}>
          <Text style={{
            fontSize: 16,
            fontFamily: 'SpaceGrotesk_700Bold',
            color: '#121516',
            marginBottom: 4,
          }}>
            📍 Selected Location
          </Text>
          <Text style={{
            fontSize: 14,
            fontFamily: 'SpaceGrotesk_400Regular',
            color: '#687b82',
            lineHeight: 20,
          }}>
            {address}
          </Text>
        </View>
      )}

      {/* Action Buttons */}
      <View style={{
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#f1f3f4',
        paddingHorizontal: 16,
        paddingVertical: 20,
        flexDirection: 'row',
        gap: 12,
      }}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            flex: 1,
            height: 48,
            backgroundColor: '#f1f3f4',
            borderRadius: 12,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <X size={20} color="#687b82" />
          <Text style={{
            fontSize: 16,
            fontFamily: 'SpaceGrotesk_600SemiBold',
            color: '#687b82',
            marginLeft: 6,
          }}>
            Cancel
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={confirmLocation}
          disabled={!selectedLocation}
          style={{
            flex: 1,
            height: 48,
            backgroundColor: selectedLocation ? '#4fa3c4' : '#e1e5e7',
            borderRadius: 12,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Check size={20} color="white" />
          <Text style={{
            fontSize: 16,
            fontFamily: 'SpaceGrotesk_600SemiBold',
            color: 'white',
            marginLeft: 6,
          }}>
            Confirm
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}