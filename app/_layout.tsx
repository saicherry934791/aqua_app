import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import '../global.css';

import { useColorScheme } from '@/hooks/useColorScheme';
import { CartProvider } from '@/contexts/CartContext';

// 1. Import the Space Grotesk font loader
import {
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold,
} from '@expo-google-fonts/space-grotesk';
import { SheetProvider } from 'react-native-actions-sheet';
import { TouchableOpacity, Text, View } from 'react-native';
import { ShoppingCart } from 'lucide-react-native';
import { useCart } from '@/contexts/CartContext';
import { useRouter } from 'expo-router';

function CartHeaderButton() {
  const { state } = useCart();
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={() => router.push('/cart')}
      style={{ marginRight: 16, position: 'relative' }}
    >
      <ShoppingCart size={24} color="#121516" />
      {state.itemCount > 0 && (
        <View style={{
          position: 'absolute',
          top: -8,
          right: -8,
          backgroundColor: '#ff4444',
          borderRadius: 10,
          minWidth: 20,
          height: 20,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <Text style={{
            color: 'white',
            fontSize: 12,
            fontWeight: 'bold',
          }}>
            {state.itemCount > 99 ? '99+' : state.itemCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  // 2. Load the Space Grotesk fonts
  const [fontsLoaded] = useFonts({
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <CartProvider>
      <SheetProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false, headerShadowVisible: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="Onboarding" options={{ headerShown: false }} />
            <Stack.Screen name="OnboardDetails" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
            <Stack.Screen
              name="products/[id]"
              options={{
                title: "Product Details",
                headerStyle: {
                  backgroundColor: '#fff'
                },
                headerShown: true,
                headerRight: () => <CartHeaderButton />
              }}
            />
            <Stack.Screen
              name="cart"
              options={{
                title: "Shopping Cart",
                headerStyle: {
                  backgroundColor: '#fff'
                },
                headerShown: true,
                headerShadowVisible: false
              }}
            />
            <Stack.Screen
              name="checkout"
              options={{
                title: "Checkout",
                headerStyle: {
                  backgroundColor: '#fff'
                },
                headerShown: true,
                headerShadowVisible: false
              }}
            />
            <Stack.Screen
              name="order-confirmation"
              options={{
                title: "Order Confirmation",
                headerStyle: {
                  backgroundColor: '#fff'
                },
                headerShown: true,
                headerShadowVisible: false
              }}
            />
            <Stack.Screen
              name="orders/[id]"
              options={{
                title: "Order Details",
                headerStyle: {
                  backgroundColor: '#fff'
                },
                headerShown: true,
                headerShadowVisible: false
              }}
            />
            <Stack.Screen
              name="services/[id]"
              options={{
                title: "Service Details",
                headerStyle: {
                  backgroundColor: '#fff'
                },
                headerShown: true,
                headerShadowVisible: false
              }}
            />
            <Stack.Screen
              name="subscriptions/[id]"
              options={{
                title: "Subscription Details",
                headerShadowVisible: false,
                headerStyle: {
                  backgroundColor: '#fff'
                },
                headerShown: true
              }}
            />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </SheetProvider>
    </CartProvider>
  );
}
</Stack.Screen>