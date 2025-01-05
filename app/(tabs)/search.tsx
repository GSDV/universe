import { useEffect, useState } from 'react';

import { TextInput, View, Text, Platform, StatusBar, Keyboard, StyleSheet, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';

import { useRouter } from 'expo-router';

import { useUser } from '@components/providers/UserProvider';

import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';

import { FeedPost } from '@components/post/FeedPost';
import { SafeAreaTop } from '@components/SafeArea';
import { CheckIfLoading } from '@components/Loading';
import Pfp from '@components/Pfp';
import List from '@components/List';

import { COLORS, FONT_SIZES } from '@util/global-client';

import { fetchWithAuth } from '@util/fetch';

import { PostType, RedactedUserWithFollow } from '@util/types';




export default function Index() {
    const [input, setInput] = useState<string>('');
    const [query, setQuery] = useState<string>('');

    const onSubmit = () => setQuery(input.trim());

    return (
        <TouchableWithoutFeedback style={{ flex: 1 }} onPress={Keyboard.dismiss}>
            <View style={{ flex: 1 }}>
                <SafeAreaTop />
                <View style={styles.searchContainer}>
                    <Ionicons name='search' size={20} color={COLORS.gray} style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder='Search...'
                        value={input}
                        onChangeText={setInput}
                        placeholderTextColor={COLORS.gray}
                        autoCapitalize='none'
                        autoCorrect={false}
                        returnKeyType='search'
                        onSubmitEditing={onSubmit}
                    />
                    {input.trim() && 
                        <TouchableOpacity onPress={onSubmit}>
                            <Feather name='send' size={24} color={COLORS.primary_1} />
                        </TouchableOpacity>
                    }
                </View>

                {(query === '') ? 
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ color: COLORS.black, fontSize: FONT_SIZES.s }}>search posts and users</Text>
                    </View>
                :
                    <PostsAndUsers query={query} />
                }
            </View>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        marginHorizontal: 16,
        marginVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        height: 40,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#333',
        height: '100%'
    },
  });
  



function PostsAndUsers({ query }: { query: string }) {
    const userContext = useUser();

    const [view, setView] = useState<'posts' | 'users'>('posts');

    const [loading, setLoading] = useState<boolean>(true);

    const [posts, setPosts] = useState<PostType[]>([]);
    const [postsCursor, setPostsCursor] = useState<Date>(new Date());
    const [morePostsAvailable, setMorePostsAvailable] = useState<boolean>(false);

    const [users, setUsers] = useState<RedactedUserWithFollow[]>([]);
    const [usersCursor, setUsersCursor] = useState<Date>(new Date());
    const [moreUsersAvailable, setMoreUsersAvailable] = useState<boolean>(false);


    const fetchAndUpdatePosts = async (cursor: Date, oldPosts: PostType[]) => {
        const params = new URLSearchParams({
            query,
            cursor: cursor.toISOString()
        });
        const resJson = await fetchWithAuth(`search/posts?${params.toString()}`, 'GET');
        if (resJson.cStatus == 200) {
            setPostsCursor(new Date(resJson.newCursor));
            setPosts([...oldPosts, ...resJson.posts]);
            setMorePostsAvailable(resJson.moreAvailable);
        }
    }

    const fetchAndUpdateUsers = async (cursor: Date, oldUsers: RedactedUserWithFollow[]) => {
        const params = new URLSearchParams({
            query,
            cursor: cursor.toISOString()
        });
        const resJson = await fetchWithAuth(`search/users?${params.toString()}`, 'GET');
        if (resJson.cStatus == 200) {
            setUsersCursor(new Date(resJson.newCursor));
            setUsers([...oldUsers, ...resJson.users]);
            setMoreUsersAvailable(resJson.moreAvailable);
        }
    }

    const renderPost = (post: PostType) => <FeedPost post={post} ownPost={userContext?.user?.id === post.author.id} />;

    const renderUser = (user: RedactedUserWithFollow) => <FeedAccount user={user} />;

    const intialFetch = async () => {
        setLoading(true);
        const now = new Date();
        await Promise.all([
            fetchAndUpdatePosts(now, []),
            fetchAndUpdateUsers(now, [])
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

            <View style={{ width: '100%', height: 5, backgroundColor: 'rgb(220, 220, 220)' }} />

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



export function FeedAccount({ user }: { user: RedactedUserWithFollow }) {
    const router = useRouter();
    const onPress = () => {
        router.push({
            pathname: '/profile/[username]/view',
            params: { username: user.username }
        });
    }

    return (
        <TouchableOpacity onPress={onPress} style={account_feed_styles.container}>
            <View style={account_feed_styles.header}>
                <Pfp pfpKey={user.pfpKey} style={account_feed_styles.pfp} />

                <View style={{ flex: 1, justifyContent: 'center', gap: 2 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                        <Text style={account_feed_styles.displayName} numberOfLines={1} ellipsizeMode='tail'>{user.displayName}</Text>
                        {user.verified && <MaterialCommunityIcons name='star-four-points' style={{ fontSize: FONT_SIZES.m }} color={COLORS.primary_1} />}
                    </View>
                    <Text style={account_feed_styles.username} numberOfLines={1} ellipsizeMode='tail'>@{user.username}</Text>
                </View>
            </View>

            {user.bio!='' && <Text ellipsizeMode='tail' numberOfLines={1} style={{ color: COLORS.black, fontSize: FONT_SIZES.s }}>{user.bio}</Text>}

            {user.isFollowed && <Text style={{ color: COLORS.gray, fontSize: FONT_SIZES.s }}>Following</Text>}
        </TouchableOpacity>
    );
}



const account_feed_styles = StyleSheet.create({
    container: {
        padding: 15,
        paddingHorizontal: 20,
        width: '100%',
        gap: 10,
        backgroundColor: COLORS.background
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 10
    },
    pfp: {
        borderRadius: 50,
        width: 50,
        height: 50
    },
    displayName: {
        maxWidth: '50%',
        color: COLORS.black,
        fontSize: FONT_SIZES.m,
        fontWeight: '500'
    },
    username: {
        color: COLORS.gray,
        fontSize: FONT_SIZES.m
    }
});