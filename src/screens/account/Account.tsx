import { useEffect, useRef, useState } from 'react';

import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import { useRouter } from 'expo-router';

import { useOperation } from '@components/providers/OperationProvider';

import { useUser } from '@components/providers/UserProvider';

import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import Pfp from '@components/Pfp';
import UserPosts from '@components/post/UserPosts';
import UserReplies from '@components/post/UserReplies';
import { CheckIfLoading } from '@components/Loading';

import { COLORS, FONT_SIZES } from '@util/global-client';

import { fetchWithAuth } from '@util/fetch';

import { PostType, RedactedUserWithFollow, UniversityType } from '@util/types';
import Button from '@components/Button';



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
                <View style={{ gap: 2 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                        <Text style={styles.displayName}>{userPrisma.displayName}</Text>
                        {userPrisma.verified && <MaterialCommunityIcons name='star-four-points' style={{ fontSize: FONT_SIZES.m }} color={COLORS.primary_1} />}
                    </View>
                    <Text style={styles.username}>@{userPrisma.username}</Text>
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



function PostsAndReplies({ userId }: { userId: string }) {
    const operationContext = useOperation();

    const [view, setView] = useState<'posts' | 'replies'>('posts');
    const [loading, setLoading] = useState<boolean>(true);

    const [posts, setPosts] = useState<PostType[]>([]);
    const [postsPage, setPostsPage] = useState<number>(1);
    // Are there more posts available for when the user scrolls to the end?
    // If not, do not let user load more.
    const [morePostsAvailable, setMorePostsAvailable] = useState<boolean>(false);

    const [replies, setReplies] = useState<PostType[]>([]);
    const [repliesPage, setRepliesPage] = useState<number>(1);
    const [moreRepliesAvailable, setMoreRepliesAvailable] = useState<boolean>(false);

    const fetchAndUpdatePosts = async (postsPage: number, oldPosts: PostType[]) => {
        const resJson = await fetchWithAuth(`user/${userId}/post?postsPage=${postsPage}`, 'GET');
        if (resJson.cStatus == 200) {
            setPostsPage(postsPage);
            setPosts([...oldPosts, ...resJson.posts]);
            setMorePostsAvailable(resJson.morePostsAvailable);
        }
    }

    const fetchAndUpdateReplies = async (repliesPage: number, oldReplies: PostType[]) => {
        const resJson = await fetchWithAuth(`user/${userId}/reply?repliesPage=${repliesPage}`, 'GET');
        if (resJson.cStatus == 200) {
            setRepliesPage(repliesPage);
            setReplies([...oldReplies, ...resJson.replies]);
            setMoreRepliesAvailable(resJson.moreRepliesAvailable);
        }
    }
    
    // Used only once, to initially load first few posts and replies.
    const fetchInitialPR = async () => {
        setLoading(true);
        await Promise.all([
            fetchAndUpdatePosts(1, []),
            fetchAndUpdateReplies(1, [])
        ]);
        setLoading(false);
    }

    useEffect(() => {
        fetchInitialPR();
    }, []);

    const isFirstRender = useRef<boolean>(true);
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        if (operationContext.lastOperation) {
            setPosts(prev => operationContext.conductOperation(prev, 'account_posts'));
            setReplies(prev => operationContext.conductOperation(prev, 'account_replies'));
        }
    }, [operationContext.lastOperation]);

    return (
        <View style={{ flex: 1 }}>
            <View style={{ padding: 10, width: '100%', flexDirection: 'row', justifyContent: 'center', gap: 15 }}>
                <TouchableOpacity onPress={() => setView('posts')}>
                    <Text style={{ color: ((view==='posts') ? COLORS.black : COLORS.gray), fontSize: FONT_SIZES.m }}>Posts</Text>
                </TouchableOpacity>

                <Text style={{ color: COLORS.gray, fontSize: FONT_SIZES.m }}>|</Text>

                <TouchableOpacity onPress={() => setView('replies')}>
                    <Text style={{ color: ((view==='replies') ? COLORS.black : COLORS.gray), fontSize: FONT_SIZES.m }}>Replies</Text>
                </TouchableOpacity>
            </View>

            <View style={{ width: '100%', height: 5, backgroundColor: 'rgb(220, 220, 220)' }} />

            <CheckIfLoading loading={loading}>
                {view === 'posts' ?
                    <UserPosts 
                        posts={posts} 
                        postsPage={postsPage} 
                        morePostsAvailable={morePostsAvailable} 
                        fetchAndUpdatePosts={fetchAndUpdatePosts} 
                    />
                :
                    <UserReplies 
                        replies={replies} 
                        repliesPage={repliesPage} 
                        moreRepliesAvailable={moreRepliesAvailable} 
                        fetchAndUpdateReplies={fetchAndUpdateReplies} 
                    />
                }
            </CheckIfLoading>
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
    const followButtonColor = isFollowing ? '#b8b8b8' : COLORS.primary_2;

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