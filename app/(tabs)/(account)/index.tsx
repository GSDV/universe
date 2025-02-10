import { View } from 'react-native';

import { useUser } from '@providers/UserProvider';

import Acccount from '@screens/account/Account';

import { SafeAreaTop } from '@components/SafeArea';

import { RedactedUserType, RedactedUserWithFollowAndBlock } from '@util/types';



// If this view is being mounted, then "userContext.user" will never be null.
export default function Index() {
    const userContext = useUser();

    const userPrisma: RedactedUserWithFollowAndBlock = {
        ...userContext.user as RedactedUserType,
        isFollowed: false,
        isBlocking: false,
        isBlockedBy: false
    }

    return (
        <View style={{ flex: 1 }}>
            <SafeAreaTop />
            <Acccount userPrisma={userPrisma} ownAccount={true} />
        </View>
    );
}