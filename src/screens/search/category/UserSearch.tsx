import React, { useEffect, useState, useCallback, memo } from 'react';

import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import { useRouter } from 'expo-router';

import { MaterialCommunityIcons } from '@expo/vector-icons';

import { CheckIfLoading } from '@components/Loading';
import List from '@components/List';
import Pfp from '@components/Pfp';

import { COLORS, FONT_SIZES } from '@util/global-client';

import { fetchWithAuth } from '@util/fetch';

import { RedactedUserWithFollow } from '@util/types';



export default function UserSearch({ query }: { query: string }) {
    const [loading, setLoading] = useState<boolean>(true);

    const [users, setUsers] = useState<RedactedUserWithFollow[]>([]);
    const [usersCursor, setUsersCursor] = useState<string>('');
    const [moreUsersAvailable, setMoreUsersAvailable] = useState<boolean>(false);

    const fetchAndUpdateUsers = useCallback(async (cursor: string, oldUsers: RedactedUserWithFollow[]) => {
        const params = new URLSearchParams({ query, cursor });
        const resJson = await fetchWithAuth(`search/users?${params.toString()}`, 'GET');
        if (resJson.cStatus == 200) {
            setUsersCursor(resJson.nextCursor);
            setUsers([...oldUsers, ...resJson.users]);
            setMoreUsersAvailable(resJson.moreAvailable);
        }
    }, [query]);

    const renderUser = useCallback((user: RedactedUserWithFollow) => {
        return <MemoizedFeedUser user={user} />;
    }, []);

    const intialFetch = useCallback(async () => {
        setLoading(true);
        await fetchAndUpdateUsers('', []);
        setLoading(false);
    }, [fetchAndUpdateUsers]);

    useEffect(() => {
        intialFetch();
    }, [query, intialFetch]);

    return (
        <CheckIfLoading loading={loading}>
            <List<RedactedUserWithFollow> 
                items={users} 
                cursor={usersCursor} 
                moreAvailable={moreUsersAvailable} 
                fetchAndUpdate={fetchAndUpdateUsers} 
                renderItem={renderUser}
                allowRefresh={false}
                noResultsText='no accounts found'
            />
        </CheckIfLoading>
    );
}


const MemoizedFeedUser = memo(FeedUser);

function FeedUser({ user }: { user: RedactedUserWithFollow }) {
    const router = useRouter();
    
    const onPress = useCallback(() => {
        router.push({
            pathname: '/profile/[username]/view',
            params: { username: user.username }
        });
    }, [router, user.username]);

    return (
        <TouchableOpacity onPress={onPress} style={account_feed_styles.container}>
            <Pfp pfpKey={user.pfpKey} style={account_feed_styles.pfp} />

            <View style={{ padding: 5, paddingTop: 5, flex: 6, gap: 2 }}>
                <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center' }}>
                    <View style={{ flex: 1, justifyContent: 'center', gap: 0 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                            <Text style={account_feed_styles.displayName} numberOfLines={1} ellipsizeMode='tail'>{user.displayName}</Text>
                            {user.verified && <MaterialCommunityIcons name='star-four-points' style={{ fontSize: FONT_SIZES.m }} color={COLORS.primary} />}
                        </View>
                        <Text style={account_feed_styles.username} numberOfLines={1} ellipsizeMode='tail'>@{user.username}</Text>
                    </View>

                    <View style={{ justifyContent: 'center' }}>
                        {user.isFollowed && <Text style={{ color: COLORS.primary, fontSize: FONT_SIZES.s }}>Following</Text>}
                    </View>
                </View>

                {user.university!=undefined && <Text numberOfLines={1} style={{ color: user.university.color, fontSize: FONT_SIZES.s }}>{user.university.name}</Text>}
                {user.bio!='' && <Text ellipsizeMode='tail' numberOfLines={1} style={{ color: COLORS.black, fontSize: FONT_SIZES.s }}>{user.bio}</Text>}
            </View>
        </TouchableOpacity>
    );
}

const account_feed_styles = StyleSheet.create({
    container: {
        padding: 10,
        paddingVertical: 5,
        width: '100%',
        flexDirection: 'row',
        backgroundColor: COLORS.background
    },
    header: {
        paddingBottom: 5,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 5
    },
    pfp: {
        marginTop: 5,
        width: 35,
        height: 35,
        borderRadius: 50
    },
    displayName: {
        maxWidth: '70%',
        color: COLORS.black,
        fontSize: FONT_SIZES.m,
        fontWeight: '500'
    },
    username: {
        color: COLORS.gray,
        fontSize: FONT_SIZES.m
    }
});