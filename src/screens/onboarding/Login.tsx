import { useState } from 'react';

import { View, Text, StyleSheet, Keyboard } from 'react-native';

import { useRouter } from 'expo-router';

import { useUser } from '@providers/UserProvider';

import TermsAndPrivacyPolicy from './TermsAndPrivacyPolicy';
import Input from './Input';
import Button from '@components/Button';
import { Alert, AlertType } from '@components/Alert';
import GoToResetPassword from './GoToResetPassword';
import { CheckIfLoading } from '@components/Loading';

import { COLORS, FONT_SIZES } from '@util/global-client';

import { fetchBasic } from '@util/fetch';
import { setAuthCookie } from '@util/storage';



export default function Login() {
    const router = useRouter();

    const userContext = useUser();

    const [loading, setLoading] = useState<boolean>(false);
    const [alert, setAlert] = useState<AlertType | null>(null);

    const [userData, setUserData] = useState({
        email: '',
        password: ''
    });

    const handleChange = (name: string, value: string) => {
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

        const body = JSON.stringify({ email: userData.email, password: userData.password });
        const resJson = await fetchBasic('user', 'PUT', body);
        if (resJson.cStatus == 200) {
            userContext.setUser(resJson.user);
            await setAuthCookie(resJson.authToken);
            router.replace('/(tabs)/(account)');
        }
        else {
            setAlert(resJson);
            setLoading(false);
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Login</Text>

            <CheckIfLoading loading={loading}>
                <Input
                    placeholder='john10@illinois.edu'
                    subtitle='Email'
                    value={userData.email}
                    onChange={(input: string) => handleChange('email', input)}
                    autoCap='none'
                />

                <Input
                    placeholder='supersecretpassword'
                    subtitle='Password'
                    value={userData.password}
                    onChange={(input: string) => handleChange('password', input)}
                    isSecure={true}
                    autoCap='none'
                />

                <Button containerStyle={{ alignSelf: 'center' }} onPress={onSubmit}>Login</Button>

                <TermsAndPrivacyPolicy />
                <GoToResetPassword />
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