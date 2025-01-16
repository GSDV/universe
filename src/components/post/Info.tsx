import { useEffect, useState } from 'react';

import { Text, View, TouchableOpacity, StyleSheet } from 'react-native';

import { usePostStore } from '@providers/PostStore';

import { AntDesign, SimpleLineIcons } from '@expo/vector-icons';

import { COLORS, FONT_SIZES, formatInteraction, formatPostDate } from '@util/global-client';

import { fetchWithAuth } from '@util/fetch';

import { PostType } from '@util/types';



export default function Info({ post }: { post: PostType }) {
    const likePost = usePostStore((state) => state.likePost);
    const unlikePost = usePostStore((state) => state.unlikePost);

    const [likeState, setLikeState] = useState<{ count: number, isLiked: boolean }>({
        count: post.likeCount, isLiked: post.isLiked
    });

    const university = post.author.university;
    const getUniName = () => university?.name ?? '';
    const getUniColor = () => university?.color ?? COLORS.black;

    const onPressLike = async () => {
        if (post.deleted) return;

        const didLike = !likeState.isLiked;
        setLikeState(prev => ({
            count: (didLike) ? prev.count+1 : prev.count -1,
            isLiked: didLike
        }));

        requestAnimationFrame(() => {
            if (didLike) likePost(post.id);
            else unlikePost(post.id);
        });

        // Async call
        const body = JSON.stringify({ liked: didLike });
        fetchWithAuth(`post/${post.id}/like`, 'POST', body);
    }

    // This useEffect handles updating for when a parent component recieves an operation event.
    useEffect(() => {
        setLikeState({ count: post.likeCount, isLiked: post.isLiked });
    }, [post.likeCount, post.isLiked])

    return (
        <View style={styles.container}>
            <Text style={[styles.uniName, { color: getUniColor() }]} numberOfLines={1} ellipsizeMode='tail'>{getUniName()}</Text>

            <View style={styles.interactionContainer}>
                <TouchableOpacity onPress={onPressLike} style={styles.infoContainers}>
                    <Text style={styles.info}>{formatInteraction(likeState.count)} </Text>
                    {likeState.isLiked ? <AntDesign name='heart' size={15} color='#ff578f' /> : <AntDesign name='hearto' size={15} color={COLORS.black} /> }
                </TouchableOpacity>
                
                <View style={styles.infoContainers}>
                    <Text style={styles.info}>{formatInteraction(post.replyCount)} </Text>
                    <SimpleLineIcons name='bubble' size={15} color={COLORS.black} />
                </View>
            </View>

            <Text style={styles.date} numberOfLines={1} ellipsizeMode='tail'>{formatPostDate(post.createdAt)}</Text>
        </View>
    );
}



const styles = StyleSheet.create({
    uniName: {
        flex: 2,
        fontSize: FONT_SIZES.m,
    },
    interactionContainer: {
        flexDirection: 'row',
        gap: 20
    },
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 5
    },
    infoContainers: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    info: {
        fontSize: FONT_SIZES.m,
        color: COLORS.black
    },
    date: {
        flex: 1,
        fontSize: FONT_SIZES.m,
        color: COLORS.gray,
        textAlign: 'right'
    }
});