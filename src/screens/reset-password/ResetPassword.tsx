// Used for resetting password through onboarding, when logged out.

import { useState } from 'react';

import { View, Text, StyleSheet, Keyboard, TextInput } from 'react-native';

import Button from '@components/Button';
import { Alert, AlertType } from '@components/Alert';
import { CheckIfLoading } from '@components/Loading';

import { COLORS, FONT_SIZES } from '@util/global-client';

import { fetchBasic } from '@util/fetch';



export default function ResetPassword() {
    const [loading, setLoading] = useState<boolean>(false);
    const [alert, setAlert] = useState<AlertType | null>(null);

    const [email, setEmail] = useState<string>('');

    const onSubmit = async () => {
        Keyboard.dismiss();
        setLoading(true);
        setAlert(null);

        const body = JSON.stringify({ email });
        const resJson = await fetchBasic('password', 'POST', body);
        setAlert(resJson);
        setLoading(false);
    }

    return (
        <View style={styles.container}>
            <Text style={[styles.title, {marginBottom: 0}]}>Reset Password</Text>
            <Text>You will receive an email to reset your password.</Text>

            <CheckIfLoading loading={loading}>
                <Input
                    title='Email'
                    placeholder='Email'
                    value={email}
                    onChange={(input: string) => setEmail(input.toLowerCase())}
                />

                <Button containerStyle={{ alignSelf: 'center' }} onPress={onSubmit}>Send Email</Button>
            </CheckIfLoading>

            {alert && <Alert alert={alert} />}
        </View>
    );
}



function Input({ placeholder, value, onChange, title, subtitle, isSecure }: { placeholder: string, value: string, onChange: (input: string)=>void, title: string, subtitle?: string, isSecure?: boolean }) {
    return (
        <View style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <Text style={{fontSize: FONT_SIZES.m}}>{title}</Text>
            <TextInput
                style={{ padding: 7, paddingHorizontal: 10, borderRadius: 5, width: '100%', backgroundColor: 'white', fontSize: FONT_SIZES.m }}
                placeholder={placeholder}
                value={value}
                onChangeText={onChange}
                secureTextEntry={isSecure}
            />
            {subtitle && <Text style={{color: COLORS.gray, fontSize: FONT_SIZES.s}}>{subtitle}</Text>}
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
        gap: 30
    },
    title: {
        marginBottom: 20,
        textAlign: 'center',
        fontSize: FONT_SIZES.xxl,
        fontWeight: 'bold',
        color: COLORS.primary
    }
});