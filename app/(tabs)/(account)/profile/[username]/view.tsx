import { View } from 'react-native';

import GoBackHeader from '@components/GoBackHeader';

import Profile from '@screens/profile/Profile';



export default function Index() {
    return (
        <View style={{ flex: 1 }}>
            <GoBackHeader />
            <Profile />
        </View>
    );
}