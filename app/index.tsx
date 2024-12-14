import { useEffect, useState } from 'react';

import { View } from 'react-native';

import { useRouter } from 'expo-router';

import { useUser } from '@components/providers/UserProvider';

import NotLoggedIn from '@screens/NotLoggedIn';

import { CheckIfLoading } from '@components/Loading';
import { SafeAreaTop } from '@components/SafeArea';

import { AUTH_TOKEN_COOKIE_KEY, DOMAIN } from '@util/global';

import { getAuthCookie } from '@util/storage';



// Check if user is signed in
export default function Index() {
    const router = useRouter();

    const userContext = useUser();

    const [loading, setLoading] = useState<boolean>(true);


    const loadProfile = async () => {
        setLoading(true);

        const authTokenCookie = await getAuthCookie();
        if (!authTokenCookie) {
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
            const user = resJson.user;
            userContext.setUser(user);
            router.replace({pathname: `/(tabs)/account`});
        }
        setLoading(false);
    }

    useEffect(() => {
        loadProfile();
    }, []);

    return (
        <View style={{ flex: 1 }}>
            <SafeAreaTop />
            <CheckIfLoading loading={loading}>
                <NotLoggedIn />
            </CheckIfLoading>
        </View>
    );
}