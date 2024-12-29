import { useEffect, useRef, useState } from 'react';

import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import { useRouter } from 'expo-router';

import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { useOperation } from '@components/providers/OperationProvider';

import Pfp from '@components/Pfp';
import UserPosts from '@components/post/UserPosts';
import UserReplies from '@components/post/UserReplies';
import { CheckIfLoading } from '@components/Loading';

import { ACCOUNT_POSTS_PER_BATCH } from '@util/global';
import { COLORS, FONT_SIZES } from '@util/global-client';

import { fetchWithAuth } from '@util/fetch';

import { PostType, RedactedUserType, UniversityType } from '@util/types';



// ownAccount (assumed false): Is the user viewing his own account
// found (assumed true): Was the account found through anything but the user tapping his own account on nav tab
//      - In other words, was this account screen mounted from the map, viewing a post, through search, ...
//      - "found" only controls whether or not to display a back button (no need to "go back" from the nav tab)
interface AccountProps {
    userPrisma: RedactedUserType
    ownAccount?: boolean
    found?: boolean
}

export default function Account({ userPrisma, ownAccount = false, found = true }: AccountProps) {
    return (
        <View style={{ flex: 1, gap: 5 }}>
            <AccountHeader userPrisma={userPrisma} ownAccount={ownAccount} found={found} />

            {userPrisma.university && <University university={userPrisma.university} />}

            <Connections user={userPrisma} />

            <PostsAndReplies userId={userPrisma.id} />
        </View>
    );
}



interface AccountHeader {
    userPrisma: RedactedUserType
    ownAccount: boolean
    found: boolean
}

function AccountHeader({ userPrisma, ownAccount, found }: AccountHeader) {
    const router = useRouter();

    return (
        <View style={styles.header}>
            {found && 
                <TouchableOpacity onPress={router.back}>
                    <Ionicons name='chevron-back' size={25} color={COLORS.primary_1} />
                </TouchableOpacity>
            }

            <View style={{ flex: 1, flexDirection: 'row', gap: 5, alignItems: 'center' }}>
                <Pfp pfpKey={userPrisma.pfpKey} style={styles.pfp} />
                <View style={{ gap: 2 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                        <Text style={styles.displayName}>{userPrisma.displayName}</Text>
                        <MaterialCommunityIcons name='star-four-points' style={{ fontSize: FONT_SIZES.m }} color={COLORS.primary_1} />
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

    const handlePinChange = (postToPinId: string) => {
        setPosts(currentPosts => {
            const currentPinnedPost = currentPosts[0]?.pinned ? currentPosts[0] : null;
            const postToPin = currentPosts.find(post => post.id === postToPinId);
            
            if (!postToPin) return currentPosts;
            
            // Unpinning case
            if (currentPinnedPost?.id === postToPinId) {
                const otherPosts = currentPosts.slice(1);
                const unpinnedPost = { ...currentPinnedPost, pinned: false };
                const sortedPosts = [unpinnedPost, ...otherPosts].sort(
                    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
                
                return (sortedPosts.length > ACCOUNT_POSTS_PER_BATCH && 
                       morePostsAvailable && 
                       sortedPosts[sortedPosts.length-1].id === unpinnedPost.id)
                       ? sortedPosts.slice(0, -1)
                       : sortedPosts;
            }

            // Pinning case
            const newPinnedPost = { ...postToPin, pinned: true };
            const otherPosts = currentPosts.filter(post => post.id !== postToPinId);
            return [newPinnedPost, ...(currentPinnedPost ? otherPosts.slice(1) : otherPosts)];
        });
    }


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
            // fetchAndUpdateReplies(1, [])
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
            <View style={{ padding: 5, width: '100%', flexDirection: 'row', justifyContent: 'center', gap: 15 }}>
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
                        handlePinChange={handlePinChange} 
                    />
                :
                    <UserReplies 
                        replies={replies} 
                        repliesPage={repliesPage} 
                        moreRepliesAvailable={morePostsAvailable} 
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


function Connections({ user }: { user: RedactedUserType }) {
    return (
        <View style={{ paddingVertical: 5, width: '100%', flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 20 }}>
            <Text style={{ fontSize: FONT_SIZES.m, color: COLORS.black }}>{user.followerCount} Followers</Text>
            <Text style={{ fontSize: FONT_SIZES.m, color: COLORS.black }}>{user.followingCount} Following</Text>
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