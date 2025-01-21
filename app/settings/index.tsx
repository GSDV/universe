import { useState } from 'react';

import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert as AlertPopUp } from 'react-native';

import { useRouter } from 'expo-router';

import { useUser } from '@providers/UserProvider';

import GoBackHeader from '@components/GoBackHeader';
import { CheckIfLoading } from '@components/Loading';

import { COLORS, FONT_SIZES } from '@util/global-client';

import { setAuthCookie } from '@util/storage';
import { fetchWithAuth } from '@util/fetch';



export default function Index() {
    const userContext = useUser();
    const router = useRouter();

    const [loading, setLoading] = useState<boolean>(false);

    /**
     * Must, in this order:
     * 1. Reset auth cookie on client
     * 2. Navigate to root
     * 3. Reset userContext
     * 4. Delete auth cookie on server
    **/
    const attemptLogout = async () => {
        await setAuthCookie('');
        router.dismissAll();
        await fetchWithAuth(`user/${userContext.user?.id}/auth`, 'DELETE');
        userContext.setUser(null);
    }


    const promptDelete = () => {
        AlertPopUp.prompt('Type "DELETE" to delete your account.', 'This action cannot be undone.', [
            { text: 'Cancel', onPress: () => {}, style: 'cancel' },
            { text: 'Send', onPress: async (text: string | undefined) => {
                if (text === undefined || text.trim().toUpperCase() !== 'DELETE') return;
                setLoading(true);
                const userId = userContext.user?.id ?? '';
                const body = JSON.stringify({ userId });
                const resJson = await fetchWithAuth(`user/${userId}`, 'DELETE', body);

                if (resJson.cStatus == 200) {
                    attemptLogout();
                    AlertPopUp.alert('You account has been deleted.', '', [{ text: 'OK', onPress: () => {} }]);
                } else {
                    AlertPopUp.alert('Something went wrong.', '', [{ text: 'OK', onPress: () => {} }]);
                }
                setLoading(false);
            } }
        ], 'plain-text');
    }

    const askDelete = () => {
        AlertPopUp.alert('Delete Account', 'Are you sure you want to delete your account?', [
            { text: 'No', style: 'default', onPress: () => {} },
            { text: 'Yes', style: 'destructive', onPress: promptDelete }
        ]);
    }

    return (
        <ScrollView contentContainerStyle={{ flex: 1 }}>
            <GoBackHeader />
            <View style={styles.container}>
                <Text style={styles.title} >Settings</Text>

                <CheckIfLoading loading={loading}>
                    <TouchableOpacity onPress={() => router.push('/settings/profile-edit')}>
                        <Text style={styles.buttonText}>Edit Profile</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={attemptLogout}>
                        <Text style={styles.buttonText}>Logout</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={askDelete}>
                        <Text style={styles.buttonText}>Delete Account</Text>
                    </TouchableOpacity>
                </CheckIfLoading>
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
        color: COLORS.primary
    },
    buttonText: {
        fontSize: FONT_SIZES.l,
        color: COLORS.gray,
        textAlign: 'center'
    }
});