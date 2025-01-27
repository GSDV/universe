import { useState } from 'react';

import { View, Text, StyleSheet, Keyboard } from 'react-native';

import Button from '@components/Button';
import Input from '@screens/onboarding/Input';
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