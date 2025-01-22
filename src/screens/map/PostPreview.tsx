import { useState } from 'react';

import {
    StyleSheet,
    TouchableOpacity,
    View,
    Text,
    Pressable,
    ScrollView,
    Dimensions
} from 'react-native';

import { useRouter } from 'expo-router';

import { usePostStore } from '@hooks/PostStore';

import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { MaterialIcons } from '@expo/vector-icons';

import TextContent from '@components/post/TextContent';
import { DisplayMedia } from '@components/post/media/Display';
import Pfp from '@components/Pfp';
import Info from '@components/post/Info';

import { COLORS, FONT_SIZES } from '@util/global-client';

import { PostType } from '@util/types';
import { getUniqueString } from '@util/unique';



interface PostPreviewProps {
    post: PostType;
    closePreview: ()=>void;
}



export default function PostPreview({ post, closePreview }: PostPreviewProps) {
    const router = useRouter();

    const addPost = usePostStore(state => state.addPost);

    const maxHeight = Dimensions.get('screen').height * 0.4;

    const [scrollEnabled, setScrollEnabled] = useState<boolean>(false);
    const [showMedia, setShowMedia] = useState<boolean>(false);

    const handleContentSizeChange = (_: number, height: number) => {
        setScrollEnabled(height > maxHeight);
    };

    const onPress = () => {
        // In case the post has been removed elsewhere:
        addPost(post);
        router.navigate({
            pathname: `/post/[postId]/view`,
            params: {
                postId: post.id,
                viewId: getUniqueString(post.id)
            }
        });
    }

    return (
        <ScrollView
            style={{ maxHeight: maxHeight}}
            scrollEnabled={scrollEnabled}
            onContentSizeChange={handleContentSizeChange}
            showsVerticalScrollIndicator={scrollEnabled}
        >
            <Pressable onPress={onPress} style={styles.container}>
                <Pfp pfpKey={post.author.pfpKey} style={styles.pfp} />

                <View style={{ paddingLeft: 10, flex: 6, gap: 10 }}>
                    <Header post={post} closePreview={closePreview} />

                    <TextContent post={post} />

                    {showMedia && <DisplayMedia media={post.media} />}
                    {(post.media.length != 0 && !showMedia) && 
                        <TouchableOpacity onPress={()=>setShowMedia(true)}>
                            <Text style={{ color: COLORS.primary, fontSize: FONT_SIZES.m }}>Show Media</Text>
                        </TouchableOpacity>
                    }

                    <Info post={post} />
                </View>
            </Pressable>
        </ScrollView>
    );
}



function Header({ post, closePreview }: PostPreviewProps) {
    return (
        <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <View style={{ flex: 1, justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                    <Text style={styles.displayName} numberOfLines={1} ellipsizeMode='tail'>{post.author.displayName}</Text>
                    {post.author.verified && <MaterialCommunityIcons name='star-four-points' style={{ fontSize: FONT_SIZES.m }} color={COLORS.primary} />}
                </View>
                <Text style={styles.username} numberOfLines={1} ellipsizeMode='tail'>@{post.author.username}</Text>
            </View>

            {/* Spacer - only gets used when the display name is too long */}
            <View style={{ width: 10 }} />

            {/* paddingLeft to allow larger close button hitbox */}
            <TouchableOpacity onPress={closePreview} style={{ paddingLeft: 10 }}>
                <MaterialIcons name='close' size={28} color={COLORS.primary} />
            </TouchableOpacity>
        </View>
    );
}



const styles = StyleSheet.create({
    container: {
        padding: 10,
        width: '100%',
        borderRadius: 15,
        backgroundColor: COLORS.background,
        flexDirection: 'row',
    },
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