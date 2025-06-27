import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import '../global.css';

import { useColorScheme } from '@/hooks/useColorScheme';

// 1. Import the Space Grotesk font loader
import {
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold,
} from '@expo-google-fonts/space-grotesk';
import { SheetProvider } from 'react-native-actions-sheet';

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


              // headerTitle: () => <ModalHeaderText />,

              // headerBackTitleVisible: false,
              // headerTintColor: Colors.dark.text,
              headerStyle: {
                backgroundColor: '#fff'

              },
              headerShown: true
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

  );
}
