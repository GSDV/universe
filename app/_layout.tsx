import { useEffect } from 'react';

import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';

import { GestureHandlerRootView } from 'react-native-gesture-handler';

import Providers from '@providers/Providers';

import * as SplashScreen from 'expo-splash-screen';

import { COLORS } from '@util/global-client';



SplashScreen.preventAutoHideAsync();



const contentStyle = { backgroundColor: COLORS.background };



export default function RootLayout() {
    const [loaded] = useFonts({
        Helvetica: require('../assets/fonts/HelveticaNeue/Regular.ttf')
    });

    useEffect(() => {
        if (loaded) SplashScreen.hideAsync();
    }, [loaded]);

    if (!loaded) return null;

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <Providers>
                <Stack initialRouteName='(tabs)'>
                    <Stack.Screen name='index' options={{ headerShown: false, contentStyle }} />
                    <Stack.Screen name='(tabs)' options={{ headerShown: false, animation: 'fade', gestureEnabled: false, contentStyle }} />
                    <Stack.Screen name='settings/index' options={{ headerShown: false, contentStyle }} />
                    <Stack.Screen name='settings/profile-edit/index' options={{ headerShown: false, contentStyle }} />
                    <Stack.Screen name='login/index' options={{ headerShown: false, contentStyle }} />
                    <Stack.Screen name='signup/index' options={{ headerShown: false, contentStyle }} />
                    <Stack.Screen name='signup/verification/index' options={{ headerShown: false, contentStyle }} />
                    <Stack.Screen name='reset-password/index' options={{ headerShown: false, contentStyle }} />
                    <Stack.Screen name='+not-found' options={{ headerShown: false, contentStyle }} />
                </Stack>
            </Providers>
        </GestureHandlerRootView>
    );
}