// An operation can be set only at PostView, and only for the parent post.
// This post can be a reply, but this context is only used on it when it is opened in PostView.

// The operation can be retrieved whenever the screen changes.

// Currently supported operations: LIKE, DELETE

import React, { createContext, useContext, useEffect, useState } from 'react';



const OperationContext = createContext<{ 
    op: PostOperation | null,
    setOperation: (postId: string, op: OperationType) => void
}>({ 
    op: null,
    setOperation: (postId: string, op: OperationType) => {}
});



type OperationType = 'LIKE' | 'DELETE';

interface PostOperation {
    postId: string;
    op: OperationType;
}



export const OperationProvider = ({ children }: { children: React.ReactNode }) => {
    const [op, setOp] = useState<PostOperation | null>(null);

    const setOperation = (postId: string, op: OperationType) => {
        setOp({ postId, op });
    }

    useEffect(() => {
        setOp(null);
    }, []);

    return (
        <OperationContext.Provider value={{ op, setOperation }}>
            {children}
        </OperationContext.Provider>
    );
}



export const useOperation = () => useContext(OperationContext);