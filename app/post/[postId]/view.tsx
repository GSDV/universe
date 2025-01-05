import { useEffect, useRef, useState } from 'react';

import { View } from 'react-native';

import { useLocalSearchParams } from 'expo-router';

import { useOperation } from '@providers/OperationProvider';

import GoBackHeader from '@components/GoBackHeader';

import { PostType } from '@util/types';
import Thread from '@components/post/thread/Thread';

import ReplyInput from '@components/post/thread/Reply';
import { fetchWithAuth } from '@util/fetch';



// We NEVER fetch the post from the server when loading this page.
// It is ALWAYS passed in as "post" parameter using JSON.stringify() and encodeURI.
export default function Index() {
    const operationContext = useOperation();

    const postId = useLocalSearchParams().postId as string;

    // Thread of ancestor posts (may be empty)
    const threadParam = useLocalSearchParams().threadParam as string;
    const thread = (!threadParam) ? [] : JSON.parse(decodeURIComponent(threadParam)) as PostType[];

    const focusedPostParam = useLocalSearchParams().postParam as string;
    const [focusPost, setFocusPost] = useState<PostType>(JSON.parse(decodeURIComponent(focusedPostParam)));

    const [ancestors, setAncestors] = useState<PostType[]>([]);
    const [loadingAncestors, setLoadingAncestors] = useState<boolean>(true);

    const [replies, setReplies] = useState<PostType[]>([]);
    const [loadingReplies, setLoadingReplies] = useState<boolean>(true);


    const fetchAncestors = async () => {
        // Post is a root (non-reply) post:
        if (!focusPost.replyToId) {
            setAncestors([]);
            setLoadingAncestors(false);
            return;
        }

        // Passed in thread of ancestors
        if (thread.length != 0) {
            setAncestors(thread);
            setLoadingAncestors(false);
            return;
        }

        const resJson = await fetchWithAuth(`post/${focusPost.id}/ancestors`, 'GET');
        setAncestors(resJson.thread);
        setLoadingAncestors(false);
    }


    const fetchReplies = async () => {
        if (focusPost.replyCount == 0) {
            setReplies([]);
            setLoadingReplies(false);
            return;
        }

        const resJson = await fetchWithAuth(`post/${focusPost.id}/replies`, 'GET');
        setReplies(resJson.replies);
        setLoadingReplies(false);
    }


    useEffect(() => {
        fetchAncestors();
        fetchReplies();
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
            if (lastOp.name === 'CREATE_REPLY' && lastOp.replyData.replyToId !== postId) return;
            setAncestors(prev => operationContext.conductOperation(prev, 'focus_ancestors'));
            setFocusPost(prev => operationContext.conductOperation([prev], 'focus_post')[0]);
            setReplies(prev => operationContext.conductOperation(prev, 'focus_replies'));
        }
    }, [operationContext.lastOperation]);

    return (
        <View style={{ flex: 1 }}>
            <GoBackHeader />
            <Thread
                focusPost={focusPost}
                ancestors={ancestors}
                replies={replies}
                loadingAncestors={loadingAncestors}
                loadingReplies={loadingReplies}
            />
            <ReplyInput />
        </View>
    );
}