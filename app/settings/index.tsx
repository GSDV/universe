import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';

import { useRouter } from 'expo-router';

import { useUser } from '@components/providers/UserProvider';

import GoBackHeader from '@components/GoBackHeader';

import { COLORS, FONT_SIZES } from '@util/global-client';

import { setAuthCookie } from '@util/storage';



export default function Index() {
    const userContext = useUser();
    const router = useRouter();

    const attemptLogout = async () => {
        // Must navigate BEFORE resetting userContext and AuthCookie.
        // If not, Account screen will throw error for using null userPrisma.
        router.navigate('/');
        userContext.setUser(null);
        await setAuthCookie('');
    }

    return (
        <ScrollView contentContainerStyle={{ flex: 1 }}>
            <GoBackHeader />
            <View style={styles.container}>
                <Text style={styles.title} >Settings</Text>

                <TouchableOpacity onPress={() => router.push('/settings/profile-edit')}>
                    <Text style={styles.buttonText}>Edit Profile</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={attemptLogout}>
                    <Text style={styles.buttonText}>Logout</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => console.log("Prompt delete account")}>
                    <Text style={styles.buttonText}>Delete Account</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}



const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        alignItems: 'center',
        gap: 70
    },
    title: {
        marginBottom: 20,
        textAlign: 'center',
        fontSize: FONT_SIZES.xxl,
        fontWeight: 'bold',
        color: COLORS.primary_1
    },
    buttonText: {
        fontSize: FONT_SIZES.l,
        color: COLORS.gray,
        textAlign: 'center'
    }
});