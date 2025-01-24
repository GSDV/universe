import React, { useRef, useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

import { useLocalSearchParams, useRouter } from 'expo-router';

import { useUser } from '@providers/UserProvider';

import Button from '@components/Button';
import { CheckIfLoading } from '@components/Loading';
import { Alert, AlertType } from '@components/Alert';

import { COLORS, FONT_SIZES } from '@util/global-client';

import { fetchBasic } from '@util/fetch';
import { setAuthCookie } from '@util/storage';



export default function Verification() {
    const router = useRouter();

    const userContext = useUser();

    const [loading, setLoading] = useState<boolean>(false);
    const [alert, setAlert] = useState<AlertType | null>(null);

    const [code, setCode] = useState(['', '', '', '', '', '']);
    const inputs = useRef<(TextInput | null)[]>([]);

    const { dataParam } = useLocalSearchParams();
    const data = JSON.parse(decodeURIComponent(dataParam as string));

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

        const body = JSON.stringify({ data });
        const resJson = await fetchBasic('user/verification', 'POST', body);
        // cStatus is always "error" to show red text instead of green.
        // Consider simply changing Alert component to always show red text, even for 200s.
        setAlert({ cStatus: 100, msg: resJson.msg });
        setLoading(false);
    }

    const attemptVerify = async () => {
        setLoading(true);
        setAlert(null);

        const body = JSON.stringify({ data, codeStr: code.join('') });
        const resJson = await fetchBasic('user/verification', 'PUT', body);
        if (resJson.cStatus == 200) {
            userContext.setUser(resJson.user);
            await setAuthCookie(resJson.authToken);
            router.replace('/(tabs)/(account)');
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
        
            <View style={{ paddingTop: 20, width: '100%' }}>
                {alert && <Alert alert={alert} />}
            </View>
        </View>
    );
}



const styles = StyleSheet.create({
    container: {
        padding: 15,
        flex: 1,
        alignSelf: 'center',
        width: '80%',
        display: 'flex',
        flexDirection: 'column',
        gap: 15
    },
    title: {
        textAlign: 'center',
        fontSize: FONT_SIZES.xxl,
        fontWeight: 'bold',
        color: COLORS.primary
    },
    subtitle: {
        fontSize: FONT_SIZES.m,
        color: COLORS.black,
        textAlign: 'center'
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
    }
});