import { useEffect, useState } from 'react';
import { View, Text, FlatList, RefreshControl } from 'react-native';

import { useOperation } from '@components/providers/OperationProvider';

import { FeedPost } from './Post';
import { Alert, AlertType } from '@components/Alert';
import { CheckIfLoading } from '@components/Loading';

import { ACCOUNT_POSTS_PER_BATCH, DOMAIN } from '@util/global'
import { COLORS } from '@util/global-client';

import { PostType } from '@util/types';



export default function UserPosts({ userId }: { userId: string }) {
    const operationContext = useOperation();

    const [refreshing, setRefreshing] = useState<boolean>(false);
    // For initial load, NOT refreshing:
    const [loading, setLoading] = useState<boolean>(true);
    const [alert, setAlert] = useState<AlertType | null>(null);

    const [posts, setPosts] = useState<PostType[]>([]);
    const [page, setPage] = useState<number>(1);

    // Are there more posts available for when the user scrolls to the end?
    // If not, do not let user load more.
    const [moreAvailable, setMoreAvailable] = useState<boolean>(false);

    const handlePinChange = (postToPinId: string) => {
        setPosts(currentPosts => {
            const currentPinnedPost = currentPosts[0].pinned ? currentPosts[0] : undefined;
            const postToPin = currentPosts.find(post => post.id === postToPinId);
            
            if (!postToPin) return currentPosts;

            // Remove current pinned, if it exists.
            if (currentPinnedPost) currentPosts.splice(0, 1);

            const otherPosts = currentPosts.filter(post => post.id !== postToPinId);

            // If there was no previosuly pinned post:
            if (currentPinnedPost === undefined) {
                const newPinnedPost = {
                    ...postToPin,
                    pinned: true
                };
                // No need to sort otherPosts, should already be sorted.
                return [newPinnedPost, ...otherPosts];
            }


            // From here onwards, there was a previosuly pinned post
            const unpinnedPost = {
                ...currentPinnedPost,
                pinned: false
            };

            const sortedPosts = [unpinnedPost, ...otherPosts];
            sortedPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            // If previously pinned post is now at the end of array, just remove it.
            // There may be other posts in between it and second-to-last.
            if (sortedPosts[sortedPosts.length-1].id===unpinnedPost.id && sortedPosts.length>ACCOUNT_POSTS_PER_BATCH && moreAvailable) {
                sortedPosts.pop();
            }

            // If we are unpinning:
            if (currentPinnedPost.id === postToPin.id) return sortedPosts;

            // If we are pinning:
            const newPinnedPost = {
                ...postToPin,
                pinned: true
            };

            return [newPinnedPost, ...sortedPosts];
        });
    };

    const handleDelete = (postToDeleteId: string) => {
        setPosts(currentPosts => currentPosts.filter(post => post.id !== postToDeleteId));
    }

    // One function to use in all three fetch-and-update instances
    const fetchAndUpdatePosts = async (p: number, oldPosts: PostType[]) => {
        setAlert(null);
        const res = await fetch(`${DOMAIN}/api/app/user/${userId}/post?page=${p}`, { method: 'GET' });
        const resJson = await res.json();
        if (resJson.cStatus == 200) {
            setPage(p);
            setPosts([...oldPosts, ...resJson.posts]);
            setMoreAvailable(resJson.moreAvailable);
        } else {
            setAlert(resJson);
        }
    }

    // Used every time the user swipes up (refreshes an account) to see newer posts.
    // Completely reset the posts array.
    const onRefresh = async () => {
        setRefreshing(true);
        await fetchAndUpdatePosts(1, []);
        setRefreshing(false);
    }

    // Used every time the user reaches end of list to see older posts.
    const onEndReached = async () => {
        setRefreshing(true);
        await fetchAndUpdatePosts(page+1, posts);
        setRefreshing(false);
    }

    // Used only once, to initially load first few posts.
    const fetchInitialPosts = async () => {
        setLoading(true);
        await fetchAndUpdatePosts(1, []);
        setLoading(false);
    }

    // The UserPosts component will always be used in an account, so all posts will be displayed in feed style.
    const renderPost = ({ item, index }: { item: PostType, index: number }) => {
        return <FeedPost post={item} ownPost={true} showPinned={item.pinned} handlePinChange={handlePinChange} handleDelete={handleDelete} previousScreen='account' />;
    }

    useEffect(() => {
        fetchInitialPosts();
    }, []);

    useEffect(() => {
        if (operationContext.lastOperation) setPosts(prev => operationContext.conductOperation(prev));
    }, [operationContext.lastOperation]);

    return (
        <CheckIfLoading loading={loading}>
            {posts.length == 0 ?
                <View style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ color: COLORS.black }}>no posts yet</Text>
                </View>
            :
                <FlatList
                    keyExtractor={(item, idx) => `${idx}--${item.id}`} 
                    data={posts} 
                    renderItem={renderPost} 

                    style={{ flex: 1, backgroundColor: 'rgb(220, 220, 220)' }} 
                    contentContainerStyle={{ gap: 5 }} 
                    showsVerticalScrollIndicator={false} 

                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing} 
                            onRefresh={onRefresh} 
                            tintColor={COLORS.primary_1}
                        />
                    } 

                    onEndReached={moreAvailable ? onEndReached : null} 
                    onEndReachedThreshold={0.5}
                />
            }
            {alert && <Alert alert={alert} />}
        </CheckIfLoading>
    );
}