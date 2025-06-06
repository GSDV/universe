import { useEffect, useState, useRef } from 'react';

import { View } from 'react-native';

import { useLocalSearchParams } from 'expo-router';

import List from '@components/List';
import { AlertType, CheckIfAlert } from '@components/Alert';
import { CheckIfLoading } from '@components/Loading';

import { fetchWithAuth } from '@util/fetch';

import { PostType } from '@util/types';
import { FeedPost } from '@components/post/FeedPost';
import { usePostStore } from '@hooks/PostStore';



// Show trending posts from a specific Uni
export default function Uni() {
    const { uniId } = useLocalSearchParams();

    const domainRef = useRef<string | null>(null);

    const [loading, setLoading] = useState<boolean>(true);
    const [alert, setAlert] = useState<AlertType>();

    const [posts, setPosts] = useState<PostType[]>([]);
    const [postsCursor, setPostsCursor] = useState<string>('');
    const [morePostsAvailable, setMorePostsAvailable] = useState<boolean>(false);

    const addPost = usePostStore(state => state.addPost);

    const fetchAndUpdatePosts = async (cursor: string, oldPosts: PostType[]) => {
        if (!domainRef.current) {
            setAlert({ msg: 'Something went wrong.', cStatus: 400 });
            return;
        }

        const params = new URLSearchParams({ cursor });
        const resJson = await fetchWithAuth(`uni/posts/${domainRef.current}?${params.toString()}`, 'GET');
        if (resJson.cStatus == 200) {
            resJson.posts.map((p: any) => addPost(p));
            setPostsCursor(resJson.nextCursor);
            setPosts([...oldPosts, ...resJson.posts]);
            setMorePostsAvailable(resJson.moreAvailable);
        } else {
            setAlert(resJson);
        }
    }

    // Used only once, to initially load first few posts.
    // Also used to get the uniPrisma schema, for "domain"
    const fetchInitialPosts = async () => {
        setLoading(true);
        try {
            const resJson = await fetchWithAuth(`uni/${uniId}`, 'GET');
            if (resJson.cStatus == 200) {
                domainRef.current = resJson.uni.domain;
            } else {
                setAlert(resJson);
                setLoading(false);
            }
            await fetchAndUpdatePosts('', []);
            setLoading(false);
        } catch (err) {
            setAlert({ msg: 'Something went wrong.', cStatus: 400 });
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchInitialPosts();
    }, []);

    const renderPost = (post: PostType) => <FeedPost postId={post.id} showPinned={true} />;

    return (
        <CheckIfLoading loading={loading}>
            <CheckIfAlert alert={alert}>
                <View style={{ flex: 1, paddingTop: 10, flexDirection: 'column' }}>
                    <List<PostType>
                        items={posts}
                        cursor={postsCursor}
                        moreAvailable={morePostsAvailable}
                        fetchAndUpdate={fetchAndUpdatePosts}
                        renderItem={renderPost}
                        noResultsText='no posts yet'
                    />
                </View>
            </CheckIfAlert>
        </CheckIfLoading>
    );
}