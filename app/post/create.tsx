import { useEffect, useState } from 'react';
import { View } from 'react-native';

import CreatePostScreen from '@screens/post/Create';

import { useUser } from '@components/providers/UserProvider';

import { SafeAreaFull } from '@components/SafeArea';
import { CheckIfLoading } from '@components/Loading';

import { COLORS } from '@util/global-client';
import { RedactedUserType } from '@util/types';



export default function Index() {
    const userContext = useUser();

    const [loading, setLoading] = useState<boolean>(false);
    const [userPrisma, setUserPrisma] = useState<RedactedUserType | null>(null);

    const fetchaccount = async () => {
        setLoading(true);
        setUserPrisma(userContext.user);
        setLoading(false);
    }

    useEffect(() => {
        fetchaccount();
    }, []);

    return (
        <View style={{ flex: 1, backgroundColor: COLORS.background }}>
            <SafeAreaFull>
            <CheckIfLoading loading={loading}>
                {userPrisma && <CreatePostScreen userPrisma={userPrisma as RedactedUserType} />}
            </CheckIfLoading>
            </ SafeAreaFull>
        </View>
    );
}