import { View } from 'react-native';

import { SafeAreaTop } from '@components/SafeArea';

import Search from '@screens/search/Selection';



export default function Index() {
    return (
        <View style={{ flex: 1 }}>
            <SafeAreaTop />
            <Search />
        </View>
    );
}