import { useEffect, useState } from 'react';

import { View, Text, ScrollView } from 'react-native';

import { useRouter } from 'expo-router';

import { useUser } from '@components/providers/UserProvider';

import Acccount from '@screens/account/Account';

import { CheckIfLoading } from '@components/Loading';
import { SafeAreaTop } from '@components/SafeArea';
import Button from '@components/Button';

import { AUTH_TOKEN_COOKIE_KEY, BRAND, DOMAIN } from '@util/global';
import { COLORS, FONT_SIZES } from '@util/global-client';

import { getAuthCookie } from '@util/storage';

import { RedactedUserType } from '@util/types';



export default function Index() {
    const userContext = useUser();

    const [loading, setLoading] = useState<boolean>(true);
    const [loggedIn, setLoggedIn] = useState<boolean>(false);
    const [userPrisma, setUserPrisma] = useState<RedactedUserType>();


    const loadProfile = async () => {
        setLoading(true);
        const authTokenCookie = await getAuthCookie();
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
            setUserPrisma(resJson.user);
            userContext.setUser(resJson.user);
            setLoggedIn(true);
        } else {
            setLoggedIn(false);
        }
        setLoading(false);
    }

    useEffect(() => {
        loadProfile();
    }, []);


    return (
        <View style={{ flex: 1, backgroundColor: COLORS.background }}>
            <SafeAreaTop />
            <CheckIfLoading loading={loading}>
                {!loggedIn ?
                    <Acccount userPrisma={userPrisma as RedactedUserType} ownAccount={true} found={false} />
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