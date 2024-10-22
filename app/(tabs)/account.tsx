import { useEffect, useState } from 'react';

import { View, Text, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useRouter } from 'expo-router';

import Acccount from '@components/Account';
import { CheckIfLoading } from '@components/Loading';

import { AUTH_TOKEN_COOKIE_KEY, BRAND, COLORS, DOMAIN, FONT_SIZES } from '@util/globals';

import { RedactedUserType } from '@util/types';
import { SafeAreaTop } from '@components/SafeArea';
import GoBackHeader from '@components/GoBackHeader';
import Button from '@components/Button';



export default function Screen() {
    const [test, settest] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [loggedIn, setLoggedIn] = useState<boolean>(false);
    const [userPrisma, setUserPrisma] = useState<RedactedUserType>();


    const loadProfile = async () => {
        setLoading(true);
        const authTokenCookie = await AsyncStorage.getItem(AUTH_TOKEN_COOKIE_KEY);
        console.log("LOAIDNG PROFILE: ", authTokenCookie);
        if (!authTokenCookie) {
            setLoggedIn(false);
            setLoading(false);
            return;
        }

        const res = await fetch(`${DOMAIN}/api/app/user`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': `${AUTH_TOKEN_COOKIE_KEY}=${authTokenCookie}`
            }
        });

        const resJson = await res.json();
        if (resJson.cStatus == 200) {
            console.log("Got it: ", resJson.user);
            setUserPrisma(resJson.user);
            setLoggedIn(true);
        } else {
            setLoggedIn(false);
        }
        setLoading(false);
    }

    useEffect(() => {
        console.log("NAjVi TO ACCOUNT");
        loadProfile();
    }, []);


    return (
        <View style={{ flex: 1, backgroundColor: COLORS.background }}>
            <SafeAreaTop />
            <CheckIfLoading loading={loading}>
                {loggedIn ?
                    <Acccount userPrisma={userPrisma as RedactedUserType} />
                :
                    <NotLoggedIn />
                }
            </CheckIfLoading>
        </View>
    );
}



function NotLoggedIn() {
    const router = useRouter();

    return (
        <ScrollView contentContainerStyle={{ flex: 1 }}>
            <View style={{ flex: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 30 }}>
                <View style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 5 }}>
                    <Text style={{ fontSize: FONT_SIZES.xxl, fontWeight: 600, color: COLORS.secondary_1 }}>Welcome to {BRAND}</Text>
                    <Text style={{ fontSize: FONT_SIZES.m, color: COLORS.black }}>To continue, please:</Text>
                </View>

                <Button textStyle={{ fontSize: FONT_SIZES.l }} onPress={() => router.push('/login')}>Login</Button>
                <Text style={{ fontSize: FONT_SIZES.m }}>Or</Text>
                <Button textStyle={{ fontSize: FONT_SIZES.l }} onPress={() => router.push('/signup')}>Sign Up</Button>
            </View>

            {/* Spacer */}
            <View style={{ flex: 1 }} />
        </ScrollView>
    );
}