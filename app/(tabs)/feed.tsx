import { View } from 'react-native';

import Feed from '@screens/feed/Feed';

import { SafeAreaTop } from '@components/SafeArea';



export default function Index() {
    return (
        <View style={{ flex: 1 }}>
            <SafeAreaTop />
            <Feed />
        </View>
    );
}