import { View } from 'react-native';

import { useUser } from '@components/providers/UserProvider';

import Acccount from '@screens/account/Account';

import { SafeAreaTop } from '@components/SafeArea';

import { RedactedUserType, RedactedUserWithFollow } from '@util/types';



// If this view is being mounted, then "userContext.user" will never be null.
export default function Index() {
    const userContext = useUser();

    const userPrisma: RedactedUserWithFollow = {
        ...userContext.user as RedactedUserType,
        isFollowed: false
    }

    return (
        <View style={{ flex: 1 }}>
            <SafeAreaTop />
            <Acccount userPrisma={userPrisma} ownAccount={true} />
        </View>
    );
}