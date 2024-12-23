import { View } from 'react-native';

import { useUser } from '@components/providers/UserProvider';

import Acccount from '@screens/account/Account';

import { SafeAreaTop } from '@components/SafeArea';

import { RedactedUserType } from '@util/types';



// If this view is being mounted, then "userContext.user" will never be null.
export default function Index() {
    const userContext = useUser();

    return (
        <View style={{ flex: 1 }}>
            <SafeAreaTop />
            <Acccount userPrisma={userContext.user as RedactedUserType} ownAccount={true} found={false} />
        </View>
    );
}