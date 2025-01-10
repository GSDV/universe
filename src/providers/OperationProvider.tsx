import React, { createContext, useContext, useEffect, useState } from 'react';

import { POST_OPERATION_EVENT_KEY } from '@util/global-client';

import { eventEmitter } from '@util/event';

import { PostType } from '@util/types';
import { ACCOUNT_POSTS_PER_BATCH } from '@util/global';



type Screen = 'account_posts' | 'account_replies' | 'search' | 'feed' | 'map' | 'focus_post' | 'focus_ancestors' | 'focus_replies';



// Add the post to the account screen.
type CreatePostOp = { name: 'CREATE_POST', postData: PostType }
const processCreate = (posts: PostType[], op: CreatePostOp) => {
    if (posts.length != 0 && posts[0].pinned) return [posts[0], op.postData, ...posts.slice(1)];
    return [op.postData, ...posts];
}
const processAddToMap = (posts: PostType[], op: CreatePostOp) => [op.postData, ...posts];

// Add the reply to the account screen and current reply section.
type CreateReplyOp = { name: 'CREATE_REPLY', replyData: PostType }
const processCreateReply = (posts: PostType[], op: CreateReplyOp) => [op.replyData, ...posts];

// Increase replyCount field of the post that was just replied to.
type ReplyCountOp = { name: 'REPLY_COUNT', replyToId: string }
const processReply = (posts: PostType[], op: ReplyCountOp) => posts.map(p => (p.id === op.replyToId) ? { ...p, replyCount: p.replyCount + 1 } : p);

type LikeOp = { name: 'LIKE', postId: string }
const processLike = (posts: PostType[], op: LikeOp) => posts.map(p => (p.id === op.postId) ? { ...p, isLiked: true, likeCount: p.likeCount + 1 } : p);

type UnlikeOp = { name: 'UNLIKE', postId: string }
const processUnlike = (posts: PostType[], op: UnlikeOp) => posts.map(p => (p.id === op.postId) ? { ...p, isLiked: false, likeCount: p.likeCount - 1 } : p);

type DeleteOp = { name: 'DELETE', postId: string }
const processDelete = (posts: PostType[], op: DeleteOp) => posts.map(p => (p.id === op.postId) ? { ...p, deleted: true, content: '', media: [] } : p);
const removeDelete = (posts: PostType[], op: DeleteOp) => posts.filter(p => p.id !== op.postId);

type BlockOp = { name: 'BLOCK', userId: string }
const processBlock = (posts: PostType[], op: BlockOp) => posts.filter(p => p.author.id !== op.userId);

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



type OperationType = CreatePostOp | CreateReplyOp | ReplyCountOp | LikeOp | UnlikeOp | DeleteOp | BlockOp | PinOP;



interface OperationContextType {
    lastOperation: OperationType | null;
    emitOperation: (op: OperationType) => void;
    conductOperation: (posts: PostType[], screen: Screen) => PostType[];
}



const OperationContext = createContext<OperationContextType>({ 
    lastOperation: null,
    emitOperation: (op: OperationType) => {},
    conductOperation: (posts: PostType[], screen: Screen) => []
});



export function OperationProvider({ children }: { children: React.ReactNode }) {
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

        if (opName === 'CREATE_POST' && screen === 'account_posts') return processCreate(posts, lastOperation);
        if (opName === 'CREATE_POST' && screen == 'map') return processAddToMap(posts, lastOperation);
        if (opName === 'CREATE_REPLY' && (screen === 'account_replies' || screen === 'focus_replies')) return processCreateReply(posts, lastOperation);
        if (opName === 'REPLY_COUNT') return processReply(posts, lastOperation);
        if (opName === 'LIKE')  return processLike(posts, lastOperation);
        if (opName === 'UNLIKE') return processUnlike(posts, lastOperation);
        if (opName === 'DELETE' && (screen === 'account_posts' || screen === 'account_replies')) return removeDelete(posts, lastOperation);
        if (opName === 'DELETE') return processDelete(posts, lastOperation);
        if (opName === 'BLOCK') return processBlock(posts, lastOperation);
        if (opName === 'PIN' && screen === 'account_posts') return processPin(posts, lastOperation);
        return posts;
    }

    return (
        <OperationContext.Provider value={{ lastOperation, emitOperation, conductOperation }}>
            {children}
        </OperationContext.Provider>
    );
}



export const useOperation = () => useContext(OperationContext);