import { View, Text, ScrollView } from 'react-native';

import { useRouter } from 'expo-router';

import Button from '@components/Button';

import { COLORS, FONT_SIZES } from '@util/global-client';



export default function NotLoggedIn() {
    const router = useRouter();

    return (
        <ScrollView contentContainerStyle={{ flex: 1 }}>
            <View style={{ padding: 30, flex: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 30 }}>
                <View style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 5 }}>
                    <Text style={{ fontSize: FONT_SIZES.xxl, fontWeight: 600, color: COLORS.primary }}>Welcome to UniVerse</Text>
                    <Text style={{ fontSize: FONT_SIZES.l, color: COLORS.black }}>To continue, please:</Text>
                </View>

                <Button textStyle={{ fontSize: FONT_SIZES.l }} onPress={() => router.push('/login')} containerStyle={{ width: '100%' }}>Login</Button>
                
                <View style={{ flexDirection: 'row', gap: 20, width: '80%', alignItems: 'center' }}>
                    <View style={{ flex: 1, height: 1, backgroundColor: COLORS.gray }} />
                    <Text style={{ fontSize: FONT_SIZES.m, color: COLORS.gray }}>Or</Text>
                    <View style={{ flex: 1, height: 1, backgroundColor: COLORS.gray }} />
                </View>

                <Button textStyle={{ fontSize: FONT_SIZES.l }} onPress={() => router.push('/signup')} containerStyle={{ width: '100%' }}>Sign Up</Button>
            </View>

            {/* Spacer */}
            <View style={{ flex: 0.5 }} />
        </ScrollView>
    );
}