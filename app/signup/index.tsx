import { View } from 'react-native';

import SignUp from '@screens/SignUp';

import GoBackHeader from '@components/GoBackHeader';



export default function Index() {
    return (
        <View style={{ flex: 1, gap: 20 }}>
            <GoBackHeader />
            <SignUp />
        </View>
    );
}