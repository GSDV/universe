// Operations for only the Account screen.
// May be called from anywhere.

import { createContext, useContext, useEffect, useState } from 'react';

import { ACCOUNT_POSTS_PER_BATCH } from '@util/global';
import { POST_OPERATION_EVENT_KEY } from '@util/global-client';

import { eventEmitter } from '@util/event';

import { PostType } from '@util/types';



type Screen = 'posts' | 'replies';



type CreatePostOp = { name: 'CREATE_POST', postData: PostType }
const processCreatePost = (posts: PostType[], op: CreatePostOp) => {
    if (posts.length != 0 && posts[0].pinned) return [posts[0], op.postData, ...posts.slice(1)];
    return [op.postData, ...posts];
}

type CreateReplyOp = { name: 'CREATE_REPLY', postData: PostType }
const processCreateReply = (posts: PostType[], op: CreateReplyOp) => [op.postData, ...posts];

type DeleteOp = { name: 'DELETE', postId: string }
const processDelete = (posts: PostType[], op: DeleteOp) => posts.filter(p => p.id !== op.postId);

// For both pinning and unpinning a post (not reply) on the account screen.
type PinOP = { name: 'PIN', selectedPostId: string, morePostsAvailable: boolean }
const processPin = (posts: PostType[], op: PinOP) => {
        const currentPinnedPost = posts[0]?.pinned ? posts[0] : null;
        const postToPin = posts.find(post => post.id === op.selectedPostId);
        if (!postToPin) return posts;
        
        // Unpinning case
        if (currentPinnedPost?.id === op.selectedPostId) {
            const otherPosts = posts.slice(1);
            const unpinnedPost = { ...currentPinnedPost, pinned: false };
            const sortedPosts = [unpinnedPost, ...otherPosts].sort(
                (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            
            if (sortedPosts[sortedPosts.length-1].id === unpinnedPost.id)
            return (sortedPosts.length > ACCOUNT_POSTS_PER_BATCH && 
                    op.morePostsAvailable && 
                    sortedPosts[sortedPosts.length-1].id === unpinnedPost.id)
                    ? sortedPosts.slice(0, -1)
                    : sortedPosts;
        }

        // Pinning case
        const newPinnedPost = { ...postToPin, pinned: true };
        const otherPosts = posts.filter(post => post.id !== op.selectedPostId);
        return [newPinnedPost, ...(currentPinnedPost ? otherPosts.slice(1) : otherPosts)];
}



type OperationType = CreatePostOp | CreateReplyOp | DeleteOp | PinOP;



interface AccountPostContextType {
    lastOperation: OperationType | null;
    emitOperation: (op: OperationType) => void;
    conductOperation: (posts: PostType[], screen: Screen) => PostType[];
}



const AccountPostContext = createContext<AccountPostContextType>({ 
    lastOperation: null,
    emitOperation: (op: OperationType) => {},
    conductOperation: (posts: PostType[], screen: Screen) => []
});



export function AccountPostProvider({ children }: { children: React.ReactNode }) {
    const [lastOperation, setLastOperation] = useState<OperationType | null>(null);

    useEffect(() => {
        const subscriber = eventEmitter.addListener(POST_OPERATION_EVENT_KEY, (op: OperationType) => {
            setLastOperation(op);
        });
        return () => subscriber.remove();
    }, []);

    const emitOperation = (op: OperationType) => eventEmitter.emit(POST_OPERATION_EVENT_KEY, op);

    const conductOperation = (posts: PostType[], screen: Screen) => {
        if (!lastOperation) return posts;
        const opName = lastOperation.name;

        if (opName === 'CREATE_POST' && screen === 'posts') return processCreatePost(posts, lastOperation);
        if (opName === 'CREATE_REPLY' && screen === 'replies') return processCreateReply(posts, lastOperation);
        if (opName === 'PIN' && screen === 'posts') return processPin(posts, lastOperation);
        if (opName === 'DELETE') return processDelete(posts, lastOperation);
        return posts;
    }

    return (
        <AccountPostContext.Provider value={{ lastOperation, emitOperation, conductOperation }}>
            {children}
        </AccountPostContext.Provider>
    );
}



export const useAccountPost = () => useContext(AccountPostContext);