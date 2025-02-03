import { useEffect, useState } from 'react';

import { Linking, View, Alert as AlertPopUp, Text } from 'react-native';

import { useRouter } from 'expo-router';

import { useUser } from '@providers/UserProvider';

import NotLoggedIn from '@screens/NotLoggedIn';

import Button from '@components/Button';
import { SafeAreaTop } from '@components/SafeArea';
import { CheckIfLoading } from '@components/Loading';

import { COLORS, FONT_SIZES } from '@util/global-client';

import { fetchBasic, fetchWithAuth } from '@util/fetch';
import { getAuthCookie } from '@util/storage';



// Check if user is signed in.
export default function Index() {
    const router = useRouter();
    const userContext = useUser();

    const [outDated, setOutDated] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);

    const goToAppStore = async () => {
        try {
            await Linking.openURL(`itms-apps:///apps.apple.com/app/id/6741363295`);
        }
        catch (e) {
            AlertPopUp.alert('Unable to open App Store', '', [{ text: 'Ok', onPress: () => {} }]);
        }
    }

    const promptUpdate = () => {
        AlertPopUp.alert('Update Available!', 'A new version of this app is available. Please update it in the App Store.', [
            { text: 'Ok', onPress: () => {} },
            { text: 'Go to App Store', onPress: goToAppStore },
        ]);
    }

    const loadProfile = async () => {
        setLoading(true);

        // Check if user is using an up-to-date version of the app.
        const resJsonVersion = await fetchBasic(`version`, 'GET');
        if (resJsonVersion.cStatus == 150) {
            promptUpdate();
            setOutDated(true);
            return;
        }

        const authTokenCookie = await getAuthCookie();
        if (!authTokenCookie) {
            setLoading(false);
            return;
        }

        const resJson = await fetchWithAuth(`user`, 'GET');
        if (resJson.cStatus == 200) {
            const user = resJson.user;
            userContext.setUser(user);
            router.push(`/(tabs)/(account)`);
        }

        // Sleep function so that the fade animation does not show NotLoggedIn content when succesfully loging in.
        await (new Promise(resolve => setTimeout(resolve, 3000)));
        setLoading(false);
    }

    useEffect(() => {
        loadProfile();
    }, []);

    return (
        <View style={{ flex: 1 }}>
            <SafeAreaTop />
                {outDated ?
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <View style={{ gap: 20 }}>
                            <Text style={{ textAlign: 'center', color: COLORS.primary, fontSize: FONT_SIZES.l }}>Please update the app to continue</Text>
                            <Button onPress={goToAppStore}>Go to App Store</Button>
                        </View>
                    </View>
                :
                    <CheckIfLoading loading={loading}>
                        <NotLoggedIn />
                    </CheckIfLoading>
                }
        </View>
    );
}