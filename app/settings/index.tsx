import { ScrollView } from 'react-native';

import SettingsView from '@screens/settings/View';

import GoBackHeader from '@components/GoBackHeader';



export default function Index() {
    return (
        <ScrollView contentContainerStyle={{ flex: 1 }}>
            <GoBackHeader />
            <SettingsView />
        </ScrollView>
    );
}