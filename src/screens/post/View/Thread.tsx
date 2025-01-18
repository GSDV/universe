import React, { useEffect, useRef } from 'react';

import { Text, View, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { FlatList } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';

import { usePostStore } from '@/src/hooks/PostStore';
import { useTabBarScroll } from '@/src/hooks/useTabBarScroll';

import { AncestorPost, FocusPost, THREAD_LINE_WIDTH } from './Post'
import { FeedPost } from '@components/post/FeedPost';
import { Loading } from '@components/Loading';

import { COLORS, FONT_SIZES } from '@util/global-client';

import { getUniqueString } from '@util/unique';

import { PostType } from '@util/types';



interface RenderPostType extends PostType {
    type: 'ancestor' | 'focused' | 'reply';
}

type RenderItemType = RenderPostType | { 
    id: string, 
    type: 'loading-ancestors' | 'loading-replies' | 'reply-barrier' | 'no-replies' 
};

interface ThreadProps {
    focusPost: PostType;
    ancestors: PostType[];
    fetchAncestors: () => void;
    loadingAncestors: boolean;
    replies: PostType[];
    fetchReplies: () => void;
    loadingReplies: boolean;
    moreRepliesAvailable: boolean;
}

export default function Thread({
    focusPost,
    ancestors,
    fetchAncestors,
    loadingAncestors,
    replies,
    fetchReplies,
    loadingReplies,
    moreRepliesAvailable
}: ThreadProps) {
    const navigation = useNavigation<StackNavigationProp<any>>();

    const router = useRouter();

    const { handleTabBarScroll } = useTabBarScroll();

    const flatListRef = useRef<FlatList>(null);

    const addPost = usePostStore(state => state.addPost);
    const removePost = usePostStore(state => state.removePost);

    
    const openAncestor = (item: RenderItemType) => {
        const { type, ...post } = item;
        addPost(post as any);
        router.navigate({
            pathname: `/post/[postId]/view`,
            params: {
                postId: post.id,
                viewId: getUniqueString(post.id)
            }
        });
    }

    // Handle scroll events to detect when we're near the top
    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        const shouldLoadAncestors = (
            (offsetY < -25) && 
            (!loadingAncestors) && 
            (focusPost.replyToId !== null) && 
            (ancestors.length === 0)
        );
        if (shouldLoadAncestors) fetchAncestors();

        handleTabBarScroll(event);
    }

    const renderableItems: RenderItemType[] = [
        // Loading and displaying ancestors:
        ...(loadingAncestors ? 
            [{ type: 'loading-ancestors' as const, id: 'loading-ancestors' }]
        :
            ancestors.map((p) => ({ type: 'ancestor' as const, ...p }))
        ),

        // Displaying focused post:
        { type: 'focused' as const, ...focusPost },

        { type: 'reply-barrier', id: 'reply-barrier' },

        // Loading and displaying replies:
        ...(loadingReplies ? 
            [{ type: 'loading-replies' as const, id: 'loading-replies' }]
        :
            replies.map((p) => ({ type: 'reply' as const, ...p }))
        ),

        // Displaying "no replies":
        ...(!loadingReplies && replies.length === 0 ? 
            [{ type: 'no-replies' as const, id: 'no-replies' }] 
        : 
            []
        )
    ];

    const renderItem = ({ item, index }: { item: RenderItemType, index: number }) => {
        if (item.type === 'focused') {
            return <FocusPost post={item} />;
        }

        if (item.type === 'ancestor') {
            return <AncestorPost post={item} openAncestor={() => openAncestor(item)} />
        }

        if (item.type === 'reply') {
            const { type, ...post } = item;
            return (<>
                <View style={{ width: '100%', height: 2, backgroundColor: COLORS.light_gray }} />
                <FeedPost postId={post.id} />
            </>);
        }

        if (item.type === 'loading-ancestors') return <Loading size='small' />;
        if (item.type === 'loading-replies') return <LoadingReplies />;
        if (item.type === 'reply-barrier') return <ReplyBarrier />;
        if (item.type === 'no-replies') return <NoReplies />;

        return <></>;
    }


    // Cleanup, remove fetched replies from PostStore.
    useEffect(() => {
        const unsubscribe = navigation.addListener('beforeRemove', (e) => {
            // If we are about to exit from a post view
            if (focusPost.replyToId === null) removePost(focusPost.id);
            replies.map((p) => removePost(p.id));
        });
        return unsubscribe;
      }, [navigation]);

    return (
        <FlatList
            ref={flatListRef}
            contentContainerStyle={{ paddingBottom: '100%' }}
            data={renderableItems}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            scrollsToTop={false}
            onScroll={handleScroll}
            scrollEventThrottle={16} // For smooth scroll handling
            onEndReached={moreRepliesAvailable ? fetchReplies : null}
            onEndReachedThreshold={0.5}
        />
    );
}



function ReplyBarrier() {
    return <View style={{ width: '100%', height: THREAD_LINE_WIDTH, backgroundColor: COLORS.primary }} />;
}



function NoReplies() {
    return <Text style={{ padding: 20, textAlign: 'center', color: COLORS.black, fontSize: FONT_SIZES.s }}>no replies yet</Text>;
}



function LoadingReplies() {
    return (
        <View style={{ padding: 30 }}>
            <Loading size='small' />
        </View>
    );
}