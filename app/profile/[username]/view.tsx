import { useEffect, useState } from 'react';

import { View } from 'react-native';

import { useLocalSearchParams } from 'expo-router';

import Acccount from '@screens/account/Account';

import { AlertType, CheckIfAlert } from '@components/Alert';
import { CheckIfLoading } from '@components/Loading';
import GoBackHeader from '@components/GoBackHeader';

import { fetchWithAuth } from '@util/fetch';

import { RedactedUserWithFollow } from '@util/types';



export default function Index() {
    const { username } = useLocalSearchParams();

    const [user, setUser] = useState<RedactedUserWithFollow>();
    const [ownAccount, setOwnAccount] = useState<boolean>(false);

    const [loading, setLoading] = useState<boolean>(true);
    const [alert, setAlert] = useState<AlertType>();

    const fetchAccount = async () => {
        setLoading(true);

        const resJson = await fetchWithAuth(`profile/${username}`, 'GET');

        if (resJson.cStatus == 200) {
            setUser(resJson.user);
            setOwnAccount(resJson.ownAccount);
        } else {
            setAlert(resJson);
        }

        setLoading(false);
    }

    useEffect(() => {
        fetchAccount();
    }, []);

    return (
        <View style={{ flex: 1 }}>
            <GoBackHeader />
            <CheckIfLoading loading={loading}>
                <CheckIfAlert alert={alert}>
                    <Acccount userPrisma={user as RedactedUserWithFollow} ownAccount={ownAccount} />
                </CheckIfAlert>
            </CheckIfLoading>
        </View>
    );
}