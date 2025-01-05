import { View } from 'react-native';

import { useUser } from '@providers/UserProvider';

import CreatePostScreen from '@screens/post/Create';
import { SafeAreaFull } from '@components/SafeArea';

import { COLORS } from '@util/global-client';

import { RedactedUserType } from '@util/types';



export default function Index() {
    const userContext = useUser();

    return (
        <View style={{ flex: 1, backgroundColor: COLORS.background }}>
            <SafeAreaFull>
                <CreatePostScreen userPrisma={userContext.user as RedactedUserType} />
            </ SafeAreaFull>
        </View>
    );
}