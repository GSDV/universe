import { View } from 'react-native';

import { useLocalSearchParams } from 'expo-router';

import { usePost } from '@hooks/PostStore';

import PostView from '@screens/post/View/View';

import GoBackHeader from '@components/GoBackHeader';
import SomethingWentWrong from '@components/Error';



export default function Index() {
    const postId = useLocalSearchParams().postId as string;
    const focusPost = usePost(postId);

    if (focusPost === undefined) return <SomethingWentWrong />;

    return (
        <View style={{ flex: 1 }}>
            <GoBackHeader />
            <PostView />
        </View>
    );
}