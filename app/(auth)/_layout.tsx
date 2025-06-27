import { Stack } from "expo-router";



export default function AuthLayout() {
    return (
        <Stack>
            <Stack.Screen name="index" options={{ headerShown: true }} />
            <Stack.Screen name="otp" options={{ headerShown: true, headerShadowVisible: false }} />

        </Stack>
    )
}