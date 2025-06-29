import React, { useState, useLayoutEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  FlatList,
  Keyboard,
} from 'react-native';
import { useNavigation, useRouter, useLocalSearchParams } from 'expo-router';
import { Search, X, MapPin, Check } from 'lucide-react-native';
import BackArrowIcon from '@/components/icons/BackArrowIcon';

interface SearchResult {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

export default function MapPickerScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const { returnTo } = useLocalSearchParams();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number; 
    longitude: number;
    address: string;
  } | null>(null);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <Text style={styles.headerTitle}>Select Location</Text>
      ),
      headerTitleAlign: 'center',
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <BackArrowIcon />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const searchPlaces = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&key=AIzaSyDBFyJk1ZsnnqxLC43WT_-OSCFZaG0OaNM&components=country:in&types=address`
      );
      const data = await response.json();
      
      if (data.predictions) {
        setSearchResults(data.predictions);
        setShowSearchResults(true);
      }
    } catch (error) {
      console.error('Error searching places:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchQueryChange = (text: string) => {
    setSearchQuery(text);
    
    // Debounce search
    const timeoutId = setTimeout(() => {
      searchPlaces(text);
    }, 300);

    return () => clearTimeout(timeoutId);
  };

  const selectSearchResult = async (result: SearchResult) => {
    try {
      setSearchQuery(result.description);
      setShowSearchResults(false);
      Keyboard.dismiss();
      
      // Get place details
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${result.place_id}&fields=geometry,formatted_address&key=AIzaSyDBFyJk1ZsnnqxLC43WT_-OSCFZaG0OaNM`
      );
      const data = await response.json();
      
      if (data.result?.geometry?.location) {
        const { lat, lng } = data.result.geometry.location;
        const location = {
          latitude: lat,
          longitude: lng,
          address: data.result.formatted_address || result.description,
        };
        
        setSelectedLocation(location);
      }
    } catch (error) {
      console.error('Error selecting search result:', error);
      Alert.alert('Error', 'Failed to select location. Please try again.');
    }
  };

  const confirmLocation = () => {
    if (selectedLocation) {
      // Navigate back to checkout with location data
      router.push({
        pathname: returnTo as string || '/checkout',
        params: {
          locationData: JSON.stringify(selectedLocation),
        },
      });
    }
  };

  const renderSearchResult = ({ item }: { item: SearchResult }) => (
    <TouchableOpacity
      style={styles.searchResultItem}
      onPress={() => selectSearchResult(item)}
    >
      <MapPin size={16} color="#4fa3c4" style={styles.searchResultIcon} />
      <View style={styles.searchResultText}>
        <Text style={styles.searchResultMain}>{item.structured_formatting.main_text}</Text>
        <Text style={styles.searchResultSecondary}>{item.structured_formatting.secondary_text}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsText}>
            🔍 Search for your address below to select your exact delivery location
          </Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={20} color="#687b82" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for places..."
              placeholderTextColor="#687b82"
              value={searchQuery}
              onChangeText={handleSearchQueryChange}
              autoFocus
            />
            {isSearching && (
              <ActivityIndicator size="small" color="#4fa3c4" />
            )}
          </View>
          
          {/* Search Results */}
          {showSearchResults && searchResults.length > 0 && (
            <View style={styles.searchResultsContainer}>
              <FlatList
                data={searchResults}
                renderItem={renderSearchResult}
                keyExtractor={(item) => item.place_id}
                style={styles.searchResultsList}
                keyboardShouldPersistTaps="handled"
              />
            </View>
          )}
        </View>

        {/* Web Map Placeholder */}
        <View style={styles.mapPlaceholder}>
          <View style={styles.mapPlaceholderContent}>
            <MapPin size={48} color="#4fa3c4" />
            <Text style={styles.mapPlaceholderTitle}>Interactive Map</Text>
            <Text style={styles.mapPlaceholderSubtitle}>
              Use the search above to find and select your location
            </Text>
            <Text style={styles.webNote}>
              📱 For full map functionality, use the mobile app
            </Text>
          </View>
        </View>

        {/* Selected Location Info */}
        {selectedLocation && (
          <View style={styles.selectedLocationContainer}>
            <View style={styles.selectedLocationHeader}>
              <Check size={20} color="#4fa3c4" />
              <Text style={styles.selectedLocationTitle}>Location Selected</Text>
            </View>
            <Text style={styles.selectedLocationAddress}>
              {selectedLocation.address}
            </Text>
            <Text style={styles.coordinatesText}>
              📍 {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
            </Text>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
        >
          <X size={18} color="#687b82" />
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.confirmButton, !selectedLocation && styles.confirmButtonDisabled]}
          onPress={confirmLocation}
          disabled={!selectedLocation}
        >
          <Check size={18} color="white" />
          <Text style={styles.confirmButtonText}>Confirm Location</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'SpaceGrotesk_700Bold',
    color: '#121516',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  instructionsContainer: {
    backgroundColor: '#e8f4f8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  instructionsText: {
    fontSize: 14,
    fontFamily: 'SpaceGrotesk_500Medium',
    color: '#4fa3c4',
    textAlign: 'center',
  },
  searchContainer: {
    marginBottom: 16,
    position: 'relative',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f3f4',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'SpaceGrotesk_400Regular',
    color: '#121516',
  },
  searchResultsContainer: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 1000,
    maxHeight: 200,
  },
  searchResultsList: {
    maxHeight: 200,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  searchResultIcon: {
    marginRight: 12,
  },
  searchResultText: {
    flex: 1,
  },
  searchResultMain: {
    fontSize: 16,
    fontFamily: 'SpaceGrotesk_500Medium',
    color: '#121516',
    marginBottom: 2,
  },
  searchResultSecondary: {
    fontSize: 14,
    fontFamily: 'SpaceGrotesk_400Regular',
    color: '#687b82',
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#e1e5e7',
    borderStyle: 'dashed',
  },
  mapPlaceholderContent: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  mapPlaceholderTitle: {
    fontSize: 20,
    fontFamily: 'SpaceGrotesk_700Bold',
    color: '#121516',
    marginTop: 16,
    marginBottom: 8,
  },
  mapPlaceholderSubtitle: {
    fontSize: 16,
    fontFamily: 'SpaceGrotesk_400Regular',
    color: '#687b82',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  webNote: {
    fontSize: 14,
    fontFamily: 'SpaceGrotesk_500Medium',
    color: '#4fa3c4',
    backgroundColor: '#e8f4f8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  selectedLocationContainer: {
    backgroundColor: '#e8f4f8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#4fa3c4',
  },
  selectedLocationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  selectedLocationTitle: {
    fontSize: 16,
    fontFamily: 'SpaceGrotesk_700Bold',
    color: '#4fa3c4',
    marginLeft: 8,
  },
  selectedLocationAddress: {
    fontSize: 15,
    fontFamily: 'SpaceGrotesk_500Medium',
    color: '#121516',
    lineHeight: 20,
    marginBottom: 6,
  },
  coordinatesText: {
    fontSize: 12,
    fontFamily: 'SpaceGrotesk_400Regular',
    color: '#687b82',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f1f3f4',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'SpaceGrotesk_600SemiBold',
    color: '#687b82',
    marginLeft: 6,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#4fa3c4',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#e1e5e7',
  },
  confirmButtonText: {
    fontSize: 16,
    fontFamily: 'SpaceGrotesk_600SemiBold',
    color: 'white',
    marginLeft: 6,
  },
});