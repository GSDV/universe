import { useEffect, useState } from 'react';

import { View } from 'react-native';

import { useRouter } from 'expo-router';

import NotLoggedIn from '@screens/NotLoggedIn';

import { useUser } from '@providers/UserProvider';
import { SafeAreaTop } from '@components/SafeArea';
import { CheckIfLoading } from '@components/Loading';

import { fetchWithAuth } from '@util/fetch';
import { getAuthCookie } from '@util/storage';



// Check if user is signed in.
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

        const resJson = await fetchWithAuth('user', 'GET');
        if (resJson.cStatus == 200) {
            const user = resJson.user;
            userContext.setUser(user);
            router.replace(`/(tabs)/(account)`);
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