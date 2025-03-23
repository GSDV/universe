// PostStore is used for ensuring two instances of the same post are synced.
// e.g. if the user likes one instance, the other should also appear as liked.

import { create } from 'zustand';

import { PostType } from '@util/types';



interface PostStore {
    posts: Record<string, PostType>;
    addPost: (post: PostType) => void;
    updatePost: (postId: string, updates: Partial<PostType>) => void;
    removePost: (postId: string) => void;
    redactPost: (postId: string) => void;
}

export const usePostStore = create<PostStore>((set) => ({
    posts: {},

    addPost: (post) => (
        set((state) => ({
            posts: {
                ...state.posts,
                [post.id]: post,
            },
        }))
    ),

    updatePost: (postId, updates) => (
        set((state) => ({
            posts: {
                ...state.posts,
                [postId]: {
                    ...state.posts[postId],
                    ...updates,
                },
            },
        }))
    ),

    removePost: (postId) => (
        set((state) => {
            const newPosts = { ...state.posts };
            delete newPosts[postId];
            return { posts: newPosts };
        })
    ),

    redactPost: (postId) => (
        set((state) => ({
            posts: {
                ...state.posts,
                [postId]: {
                    ...state.posts[postId],
                    content: '',
                    media: [],
                    deleted: true
                },
            },
        }))
    )
}));



export const usePost = (postId: string): (undefined | PostType) => usePostStore((state) => state.posts[postId]);



// Hook for post actions
export const usePostActions = () => {
    return usePostStore((state) => ({
        updatePost: state.updatePost,
        removePost: state.removePost,
        redactPost: state.redactPost
    }));
};