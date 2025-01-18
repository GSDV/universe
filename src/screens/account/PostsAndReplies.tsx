import { useEffect, useState } from 'react';

import { View, Text, TouchableOpacity } from 'react-native';

import { usePostStore } from '@hooks/PostStore';

import { useAccountPost } from '@providers/AccountPostProvider';

import List from '@components/List';
import { FeedPost } from '@components/post/FeedPost';
import { CheckIfLoading } from '@components/Loading';

import { COLORS, FONT_SIZES } from '@util/global-client';

import { fetchWithAuth } from '@util/fetch';

import { PostType } from '@util/types';



export default function PostsAndReplies({ userId }: { userId: string }) {
    const accountPostContext = useAccountPost();

    const addPost = usePostStore(state => state.addPost);

    const [view, setView] = useState<'posts' | 'replies'>('posts');
    const [loading, setLoading] = useState<boolean>(true);

    const [posts, setPosts] = useState<PostType[]>([]);
    const [postsCursor, setPostsCursor] = useState<string>('');
    const [morePostsAvailable, setMorePostsAvailable] = useState<boolean>(false);

    const [replies, setReplies] = useState<PostType[]>([]);
    const [repliesCursor, setRepliesCursor] = useState<string>('');
    const [moreRepliesAvailable, setMoreRepliesAvailable] = useState<boolean>(false);

    const fetchAndUpdatePosts = async (cursor: string, oldPosts: PostType[]) => {
        const getPinned = (cursor === '').toString();
        const params = new URLSearchParams({ getPinned, cursor });
        const resJson = await fetchWithAuth(`user/${userId}/post?${params.toString()}`, 'GET');
        if (resJson.cStatus == 200) {
            resJson.posts.map((p: any) => addPost(p));
            setPostsCursor(resJson.nextCursor);
            setPosts([...oldPosts, ...resJson.posts]);
            setMorePostsAvailable(resJson.moreAvailable);
        }
    }

    const fetchAndUpdateReplies = async (cursor: string, oldReplies: PostType[]) => {
        const params = new URLSearchParams({ cursor });
        const resJson = await fetchWithAuth(`user/${userId}/reply?${params.toString()}`, 'GET');
        if (resJson.cStatus == 200) {
            resJson.replies.map((p: any) => addPost(p));
            setRepliesCursor(resJson.nextCursor);
            setReplies([...oldReplies, ...resJson.replies]);
            setMoreRepliesAvailable(resJson.moreAvailable);
        }
    }

    // Used only once, to initially load first few posts and replies.
    const fetchInitialPR = async () => {
        setLoading(true);
        await Promise.all([
            fetchAndUpdatePosts('', []),
            fetchAndUpdateReplies('', [])
        ]);
        setLoading(false);
    }

    useEffect(() => {
        fetchInitialPR();
    }, []);

    const renderPost = (post: PostType) => <FeedPost postId={post.id} showPinned={true} />;

    const renderReply = (reply: PostType) => <FeedPost postId={reply.id} />;

    useEffect(() => {
        const { lastOperation: lastOp, conductOperation } = accountPostContext;
        if (!lastOp) return;
        setPosts(prev => conductOperation(prev, 'posts'));
        setReplies(prev => conductOperation(prev, 'replies'));
    }, [accountPostContext.lastOperation]);

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