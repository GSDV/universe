// Used when a post is in focus (user pressed on a post and now can see the post and its replies).
// Only used at the top of PostView.

import { ActionSheetIOS, Text, Image, View, StyleSheet, Alert as AlertPopUp } from 'react-native';

import { useOperation } from '@components/providers/OperationProvider';

import Ionicons from '@expo/vector-icons/Ionicons';

import { MediaDisplay } from './Media';

import { AUTH_TOKEN_COOKIE_KEY, DOMAIN, MAX_REPORT_LENGTH } from '@util/global';
import { COLORS, DEFAULT_PFP, FONT_SIZES, formatPostDate, imgUrl } from '@util/global-client';

import { getAuthCookie } from '@util/storage';

import { PostType } from '@util/types';
import { useRouter } from 'expo-router';



interface FocusedPostType {
    post: PostType;
    ownPost?: boolean;
}
export default function FocusedPost({ post, ownPost }: FocusedPostType) {
    return (
        <View style={{ padding: 20, width: '100%', gap: 10, backgroundColor: COLORS.background }}>
            <Header post={post} ownPost={ownPost} />

            <TextContent content={post.content} />

            <MediaDisplay media={post.media} />

            <Info post={post} />
        </View>
    );
}



function Header({ post, ownPost }: FocusedPostType) {
    const operationContext = useOperation();

    const router = useRouter();

    const deletePost = async () => {
        let authToken = await getAuthCookie();
        // Async call
        fetch(`${DOMAIN}/api/app/post/${post.id}`, {
            method: 'DELETE',
            headers: { 
                'Content-Type': 'application/json',
                'Cookie': `${AUTH_TOKEN_COOKIE_KEY}=${authToken}`
            }
        });

        operationContext.emitOperation(post.id, 'DELETE');
        router.back();
    }

    const handleReport = async (reportText: string | undefined) => {
        AlertPopUp.alert('Post Reported', 'Your report has been sent.', [{ text: 'OK', onPress: () => {} }]);
        if (!reportText || reportText.length > MAX_REPORT_LENGTH) return;

        let authToken = await getAuthCookie();
        // Async call
        fetch(`/api/app/post/${post.id}/report`, {
            method: 'POST',
            body: JSON.stringify({ reportText }),
            headers: { 
                'Content-Type': 'application/json',
                'Cookie': `${AUTH_TOKEN_COOKIE_KEY}=${authToken}`
            }
        });
    }

    const ownOptions = () => {
        ActionSheetIOS.showActionSheetWithOptions(
            { options: ['Cancel', 'Delete'], cancelButtonIndex: 0, destructiveButtonIndex: 1 },
            async (buttonIndex) => {
                if (buttonIndex == 0) { } 
                else if (buttonIndex == 1) {
                    AlertPopUp.alert('Delete post?', 'This cannot be undone.', [
                        { text: 'Cancel', onPress: () => {}, style: 'cancel' },
                        { text: 'Delete', onPress: deletePost, style: 'destructive' },
                    ]);
                }
            }
        );
    }

    const otherOptions = () => {
        ActionSheetIOS.showActionSheetWithOptions(
            { options: ['Cancel', 'Report'], cancelButtonIndex: 0, destructiveButtonIndex: 1 },
            (buttonIndex) => {
                if (buttonIndex == 0) { } 
                else if (buttonIndex == 1) {
                    AlertPopUp.prompt('Report Post', 'Please describe why you are reporting this post:', [
                        { text: 'Cancel', onPress: () => {}, style: 'cancel' },
                        { text: 'Send', onPress: handleReport }
                    ], 'plain-text');
                }
            }
        );
    }

    const onEllipsisPres = (ownPost) ? ownOptions : otherOptions;

    return (
        <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <Pfp pfpKey={post.author.pfpKey} />

            <View style={{ flex: 1, justifyContent: 'space-between' }}>
                <Text style={styles.displayName} numberOfLines={1} ellipsizeMode='tail'>{post.author.displayName}</Text>
                <Text style={styles.username} numberOfLines={1} ellipsizeMode='tail'>@{post.author.username}</Text>
            </View>

            {/* Spacer */}
            <View style={{ width: 10 }} />

            <Ionicons onPress={onEllipsisPres} name='ellipsis-horizontal' size={25} color={COLORS.black} style={{borderRadius: 10, overflow: 'hidden'}} />
        </View>
    );
}



function Pfp({ pfpKey }: { pfpKey: string }) {
    return (
        <>{pfpKey=='' ? 
            <Image style={styles.pfp} source={DEFAULT_PFP} />
        :
            <Image style={styles.pfp} source={{ uri: imgUrl(pfpKey) }} />
        }</>
    );
}



function TextContent({ content }: { content: string }) {
    return <Text style={{ fontSize: FONT_SIZES.m }}>{content}</Text>;
}



function Info({ post }: { post: PostType }) {
    const getUniName = () => {
        if (!post.author.university) return '';
        else return post.author.university.name;
    }
    const getUniColor = () => {
        if (!post.author.university) return COLORS.black;
        else return post.author.university.color;
    }

    return (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 5 }}>
            <Text style={{ flex: 2, fontSize: FONT_SIZES.s, color: getUniColor() }} numberOfLines={1} ellipsizeMode='tail'>{getUniName()}</Text>
            <Text style={{ flex: 1, fontSize: FONT_SIZES.s, color: COLORS.gray, textAlign: 'right' }} numberOfLines={1} ellipsizeMode='tail'>{formatPostDate(post.createdAt)}</Text>
        </View>
    );
}



const styles = StyleSheet.create({
    header: {
        position: 'relative',
        padding: 20,
        paddingVertical: 5,
        display: 'flex',
        flexDirection: 'row',
        gap: 20,
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    pfp: {
        borderRadius: 50,
        width: 40,
        height: 40
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
