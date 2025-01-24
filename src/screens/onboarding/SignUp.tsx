import { useCallback, useState } from 'react';

import { View, Text, StyleSheet, Keyboard } from 'react-native';

import { useFocusEffect, useRouter } from 'expo-router';

import TermsAndPrivacyPolicy from './TermsAndPrivacyPolicy';
import Input from './Input';
import Button from '@components/Button';
import { Alert, AlertType } from '@components/Alert';
import { CheckIfLoading } from '@components/Loading';

import { MAX_USERNAME_LENGTH } from '@util/global';
import { COLORS, FONT_SIZES } from '@util/global-client';

import { fetchBasic } from '@util/fetch';



export default function SignUp() {
    const router = useRouter();

    const [loading, setLoading] = useState<boolean>(false);
    const [alert, setAlert] = useState<AlertType | null>(null);

    const [userData, setUserData] = useState({
        displayName: '',
        username: '',
        email: '',
        password: ''
    });

    const handleChange = (name: string, value: string) => {
        if (name == 'username') value = value.toLowerCase();
        if (value.length > MAX_USERNAME_LENGTH) value = value.substring(0, MAX_USERNAME_LENGTH+1);

        if (name == 'email') value = value.toLowerCase();

        setUserData(prevState => ({
            ...prevState,
            [name]: value,
        }));
    };

    const onSubmit = async () => {
        Keyboard.dismiss();
        setLoading(true);
        setAlert(null);

        const body = JSON.stringify({ data: userData });
        const resJson = await fetchBasic('user/verification', 'POST', body);
        if (resJson.cStatus == 200 || resJson.cStatus == 510) {
            const dataParam = encodeURIComponent(JSON.stringify(userData));
            router.push({ pathname: `/signup/verification`, params: { dataParam } });
        }
        else {
            setAlert(resJson);
            setLoading(false);
        }
    }

    // When navigating back from verification page, keep user data but take off loading and alert.
    useFocusEffect(
        useCallback(() => {
                setLoading(false);
                setAlert(null);
        }, [])
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Create Account</Text>

            <CheckIfLoading loading={loading}>
                <Input
                    title='Display Name'
                    placeholder='John Doe'
                    subtitle='Can be anything!'
                    value={userData.displayName}
                    onChange={(input: string) => handleChange('displayName', input)}
                />

                <Input
                    title='Username'
                    placeholder='john_doe'
                    subtitle='a-z, 0-9, and underscores'
                    value={userData.username}
                    onChange={(input: string) => handleChange('username', input)}
                />

                <Input
                    title='Email'
                    placeholder='john10@illinois.edu'
                    subtitle='School email'
                    value={userData.email}
                    onChange={(input: string) => handleChange('email', input)}
                />

                <Input
                    title='Password'
                    placeholder='supersecretpassword'
                    value={userData.password}
                    onChange={(input: string) => handleChange('password', input)}
                    isSecure={true}
                />

                <Button containerStyle={{ alignSelf: 'center' }} onPress={onSubmit}>Sign Up</Button>

                <TermsAndPrivacyPolicy />
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