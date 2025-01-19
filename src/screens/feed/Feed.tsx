import React, { useEffect, useState } from 'react';

import { View, Text, TouchableOpacity } from 'react-native';

import { usePostStore } from '@hooks/PostStore';

import { FeedPost } from '@components/post/FeedPost';
import List from '@components/List';
import { CheckIfLoading } from '@components/Loading';

import { COLORS, FONT_SIZES } from '@util/global-client';

import { fetchWithAuth } from '@util/fetch';

import { PostType } from '@util/types';



export default function Feed() {
    const addPost = usePostStore(state => state.addPost);

    const [view, setView] = useState<'hot' | 'new' | 'following' | 'school'>('hot');

    const [loading, setLoading] = useState<boolean>(true);

    const [hotPosts, setHotPosts] = useState<PostType[]>([]);
    const [hotCursor, setHotCursor] = useState<string>('');
    const [moreHotAvailable, setMoreHotAvailable] = useState<boolean>(false);

    const [newPosts, setNewPosts] = useState<PostType[]>([]);
    const [newCursor, setNewCursor] = useState<string>('');
    const [moreNewAvailable, setMoreNewAvailable] = useState<boolean>(false);

    const [followingPosts, setFollowingPosts] = useState<PostType[]>([]);
    const [followingCursor, setFollowingCursor] = useState<string>('');
    const [moreFollowingAvailable, setMoreFollowingAvailable] = useState<boolean>(false);

    const [schoolPosts, setSchoolPosts] = useState<PostType[]>([]);
    const [schoolCursor, setSchoolCursor] = useState<string>('');
    const [moreSchoolAvailable, setMoreSchoolAvailable] = useState<boolean>(false);

    const fetchAndUpdateHot = async (cursor: string, oldPosts: PostType[]) => {
        const params = new URLSearchParams({ cursor });
        const resJson = await fetchWithAuth(`feed/hot?${params.toString()}`, 'GET');
        if (resJson.cStatus == 200) {
            resJson.posts.map((p: any) => addPost(p));
            setHotCursor(resJson.nextCursor);
            setHotPosts([...oldPosts, ...resJson.posts]);
            setMoreHotAvailable(resJson.moreAvailable);
        }
    }

    const fetchAndUpdateNew = async (cursor: string, oldPosts: PostType[]) => {
        const params = new URLSearchParams({ cursor });
        const resJson = await fetchWithAuth(`feed/new?${params.toString()}`, 'GET');
        if (resJson.cStatus == 200) {
            resJson.posts.map((p: any) => addPost(p));
            setNewCursor(resJson.nextCursor);
            setNewPosts([...oldPosts, ...resJson.posts]);
            setMoreNewAvailable(resJson.moreAvailable);
        }
    }

    const fetchAndUpdateFollowing = async (cursor: string, oldPosts: PostType[]) => {
        const params = new URLSearchParams({ cursor });
        const resJson = await fetchWithAuth(`feed/following?${params.toString()}`, 'GET');
        if (resJson.cStatus == 200) {
            resJson.posts.map((p: any) => addPost(p));
            setFollowingCursor(resJson.nextCursor);
            setFollowingPosts([...oldPosts, ...resJson.posts]);
            setMoreFollowingAvailable(resJson.moreAvailable);
        }
    }

    const fetchAndUpdateSchool = async (cursor: string, oldPosts: PostType[]) => {
        const params = new URLSearchParams({ cursor });
        const resJson = await fetchWithAuth(`feed/school?${params.toString()}`, 'GET');
        if (resJson.cStatus == 200) {
            resJson.posts.map((p: any) => addPost(p));
            setSchoolCursor(resJson.nextCursor);
            setSchoolPosts([...oldPosts, ...resJson.posts]);
            setMoreSchoolAvailable(resJson.moreAvailable);
        }
    }

    const renderPost = (post: PostType) => <FeedPost postId={post.id} />;

    const intialFetch = async () => {
        setLoading(true);
        await Promise.all([
            fetchAndUpdateNew('', []),
            fetchAndUpdateHot('', []),
            fetchAndUpdateSchool('', [])
        ]);
        setLoading(false);
    }

    useEffect(() => {
        intialFetch();
    }, []);

    return (
        <>
            <View style={{ paddingVertical: 15, width: '100%', flexDirection: 'row', justifyContent: 'center', gap: 15 }}>
                <TouchableOpacity onPress={() => setView('hot')}>
                    <Text style={{ color: ((view==='hot') ? COLORS.black : COLORS.gray), fontSize: FONT_SIZES.m }}>Hot</Text>
                </TouchableOpacity>

                <Text style={{ color: COLORS.gray, fontSize: FONT_SIZES.m }}>|</Text>

                <TouchableOpacity onPress={() => setView('new')}>
                    <Text style={{ color: ((view==='new') ? COLORS.black : COLORS.gray), fontSize: FONT_SIZES.m }}>New</Text>
                </TouchableOpacity>

                <Text style={{ color: COLORS.gray, fontSize: FONT_SIZES.m }}>|</Text>

                <TouchableOpacity onPress={() => setView('following')}>
                    <Text style={{ color: ((view==='following') ? COLORS.black : COLORS.gray), fontSize: FONT_SIZES.m }}>Following</Text>
                </TouchableOpacity>

                <Text style={{ color: COLORS.gray, fontSize: FONT_SIZES.m }}>|</Text>

                <TouchableOpacity onPress={() => setView('school')}>
                    <Text style={{ color: ((view==='school') ? COLORS.black : COLORS.gray), fontSize: FONT_SIZES.m }}>My School</Text>
                </TouchableOpacity>
            </View>

            <View style={{ width: '100%', height: 5, backgroundColor: COLORS.light_gray }} />

            <CheckIfLoading loading={loading}>
                <>{
                    {
                    'hot':
                        <List<PostType> 
                            items={hotPosts} 
                            cursor={hotCursor} 
                            moreAvailable={moreHotAvailable} 
                            fetchAndUpdate={fetchAndUpdateHot} 
                            renderItem={renderPost}
                            noResultsText='no posts yet'
                        />,
                    'new':
                        <List<PostType> 
                            items={newPosts} 
                            cursor={newCursor} 
                            moreAvailable={moreNewAvailable} 
                            fetchAndUpdate={fetchAndUpdateNew} 
                            renderItem={renderPost}
                            noResultsText='no posts yet'
                        />,
                    'following':
                        <List<PostType> 
                            items={followingPosts} 
                            cursor={followingCursor} 
                            moreAvailable={moreFollowingAvailable} 
                            fetchAndUpdate={fetchAndUpdateFollowing} 
                            renderItem={renderPost}
                            noResultsText='no posts yet'
                        />,
                    'school':
                        <List<PostType> 
                            items={schoolPosts} 
                            cursor={schoolCursor} 
                            moreAvailable={moreSchoolAvailable} 
                            fetchAndUpdate={fetchAndUpdateSchool} 
                            renderItem={renderPost}
                            noResultsText='no posts yet'
                        />
                    }[view]
                }</>
            </CheckIfLoading>
        </>
    );
}