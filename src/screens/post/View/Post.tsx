import { Text, View, StyleSheet, TouchableOpacity, Pressable } from 'react-native';

import { useRouter } from 'expo-router';

import { MaterialCommunityIcons } from '@expo/vector-icons';

import Pfp from '@components/Pfp';
import TextContent from '@components/post/TextContent';
import Info from '@components/post/Info';
import PostActionsMenu from '@components/post/Actions';
import { DisplayMedia } from '@components/post/media/Display';

import { COLORS, FONT_SIZES } from '@util/global-client';

import { PostType } from '@util/types';


export const THREAD_LINE_WIDTH = 3;

export const PFP_TOP_MARGIN = 10;
export const PFP_SIZE = 40;


const LEFT_COLUMN_WIDTH = PFP_SIZE + 10;


interface ThreadPostType {
    post: PostType;
    ownPost?: boolean;
}

type LineType = 'up' | 'down' | 'full' | 'none';



// Direct ancestor to post that was pressed on.
export function AncestorPost({ post, ownPost, openAncestor }: { post: PostType, ownPost?: boolean, openAncestor: ()=>void }) {
    const type = (!post.replyToId) ? 'down' : 'full';
    return (
        <TouchableOpacity onPress={openAncestor}>
            <ThreadPost post={post} ownPost={ownPost} type={type} />
        </TouchableOpacity>
    );
}



// Post that was pressed on.
export function FocusPost({ post, ownPost }: { post: PostType, ownPost?: boolean }) {
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
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                    <Text style={styles.displayName} numberOfLines={1} ellipsizeMode='tail'>{post.author.displayName}</Text>
                    {post.author.verified && <MaterialCommunityIcons name='star-four-points' style={{ fontSize: FONT_SIZES.m }} color={COLORS.primary} />}
                </View>
                <Text style={styles.username} numberOfLines={1} ellipsizeMode='tail'>@{post.author.username}</Text>
            </View>

            {/* Spacer */}
            <View style={{ width: 10 }} />

            <PostActionsMenu post={post} ownPost={ownPost} />
        </Pressable>
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