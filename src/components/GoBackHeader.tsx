import { TouchableOpacity, View } from 'react-native';

import { useLocalSearchParams, useRouter } from 'expo-router';

import { Ionicons } from '@expo/vector-icons';

import { SafeAreaTop } from '@components/SafeArea';

import { COLORS } from '@util/global-client';
import { usePostStore } from '@providers/PostStoreProvider';



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

    const postContext = usePostStore();
    const postId = useLocalSearchParams().postId as string;

    const goBack = () => {
        postContext.removePost(postId);
        router.back();
    }

    return (
        <View>
            <SafeAreaTop />
            <TouchableOpacity style={{ paddingLeft: 5, width: 50 }} onPress={goBack}>
                <Ionicons name='chevron-back' size={25} color={COLORS.primary} />
            </TouchableOpacity>
        </View>
    );
}