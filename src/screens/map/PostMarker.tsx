import React, { Pressable, StyleSheet } from 'react-native';

import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { COLORS } from '@util/global-client';

import { PostType } from '@util/types';



export default function PostMarker({ post, onPress }: { post: PostType; onPress: () => void }) {
    const score = post.likeCount + post.replyCount/3;

    return (
        <Pressable onPress={onPress} style={styles.container}>
            <Star score={score} />
        </Pressable>
    );
}



function Star({ score }: { score: number }) {
    // New/Unpopular posts.
    // Note: due to some internal padding in specifically the 'star-three-points' component, 
    //      we must offset one by a few pixels to be centered.
    if (score < 20) return (
        <>
            <MaterialCommunityIcons style={{ zIndex: 1, position: 'absolute' }} name='star-three-points' size={60} color={COLORS.black} />
            <MaterialCommunityIcons style={{ zIndex: 2, position: 'absolute', top: 11 }} name='star-three-points' size={40} color='#ffd970' />
        </>
    );

    // Semi-popular posts.
    if (score < 70) return (
        <>
            <MaterialCommunityIcons style={{ zIndex: 1, position: 'absolute' }} name='star-four-points' size={60} color={COLORS.black} />
            <MaterialCommunityIcons style={{ zIndex: 2, position: 'absolute' }} name='star-four-points' size={40} color='#ff9b61' />
        </>
    );

    // Popular posts.
    return (
        <>
            <MaterialCommunityIcons style={{ zIndex: 1, position: 'absolute' }} name='star' size={60} color={COLORS.black} />
            <MaterialCommunityIcons style={{ zIndex: 2, position: 'absolute' }} name='star' size={40} color='#ff6666' />
        </>
    );
}



const styles = StyleSheet.create({
    container: {
        position: 'relative',
        width: 60,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center'
    }
});