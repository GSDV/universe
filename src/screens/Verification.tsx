import React, { useRef, useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

import { useRouter } from 'expo-router';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { CheckIfLoading } from '@components/Loading';
import { Alert, AlertType } from '@components/Alert';
import Button from '@components/Button';

import { USER_ID_COOKIE_KEY, DOMAIN, AUTH_TOKEN_COOKIE_KEY } from '@util/global';
import { COLORS, FONT_SIZES } from '@util/global-client';



export default function Verification() {
    const router = useRouter();

    const [loading, setLoading] = useState<boolean>(false);
    const [alert, setAlert] = useState<AlertType | null>(null);

    const [code, setCode] = useState(['', '', '', '', '', '']);
    const inputs = useRef<(TextInput | null)[]>([]);

    const handleChange = (value: string, index: number) => {
        if (/^[a-zA-Z0-9]$/.test(value)) {
            // Update the current digit, capitalizing letters
            const newCode = [...code];
            newCode[index] = value.toUpperCase();
            setCode(newCode);

            // Move to the next input if it exists
            if (index < 5) inputs.current[index + 1]?.focus();
        } else if (value === '') {
            // Allow deletion of the current input
            const newCode = [...code];
            newCode[index] = '';
            setCode(newCode);
        }
    }

    const attemptResend = async () => {
        setLoading(true);
        setAlert(null);
        const userId = await AsyncStorage.getItem(USER_ID_COOKIE_KEY);
        const res = await fetch(`${DOMAIN}/api/app/user/verification`, {
            method: 'POST',
            body: JSON.stringify({ userId })
        });
        const resJson = await res.json();
        setAlert(resJson);
        setLoading(false);
    }

    const attemptVerify = async () => {
        setLoading(true);
        setAlert(null);
        const codeStr = code.join('');
        const userId = await AsyncStorage.getItem(USER_ID_COOKIE_KEY);
        const res = await fetch(`${DOMAIN}/api/app/user/verification`, {
            method: 'PUT',
            body: JSON.stringify({ userId, codeStr })
        });
        const resJson = await res.json();
        if (resJson.cStatus == 200) {
            await AsyncStorage.setItem(AUTH_TOKEN_COOKIE_KEY, resJson.authToken);
            router.push('/(tabs)/account');
        } else {
            setAlert(resJson);
            setLoading(false);
        }
    }

    const handleKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
            // Move to the previous input if current is empty
            inputs.current[index - 1]?.focus();
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Verify Account</Text>

            <CheckIfLoading loading={loading}>
                <Text style={styles.subtitle}>Enter the code sent to your email.</Text>
                <View style={styles.inputContainer}>
                {code.map((digit, index) => (
                    <TextInput
                        key={index}
                        ref={(ref) => inputs.current[index] = ref}
                        style={styles.input}
                        maxLength={1}
                        value={digit}
                        onChangeText={(value) => handleChange(value, index)}
                        onKeyPress={(e) => handleKeyPress(e, index)}
                        textAlign="center" 
                        autoCorrect={false} // Disable autocorrect (e.g. 'o' to 'I')
                        autoCapitalize="none"
                    />
                ))}
                </View>
                <View style={{ width: '100%', display: 'flex', flexDirection: 'row', gap: 20, justifyContent: 'center' }}>
                    <Button onPress={attemptResend}>Resend Code</Button>
                    <Button onPress={attemptVerify} disabled={code.some((ele)=>ele=='')}>Verify</Button>
                </View>
            </CheckIfLoading>

            {alert && <Alert alert={alert} />}
        </View>
    );
};



const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        padding: 15,
        backgroundColor: COLORS.background
    },
    title: {
        marginBottom: 20,
        fontSize: FONT_SIZES.xl,
        color: COLORS.primary_1,
        fontWeight: '600'
    },
    subtitle: {
        marginBottom: 16,
        fontSize: FONT_SIZES.m,
        color: COLORS.black
    },
    inputContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '80%',
        marginBottom: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 10,
        fontSize: 18,
        width: 40,
        height: 50,
        marginHorizontal: 5,
        color: COLORS.black
    },
});