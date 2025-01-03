// Displays the replies of a given user on his account.
// Does not need to be the same user as who is logged in.
import { useState } from 'react';

import { View, Text, FlatList, RefreshControl } from 'react-native';

import { useUser } from '@components/providers/UserProvider';

import { FeedPost } from './FeedPost';

import { COLORS } from '@util/global-client';

import { PostType } from '@util/types';



interface UserRepliesType {
    replies: PostType[];
    repliesPage: number;
    moreRepliesAvailable: boolean;
    fetchAndUpdateReplies: (repliesPage: number, oldPosts: PostType[]) => Promise<void>;
}



export default function UserReplies({ replies, repliesPage, moreRepliesAvailable, fetchAndUpdateReplies }: UserRepliesType) {
    const userContext = useUser();

    const [refreshing, setRefreshing] = useState<boolean>(false);

    // Used every time the user swipes up (refreshes an account) to see newer replies.
    // Completely reset the replies array.
    const onRefresh = async () => {
        setRefreshing(true);
        await fetchAndUpdateReplies(1, []);
        setRefreshing(false);
    }

    // Used every time the user reaches end of list to see older replies.
    const onEndReached = async () => {
        setRefreshing(true);
        await fetchAndUpdateReplies(repliesPage+1, replies);
        setRefreshing(false);
    }

    // The UserReplies component will always be used in an account, so all replies will be displayed in feed style.
    const renderPost = ({ item, index }: { item: PostType, index: number }) => {
        return <FeedPost post={item} ownPost={userContext?.user?.id === item.author.id} />;
    }

    return (
        <>
            {replies.length == 0 ?
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ color: COLORS.black }}>no replies yet</Text>
                </View>
            :
                <FlatList
                    keyExtractor={(item, idx) => `${idx}--${item.id}`} 
                    data={replies} 
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

                    onEndReached={moreRepliesAvailable ? onEndReached : null} 
                    onEndReachedThreshold={0.5}
                />
            }
        </>
    );
}