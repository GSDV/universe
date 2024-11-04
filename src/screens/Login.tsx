import { useCallback, useState } from 'react';
import { View, Text, TextInput } from 'react-native';

import { useFocusEffect, useRouter } from 'expo-router';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { CheckIfLoading } from '@components/Loading';
import Button from '@components/Button';
import { Alert, AlertType } from '@components/Alert';

import { AUTH_TOKEN_COOKIE_KEY, DOMAIN, USER_ID_COOKIE_KEY } from '@util/global';
import { COLORS, FONT_SIZES } from '@util/global-client';



export default function Login() {
    const router = useRouter();

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
        setLoading(true);
        setAlert(null);
        const res = await fetch(`${DOMAIN}/api/app/user`, {
            method: 'PUT',
            body: JSON.stringify({ email: userData.email, password: userData.password })
        });
        const resJson = await res.json();
        if (resJson.cStatus == 412) {
            await AsyncStorage.setItem(USER_ID_COOKIE_KEY, resJson.userId);
            router.push(`/signup/verification`);
        }
        else if (resJson.cStatus == 200) {
            await AsyncStorage.setItem(AUTH_TOKEN_COOKIE_KEY, resJson.authToken);
            router.push(`/(tabs)/account`);
        }
        else {
            setAlert(resJson);
            setLoading(false);
        }
    }

    // When navigating back from verification page, keep user data but take off loading and alert
    useFocusEffect(
        useCallback(() => {
                setLoading(false);
                setAlert(null);
        }, [])
    );

    return (
    <>
        <View style={{ alignSelf: 'center', width: '80%', display: 'flex', flexDirection: 'column', gap: 30 }}>
            <Text style={{ textAlign: 'center', fontSize: FONT_SIZES.xxl, fontWeight: 600, color: COLORS.primary_1 }}>Login</Text>

            <CheckIfLoading loading={loading}>
                <LoginInput
                    title='Email'
                    placeholder='john10@illinois.edu'
                    subtitle='School email'
                    value={userData.email}
                    onChange={(input: string) => handleChange('email', input)} />

                <LoginInput
                    title='Password'
                    placeholder='supersecretpassword'
                    value={userData.password}
                    onChange={(input: string) => handleChange('password', input)}
                    isSecure={true} />

                <Button containerStyle={{ alignSelf: 'center' }} onPress={onSubmit}>Login</Button>
            </CheckIfLoading>
        </View>

        {alert && <Alert alert={alert} />}
    </>
    );
}





function LoginInput({ placeholder, value, onChange, title, subtitle, isSecure }: { placeholder: string, value: string, onChange: (input: string)=>void, title: string, subtitle?: string, isSecure?: boolean }) {
    return (
        <View style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <Text style={{fontSize: FONT_SIZES.m}}>{title}</Text>
            <TextInput
                style={{ padding: 5, width: '100%', backgroundColor: 'white', fontSize: FONT_SIZES.m }}
                placeholder={placeholder}
                value={value}
                onChangeText={onChange}
                secureTextEntry={isSecure}
            />
            {subtitle && <Text style={{color: COLORS.gray, fontSize: FONT_SIZES.s}}>{subtitle}</Text>}
        </View>
    );
}