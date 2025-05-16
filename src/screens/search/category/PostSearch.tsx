import React, { useEffect, useState, useCallback } from 'react';

import { View } from 'react-native';

import { usePostStore } from '@hooks/PostStore';

import { MemoizedFeedPost } from '@components/post/FeedPost';
import { CheckIfLoading } from '@components/Loading';
import List from '@components/List';

import { fetchWithAuth } from '@util/fetch';

import { PostType } from '@util/types';



export default function PostSearch({ query }: { query: string }) {
    const addPost = usePostStore(state => state.addPost);
    const [loading, setLoading] = useState<boolean>(true);

    const [posts, setPosts] = useState<PostType[]>([]);
    const [postsCursor, setPostsCursor] = useState<string>('');
    const [morePostsAvailable, setMorePostsAvailable] = useState<boolean>(false);

    const fetchAndUpdatePosts = useCallback(async (cursor: string, oldPosts: PostType[]) => {
        const params = new URLSearchParams({ query, cursor });
        const resJson = await fetchWithAuth(`search/posts?${params.toString()}`, 'GET');
        if (resJson.cStatus == 200) {
            resJson.posts.map((p: any) => addPost(p));
            setPostsCursor(resJson.nextCursor);
            setPosts([...oldPosts, ...resJson.posts]);
            setMorePostsAvailable(resJson.moreAvailable);
        }
    }, [query, addPost]);

    const renderPost = useCallback((post: PostType) => {
        return <MemoizedFeedPost postId={post.id} />;
    }, []);


    const intialFetch = useCallback(async () => {
        setLoading(true);
        await fetchAndUpdatePosts('', []);
        setLoading(false);
    }, [fetchAndUpdatePosts]);

    useEffect(() => {
        intialFetch();
    }, [query, intialFetch]);

    return (
        <>
            <CheckIfLoading loading={loading}>
                <View style={{ flex: 1 }}>
                    <List<PostType> 
                        items={posts} 
                        cursor={postsCursor} 
                        moreAvailable={morePostsAvailable} 
                        fetchAndUpdate={fetchAndUpdatePosts} 
                        renderItem={renderPost}
                        allowRefresh={false}
                        noResultsText='no posts found'
                    />
                </View>
            </CheckIfLoading>
        </>
    );
}