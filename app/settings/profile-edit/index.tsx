
import { View } from 'react-native';

import ProfileEdit from '@screens/settings/ProfileEdit';

import GoBackHeader from '@components/GoBackHeader';



export default function Index() {

    return (
        <View style={{ flex: 1 }}>
            <GoBackHeader />
            <ProfileEdit />
        </View>
    );
}