import { useEffect, useState } from 'react';

import { Text, View, StyleSheet, TouchableOpacity, Pressable } from 'react-native';

import { useRouter } from 'expo-router';

import { usePost } from '@hooks/PostStore';

import { MaterialCommunityIcons } from '@expo/vector-icons';

import Pfp from '@components/Pfp';
import TextContent from '@components/post/TextContent';
import Info from '@components/post/Info';
import PostActionsMenu from '@components/post/Actions';
import { DisplayMedia } from '@components/post/media/Display';

import { COLORS, FONT_SIZES } from '@util/global-client';

import { getUniqueString } from '@util/unique';

import { PostType } from '@util/types';



export const THREAD_LINE_WIDTH = 3;

export const PFP_TOP_MARGIN = 10;
export const PFP_SIZE = 40;

const LEFT_COLUMN_WIDTH = PFP_SIZE + 10;



type LineType = 'up' | 'down' | 'full' | 'none';



// Direct ancestor to post that was pressed on.
export function AncestorPost({ postId, openAncestor }: { postId: string, openAncestor: ()=>void }) {
    const postData = usePost(postId);
    const [post, setPost] = useState<PostType | undefined>(postData);

    const type = (!post?.replyToId) ? 'down' : 'full';

    useEffect(() => {
        if (postData === undefined) return;
        setPost(postData);
    }, [postData]);

     // Should never happen, but for TypeScript:
    if (post === undefined) return <ErrorPost />;
    
    return (
        <TouchableOpacity onPress={openAncestor}>
            <ThreadPost post={post} type={type} />
        </TouchableOpacity>
    );
}



// Post that was pressed on.
export function FocusPost({ postId }: { postId: string }) {
    const postData = usePost(postId);
    const [post, setPost] = useState<PostType | undefined>(postData);

    const type = (!post?.replyToId) ? 'none' : 'up';

    useEffect(() => {
        if (postData === undefined) return;
        setPost(postData);
    }, [postData]);

     // Should never happen, but for TypeScript:
     if (post === undefined) return <ErrorPost />;

    return <ThreadPost post={post} type={type} />;
}



// "type" prop refers to the line on the left of the thread.
function ThreadPost({ post, type }: { post: PostType, type: LineType }) {
    return (
        <View style={{ paddingLeft: 5, width: '100%', flexDirection: 'row' }}>
            <ThreadLine username={post.author.username} pfpKey={post.author.pfpKey} type={type} />

            <View style={{ paddingVertical: 15, padding: 10, flex: 6, gap: 10 }}>
                <PostHeader post={post} />

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
            params: {
                username,
                viewId: getUniqueString(username)
            }
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



function PostHeader({ post }: { post: PostType }) {
    const router = useRouter();
    const navigateToProfile = () => {
        router.push({
            pathname: '/profile/[username]/view',
            params: {
                username: post.author.username,
                viewId: getUniqueString(post.author.username,)
            }
        });
    }

    return (
        <Pressable onPress={navigateToProfile} style={{ width: '100%', flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <View style={{ flex: 1, justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                    <Text style={styles.displayName} numberOfLines={1} ellipsizeMode='tail'>{post.author.displayName}</Text>
                    {post.author.verified && <MaterialCommunityIcons name='star-four-points' style={{ fontSize: FONT_SIZES.m }} color={COLORS.primary} />}
                </View>
                <Text style={styles.username} numberOfLines={1} ellipsizeMode='tail'>@{post.author.username}</Text>
            </View>

            {/* Spacer */}
            <View style={{ width: 10 }} />

            <PostActionsMenu post={post} />
        </Pressable>
    );
}



function ErrorPost() {
    return (
        <View style={{ padding: 10, paddingLeft: LEFT_COLUMN_WIDTH, width: '100%' }}>
            <Text style={{ fontSize: FONT_SIZES.m, color: COLORS.black }}>Something went wrong!</Text>
        </View>
    );
}



const styles = StyleSheet.create({
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
        backgroundColor: COLORS.primary,
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