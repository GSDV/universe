import { View } from 'react-native';

import Verification from '@screens/Verification';

import GoBackHeader from '@components/GoBackHeader';



export default function Index() {
    return (
        <View style={{ flex: 1, gap: 20 }}>
            <GoBackHeader />
            <Verification />
        </View>
    );
}