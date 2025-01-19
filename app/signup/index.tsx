import { ScrollView } from 'react-native';

import SignUp from '@screens/onboarding/SignUp';

import GoBackHeader from '@components/GoBackHeader';



export default function Index() {
    return (
        <ScrollView contentContainerStyle={{ flex: 1, gap: 20 }}>
            <GoBackHeader />
            <SignUp />
        </ScrollView>
    );
}