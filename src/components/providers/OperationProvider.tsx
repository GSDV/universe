// An operation can be set only at PostView, and only for the parent post.
// This post can be a reply, but this context is only used on it when it is opened in PostView.

// The operation can be retrieved whenever the screen changes.

// Currently supported operations: LIKE, DELETE

import React, { createContext, useContext, useEffect, useState } from 'react';

import { PostType } from '@util/types';



const OperationContext = createContext<{ 
    postOp: PostOperationType | null,
    setOperation: (postId: string, op: OperationType) => void,
    conductOperation: (posts: PostType[]) => PostType[];
}>({ 
    postOp: null,
    setOperation: (postId: string, op: OperationType) => {},
    conductOperation: (posts: PostType[]) => []
});



type OperationType = 'LIKE' | 'UNLIKE' | 'DELETE';

interface PostOperationType {
    postId: string;
    op: OperationType;
}



export const OperationProvider = ({ children }: { children: React.ReactNode }) => {
    const [postOp, setPostOp] = useState<PostOperationType | null>(null);

    const setOperation = (postId: string, op: OperationType) => {
        setPostOp({ postId, op });
    }

    const conductOperation = (posts: PostType[]) => {
        if (!postOp) return [];

        const op = postOp.op;
        const postId = postOp.postId;
        if (op === 'LIKE') return posts.map(p => (p.id === postId) ? {...p, isLiked: true} : p );
        if (op === 'UNLIKE') return posts.map(p => (p.id === postId) ? {...p, isLiked: false} : p );
        if (op === 'DELETE') return posts.filter(post => post.id !== postId);

        // Should never happen, but for TypeScript:
        return [];
    }

    useEffect(() => {
        setPostOp(null);
    }, []);

    return (
        <OperationContext.Provider value={{ postOp, setOperation, conductOperation }}>
            {children}
        </OperationContext.Provider>
    );
}



export const useOperation = () => useContext(OperationContext);