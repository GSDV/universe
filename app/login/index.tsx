import { ScrollView } from 'react-native';

import Login from '@screens/onboarding/Login';

import GoBackHeader from '@components/GoBackHeader';



export default function Index() {
    return (
        <ScrollView contentContainerStyle={{ flex: 1, gap: 20 }}>
            <GoBackHeader />
            <Login />
        </ScrollView>
    );
}