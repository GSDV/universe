import React, { createContext, useContext, useEffect, useState } from 'react';

import { POST_OPERATION_EVENT_KEY } from '@util/global-client';

import { eventEmitter } from '@util/event';

import { PostType } from '@util/types';



type Screen = 'account_posts' | 'account_replies' | 'search' | 'feed' | 'map' | 'focus_post' | 'focus_ancestors' | 'focus_replies';



// Add the post to the account screen.
type CreatePostOp = { name: 'CREATE_POST', postData: PostType }
const processCreate = (posts: PostType[], op: CreatePostOp) => [op.postData, ...posts];

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
const processDelete = (posts: PostType[], op: DeleteOp) => posts.filter(p => p.id !== op.postId);

type BlockOp = { name: 'BLOCK', userId: string }
const processBlock = (posts: PostType[], op: BlockOp) => posts.filter(p => p.author.id !== op.userId);



type OperationType = CreatePostOp | CreateReplyOp | ReplyCountOp | LikeOp | UnlikeOp | DeleteOp | BlockOp;



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
        if (opName === 'CREATE_REPLY' && screen === 'account_replies') return processCreateReply(posts, lastOperation);
        if (opName === 'REPLY_COUNT') return processReply(posts, lastOperation);
        if (opName === 'LIKE')  return processLike(posts, lastOperation);
        if (opName === 'UNLIKE') return processUnlike(posts, lastOperation);
        if (opName === 'DELETE') return processDelete(posts, lastOperation);
        if (opName === 'BLOCK') return processBlock(posts, lastOperation);
        return posts;
    }

    return (
        <OperationContext.Provider value={{ lastOperation, emitOperation, conductOperation }}>
            {children}
        </OperationContext.Provider>
    );
}



export const useOperation = () => useContext(OperationContext);