import { Stack } from 'expo-router';

import { COLORS } from '@util/global-client';



const contentStyle = { backgroundColor: COLORS.background };



export default function MapStack() {
    return (
        <Stack>
            <Stack.Screen name='index' options={{ headerShown: false, contentStyle }} />
            <Stack.Screen
                name='post/[postId]/view'
                options={{ headerShown: false, contentStyle }}
                getId={({ params }) => params?.viewId}
            />
            <Stack.Screen
                name='profile/[username]/view'
                options={{ headerShown: false, contentStyle }}
                getId={({ params }) => params?.viewId}
            />
            <Stack.Screen
                name='uni/[uniId]]/view'
                options={{ headerShown: false, contentStyle }}
                getId={({ params }) => params?.viewId}
            />
        </Stack>
    );
}