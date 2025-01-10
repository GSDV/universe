import { useState } from 'react';

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

import { RedactedUserWithFollow, UniversityType } from '@util/types';



// ownAccount (assumed false): Is the user viewing his own account
interface AccountProps {
    userPrisma: RedactedUserWithFollow
    ownAccount?: boolean
}

export default function Account({ userPrisma, ownAccount = false }: AccountProps) {
    return (
        <View style={{ flex: 1, gap: 5 }}>
            <AccountHeader userPrisma={userPrisma} ownAccount={ownAccount} />

            {userPrisma.university && <University university={userPrisma.university} />}

            <Bio bio={userPrisma.bio} />

            <Connections user={userPrisma} ownAccount={ownAccount} />

            <PostsAndReplies userId={userPrisma.id} />
        </View>
    );
}



interface AccountHeader {
    userPrisma: RedactedUserWithFollow
    ownAccount: boolean
}

function AccountHeader({ userPrisma, ownAccount }: AccountHeader) {
    const router = useRouter();

    return (
        <View style={styles.header}>
            <View style={{ flex: 1, flexDirection: 'row', gap: 5, alignItems: 'center' }}>
                <Pfp pfpKey={userPrisma.pfpKey} style={styles.pfp} />
                <View style={{ flex: 1, gap: 2 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                        <Text ellipsizeMode='tail' numberOfLines={1} style={styles.displayName}>{userPrisma.displayName}</Text>
                        {userPrisma.verified && <MaterialCommunityIcons name='star-four-points' style={{ fontSize: FONT_SIZES.m }} color={COLORS.primary_1} />}
                    </View>
                    <Text ellipsizeMode='tail' numberOfLines={1} style={styles.username}>@{userPrisma.username}</Text>
                </View>
            </View>

            {ownAccount && 
            <>
                <TouchableOpacity onPress={() => router.push(`/post/create`)}>
                    <Ionicons name='add-outline' size={30} color={COLORS.primary_1} />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.push('/settings')}>
                    <Ionicons name='settings-outline' size={30} color={COLORS.primary_1} />
                </TouchableOpacity>
            </>
            }
        </View>
    );
}



function University({ university }: { university: UniversityType }) {
    return (
        <View style={{ width: '100%', paddingHorizontal: 20 }}>
            <Text style={{ fontSize: FONT_SIZES.m, color: university.color }}>{university.name}</Text>
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



function Connections({ user, ownAccount }: { user: RedactedUserWithFollow, ownAccount: boolean }) {
    const userContext = useUser();

    const [isFollowing, setIsFollowing] = useState<boolean>(user.isFollowed);
    const [followerCount, setFollowerCount] = useState<number>(user.followerCount);
    const followButtonColor = isFollowing ? '#b8b8b8' : COLORS.primary_1;

    const toggleFollow = async () => {
        const followed = !isFollowing;
        setIsFollowing(followed);

        if (followed) setFollowerCount(prev=>prev+1);
        else setFollowerCount(prev=>prev-1);

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
                <Text style={{ fontSize: FONT_SIZES.m, color: COLORS.black }}>{followerCount} Followers</Text>
                {!ownAccount && <Button
                    textStyle={{width: 100, fontSize: FONT_SIZES.m, backgroundColor: followButtonColor}} 
                    onPress={toggleFollow}
                >
                    {(isFollowing) ? 'Unfollow' : 'Follow'}
                </Button>}
            </View>
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