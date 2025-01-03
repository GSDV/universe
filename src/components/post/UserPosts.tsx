// Displays the posts of a given user on his account.
// Does not need to be the same user as who is logged in.
import { useState } from 'react';

import { View, Text, FlatList, RefreshControl } from 'react-native';

import { useUser } from '@components/providers/UserProvider';

import { FeedPost } from './FeedPost';

import { COLORS } from '@util/global-client';

import { PostType } from '@util/types';



interface UserPostsType {
    posts: PostType[];
    postsPage: number;
    morePostsAvailable: boolean;
    fetchAndUpdatePosts: (postsPage: number, oldPosts: PostType[]) => Promise<void>;
}



export default function UserPosts({ posts, postsPage, morePostsAvailable, fetchAndUpdatePosts }: UserPostsType) {
    const userContext = useUser();

    const [refreshing, setRefreshing] = useState<boolean>(false);

    // Used every time the user swipes up (refreshes an account) to see newer posts.
    // Completely reset the posts array.
    const onRefresh = async () => {
        setRefreshing(true);
        await fetchAndUpdatePosts(1, []);
        setRefreshing(false);
    }

    // Used every time the user reaches end of list to see older posts.
    const onEndReached = async () => {
        setRefreshing(true);
        await fetchAndUpdatePosts(postsPage+1, posts);
        setRefreshing(false);
    }

    // The UserPosts component will always be used in an account, so all posts will be displayed in feed style.
    const renderPost = ({ item, index }: { item: PostType, index: number }) => {
        return <FeedPost post={item} ownPost={userContext?.user?.id === item.author.id} showPinned={true} morePostsAvailable={morePostsAvailable} />;
    }

    return (
        <>
            {posts.length == 0 ?
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ color: COLORS.black }}>no posts yet</Text>
                </View>
            :
                <FlatList
                    keyExtractor={(item, idx) => `${idx}--${item.id}`} 
                    data={posts} 
                    renderItem={renderPost} 

                    style={{ flex: 1, backgroundColor: COLORS.dark_gray }} 
                    contentContainerStyle={{ gap: 2 }} 
                    showsVerticalScrollIndicator={false} 

                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing} 
                            onRefresh={onRefresh} 
                            tintColor={COLORS.primary_1}
                        />
                    } 

                    onEndReached={morePostsAvailable ? onEndReached : null} 
                    onEndReachedThreshold={0.5}
                />
            }
        </>
    );
}