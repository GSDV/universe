import { useEffect, useRef, useState } from 'react';

import { View, Text, TouchableOpacity } from 'react-native';

import { useUser } from '@components/providers/UserProvider';
import { useOperation } from '@components/providers/OperationProvider';

import List from '@components/List';
import { FeedPost } from '@components/post/FeedPost';
import { CheckIfLoading } from '@components/Loading';

import { COLORS, FONT_SIZES } from '@util/global-client';

import { fetchWithAuth } from '@util/fetch';

import { PostType } from '@util/types';


export default function PostsAndReplies({ userId }: { userId: string }) {
    const userContext = useUser();

    const operationContext = useOperation();

    const [view, setView] = useState<'posts' | 'replies'>('posts');
    const [loading, setLoading] = useState<boolean>(true);

    const [posts, setPosts] = useState<PostType[]>([]);
    const [postsCursor, setPostsCursor] = useState<Date>(new Date());
    const [morePostsAvailable, setMorePostsAvailable] = useState<boolean>(false);

    const [replies, setReplies] = useState<PostType[]>([]);
    const [repliesCursor, setRepliesCursor] = useState<Date>(new Date());
    const [moreRepliesAvailable, setMoreRepliesAvailable] = useState<boolean>(false);

    const fetchAndUpdatePosts = async (cursor: Date, oldPosts: PostType[]) => {
        const getPinned = ((new Date()).getTime() - cursor.getTime()) < 500;
        const params = new URLSearchParams({
            getPinned: getPinned.toString(),
            cursor: cursor.toISOString()
        });
        const resJson = await fetchWithAuth(`user/${userId}/post?${params.toString()}`, 'GET');
        if (resJson.cStatus == 200) {
            setPostsCursor(new Date(resJson.newCursor));
            setPosts([...oldPosts, ...resJson.posts]);
            setMorePostsAvailable(resJson.moreAvailable);
        }
    }

    const fetchAndUpdateReplies = async (cursor: Date, oldReplies: PostType[]) => {
        const params = new URLSearchParams({
            cursor: cursor.toISOString()
        });
        const resJson = await fetchWithAuth(`user/${userId}/reply?${params.toString()}`, 'GET');
        if (resJson.cStatus == 200) {
            setRepliesCursor(new Date(resJson.newCursor));
            setReplies([...oldReplies, ...resJson.replies]);
            setMoreRepliesAvailable(resJson.moreAvailable);
        }
    }
    
    // Used only once, to initially load first few posts and replies.
    const fetchInitialPR = async () => {
        setLoading(true);
        const now = new Date();
        await Promise.all([
            fetchAndUpdatePosts(now, []),
            fetchAndUpdateReplies(now, [])
        ]);
        setLoading(false);
    }

    useEffect(() => {
        fetchInitialPR();
    }, []);

    const renderPost = (post: PostType) => <FeedPost post={post} ownPost={userContext?.user?.id === post.author.id} showPinned={true} />;

    const renderReply = (reply: PostType) => <FeedPost post={reply} ownPost={userContext?.user?.id === reply.author.id} />;

    const isFirstRender = useRef<boolean>(true);
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        if (operationContext.lastOperation) {
            setPosts(prev => operationContext.conductOperation(prev, 'account_posts'));
            setReplies(prev => operationContext.conductOperation(prev, 'account_replies'));
        }
    }, [operationContext.lastOperation]);

    return (
        <View style={{ flex: 1 }}>
            <View style={{ padding: 10, width: '100%', flexDirection: 'row', justifyContent: 'center', gap: 15 }}>
                <TouchableOpacity onPress={() => setView('posts')}>
                    <Text style={{ color: ((view==='posts') ? COLORS.black : COLORS.gray), fontSize: FONT_SIZES.m }}>Posts</Text>
                </TouchableOpacity>

                <Text style={{ color: COLORS.gray, fontSize: FONT_SIZES.m }}>|</Text>

                <TouchableOpacity onPress={() => setView('replies')}>
                    <Text style={{ color: ((view==='replies') ? COLORS.black : COLORS.gray), fontSize: FONT_SIZES.m }}>Replies</Text>
                </TouchableOpacity>
            </View>

            <View style={{ width: '100%', height: 5, backgroundColor: COLORS.light_gray }} />

            <CheckIfLoading loading={loading}>
                {view === 'posts' ?
                    <List
                        items={posts}
                        cursor={postsCursor}
                        moreAvailable={morePostsAvailable}
                        fetchAndUpdate={fetchAndUpdatePosts}
                        renderItem={renderPost}
                        noResultsText='no posts yet'
                    />
                :
                    <List
                        items={replies}
                        cursor={repliesCursor}
                        moreAvailable={moreRepliesAvailable}
                        fetchAndUpdate={fetchAndUpdateReplies}
                        renderItem={renderReply}
                        noResultsText='no replies yet'
                    />
                }
            </CheckIfLoading>
        </View>
    );
}