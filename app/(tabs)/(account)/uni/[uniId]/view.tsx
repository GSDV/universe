import { View } from 'react-native';

import GoBackHeader from '@components/GoBackHeader';

import Uni from '@screens/uni/Uni';



export default function Index() {
    return (
        <View style={{ flex: 1 }}>
            <GoBackHeader />
            <Uni />
        </View>
    );
}