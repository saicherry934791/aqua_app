import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
} from 'react-native';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useNavigation, useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';

const OTPScreen = () => {
    const navigation = useNavigation();
    const router = useRouter();
    const { phone } = useLocalSearchParams();
    const { loginWithOTP, sendOTP } = useAuth();
    
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [isComplete, setIsComplete] = useState(false);
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const inputRefs = useRef<(TextInput | null)[]>([]);

    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: () => (
                <Text className="text-2xl font-grotesk-bold text-[#121516]">Verify OTP</Text>
            ),
            headerTitleAlign: 'center',
            headerShadowVisible: false,
        });
    }, [navigation]);

    useEffect(() => {
        // Check if OTP is complete
        const otpString = otp.join('');
        setIsComplete(otpString.length === 6 && /^\d{6}$/.test(otpString));
    }, [otp]);

    const handleOtpChange = (value: string, index: number) => {
        // Handle paste functionality - only allow on first input
        if (value.length > 1) {
            if (index === 0) {
                // Extract only digits and limit to 6
                const pastedCode = value.replace(/[^0-9]/g, '').slice(0, 6);
                const newOtp = Array(6).fill('');
                
                // Fill the array with pasted digits
                for (let i = 0; i < Math.min(pastedCode.length, 6); i++) {
                    newOtp[i] = pastedCode[i];
                }
                
                setOtp(newOtp);
                
                // Focus management after paste
                if (pastedCode.length >= 6) {
                    inputRefs.current[5]?.blur();
                } else if (pastedCode.length > 0) {
                    inputRefs.current[Math.min(pastedCode.length, 5)]?.focus();
                }
            }
            return;
        }

        // Handle single digit input
        if (value.length <= 1 && (/^\d$/.test(value) || value === '')) {
            const newOtp = [...otp];
            newOtp[index] = value;
            setOtp(newOtp);

            // Auto-focus next input
            if (value !== '' && index < 5) {
                inputRefs.current[index + 1]?.focus();
            }
        }
    };

    const handleKeyPress = (key: string, index: number) => {
        if (key === 'Backspace') {
            if (otp[index] === '' && index > 0) {
                // If current input is empty, focus previous and clear it
                const newOtp = [...otp];
                newOtp[index - 1] = '';
                setOtp(newOtp);
                inputRefs.current[index - 1]?.focus();
            } else if (otp[index] !== '') {
                // If current input has value, just clear it
                const newOtp = [...otp];
                newOtp[index] = '';
                setOtp(newOtp);
            }
        }
    };

    const handleVerifyOTP = async () => {
        const otpString = otp.join('');
        if (isComplete && phone) {
            setLoading(true);
            try {
                const result = await loginWithOTP(phone as string, otpString);
                if (result.success) {
                    // Don't navigate here - let the index screen handle navigation
                    // The auth context will update and index screen will redirect appropriately
                } else {
                    Alert.alert('Error', result.error || 'Invalid OTP. Please try again.');
                    // Clear OTP on error
                    setOtp(['', '', '', '', '', '']);
                    inputRefs.current[0]?.focus();
                }
            } catch (error) {
                Alert.alert('Error', 'Something went wrong. Please try again.');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleResendOTP = async () => {
        if (phone) {
            setResendLoading(true);
            try {
                const result = await sendOTP(phone as string);
                if (result.success) {
                    Alert.alert('Success', 'A new OTP has been sent to your phone number.');
                    // Clear current OTP
                    setOtp(['', '', '', '', '', '']);
                    inputRefs.current[0]?.focus();
                } else {
                    Alert.alert('Error', result.error || 'Failed to resend OTP');
                }
            } catch (error) {
                Alert.alert('Error', 'Something went wrong. Please try again.');
            } finally {
                setResendLoading(false);
            }
        }
    };

    const renderOtpInput = (index: number) => (
        <TextInput
            key={index}
            ref={(ref) => (inputRefs.current[index] = ref)}
            style={[
                styles.otpInput,
                otp[index] ? styles.filledInput : styles.emptyInput
            ]}
            value={otp[index]}
            onChangeText={(value) => handleOtpChange(value, index)}
            onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
            keyboardType="numeric"
            maxLength={6} // Allow paste of full OTP
            textAlign="center"
            selectTextOnFocus={true}
            blurOnSubmit={false}
            editable={!loading}
        />
    );

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Enter the code</Text>

            <Text style={styles.description}>
                We sent a verification code to +91 {phone}. Please enter it below.
            </Text>

            <View style={styles.otpContainer}>
                {Array.from({ length: 6 }, (_, index) => renderOtpInput(index))}
            </View>

            <TouchableOpacity
                style={[
                    styles.verifyButton,
                    isComplete ? styles.activeButton : styles.inactiveButton
                ]}
                onPress={handleVerifyOTP}
                disabled={!isComplete || loading}
            >
                {loading ? (
                    <ActivityIndicator color="#111618" size="small" />
                ) : (
                    <Text style={styles.buttonText}>Verify OTP</Text>
                )}
            </TouchableOpacity>

            <Text style={styles.didntReceiveText}>Didn't receive the code?</Text>

            <TouchableOpacity 
                onPress={handleResendOTP} 
                style={styles.resendContainer}
                disabled={resendLoading}
            >
                {resendLoading ? (
                    <ActivityIndicator color="#607e8a" size="small" />
                ) : (
                    <Text style={styles.resendText}>Resend OTP</Text>
                )}
            </TouchableOpacity>

            <View style={styles.helpContainer}>
                <Text style={styles.helpText}>
                    For testing, use OTP: 123456
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
    title: {
        color: '#111618',
        fontSize: 28,
        fontFamily: 'SpaceGrotesk_700Bold',
        textAlign: 'left',
        paddingBottom: 12,
        paddingTop: 20,
    },
    description: {
        color: '#111618',
        fontSize: 18,
        fontFamily: 'SpaceGrotesk_500Medium',
        paddingBottom: 12,
        paddingTop: 4,
        lineHeight: 24,
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 16,
        paddingVertical: 12,
    },
    otpInput: {
        height: 56,
        width: 48,
        borderRadius: 12,
        fontSize: 18,
        fontFamily: 'SpaceGrotesk_500Medium',
        color: '#111618',
    },
    emptyInput: {
        backgroundColor: '#f0f3f5',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    filledInput: {
        backgroundColor: '#f0f3f5',
        borderWidth: 2,
        borderColor: '#dbe3e6',
    },
    verifyButton: {
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
        fontSize: 18,
        fontFamily: 'SpaceGrotesk_700Bold',
    },
    didntReceiveText: {
        color: '#607e8a',
        fontSize: 16,
        textAlign: 'center',
        paddingBottom: 12,
        paddingTop: 4,
        fontFamily: 'SpaceGrotesk_500Medium',
    },
    resendContainer: {
        alignItems: 'center',
        paddingBottom: 12,
        paddingTop: 4,
        minHeight: 40,
        justifyContent: 'center',
    },
    resendText: {
        color: '#607e8a',
        fontSize: 16,
        textDecorationLine: 'underline',
        fontFamily: 'SpaceGrotesk_500Medium',
    },
    helpContainer: {
        alignItems: 'center',
        paddingVertical: 24,
        marginTop: 'auto',
    },
    helpText: {
        color: '#4fa3c4',
        fontSize: 14,
        textAlign: 'center',
        fontFamily: 'SpaceGrotesk_500Medium',
        backgroundColor: '#e8f4f8',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
});

export default OTPScreen