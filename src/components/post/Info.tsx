import { Text, View, TouchableOpacity, StyleSheet } from 'react-native';

import { usePostStore } from '@hooks/PostStore';

import { AntDesign, SimpleLineIcons } from '@expo/vector-icons';

import { COLORS, FONT_SIZES, formatInteraction, formatPostDate } from '@util/global-client';

import { fetchWithAuth } from '@util/fetch';

import { PostType } from '@util/types';



export default function Info({ post }: { post: PostType }) {
    const addPost = usePostStore(state => state.addPost);

    const university = post.author.university;
    const getUniName = () => university?.name ?? '';
    const getUniColor = () => university?.color ?? COLORS.black;

    const onPressLike = async () => {
        if (post.deleted) return;

        const postCopy = {...post};
        const didLike = !post.isLiked;

        if (didLike) {
            postCopy.likeCount++;
            postCopy.isLiked = true;
        }
        else {
            postCopy.likeCount--;
            postCopy.isLiked = false;
        }
        addPost(postCopy);

        // Async call
        const body = JSON.stringify({ liked: didLike });
        fetchWithAuth(`post/${post.id}/like`, 'POST', body);
    }

    return (
        <View style={styles.container}>
            <Text style={[styles.uniName, { color: getUniColor() }]} numberOfLines={1} ellipsizeMode='tail'>{getUniName()}</Text>

            <View style={styles.interactionContainer}>
                <TouchableOpacity onPress={onPressLike} style={styles.infoContainers}>
                    <Text style={styles.info}>{formatInteraction(post.likeCount)} </Text>
                    {post.isLiked ? <AntDesign name='heart' size={14} color='#ff578f' /> : <AntDesign name='hearto' size={14} color={COLORS.black} /> }
                </TouchableOpacity>
                
                <View style={styles.infoContainers}>
                    <Text style={styles.info}>{formatInteraction(post.replyCount)} </Text>
                    <SimpleLineIcons name='bubble' size={14} color={COLORS.black} />
                </View>
            </View>

            <Text style={styles.date} numberOfLines={1} ellipsizeMode='tail'>{formatPostDate(post.createdAt)}</Text>
        </View>
    );
}



const styles = StyleSheet.create({
    uniName: {
        flex: 6,
        fontSize: FONT_SIZES.s
    },
    interactionContainer: {
        flex: 4,
        flexDirection: 'row',
        gap: 10
    },
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 10
    },
    infoContainers: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 0
    },
    info: {
        fontSize: FONT_SIZES.s,
        color: COLORS.black
    },
    date: {
        fontSize: FONT_SIZES.s,
        color: COLORS.gray,
        textAlign: 'right'
    }
});