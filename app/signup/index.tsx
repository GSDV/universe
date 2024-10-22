import { ScrollView } from 'react-native';

import GoBackHeader from '@components/GoBackHeader';
import SignUp from '@screens/SignUp';



export default function Index() {
    return (
        <ScrollView contentContainerStyle={{ flex: 1, gap: 20 }}>
            <GoBackHeader />
            <SignUp />
        </ScrollView>
    );
}