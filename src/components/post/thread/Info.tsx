import { Text, View, TouchableOpacity, StyleSheet } from 'react-native';

import { AntDesign, SimpleLineIcons } from '@expo/vector-icons';

import { useOperation } from '@components/providers/OperationProvider';

import { COLORS, FONT_SIZES, formatInteraction, formatPostDate } from '@util/global-client';

import { fetchWithAuth } from '@util/fetch';

import { PostType } from '@util/types';



export default function Info({ post }: { post: PostType }) {
    const operationContext = useOperation();

    const university = post.author.university;

    const getUniName = () => {
        if (!university) return '';
        else return university.name;
    }
    const getUniColor = () => {
        if (!university) return COLORS.black;
        else return university.color;
    }

    const onPressLike = async () => {
        const didLike = !post.isLiked;
        if (didLike) operationContext.emitOperation({ name: 'LIKE', postId: post.id });
        else operationContext.emitOperation({ name: 'UNLIKE', postId: post.id });

        // Async call
        const body = JSON.stringify({ liked: didLike });
        fetchWithAuth(`post/${post.id}/like`, 'POST', body);
    }

    return (
        <View style={styles.container}>
            <Text style={{ flex: 2, fontSize: FONT_SIZES.m, color: getUniColor() }} numberOfLines={1} ellipsizeMode='tail'>{getUniName()}</Text>

            <View style={{ flexDirection: 'row', gap: 20 }}>
                <TouchableOpacity onPress={onPressLike} style={styles.infoContainers}>
                    <Text style={styles.info}>{formatInteraction(post.likeCount)} </Text>
                    {post.isLiked ? <AntDesign name='heart' size={15} color='#ff578f' /> : <AntDesign name='hearto' size={15} color={COLORS.black} /> }
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