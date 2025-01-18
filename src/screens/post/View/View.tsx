import React, { useCallback, useEffect, useState } from 'react';

import { useLocalSearchParams } from 'expo-router';

import { usePostStore, usePost } from '@/src/hooks/PostStore';

import { useAccountPost } from '@providers/AccountPostProvider';

import Thread from '@screens/post/View/Thread';
import ReplyInput from '@screens/post/View/Reply';
import SomethingWentWrong from '@components/Error';

import { fetchWithAuth } from '@util/fetch';

import { PostType } from '@util/types';



// We NEVER fetch the post from the server when loading this page.
// It is ALWAYS passed in using postStore.
export default function PostView() {
    const accountPostContext = useAccountPost();

    const addPost = usePostStore((state) => state.addPost);
    const updatePost = usePostStore((state) => state.updatePost);

    const postId = useLocalSearchParams().postId as string;
    const focusPost = usePost(postId);

    const [ancestors, setAncestors] = useState<PostType[]>([]);
    const [loadingAncestors, setLoadingAncestors] = useState<boolean>(false);

    const [replies, setReplies] = useState<PostType[]>([]);
    const [loadingReplies, setLoadingReplies] = useState<boolean>(false);
    const [repliesCursor, setRepliesCursor] = useState<string>('');
    const [moreRepliesAvailable, setMoreRepliesAvailable] = useState<boolean>(false);

    const fetchAncestors = useCallback(async () => {
        if (loadingAncestors || !focusPost) return;
        // Post is a root (non-reply) post:
        if (!focusPost.replyToId) {
            setAncestors([]);
            setLoadingAncestors(false);
            return;
        }
        setLoadingAncestors(true);
        const resJson = await fetchWithAuth(`post/${focusPost.id}/ancestors`, 'GET');
        setAncestors(resJson.thread);
        setLoadingAncestors(false);
    }, [focusPost]);

    const fetchReplies = useCallback(async () => {
        if (loadingReplies || !focusPost) return;
        if (focusPost.replyCount == 0) {
            setReplies([]);
            setLoadingReplies(false);
            setMoreRepliesAvailable(false);
            return;
        }
        setLoadingReplies(true);
        const params = new URLSearchParams({ cursor: repliesCursor });
        const resJson = await fetchWithAuth(`post/${focusPost.id}/replies?${params.toString()}`, 'GET');
        if (resJson.cStatus == 200) {
            setReplies(prev => [...prev, ...resJson.replies]);
            setRepliesCursor(resJson.nextCursor);
            setMoreRepliesAvailable(resJson.moreAvailable);
        }
        setLoadingReplies(false);
    }, [focusPost]);

    const addNewReply = useCallback((reply: PostType) => {
        if (focusPost === undefined) return;
        // Add reply to account screen:
        accountPostContext.emitOperation({ name: 'CREATE_REPLY', postData: reply });
        // Update the focused post reply count:
        updatePost(focusPost.id, { replyCount: focusPost.replyCount + 1 });
        // Add reply to Zustand:
        addPost(reply);
        // Add reply to top of replies:
        setReplies(prev => [reply, ...prev]);
    }, [focusPost]);


    useEffect(() => {
        if (!focusPost) return;
        // We only initially fetch some replies.
        // Ancestors are fetched if user swipes up.
        fetchReplies();
    }, [focusPost, fetchReplies]);


    // For TypeScript, undefined catches will be in tab root "view.tsx".
    if (focusPost === undefined) return <SomethingWentWrong />;

    return (
        <>
            <Thread
                focusPost={focusPost}
                ancestors={ancestors}
                fetchAncestors={fetchAncestors}
                loadingAncestors={loadingAncestors}
                replies={replies}
                fetchReplies={fetchReplies}
                loadingReplies={loadingReplies}
                moreRepliesAvailable={moreRepliesAvailable}
            />
            <ReplyInput addNewReply={addNewReply} />
        </>
    );
}