import { useEffect, useState } from 'react';

import { useLocalSearchParams } from 'expo-router';

import Acccount from '@screens/account/Account';

import { AlertType, CheckIfAlert } from '@components/Alert';
import { CheckIfLoading } from '@components/Loading';

import { fetchWithAuth } from '@util/fetch';

import { RedactedUserWithFollowAndBlock } from '@util/types';



export default function Profile() {
    const { username } = useLocalSearchParams();

    const [user, setUser] = useState<RedactedUserWithFollowAndBlock>();
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
        <CheckIfLoading loading={loading}>
            <CheckIfAlert alert={alert}>
                <Acccount userPrisma={user as RedactedUserWithFollowAndBlock} ownAccount={ownAccount} />
            </CheckIfAlert>
        </CheckIfLoading>
    );
}