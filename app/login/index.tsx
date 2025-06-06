import { Platform, KeyboardAvoidingView, Pressable, Keyboard, ScrollView } from 'react-native';

import Login from '@screens/onboarding/Login';

import GoBackHeader from '@components/GoBackHeader';



export default function Index() {
    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
            <Pressable onPress={Keyboard.dismiss} style={{ flex: 1 }}>
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1, gap: 20 }}
                    keyboardShouldPersistTaps='handled'
                    showsVerticalScrollIndicator={false}
                >
                    <GoBackHeader />
                    <Login />
                </ScrollView>
            </Pressable>
        </KeyboardAvoidingView>
    );
}