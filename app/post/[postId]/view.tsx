import { useEffect, useRef, useState } from 'react';

import { View } from 'react-native';

import { useLocalSearchParams } from 'expo-router';

import { useOperation } from '@providers/OperationProvider';
import { usePostStore } from '@providers/PostStoreProvider';

import Thread from '@components/post/thread/Thread';
import ReplyInput from '@components/post/thread/Reply';
import { GoBackFromPostHeader } from '@components/GoBackHeader';

import { fetchWithAuth } from '@util/fetch';

import { PostType } from '@util/types';



// We NEVER fetch the post from the server when loading this page.
// It is ALWAYS passed in using JSON.stringify(), encodeURI, and postStore.
export default function Index() {
    const operationContext = useOperation();
    const postContext = usePostStore();

    const postId = useLocalSearchParams().postId as string;

    const [focusPost, setFocusPost] = useState<PostType>();

    const [ancestors, setAncestors] = useState<PostType[]>([]);
    const [loadingAncestors, setLoadingAncestors] = useState<boolean>(true);

    const [replies, setReplies] = useState<PostType[]>([]);
    const [loadingReplies, setLoadingReplies] = useState<boolean>(true);


    const fetchAncestors = async (passedInFocusPost: PostType, threadParam: string) => {
        // Post is a root (non-reply) post:
        if (!passedInFocusPost.replyToId) {
            setAncestors([]);
            setLoadingAncestors(false);
            return;
        }

        const thread = (!threadParam) ? [] : JSON.parse(decodeURIComponent(threadParam)) as PostType[];
        // Passed in thread of ancestors
        if (thread.length != 0) {
            setAncestors(thread);
            setLoadingAncestors(false);
            return;
        }

        const resJson = await fetchWithAuth(`post/${passedInFocusPost.id}/ancestors`, 'GET');
        setAncestors(resJson.thread);
        setLoadingAncestors(false);
    }


    const fetchReplies = async (passedInFocusPost: PostType) => {
        if (passedInFocusPost.replyCount == 0) {
            setReplies([]);
            setLoadingReplies(false);
            return;
        }

        const resJson = await fetchWithAuth(`post/${passedInFocusPost.id}/replies`, 'GET');
        setReplies(resJson.replies);
        setLoadingReplies(false);
    }

    // Do not use operation context as we already have an increment reply count operation, and cannot have more than one operation at a time.
    // Consider alternatives to operation context.
    const addReply = (reply: PostType) => setReplies(prev=>[reply, ...prev]);


    useEffect(() => {
        const postContextRes = postContext.getPost(postId);
        // For TypeScript:
        if (postContextRes === undefined) return;
        const { postParam, threadParam } = postContextRes;
        const passedInFocusPost = JSON.parse(decodeURIComponent(postParam));
        setFocusPost(passedInFocusPost);
        fetchAncestors(passedInFocusPost, threadParam);
        fetchReplies(passedInFocusPost);
    }, []);

    const isFirstRender = useRef<boolean>(true);
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        const lastOp = operationContext.lastOperation;
        if (lastOp) {
            // Skip CREATE_REPLY for posts that are not being replied to (nested post views):
            setAncestors(prev => operationContext.conductOperation(prev, 'focus_ancestors'));
            setFocusPost(prev => {
                if (prev === undefined) return;
                return operationContext.conductOperation([prev], 'focus_post')[0];
            });
            setReplies(prev => operationContext.conductOperation(prev, 'focus_replies'));
        }
    }, [operationContext.lastOperation]);

    return (
        <View style={{ flex: 1 }}>
            <GoBackFromPostHeader />
            {(focusPost !== undefined && ancestors !== undefined) && <Thread
                focusPost={focusPost}
                ancestors={ancestors}
                replies={replies}
                loadingAncestors={loadingAncestors}
                loadingReplies={loadingReplies}
            />}
            <ReplyInput addReply={addReply} />
        </View>
    );
}