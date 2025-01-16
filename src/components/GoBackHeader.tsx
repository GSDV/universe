import { useCallback } from 'react';

import { TouchableOpacity, View } from 'react-native';

import { useLocalSearchParams, useRouter } from 'expo-router';

import { usePostStore } from '@providers/PostStore';

import { Ionicons } from '@expo/vector-icons';

import { SafeAreaTop } from '@components/SafeArea';

import { COLORS } from '@util/global-client';



export default function GoBackHeader() {
    const router = useRouter();

    return (
        <View>
            <SafeAreaTop />
            <TouchableOpacity style={{ paddingLeft: 5, width: 50 }} onPress={router.back}>
                <Ionicons name='chevron-back' size={25} color={COLORS.primary} />
            </TouchableOpacity>
        </View>
    );
}



export function GoBackFromPostHeader() {
    const router = useRouter();

    const removePost = usePostStore((state) => state.removePost);

    const postId = useLocalSearchParams().postId as string;

    const goBack = useCallback(() => {
        removePost(postId);
        router.back();
    }, [postId, removePost, router]);

    return (
        <View>
            <SafeAreaTop />
            <TouchableOpacity style={{ paddingLeft: 5, width: 50 }} onPress={goBack}>
                <Ionicons name='chevron-back' size={25} color={COLORS.primary} />
            </TouchableOpacity>
        </View>
    );
}