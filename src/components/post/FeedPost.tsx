// Used when a post is in a feed or as a reply.
// Always has the TouchableOpacity, linked to post/[postId]/view.
// Note: Even though the post schema has a "pinned" field, we need a separate one so that pins do not show up in search, maps, etc.
// morePostsAvailable is only used for resorting after un/pinning.

import { View, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native';

import { useRouter } from 'expo-router';

import { useUser } from '@providers/UserProvider';

import Entypo from '@expo/vector-icons/Entypo';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import Pfp from '@components/Pfp';
import PostActionsMenu from '@components/post/Actions';
import { DisplayMedia } from '@components/post/media/Display';
import TextContent from '@components/post/TextContent';
import Info from '@components/post/Info';

import { COLORS, FONT_SIZES } from '@util/global-client';

import { PostType } from '@util/types';



interface FeedPostProps {
    post: PostType;
    showPinned?: boolean;
    threadParam?: string;
    morePostsAvailable?: boolean;
}


export function FeedPost({ post, showPinned = false, threadParam = '', morePostsAvailable }: FeedPostProps) {
    const router = useRouter();
    const userContext = useUser();

    const onPress = () => {
        router.push({ pathname: `/post/[postId]/view`, params: {
            postId: post.id,
            postParam: encodeURIComponent(JSON.stringify(post)),
            threadParam
        }});
    }

    const navigateToProfile = () => {
        router.push({
            pathname: '/profile/[username]/view',
            params: { username: post.author.username }
        });
    }

    return (
        <TouchableOpacity onPress={onPress} style={{ paddingVertical: 10, paddingLeft: 10, width: '100%', flexDirection: 'row', backgroundColor: COLORS.background }}>
            <Pressable onPress={navigateToProfile} style={styles.pfpContainer}>
                <Pfp pfpKey={post.author.pfpKey} style={styles.pfp} />
            </Pressable>

            <View style={{ padding: 10, flex: 6, gap: 10 }}>
                <Header
                    post={post}
                    ownPost={userContext?.user?.id === post.author.id}
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
    ownPost: boolean;
    showPinned?: boolean;
    morePostsAvailable?: boolean;
    navigateToProfile: ()=>void;
}

function Header({ post, ownPost, showPinned, morePostsAvailable, navigateToProfile }: HeaderProps) {
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
            <PostActionsMenu post={post} ownPost={ownPost} morePostsAvailable={morePostsAvailable} />
        </View>
    );
}



const styles = StyleSheet.create({
    pfpContainer: {
        width: 35,
        height: 35,
        marginTop: 10
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