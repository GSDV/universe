import { useEffect, useRef } from 'react';

import { Text, View, StyleSheet, TouchableOpacity, Pressable } from 'react-native';

import { FlatList } from 'react-native-gesture-handler';

import { useRouter } from 'expo-router';

import Pfp from '@components/Pfp';
import TextContent from '@components/post/TextContent';
import Info from '@components/post/Info';
import PostActionsMenu from '@components/post/Actions';
import { DisplayMedia } from '@components/post/media/Display';
import { FeedPost } from '@components/post/FeedPost';
import { Loading } from '@components/Loading';

import { COLORS, FONT_SIZES } from '@util/global-client';

import { PostType } from '@util/types';



const THREAD_LINE_WIDTH = 3;

const PFP_TOP_MARGIN = 10;
const PFP_SIZE = 40;

const LEFT_COLUMN_WIDTH = PFP_SIZE + 10;



interface RenderPostType extends PostType {
    type: 'ancestor' | 'focused' | 'reply';
}

type RenderItemType = RenderPostType | { id: string, type: 'loading' | 'reply-barrier' | 'no-replies' };

interface ThreadProps {
    focusPost: PostType,
    ancestors: PostType[],
    replies: PostType[],
    loadingAncestors: boolean,
    loadingReplies: boolean
}

export default function Thread({ focusPost, ancestors, replies, loadingAncestors, loadingReplies }: ThreadProps) {
    const router = useRouter();
    const flatListRef = useRef<FlatList>(null);

    const renderableItems: RenderItemType[] = [
        // Loading and displaying ancestors:
        ...(loadingAncestors ? 
            [{ type: 'loading' as const, id: 'loading-ancestors' }]
        :
            ancestors.map((p) => ({ type: 'ancestor' as const, ...p }))
        ),

        // Displaying focused post:
        { type: 'focused' as const, ...focusPost },

        { type: 'reply-barrier', id: 'reply-barrier' },

        // Loading and displaying replies:
        ...(loadingReplies ? 
            [{ type: 'loading' as const, id: 'loading-replies' }]
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

    const openAncestor = (item: RenderItemType, idx: number) => {
        const { type, ...post } = item;
        router.push({ pathname: `/post/[postId]/view`, params: {
            postId: post.id,
            postParam: encodeURIComponent(JSON.stringify(post)),
            threadParam: encodeURIComponent(JSON.stringify(ancestors.slice(0, idx)))
        } });
    }

    const renderItem = ({ item, index }: { item: RenderItemType, index: number }) => {
        if (item.type === 'focused') {
            return <FocusPost post={item} />;
        }

        if (item.type === 'ancestor') {
            return <AncestorPost post={item} openAncestor={() => openAncestor(item, index)} />
        }

        if (item.type === 'reply') {
            const { type, ...post } = item;
            const threadParam = encodeURIComponent(JSON.stringify([...ancestors, focusPost]));
            return (<>
                <View style={{ width: '100%', height: 2, backgroundColor: COLORS.light_gray }} />
                <FeedPost post={post} threadParam={threadParam} />
            </>);
        }

        if (item.type === 'loading') return <Loading size='small' />;

        if (item.type === 'reply-barrier') return <ReplyBarrier />

        if (item.type === 'no-replies') return <NoReplies />;

        // For TypeScript:
        return <></>;
    }


    // Used to gracefully scroll to the focused post in long thread
    useEffect(() => {
        if (!loadingAncestors) {
            const focusedIndex = renderableItems.findIndex(item => item.type === 'focused');
            setTimeout(() => {
                flatListRef.current?.scrollToIndex({
                    index: focusedIndex,
                    animated: true,
                    viewPosition: 0
                });
            }, 300);
        }
    }, [loadingAncestors]);

    return (
        <FlatList 
            ref={flatListRef}
            initialScrollIndex={loadingAncestors ? 0 : renderableItems.findIndex(item => item.type === 'focused')}
            contentContainerStyle={{ paddingBottom: '50%' }}
            data={renderableItems}
            keyExtractor={(item, idx) => item.id}
            renderItem={renderItem}
            scrollsToTop={false}
            onScrollToIndexFailed={info => {
                setTimeout(() => {
                    flatListRef.current?.scrollToIndex({
                        index: info.index,
                        animated: true,
                        viewPosition: 0
                    });
                }, 200);
            }}
        />
    );
}



function ReplyBarrier() {
    return <View style={{ width: '100%', height: THREAD_LINE_WIDTH, backgroundColor: COLORS.primary_1 }} />;
}



function NoReplies() {
    return <Text style={{ padding: 20, textAlign: 'center', color: COLORS.black, fontSize: FONT_SIZES.s }}>no replies yet</Text>;
}



interface ThreadPostType {
    post: PostType;
    ownPost?: boolean;
}

type LineType = 'up' | 'down' | 'full' | 'none';




// Direct ancestor to post that was pressed on.
function AncestorPost({ post, ownPost, openAncestor }: { post: PostType, ownPost?: boolean, openAncestor: ()=>void }) {
    const type = (!post.replyToId) ? 'down' : 'full';
    return (
        <TouchableOpacity onPress={openAncestor}>
            <ThreadPost post={post} ownPost={ownPost} type={type} />
        </TouchableOpacity>
    );
}



// Post that was pressed on.
function FocusPost({ post, ownPost }: { post: PostType, ownPost?: boolean }) {
    const type = (!post.replyToId) ? 'none' : 'up';
    return <ThreadPost post={post} ownPost={ownPost} type={type} />;
}



// "type" prop refers to the line on the left of the thread.
function ThreadPost({ post, ownPost, type }: { post: PostType, ownPost?: boolean, type: LineType }) {
    return (
        <View style={{ paddingLeft: 5, width: '100%', flexDirection: 'row' }}>
            <ThreadLine username={post.author.username} pfpKey={post.author.pfpKey} type={type} />

            <View style={{ paddingVertical: 15, padding: 10, flex: 6, gap: 10 }}>
                <PostHeader post={post} ownPost={ownPost} />

                <TextContent post={post} truncate={false} />

                <DisplayMedia media={post.media} />

                <Info post={post} />
            </View>
        </View>
    );
}



function ThreadLine({ username, pfpKey, type }: { username: string, pfpKey: string, type: LineType }) {
    const router = useRouter();
    const navigateToProfile = () => {
        router.push({
            pathname: '/profile/[username]/view',
            params: { username }
        });
    }

    return (
        <View style={{ width: LEFT_COLUMN_WIDTH, alignItems: 'center' }}>
            {(type === 'full') && <View style={[styles.line, styles.fullLine]} />}
            {(type === 'up') && <View style={[styles.line, styles.upperLine]} />}
            {(type === 'down') && <View style={[styles.line, styles.lowerLine]} />}
            <Pressable onPress={navigateToProfile} style={styles.pfpContainer}>
                <Pfp pfpKey={pfpKey} style={styles.pfp} />
            </Pressable>
        </View>
    );
}





function PostHeader({ post, ownPost }: ThreadPostType) {
    const router = useRouter();
    const navigateToProfile = () => {
        router.push({
            pathname: '/profile/[username]/view',
            params: { username: post.author.username }
        });
    }

    return (
        <Pressable onPress={navigateToProfile} style={{ width: '100%', flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <View style={{ flex: 1, justifyContent: 'space-between' }}>
                <Text style={styles.displayName} numberOfLines={1} ellipsizeMode='tail'>{post.author.displayName}</Text>
                <Text style={styles.username} numberOfLines={1} ellipsizeMode='tail'>@{post.author.username}</Text>
            </View>

            {/* Spacer */}
            <View style={{ width: 10 }} />

            <PostActionsMenu post={post} ownPost={ownPost} />
        </Pressable>
    );
}



const styles = StyleSheet.create({
    header: {
        flex: 1,
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5 
    },
    pfpContainer: {
        top: PFP_TOP_MARGIN,
        width: PFP_SIZE,
        height: PFP_SIZE,
        zIndex: 2
    },
    pfp: {
        width: PFP_SIZE,
        height: PFP_SIZE,
        borderRadius: 50
    },
    displayName: {
        color: COLORS.black,
        fontSize: FONT_SIZES.m,
        fontWeight: '500'
    },
    username: {
        color: COLORS.gray,
        fontSize: FONT_SIZES.m
    },
    line: {
        position: 'absolute',
        width: THREAD_LINE_WIDTH,
        backgroundColor: COLORS.primary_1,
        left: '50%',
        marginLeft: -THREAD_LINE_WIDTH / 2
    },
    fullLine: {
        top: 0,
        bottom: 0
    },
    upperLine: {
        top: 0,
        height: PFP_TOP_MARGIN + PFP_SIZE/2
    },
    lowerLine: {
        top: PFP_TOP_MARGIN + PFP_SIZE/2,
        bottom: 0
    }
});