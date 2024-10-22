import { View } from 'react-native';

import GoBackHeader from '@components/GoBackHeader';
import Verification from '@screens/Verification';



export default function Index() {
    return (
        <View style={{ flex: 1, gap: 20 }}>
            <GoBackHeader />
            <Verification />
        </View>
    );
}