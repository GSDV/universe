import React, { useEffect, useState } from 'react';

import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import { useRouter } from 'expo-router';

import { usePostStore } from '@hooks/PostStore';

import { MaterialCommunityIcons } from '@expo/vector-icons';

import { FeedPost } from '@components/post/FeedPost';
import { CheckIfLoading } from '@components/Loading';
import List from '@components/List';
import Pfp from '@components/Pfp';

import { COLORS, FONT_SIZES } from '@util/global-client';

import { fetchWithAuth } from '@util/fetch';

import { PostType, RedactedUserWithFollow } from '@util/types';



export default function PostsAndUsers({ query }: { query: string }) {
    const addPost = usePostStore(state => state.addPost);

    const [view, setView] = useState<'posts' | 'users'>('posts');

    const [loading, setLoading] = useState<boolean>(true);

    const [posts, setPosts] = useState<PostType[]>([]);
    const [postsCursor, setPostsCursor] = useState<string>('');
    const [morePostsAvailable, setMorePostsAvailable] = useState<boolean>(false);

    const [users, setUsers] = useState<RedactedUserWithFollow[]>([]);
    const [usersCursor, setUsersCursor] = useState<string>('');
    const [moreUsersAvailable, setMoreUsersAvailable] = useState<boolean>(false);


    const fetchAndUpdatePosts = async (cursor: string, oldPosts: PostType[]) => {
        const params = new URLSearchParams({ query, cursor });
        const resJson = await fetchWithAuth(`search/posts?${params.toString()}`, 'GET');
        if (resJson.cStatus == 200) {
            resJson.posts.map((p: any) => addPost(p));
            setPostsCursor(resJson.nextCursor);
            setPosts([...oldPosts, ...resJson.posts]);
            setMorePostsAvailable(resJson.moreAvailable);
        }
    }

    const fetchAndUpdateUsers = async (cursor: string, oldUsers: RedactedUserWithFollow[]) => {
        const params = new URLSearchParams({ query, cursor });
        const resJson = await fetchWithAuth(`search/users?${params.toString()}`, 'GET');
        if (resJson.cStatus == 200) {
            setUsersCursor(resJson.nextCursor);
            setUsers([...oldUsers, ...resJson.users]);
            setMoreUsersAvailable(resJson.moreAvailable);
        }
    }

    const renderPost = (post: PostType) => <FeedPost postId={post.id} />;

    const renderUser = (user: RedactedUserWithFollow) => <FeedUser user={user} />;

    const intialFetch = async () => {
        setLoading(true);
        await Promise.all([
            fetchAndUpdatePosts('', []),
            fetchAndUpdateUsers('', [])
        ]);
        setLoading(false);
    }

    useEffect(() => {
        intialFetch();
    }, [query]);

    return (
        <>
            <View style={{ paddingVertical: 15, width: '100%', flexDirection: 'row', justifyContent: 'center', gap: 15 }}>
                <TouchableOpacity onPress={() => setView('posts')}>
                    <Text style={{ color: ((view==='posts') ? COLORS.black : COLORS.gray), fontSize: FONT_SIZES.m }}>Posts</Text>
                </TouchableOpacity>

                <Text style={{ color: COLORS.gray, fontSize: FONT_SIZES.m }}>|</Text>

                <TouchableOpacity onPress={() => setView('users')}>
                    <Text style={{ color: ((view==='users') ? COLORS.black : COLORS.gray), fontSize: FONT_SIZES.m }}>Users</Text>
                </TouchableOpacity>
            </View>

            <View style={{ width: '100%', height: 5, backgroundColor: COLORS.light_gray }} />

            <CheckIfLoading loading={loading}>
                <>
                    {view === 'posts' ?
                        <List<PostType> 
                            items={posts} 
                            cursor={postsCursor} 
                            moreAvailable={morePostsAvailable} 
                            fetchAndUpdate={fetchAndUpdatePosts} 
                            renderItem={renderPost}
                            allowRefresh={false}
                            noResultsText='no posts found'
                        />
                    :
                        <List<RedactedUserWithFollow> 
                            items={users} 
                            cursor={usersCursor} 
                            moreAvailable={moreUsersAvailable} 
                            fetchAndUpdate={fetchAndUpdateUsers} 
                            renderItem={renderUser}
                            allowRefresh={false}
                            noResultsText='no accounts found'
                        />
                    }
                </>
            </CheckIfLoading>
        </>
    );
}



function FeedUser({ user }: { user: RedactedUserWithFollow }) {
    const router = useRouter();
    const onPress = () => {
        router.push({
            pathname: '/profile/[username]/view',
            params: { username: user.username }
        });
    }

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