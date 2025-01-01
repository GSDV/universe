import { useEffect } from 'react';

import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';

import Providers from '@components/providers/Providers';

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';

import { COLORS } from '@util/global-client';



// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const contentStyle = { backgroundColor: COLORS.background };



export default function RootLayout() {
    const [loaded] = useFonts({
        Helvetica: require('../src/assets/fonts/HelveticaNeue/Regular.ttf') // SpaceMono-Regular
    });

    useEffect(() => {
        if (loaded) SplashScreen.hideAsync();
    }, [loaded]);

    if (!loaded) return null;

    return (
        <GestureHandlerRootView>
            <Providers>
                <Stack initialRouteName='(tabs)'>
                    <Stack.Screen name='index' options={{ headerShown: false, contentStyle }} />

                    <Stack.Screen name='(tabs)' options={{ headerShown: false, animation: 'fade', gestureEnabled: false, contentStyle }} />

                    <Stack.Screen name='profile/[username]/view' options={{ headerShown: false, contentStyle }} />

                    <Stack.Screen name='settings/index' options={{ headerShown: false, contentStyle }} />
                    <Stack.Screen name='settings/profile-edit/index' options={{ headerShown: false, contentStyle }} />

                    <Stack.Screen name='login/index' options={{ headerShown: false, contentStyle }} />
                    <Stack.Screen name='signup/index' options={{ headerShown: false, contentStyle }} />
                    <Stack.Screen name='signup/verification/index' options={{ headerShown: false, contentStyle }} />

                    <Stack.Screen name='post/create' options={{ headerShown: false, contentStyle }} />
                    <Stack.Screen name='post/[postId]/view' options={{ headerShown: false, contentStyle }} />

                    <Stack.Screen name='+not-found' options={{ headerShown: false, contentStyle }} />
                </Stack>
            </Providers>
        </GestureHandlerRootView>
    );
}