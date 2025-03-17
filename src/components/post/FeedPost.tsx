// Used when a post is in a feed or as a reply.
// Always has the TouchableOpacity, linked to post/[postId]/view.
// Note: Even though the post schema has a "pinned" field, we need a separate one so that pins do not show up in search, maps, etc.
// morePostsAvailable is only used for resorting after un/pinning.

import { useCallback, useEffect, useState, memo } from 'react';

import { View, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native';

import { useRouter } from 'expo-router';

import { usePost, usePostStore } from '@hooks/PostStore';

import Entypo from '@expo/vector-icons/Entypo';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import Pfp from '@components/Pfp';
import PostActionsMenu from '@components/post/Actions';
import { DisplayMedia } from '@components/post/media/Display';
import TextContent from '@components/post/TextContent';
import Info from '@components/post/Info';

import { COLORS, FONT_SIZES } from '@util/global-client';

import { getUniqueString } from '@util/unique';

import { PostType } from '@util/types';



interface FeedPostProps {
    postId: string
    showPinned?: boolean;
    morePostsAvailable?: boolean;
}

export function FeedPost({ postId, showPinned = false, morePostsAvailable }: FeedPostProps) {
    const router = useRouter();

    const addPost = usePostStore(state => state.addPost);

    const postData = usePost(postId);
    const [post, setPost] = useState<PostType | undefined>(postData);

    const onPress = useCallback(() => {
        if (post === undefined) return;
        // In case the post has been removed elsewhere:
        addPost(post);
        router.navigate({
            pathname: `/post/[postId]/view`,
            params: {
                postId: post.id,
                viewId: getUniqueString(post.id)
            }
        });
    }, [post, addPost, router]);

    const navigateToProfile = useCallback(() => {
        if (post === undefined) return;
        router.push({
            pathname: `/profile/[username]/view`,
            params: {
                username: post.author.username,
                viewId: getUniqueString(post.author.username)
            }
        });
    }, [router, post?.author.username]);

    useEffect(() => {
        if (postData === undefined) {
            if (post !== undefined) addPost(post);
            return;
        }
        setPost(postData);
    }, [postData]);


    // Should never happen, but for TypeScript:
    if (post === undefined) return <Text>Something went wrong!</Text>;

    return (
        <TouchableOpacity onPress={onPress} style={styles.container}>
            <Pressable onPress={navigateToProfile} style={styles.pfpContainer}>
                <Pfp pfpKey={post.author.pfpKey} style={styles.pfp} />
            </Pressable>

            <View style={{ padding: 5, paddingTop: 5, flex: 6, gap: 10 }}>
                <Header
                    post={post}
                    showPinned={showPinned}
                    morePostsAvailable={morePostsAvailable}
                    navigateToProfile={navigateToProfile}
                />

                <TextContent post={post} />

                <DisplayMedia media={post.media} />

                <Info post={post} />
            </View>
        </TouchableOpacity>
    );
}



interface HeaderProps {
    post: PostType;
    showPinned?: boolean;
    morePostsAvailable?: boolean;
    navigateToProfile: ()=>void;
}

function Header({ post, showPinned, morePostsAvailable, navigateToProfile }: HeaderProps) {
    return (
        <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <View style={{ flex: 1, justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                    <Pressable onPress={navigateToProfile} style={{ maxWidth: '50%' }}>
                        <Text style={styles.displayName} numberOfLines={1} ellipsizeMode='tail'>{post.author.displayName}</Text>
                    </Pressable>
                    {post.author.verified && <MaterialCommunityIcons name='star-four-points' style={{ fontSize: FONT_SIZES.m }} color={COLORS.primary} />}
                </View>
                <Pressable onPress={navigateToProfile} style={{ alignSelf: 'flex-start' }}>
                    <Text style={styles.username} numberOfLines={1} ellipsizeMode='tail'>@{post.author.username}</Text>
                </Pressable>
            </View>

            {/* Spacer - only gets used when the display name is too long */}
            <View style={{ width: 10 }} />

            {(showPinned && post.pinned) && <Entypo name='pin' size={20} color={COLORS.black} />}
            <PostActionsMenu post={post} morePostsAvailable={morePostsAvailable} />
        </View>
    );
}



const styles = StyleSheet.create({
    container: {
        padding: 5,
        paddingLeft: 10,
        width: '100%',
        flexDirection: 'row',
        backgroundColor: COLORS.background
    },
    pfpContainer: {
        width: 35,
        height: 35,
        marginTop: 5
    },
    pfp: {
        borderRadius: 50,
        width: 35,
        height: 35
    },
    displayName: {
        color: COLORS.black,
        fontSize: FONT_SIZES.m,
        fontWeight: '500'
    },
    username: {
        color: COLORS.gray,
        fontSize: FONT_SIZES.m
    }
});


export const MemoizedFeedPost = memo(FeedPost, (prevProps, nextProps) => {
    // Only re-render if the postId changes
    return prevProps.postId === nextProps.postId;
  });