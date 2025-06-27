import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
} from 'react-native';
import React, { useLayoutEffect, useState } from 'react'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from 'expo-router';

const Login = () => {
    const [phoneNumber, setPhoneNumber] = useState('');

    // Validate Indian phone number (10 digits)
    const isValidPhoneNumber = (number) => {
        const phoneRegex = /^[6-9]\d{9}$/;
        return phoneRegex.test(number);
    };

    const handlePhoneNumberChange = (text) => {
        // Remove any non-numeric characters
        const numericText = text.replace(/[^0-9]/g, '');

        // Limit to 10 digits
        if (numericText.length <= 10) {
            setPhoneNumber(numericText);
        }
    };

    const handleSendOTP = () => {
        if (isValidPhoneNumber(phoneNumber)) {
            Alert.alert('Success', `OTP sent to +91 ${phoneNumber}`);
            navigation.navigate('otp');
            // Add your OTP sending logic here
        }
    };

    const handleSignUp = () => {
        // Add navigation to sign up screen
        // Alert.alert('Sign Up', 'Navigate to Sign Up screen');
        navigation.navigate('otp');
    };


    const navigation = useNavigation();

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
        <View style={styles.container}>
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
                disabled={!isValidPhoneNumber(phoneNumber)}
            >
                <Text style={styles.buttonText}>Send OTP</Text>
            </TouchableOpacity>


        </View>

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
    signUpContainer: {
        alignItems: 'center',
        paddingVertical: 12,
    },
    signUpText: {
        color: '#111618',
        fontSize: 14,
        textDecorationLine: 'underline',
        fontFamily: 'SpaceGrotesk_500Medium',
    },
});

export default Login