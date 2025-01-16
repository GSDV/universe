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

import MapClusteredView from 'react-native-map-clustering';
import { Region, Marker } from 'react-native-maps';

import PostPreview from './PostPreview';
import PostMarker from './PostMarker';
import LoadingSymbol from './LoadingSymbol';

import { COLORS } from '@util/global-client';

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
    const mapRef = useRef<MapClusteredView>(null);
    const [mapRegion, setMapRegion] = useState<Region>(DEFAULT_REGION);

    const [loading, setLoading] = useState<boolean>(false);
    const [posts, setPosts] = useState<PostType[]>([]);
    const [selectedPost, setSelectedPost] = useState<PostType | null>(null);
    const slideAnim = useRef(new Animated.Value(0)).current;

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
            speed: 9,
            bounciness: 1
        }).start(() => setSelectedPost(null));
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
                                onPress={(e) => e.stopPropagation()}
                                tracksViewChanges={false}
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
                                outputRange: [Dimensions.get('window').height, 0]
                            })
                        }] }
                    ]}
                >
                    <PostPreview post={selectedPost} closePreview={closePreview} />
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