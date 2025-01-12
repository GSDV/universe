import React, { createContext, useCallback, useContext, useState } from 'react';



interface Params {
    postParam: string;
    threadParam: string;
}

interface PostStoreType {
    addPost: (postId: string, params: Params) => void;
    removePost: (postId: string) => void;
    getPost: (postId: string) => Params | undefined;
}
  
const PostStoreContext = createContext<PostStoreType | undefined>(undefined);



export function PostStoreProvider({ children }: { children: React.ReactNode }) {
    const [store, setStore] = useState<Map<string, Params>>(new Map());

    const addPost = useCallback((postId: string, params: Params) => {
        setStore(prev => {
            const newStore = new Map(prev);
            newStore.set(postId, params);
            return newStore;
        });
    }, []);

    const removePost = useCallback((postId: string) => {
        setStore(prev => {
            const newStore = new Map(prev);
            newStore.delete(postId);
            return newStore;
        });
    }, []);

    const getPost = useCallback((postId: string) => {
        return store.get(postId);
    }, [store]);

    return (
        <PostStoreContext.Provider value={{ addPost, removePost, getPost }}>
            {children}
        </PostStoreContext.Provider>
    );
}



export const usePostStore = () => {
    const context = useContext(PostStoreContext);
    if (context === undefined) throw new Error('usePostStore must be used within a PostStoreProvider.');
    return context;
}