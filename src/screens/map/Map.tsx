/*
Both react native maps seem to be broken by SDK 52

MapView from 'react-native-maps'
- Will fetch but not display the most recent markers.
- Displays markers from the last region instead.
- Setting a key to the map displays current posts, but forces the map to refresh every time.
- Setting a key to a React fragment causes crashes when moving.

MapClusteredView from 'react-native-map-clustering'
- Crashes when updating markers.

Solution:
- MapClusteredView but with a fragment. For some reason this works.
- Cannot do clustering, however.
*/
/*
Both react native maps seem to be broken by SDK 52

MapView from 'react-native-maps'
- Will fetch but not display the most recent markers.
- Displays markers from the last region instead.
- Setting a key to the map displays current posts, but forces the map to refresh every time.
- Setting a key to a React fragment causes crashes when moving.

MapClusteredView from 'react-native-map-clustering'
- Crashes when updating markers.

Solution:
- MapClusteredView but with a fragment. For some reason this works.
- Cannot do clustering, however.
*/

import React, { useState, useRef, useEffect } from 'react';

import { StyleSheet, View, Animated, Dimensions } from 'react-native';

import { usePostStore } from '@hooks/PostStore';

import MapClusteredView from 'react-native-map-clustering';
import { Region, Marker } from 'react-native-maps';

import PostPreview from './PostPreview';
import PostMarker from './PostMarker';
import LoadingSymbol from './LoadingSymbol';

import { COLORS, TAB_BAR_HEIGHT } from '@util/global-client';

import { fetchWithAuth } from '@util/fetch';
import { requestLocation } from '@util/location';

import { PostType } from '@util/types';



const DEFAULT_REGION = {
    latitude: 34.4929995,
    longitude: -97.6965825,
    latitudeDelta: 10.6008835,
    longitudeDelta: 30.2541415,
};



export default function Map() {
    const addPost = usePostStore(state => state.addPost);
    const removePost = usePostStore(state => state.removePost);

    const mapRef = useRef<MapClusteredView>(null);
    const [mapRegion, setMapRegion] = useState<Region>(DEFAULT_REGION);

    // Does PostStore have a current post?
    // Used in previewing post to check if it is stored.
    const psPosts = usePostStore(state => (state.posts));

    const [loading, setLoading] = useState<boolean>(false);
    const [posts, setPosts] = useState<PostType[]>([]);
    const [selectedPost, setSelectedPost] = useState<PostType | null>(null);
    const slideAnim = useRef(new Animated.Value(0)).current;

    // Every time we fetch new posts, we neither remove current ones nor add new ones to PostStore.
    // We only add and remove posts on opening and closing the preview, respectively.
    const fetchPosts = async () => {
        const screen_bl = {
            lat: mapRegion.latitude - (mapRegion.latitudeDelta/2),
            lng: mapRegion.longitude - (mapRegion.longitudeDelta/2) 
        };
        const screen_tr = {
            lat: mapRegion.latitude + (mapRegion.latitudeDelta/2),
            lng: mapRegion.longitude + (mapRegion.longitudeDelta/2)
        };
        const screenCoords = JSON.stringify({ screen_bl, screen_tr });

        const params = new URLSearchParams({ screenCoords });
        const resJson = await fetchWithAuth(`map?${params}`, 'GET');
        if (resJson.cStatus == 200) {
            setPosts(resJson.posts);
        }
        setLoading(false);
    }

    useEffect(() => {
        fetchPosts();
    }, [mapRegion]);

    const handleChangeRegion = (newRegion: Region) => {
        setMapRegion(newRegion);
    }

    const moveToUser = async () => {
        const { granted, location } = await requestLocation();
        if (!granted || !location) return;

        const newRegion = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
        };
        // TypeScript says "animateToRegion" does not exist on MapView, but it does.
        // Ignore error with any.
        (mapRef.current as any).animateToRegion(newRegion, 500);
        handleChangeRegion(newRegion);
    }

    useEffect(() => {
        moveToUser();
    }, []);


    const openPreview = (post: PostType) => {
        // Add post from PostStore when preview is opened.
        // Only add if it does not already exist.
        // If it does exist, then it is possible that the data may be overwritten.
        // I.e. liking in another screen before opening preview results in like being gone, since preview would overwrite.
        if (psPosts[post.id] === undefined) addPost(post);
        setSelectedPost(post);
        Animated.spring(slideAnim, {
            toValue: 1,
            useNativeDriver: true,
            speed: 9,
            bounciness: 5
        }).start();
    }

    const closePreview = () => {
        Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
            speed: 2,
            bounciness: 1
        }).start(() => {
            // Remove post from PostStore when preview is removed.
            if (selectedPost) removePost(selectedPost.id);
            setSelectedPost(null);
        });
    }

    const handleMapPress = () => {
        if (selectedPost) closePreview();
    }


    return (
        <View style={styles.container}>
            <MapClusteredView
                ref={mapRef}
                style={styles.map}
                initialRegion={mapRegion}
                onRegionChange={() => {if (!loading) setLoading(true);}}
                onRegionChangeComplete={handleChangeRegion}
                showsUserLocation
                mapType='standard'
                onPress={handleMapPress}
            >
                <React.Fragment>
                    {posts.map((p) => {
                        const lat = p.lat ? Number(p.lat) : null;
                        const lng = p.lng ? Number(p.lng) : null;
                        if (lat === null || lng === null) return null;
                        return (
                            <Marker 
                                key={p.id}
                                coordinate={{ latitude: lat, longitude: lng }}
                                zIndex={p.likeCount}
                                tracksViewChanges={false}
                                onPress={() => openPreview(p)}
                                hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                            >
                                <PostMarker post={p} onPress={() => openPreview(p)} />
                            </Marker>
                        );
                    })}
                </React.Fragment>
            </MapClusteredView>

            {selectedPost && (
                <Animated.View
                    style={[styles.previewContainer,
                        { transform: [{
                            translateY: slideAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [Dimensions.get('window').height, (-1 * TAB_BAR_HEIGHT)]
                            })
                        }] }
                    ]}
                >
                    <PostPreview postId={selectedPost.id} closePreview={closePreview} />
                </Animated.View>
            )}
            {loading && <LoadingSymbol />}
        </View>
    );
}



const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    map: {
        flex: 1
    },
    previewContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5
    },
    previewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8
    },
    previewTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.primary
    },
    previewText: {
        fontSize: 16,
        color: '#333'
    }
});