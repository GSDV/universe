// Used when a post is in a feed or as a reply.
// Always has the TouchableOpacity, linked to post/[postId]/view.
// Note: Even though the post schema has a "pinned" field, we need a separate one so that pins do not show up in search, maps, etc.
// morePostsAvailable is only used for resorting after un/pinning.

import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import { useRouter } from 'expo-router';

import Entypo from '@expo/vector-icons/Entypo';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import Pfp from '@components/Pfp';
import PostActionsMenu from '@components/post/Actions';
import { DisplayMedia } from '@components/post/media/Display';
import TextContent from '@components/post/TextContent';
import Info from '@components/post/Info';

import { COLORS, FONT_SIZES } from '@util/global-client';

import { PostType } from '@util/types';



interface FeedPostType {
    post: PostType;
    ownPost?: boolean;
    showPinned?: boolean;
    threadParam?: string
    morePostsAvailable?: boolean;
}


export function FeedPost({ post, ownPost, showPinned = false, threadParam = '', morePostsAvailable }: FeedPostType) {
    const router = useRouter();

    const onPress = () => {
        router.push({ pathname: `/post/[postId]/view`, params: {
            postId: post.id,
            postParam: encodeURIComponent(JSON.stringify(post)),
            threadParam
        }});
    }

    return (
        <TouchableOpacity onPress={onPress} style={{ paddingLeft: 10, width: '100%', flexDirection: 'row', backgroundColor: COLORS.background }}>
                <Pfp pfpKey={post.author.pfpKey} style={styles.pfp} />

                <View style={{ padding: 10, flex: 6, gap: 5 }}>
                    <Header post={post} ownPost={ownPost} showPinned={showPinned} morePostsAvailable={morePostsAvailable} />

                    <TextContent post={post} />

                    <DisplayMedia media={post.media} />

                    <Info post={post} />
                </View>
            {/* </View> */}
        </TouchableOpacity>
    );
}


function Header({ post, ownPost, showPinned, morePostsAvailable }: FeedPostType) {
    return (
        <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <View style={{ flex: 1, justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                    <Text style={styles.displayName} numberOfLines={1} ellipsizeMode='tail'>{post.author.displayName}</Text>
                    {post.author.verified && <MaterialCommunityIcons name='star-four-points' style={{ fontSize: FONT_SIZES.m }} color={COLORS.primary_1} />}
                </View>
                <Text style={styles.username} numberOfLines={1} ellipsizeMode='tail'>@{post.author.username}</Text>
            </View>

            {/* Spacer - only gets used when the display name is too long */}
            <View style={{ width: 10 }} />

            {(showPinned && post.pinned) && <Entypo name='pin' size={20} color={COLORS.black} />}
            <PostActionsMenu post={post} ownPost={ownPost} morePostsAvailable={morePostsAvailable} />
        </View>
    );
}



const styles = StyleSheet.create({
    pfp: {
        borderRadius: 50,
        width: 35,
        height: 35,
        marginTop: 10
    },
    displayName: {
        maxWidth: '50%',
        color: COLORS.black,
        fontSize: FONT_SIZES.m,
        fontWeight: 500
    },
    username: {
        flex: 1,
        color: COLORS.gray,
        fontSize: FONT_SIZES.m
    }
});