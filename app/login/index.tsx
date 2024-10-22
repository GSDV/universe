import { ScrollView } from 'react-native';

import GoBackHeader from '@components/GoBackHeader';
import Login from '@screens/Login';



export default function Index() {
    return (
        <ScrollView contentContainerStyle={{ flex: 1, gap: 20 }}>
            <GoBackHeader />
            <Login />
        </ScrollView>
    );
}