import { useState, useRef, useEffect } from 'react';

import { StyleSheet, View, Animated, Dimensions } from 'react-native';

import { useOperation } from '@providers/OperationProvider';

import MapView, { Region, Marker } from 'react-native-maps';

import PostMarker from './PostMarker';
import PostPreview from './PostPreview';

import { COLORS } from '@util/global-client';

import { fetchWithAuth } from '@util/fetch';
import { requestLocation } from '@util/location';

import { PostType } from '@util/types';



const DEFAULT_REGION = {
    latitude: 34.4929995,
    longitude: -97.6965825,
    latitudeDelta: 10.6008835,
    longitudeDelta: 30.2541415,
}



export default function Map() {
    const operationContext = useOperation();

    const mapRef = useRef<MapView>(null);
    const [currentRegion, setCurrentRegion] = useState<Region>(DEFAULT_REGION);

    const [posts, setPosts] = useState<PostType[]>([]);
    const [selectedPost, setSelectedPost] = useState<PostType | null>(null);
    const slideAnim = useRef(new Animated.Value(0)).current;

    const moveToUser = async () => {
        const { granted, location } = await requestLocation();
        if (!granted || !location) return;

        const newRegion = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
        };
        setCurrentRegion(newRegion);
        mapRef.current?.animateToRegion(newRegion, 500);
    }

    useEffect(() => {
        moveToUser();
    }, []);

    const handleChangeRegion = async (newRegion: Region) => {
        const screen_bl = {
            lat: newRegion.latitude - (newRegion.latitudeDelta/2),
            lng: newRegion.longitude - (newRegion.longitudeDelta/2) 
        };
        const screen_tr = {
            lat: newRegion.latitude + (newRegion.latitudeDelta/2),
            lng: newRegion.longitude + (newRegion.longitudeDelta/2)
        };
        const screenCoords = JSON.stringify({ screen_bl, screen_tr });

        const params = new URLSearchParams({ screenCoords });
        const resJson = await fetchWithAuth(`map?${params}`, 'GET');
        setPosts(resJson.posts);
    }

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


    const isFirstRender = useRef<boolean>(true);
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        if (operationContext.lastOperation) setPosts(prev => operationContext.conductOperation(prev, 'map'));
    }, [operationContext.lastOperation]);

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={currentRegion}
                onRegionChangeComplete={handleChangeRegion}
                showsUserLocation
                mapType='standard'
                onPress={handleMapPress}
            >
                {posts.map((p) => {
                    if (p.lat === null || p.lng === null) return null;
                    return (
                        <Marker 
                            key={p.id}
                            coordinate={{ latitude: p.lat, longitude: p.lng }}
                            zIndex={p.likeCount}
                            onPress={(e) => e.stopPropagation()}
                        >
                            <PostMarker post={p} onPress={() => openPreview(p)} />
                        </Marker>
                    );
                })}
            </MapView>

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