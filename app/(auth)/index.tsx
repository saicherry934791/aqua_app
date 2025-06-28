import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
} from 'react-native';
import React, { useLayoutEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation, useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSkeleton from '@/components/skeletons/LoadingSkeleton';

const Login = () => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation();
    const router = useRouter();
    const { sendOTP } = useAuth();

    // Validate Indian phone number (10 digits)
    const isValidPhoneNumber = (number: string) => {
        const phoneRegex = /^[6-9]\d{9}$/;
        return phoneRegex.test(number);
    };

    const handlePhoneNumberChange = (text: string) => {
        // Remove any non-numeric characters
        const numericText = text.replace(/[^0-9]/g, '');

        // Limit to 10 digits
        if (numericText.length <= 10) {
            setPhoneNumber(numericText);
        }
    };

    const handleSendOTP = async () => {
        if (isValidPhoneNumber(phoneNumber)) {
            setLoading(true);
            try {
                const result = await sendOTP(phoneNumber);
                if (result.success) {
                    Alert.alert('Success', `OTP sent to +91 ${phoneNumber}`, [
                        { text: 'OK', onPress: () => router.push({ pathname: '/(auth)/otp', params: { phone: phoneNumber } }) }
                    ]);
                } else {
                    Alert.alert('Error', result.error || 'Failed to send OTP');
                }
            } catch (error) {
                Alert.alert('Error', 'Something went wrong. Please try again.');
            } finally {
                setLoading(false);
            }
        }
    };

    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: () => (
                <Text className="text-2xl font-grotesk-bold text-[#121516]">AQUA HOME</Text>
            ),
            headerTitleAlign: 'center',
            headerShadowVisible: false,
        });
    }, [navigation]);

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <LoadingSkeleton width="60%" height={32} style={styles.loadingTitle} />
                    <LoadingSkeleton width="40%" height={20} style={styles.loadingLabel} />
                    <LoadingSkeleton width="100%" height={56} style={styles.loadingInput} />
                    <LoadingSkeleton width="100%" height={48} borderRadius={24} style={styles.loadingButton} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.welcomeText}>Welcome back</Text>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Phone Number</Text>
                <View style={styles.phoneInputWrapper}>
                    <Text style={styles.countryCode}>+91</Text>
                    <TextInput
                        style={styles.phoneInput}
                        placeholder="Enter your phone number"
                        placeholderTextColor="#607e8a"
                        value={phoneNumber}
                        onChangeText={handlePhoneNumberChange}
                        keyboardType="numeric"
                        maxLength={10}
                    />
                </View>
            </View>

            <TouchableOpacity
                style={[
                    styles.otpButton,
                    isValidPhoneNumber(phoneNumber) ? styles.activeButton : styles.inactiveButton
                ]}
                onPress={handleSendOTP}
                disabled={!isValidPhoneNumber(phoneNumber) || loading}
            >
                {loading ? (
                    <ActivityIndicator color="#111618" size="small" />
                ) : (
                    <Text style={styles.buttonText}>Send OTP</Text>
                )}
            </TouchableOpacity>

            <View style={styles.helpContainer}>
                <Text style={styles.helpText}>
                    By continuing, you agree to our Terms of Service and Privacy Policy
                </Text>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        paddingHorizontal: 16,
    },
    loadingContainer: {
        flex: 1,
        paddingTop: 20,
    },
    loadingTitle: {
        marginBottom: 32,
    },
    loadingLabel: {
        marginBottom: 8,
    },
    loadingInput: {
        marginBottom: 24,
    },
    loadingButton: {
        marginTop: 'auto',
        marginBottom: 20,
    },
    welcomeText: {
        color: '#111618',
        fontSize: 28,
        textAlign: 'left',
        paddingBottom: 12,
        paddingTop: 20,
        fontFamily: 'SpaceGrotesk_700Bold',
    },
    inputContainer: {
        paddingVertical: 12,
    },
    label: {
        color: '#111618',
        fontSize: 18,
        fontFamily: 'SpaceGrotesk_500Medium',
        paddingBottom: 8,
    },
    phoneInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f3f5',
        borderRadius: 12,
        height: 56,
        paddingHorizontal: 16,
    },
    countryCode: {
        color: '#111618',
        fontSize: 18,
        fontFamily: 'SpaceGrotesk_500Medium',
        marginRight: 8,
    },
    phoneInput: {
        flex: 1,
        color: '#111618',
        fontSize: 18,
        height: '100%',
        fontFamily: 'SpaceGrotesk_500Medium',
    },
    otpButton: {
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 12,
    },
    activeButton: {
        backgroundColor: '#20b7f3',
    },
    inactiveButton: {
        backgroundColor: '#d0d0d0',
    },
    buttonText: {
        color: '#111618',
        fontSize: 16,
        fontFamily: 'SpaceGrotesk_700Bold',
    },
    helpContainer: {
        alignItems: 'center',
        paddingVertical: 24,
        marginTop: 'auto',
    },
    helpText: {
        color: '#607e8a',
        fontSize: 14,
        textAlign: 'center',
        fontFamily: 'SpaceGrotesk_400Regular',
        lineHeight: 20,
    },
});

export default Login