import { useAuth } from "@/contexts/AuthContext";
import { router, Stack } from "expo-router";
import { useLayoutEffect } from "react";



export default function AuthLayout() {
    const { isAuthenticated,user } = useAuth()

    useLayoutEffect(() => {
        if (isAuthenticated) {
            let nextScreen = !user?.name || !user?.email || !user?.address  ? '/OnboardDetails' : '(tabs)';
            router.replace(nextScreen as any);
        }
    }, [isAuthenticated]);
    return (
        <Stack>
            <Stack.Screen name="index" options={{ headerShown: true }} />
            <Stack.Screen name="otp" options={{ headerShown: true, headerShadowVisible: false }} />

        </Stack>
    )
}