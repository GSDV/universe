import React, { createContext, useContext, useEffect, useState } from 'react';

import { eventEmitter } from '@util/event';

import { POST_OPERATION_EVENT_KEY } from '@util/global-client';

import { PostType } from '@util/types';



type OperationType = 'LIKE' | 'UNLIKE' | 'DELETE';

interface OperationData {
    postId: string;
    op: OperationType;
}

interface OperationContextType {
    lastOperation: OperationData | null;
    emitOperation: (postId: string, op: OperationType) => void;
    conductOperation: (posts: PostType[]) => PostType[];
}



const OperationContext = createContext<OperationContextType>({ 
    lastOperation: null,
    emitOperation: (postId: string, op: OperationType) => {},
    conductOperation: (posts: PostType[]) => []
});



export function OperationProvider({ children }: { children: React.ReactNode }) {
    const [lastOperation, setLastOperation] = useState<OperationData | null>(null);


    useEffect(() => {
        const subscriber = eventEmitter.addListener(POST_OPERATION_EVENT_KEY, (data: OperationData) => {
            setLastOperation(data);
        });
        return () => subscriber.remove();
    }, []);


    const emitOperation = (postId: string, op: OperationType) => {
        const postOperationData: OperationData = { postId, op };
        eventEmitter.emit(POST_OPERATION_EVENT_KEY, postOperationData);
    };


    const conductOperation = (posts: PostType[]) => {
        if (!lastOperation) return posts;

        const postId = lastOperation.postId;   
        const op = lastOperation.op;
        if (op === 'LIKE') return posts.map(p => p.id === postId ? { ...p, isLiked: true, likeCount: p.likeCount + 1 } : p);
        if (op === 'UNLIKE') return posts.map(p => p.id === postId ? { ...p, isLiked: false, likeCount: p.likeCount -1 } : p);
        if (op === 'DELETE') return posts.filter(p => p.id !== postId);

        // Should never happen, but just for TypeScript:
        return posts;
    }


    return (
        <OperationContext.Provider value={{ lastOperation, emitOperation, conductOperation }}>
            {children}
        </OperationContext.Provider>
    );
}



export const useOperation = () => useContext(OperationContext);