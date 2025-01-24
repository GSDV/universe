import { Text, StyleSheet } from 'react-native';

import { useRouter } from 'expo-router';

import { COLORS, FONT_SIZES } from '@util/global-client';



export default function GoToResetPassword() {
    const router = useRouter();
    return <Text style={styles.text}>If you forgot your password, reset it <Text style={styles.link} onPress={()=>router.push('/reset-password')}>here</Text>.</Text>;
}



const styles = StyleSheet.create({
    text: {
        color: COLORS.gray,
        fontSize: FONT_SIZES.m,
        textAlign: 'center'
    },
    link: {
        color: COLORS.primary
    }
});