import { Dispatch, SetStateAction, useState, Fragment } from 'react';

import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import { useRouter } from 'expo-router';

import { useUser } from '@providers/UserProvider';

import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import PostsAndReplies from './PostsAndReplies';
import Pfp from '@components/Pfp';
import Button from '@components/Button';

import { COLORS, FONT_SIZES } from '@util/global-client';

import { fetchWithAuth } from '@util/fetch';

import { RedactedUserWithFollowAndBlock, UniversityWithoutUsers } from '@util/types';
import { showActionSheet } from '@util/action';
import { getUniqueString } from '@util/unique';



// ownAccount (assumed false): Is the user viewing his own account
interface AccountProps {
    userPrisma: RedactedUserWithFollowAndBlock;
    ownAccount?: boolean;
    blocked?: boolean;
}

export default function Account({ userPrisma, ownAccount = false }: AccountProps) {
    const [user, setUser] = useState<RedactedUserWithFollowAndBlock>(userPrisma);

    return (
        <View style={{ flex: 1, gap: 5 }}>
            <AccountHeader user={user} ownAccount={ownAccount} setUser={setUser} />

            {userPrisma.university && <University university={userPrisma.university} />}

            {userPrisma.bio !== '' && <Bio bio={userPrisma.bio} />}

            <Connections user={user} ownAccount={ownAccount} setUser={setUser} />

            {user.isBlocking ?
                <AccountIsBlocked />
            :
                <Fragment>{user.isBlockedBy ?
                    <AccountBlockedYou />
                :
                    <PostsAndReplies userId={userPrisma.id} />
                }</Fragment>
            }
        </View>
    );
}



interface AccountHeader {
    user: RedactedUserWithFollowAndBlock;
    ownAccount: boolean;
    setUser: Dispatch<SetStateAction<RedactedUserWithFollowAndBlock>>
}

function AccountHeader({ user, ownAccount, setUser }: AccountHeader) {
    const router = useRouter();

    const toggleBlock = () => {
        const didBlock = !user.isBlocking;
        const body = JSON.stringify({ didBlock });
        fetchWithAuth(`user/${user.id}/block`, 'PUT', body);

        setUser(u => ({
            ...u,
            isBlocking: didBlock,
            isFollowed: false,
            followerCount: (user.isFollowed) ? (user.followerCount - 1) : user.followerCount
        }));
    }

    const promptOtherOptions = () => {
        const options = [
            { label: (user.isBlocking ? 'Unblock' : 'Block'), action: toggleBlock }
        ];
        showActionSheet(options, [0])
    }

    return (
        <View style={styles.header}>
            <View style={{ flex: 1, flexDirection: 'row', gap: 5, alignItems: 'center' }}>
                <Pfp pfpKey={user.pfpKey} style={styles.pfp} isOwnPfp={ownAccount} />
                <View style={{ flex: 1, gap: 2 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                        <Text ellipsizeMode='tail' numberOfLines={1} style={styles.displayName}>{user.displayName}</Text>
                        {user.verified && <MaterialCommunityIcons name='star-four-points' style={{ fontSize: FONT_SIZES.m }} color={COLORS.primary} />}
                    </View>
                    <Text ellipsizeMode='tail' numberOfLines={1} style={styles.username}>@{user.username}</Text>
                </View>
            </View>

            {ownAccount ? 
                <TouchableOpacity onPress={() => router.push('/settings')}>
                    <Ionicons name='settings-outline' size={30} color={COLORS.primary} />
                </TouchableOpacity>
            :
                <TouchableOpacity onPress={promptOtherOptions}>
                    <Ionicons name='ellipsis-horizontal' size={25} color={COLORS.primary} />
                </TouchableOpacity>
            }
        </View>
    );
}



function University({ university }: { university: UniversityWithoutUsers }) {
    const router = useRouter();

    const goToUni = () => {
        if (!university) return;
        router.push({
            pathname: '/uni/[uniId]/view',
            params: {
                uniId: university.id,
                viewId: getUniqueString(university.id)
            }
        });
    }

    return (
        <View style={{ width: '100%', paddingHorizontal: 20 }}>
            <TouchableOpacity style={{ alignSelf: 'flex-start' }} onPress={goToUni} hitSlop={5}>
                <Text numberOfLines={1} ellipsizeMode='tail' style={{ fontSize: FONT_SIZES.m, color: university.color }}>{university.name}</Text>
            </TouchableOpacity>
        </View>
    );
}



function Bio({ bio }: { bio: string }) {
    return (
        <View style={{ width: '100%', paddingHorizontal: 20 }}>
            <Text style={{ fontSize: FONT_SIZES.m, color: COLORS.black }}>{bio}</Text>
        </View>
    );
}



interface ConnectionsProps {
    user: RedactedUserWithFollowAndBlock;
    ownAccount: boolean;
    setUser: Dispatch<SetStateAction<RedactedUserWithFollowAndBlock>>;
}
function Connections({ user, ownAccount, setUser }: ConnectionsProps) {
    const userContext = useUser();
    const followButtonColor = user.isFollowed ? '#b8b8b8' : COLORS.primary;

    const toggleFollow = async () => {
        const followed = !user.isFollowed;

        setUser(u => ({
            ...u,
            isFollowed: followed,
            followerCount: (followed) ? (u.followerCount+1) : (u.followerCount-1)
        }));

        // For displaying on user's own account:
        userContext.setUser(prev => {
            if (!prev) return null;
            const followingCount = prev.followingCount + ((followed) ? 1 : -1);
            return { ...prev, followingCount };
        });

        // Async call:
        const body = JSON.stringify({ followed });
        fetchWithAuth(`profile/${user.username}/follow`, 'POST', body);
    }

    return (
        <View style={{ paddingVertical: 5, paddingHorizontal: 20, width: '100%', gap: 10 }}>
            <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' }}>
                <Text style={{ fontSize: FONT_SIZES.m, color: COLORS.black }}>{user.followingCount} Following</Text>
                <Text style={{ fontSize: FONT_SIZES.m, color: COLORS.black }}>{user.followerCount} Followers</Text>
                {(!ownAccount && !user.isBlocking && !user.isBlockedBy) && <Button
                    textStyle={{width: 100, fontSize: FONT_SIZES.m, backgroundColor: followButtonColor}} 
                    onPress={toggleFollow}
                >
                    {(user.isFollowed) ? 'Unfollow' : 'Follow'}
                </Button>}
            </View>
        </View>
    );
}



function AccountIsBlocked() {
    return (
        <View style={{ padding: 10, flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.light_gray }}>
            <Text style={{ textAlign: 'center', color: COLORS.black, fontSize: FONT_SIZES.s }}>you blocked this account</Text>
        </View>
    );
}

function AccountBlockedYou() {
    return (
        <View style={{ padding: 10, flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.light_gray }}>
            <Text style={{ textAlign: 'center', color: COLORS.black, fontSize: FONT_SIZES.s }}>this account has blocked you</Text>
        </View>
    );
}



const styles = StyleSheet.create({
    header: {
        position: 'relative',
        paddingHorizontal: 15,
        paddingVertical: 5,
        display: 'flex',
        flexDirection: 'row',
        gap: 15,
        alignItems: 'center'
    },
    pfp: {
        borderRadius: 50,
        width: 50,
        height: 50
    },
    displayName: {
        color: COLORS.black,
        fontSize: FONT_SIZES.m
    },
    username: {
        color: COLORS.gray,
        fontSize: FONT_SIZES.m
    }
});