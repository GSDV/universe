import { View } from 'react-native';

import Search from '@screens/search/Search';

import { SafeAreaTop } from '@components/SafeArea';



export default function Index() {
    return (
        <View style={{ flex: 1 }}>
            <SafeAreaTop />
            <Search tag='search students' type='USERS' />
        </View>
    );
}