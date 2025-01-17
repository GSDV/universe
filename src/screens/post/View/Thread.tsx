import React, { useRef } from 'react';

import { Text, View, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';

import { FlatList } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';

import { usePostStore } from '@providers/PostStore';

import { AncestorPost, FocusPost, THREAD_LINE_WIDTH } from './Post'
import { FeedPost } from '@components/post/FeedPost';
import { Loading } from '@components/Loading';

import { COLORS, FONT_SIZES } from '@util/global-client';

import { PostType } from '@util/types';;



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
    const router = useRouter();

    const flatListRef = useRef<FlatList>(null);

    const addPost = usePostStore(state => state.addPost);
    
    const openAncestor = (item: RenderItemType) => {
        const { type, ...post } = item;
        addPost(post as any);
        router.navigate({ 
            pathname: `/post/[postId]/view`, 
            params: { 
                postId: post.id, 
                viewId: `${post.id}${(new Date()).toISOString()}` 
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
    };

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
                <FeedPost post={post} />
            </>);
        }

        if (item.type === 'loading-ancestors') return <Loading size='small' />;
        if (item.type === 'loading-replies') return <LoadingReplies />;
        if (item.type === 'reply-barrier') return <ReplyBarrier />;
        if (item.type === 'no-replies') return <NoReplies />;

        return <></>;
    }

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