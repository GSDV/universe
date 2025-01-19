// Must use `{' '}` for react native to render a space in some instances.

import {
    Linking,
    Text,
    Alert as AlertPopUp,
    StyleSheet
} from 'react-native';

import { COLORS, FONT_SIZES } from '@util/global-client';



export default function TermsAndPrivacyPolicy() {
    const openLink = async (url: string) => {
        try {
            const supported = await Linking.canOpenURL(url);
            if (supported) {
                await Linking.openURL(url);
            } else {
                AlertPopUp.alert(
                    'Error',
                    'Something went wrong.',
                    [{ text: 'OK' }]
                );
            }
        } catch (error) {}
    }

    const openTerms = async () => openLink(`https://www.joinuniverse.app/terms`);
    const openPrivacyPolicy = async () => openLink(`https://www.joinuniverse.app/privacy-policy`);

    return (
            <Text style={styles.text}>
                By using UniVerse, you agree to our{' '}
                <Text style={styles.link} onPress={openTerms}>Terms</Text>
                {' and '}
                <Text style={styles.link} onPress={openPrivacyPolicy}>Privacy Policy</Text>
                .
            </Text>
    );
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