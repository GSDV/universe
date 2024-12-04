import React, { useEffect, useRef, useState } from 'react';

import { Text, View, TouchableOpacity, } from 'react-native';

import { useLocalSearchParams } from 'expo-router';

import FocusedPost from '@components/post/FocusedPost';
import GoBackHeader from '@components/GoBackHeader';

import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';
import AntDesign from '@expo/vector-icons/AntDesign';

import { getAuthCookie } from '@util/storage';

import { AUTH_TOKEN_COOKIE_KEY, DOMAIN } from '@util/global';
import { COLORS, FONT_SIZES, formatInteraction } from '@util/global-client';

import { PostType } from '@util/types';
import { useOperation } from '@components/providers/OperationProvider';
import { useUser } from '@components/providers/UserProvider';
import { FlatList } from 'react-native-gesture-handler';
import { ThreadPost, ThreadReply } from '@components/post/ThreadPost';



// We NEVER fetch the post from the server when loading this page.
// It is ALWAYS passed in as "post" parameter using JSON.stringify() and encodeURI.
export default function Index() {
    const userContext = useUser();

    // Thread of ancestor posts (may be empty)
    const threadStr = useLocalSearchParams().post as string;
    const thread = (!threadStr) ? [] : JSON.parse(decodeURIComponent(threadStr)) as PostType[];

    const postStr = useLocalSearchParams().post as string;
    const post = JSON.parse(decodeURIComponent(postStr)) as PostType;

    const [ancestors, setAncestors] = useState<PostType[] | null>(null);
    const [loadingAncestors, setLoadingAncestors] = useState<boolean>(true);


    const [replies, setReplies] = useState<PostType[] | null>(null);
    const [loadingReplies, setLoadingReplies] = useState<boolean>(true);


    const fetchAncestors = async () => {
        // Post is a root (non-reply) post:
        if (!post.replyToId) {
            setAncestors([]);
            return;
        }

        // Passed in thread of ancestors
        if (thread.length != 0) {
            setAncestors(thread);
            return;
        }

        const res = await fetch(`${DOMAIN}/api/app/post/${post.id}/`, {
            method: 'GET'
        });
    }

    const fetchReplies = async () => {
        if (post.replyCount == 0) {
            setReplies([]);
            return;
        }
    }
    useEffect(() => {
        fetchAncestors();
        fetchReplies();
    }, []);

    return (
        <View style={{ flex: 1, backgroundColor: COLORS.background }}>
            <GoBackHeader />
            <FocusedPost post={post} ownPost={userContext.user?.id === post.author.id} />
        </View>
    );
}



interface RenderPostType extends PostType {
    type: 'ancestor' | 'focused' | 'reply';
}

type RenderItemType = RenderPostType | { id: string, type: 'loading' | 'no-replies' };



function Thread({ userId }: { userId: string }) {
    // Thread of ancestor posts (may be empty)
    const threadStr = useLocalSearchParams().post as string;
    const thread = (!threadStr) ? [] : JSON.parse(decodeURIComponent(threadStr)) as PostType[];

    const postStr = useLocalSearchParams().post as string;
    const post = JSON.parse(decodeURIComponent(postStr)) as PostType;

    const [ancestors, setAncestors] = useState<PostType[]>([]);
    const [loadingAncestors, setLoadingAncestors] = useState<boolean>(true);

    const [replies, setReplies] = useState<PostType[]>([]);
    const [loadingReplies, setLoadingReplies] = useState<boolean>(true);


    const renderableItems: RenderItemType[] = [
        // Loading and displaying ancestors:
        ...(loadingAncestors ? 
            [{ type: 'loading' as const, id: 'loading-ancestors' }]
        :
            ancestors.map((p) => ({ type: 'ancestor' as const, key: `ancestor-${p.id}`, ...p }))
        ),

        // Displaying focused post:
        { type: 'focused' as const, ...post },

        // Loading and displaying replies:
        ...(loadingReplies ? 
            [{ type: 'loading' as const, id: 'loading-replies' }]
        :
            replies.map((p) => ({ type: 'reply' as const, key: `reply-${p.id}`, ...p }))
        ),

        // Displaying "no replies":
        ...(!loadingReplies && replies.length === 0 ? 
            [{ type: 'no-replies' as const, id: 'no-replies' }] 
        : 
            []
        )
    ];


    const fetchAncestors = async () => {
        // Post is a root (non-reply) post:
        if (!post.replyToId) {
            setAncestors([]);
            return;
        }

        // Passed in thread of ancestors
        if (thread.length != 0) {
            setAncestors(thread);
            return;
        }

        const res = await fetch(`${DOMAIN}/api/app/post/${post.id}/`, {
            method: 'GET'
        });
    }

    const fetchReplies = async () => {
        if (post.replyCount == 0) {
            setReplies([]);
            return;
        }
    }
    useEffect(() => {
        fetchAncestors();
        fetchReplies();
    }, []);




    const renderItem = ({ item, index }: { item: RenderItemType, index: number }) => {
        if (item.type === 'focused') {
            const ownPost = (item.author.id === userId);
            // Focused post is the only post in thread:
            if (!item.replyToId) return <ThreadPost post={item} ownPost={ownPost} style='none' />
            return <ThreadPost post={item} ownPost={ownPost} style='up' />
        }

        if (item.type === 'ancestor') {
            const ownPost = (item.author.id === userId);
            // Top of the thread:
            if (!item.replyToId) return <ThreadPost post={item} ownPost={ownPost} style='down' />
            return <ThreadPost post={item} ownPost={ownPost} style='up' />
        }

        if (item.type === 'reply') {
            const ownPost = (item.author.id === userId);
            return <ThreadReply post={item} ownPost={ownPost} />
        }
    

        if (item.type === 'loading') return <Text>Loading</Text>;

        if (item.type === 'no-replies') return <Text>no replies</Text>;
        
        // For TypeScript:
        return <></>;
    }
    
    return (
        <FlatList 
            data={renderableItems} 
            keyExtractor={(item, idx) => item.id} 
            renderItem={renderItem}
        />
    );
}
