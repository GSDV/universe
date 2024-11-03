import { useCallback, useState } from 'react';
import { View, Text, TextInput } from 'react-native';

import { useFocusEffect, useRouter } from 'expo-router';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { CheckIfLoading } from '@components/Loading';
import Button from '@components/Button';
import { Alert, AlertType } from '@components/Alert';

import { DOMAIN, USER_ID_COOKIE_KEY, MAX_USERNAME_LENGTH } from '@util/global';
import { COLORS, FONT_SIZES } from '@util/global-client';



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
        setLoading(true);
        setAlert(null);
        const res = await fetch(`${DOMAIN}/api/app/user`, {
            method: 'POST',
            body: JSON.stringify({ data: userData })
        });
        const resJson = await res.json();
        if (resJson.cStatus == 200) {
            await AsyncStorage.setItem(USER_ID_COOKIE_KEY, resJson.userId);
            router.push(`/signup/verification`);
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
            <Text style={{ textAlign: 'center', fontSize: FONT_SIZES.xxl, fontWeight: 600, color: COLORS.secondary_1 }}>Create Account</Text>

            <CheckIfLoading loading={loading}>
                <SignUpInput
                    title='Display Name'
                    placeholder='John Doe'
                    subtitle='Can be anything!'
                    value={userData.displayName}
                    onChange={(input: string) => handleChange('displayName', input)} />

                <SignUpInput
                    title='Username'
                    placeholder='john_doe'
                    subtitle='a-z, 0-9, and underscores'
                    value={userData.username}
                    onChange={(input: string) => handleChange('username', input)} />

                <SignUpInput
                    title='Email'
                    placeholder='john10@illinois.edu'
                    subtitle='School email'
                    value={userData.email}
                    onChange={(input: string) => handleChange('email', input)} />

                <SignUpInput
                    title='Password'
                    placeholder='supersecretpassword'
                    value={userData.password}
                    onChange={(input: string) => handleChange('password', input)}
                    isSecure={true} />

                <Button containerStyle={{ alignSelf: 'center' }} onPress={onSubmit}>Sign Up</Button>
            </CheckIfLoading>
        </View>

        {alert && <Alert alert={alert} />}
    </>
    );
}



function SignUpInput({ placeholder, value, onChange, title, subtitle, isSecure }: { placeholder: string, value: string, onChange: (input: string)=>void, title: string, subtitle?: string, isSecure?: boolean }) {
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