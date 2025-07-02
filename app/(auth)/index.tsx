import { CustomerType, useAuth } from '@/contexts/AuthContext';
import { useNavigation, useRouter } from 'expo-router';
import React, { useLayoutEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
                const result = await sendOTP(phoneNumber, CustomerType.CUSTOMER);
                if (result) {
                    Alert.alert('Success', `OTP sent to +91 ${phoneNumber}`, [
                        { text: 'OK', onPress: () => router.push({ pathname: '/(auth)/otp', params: { phone: phoneNumber } }) }
                    ]);
                }
            } catch (error: any) {
                Alert.alert('Error', error.message || 'Failed to send OTP');
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
    welcomeText: {
        color: '#111618',
        fontSize: 28,
        textAlign: 'left',
        paddingBottom: 12,
        paddingTop: 20,
        fontFamily: 'Outfit_700Bold',
    },
    inputContainer: {
        paddingVertical: 12,
    },
    label: {
        color: '#111618',
        fontSize: 18,
        fontFamily: 'Outfit_500Medium',
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
        fontFamily: 'Outfit_500Medium',
        marginRight: 8,
    },
    phoneInput: {
        flex: 1,
        color: '#111618',
        fontSize: 18,
        height: '100%',
        fontFamily: 'Outfit_500Medium',
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
        fontFamily: 'Outfit_700Bold',
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
        fontFamily: 'Outfit_400Regular',
        lineHeight: 20,
    },
});

export default Login