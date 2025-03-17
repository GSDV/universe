import { useState, useRef } from 'react';

import { StyleSheet, View, Animated, Dimensions } from 'react-native';

import * as Location from 'expo-location';

import { usePostStore } from '@hooks/PostStore';

import MapView, { Marker, Region } from 'react-native-maps';

import PostPreview from './PostPreview';
import PostMarker from './PostMarker';
import LoadingSymbol from './LoadingSymbol';

import { COLORS, TAB_BAR_HEIGHT } from '@util/global-client';

import { fetchWithAuth } from '@util/fetch';

import { PostType } from '@util/types';
import { useLocation } from '@providers/LocationProvider';



export default function Map() {
    const addPost = usePostStore(state => state.addPost);
    const removePost = usePostStore(state => state.removePost);

    const mapRef = useRef<MapView>(null);
    const mapReady = useRef<boolean>(false);
    // Does PostStore have a current post?
    // Used in previewing post to check if it is stored.
    const psPosts = usePostStore(state => (state.posts));

    const [loading, setLoading] = useState<boolean>(false);
    const [posts, setPosts] = useState<PostType[]>([]);
    const [selectedPost, setSelectedPost] = useState<PostType | null>(null);
    const slideAnim = useRef(new Animated.Value(0)).current;

    const {
        location: currentLocation,
        hasPermission: locationPermissionGranted,
        requestPermission
    } = useLocation();
    

    // Every time we fetch new posts, we neither remove current ones nor add new ones to PostStore.
    // We only add and remove posts on opening and closing the preview, respectively.
    const fetchPosts = async () => {
        setLoading(true);

        const boundingBox = await mapRef.current?.getMapBoundaries();
        if (!boundingBox) return;
        const screen_bl = { lat: boundingBox.southWest.latitude, lng: boundingBox.southWest.longitude };
        const screen_tr = { lat: boundingBox.northEast.latitude, lng: boundingBox.northEast.longitude };
        const screenCoords = JSON.stringify({ screen_bl, screen_tr });

        const params = new URLSearchParams({ screenCoords });
        const resJson = await fetchWithAuth(`map?${params}`, 'GET');

        if (resJson.cStatus == 200) setPosts(resJson.posts);

        setLoading(false);
    }


    const moveToUser = async () => {
        const userLocation: { lat?: number, lng?: number } = {};
        if (locationPermissionGranted && currentLocation) {
            userLocation.lat = currentLocation.coords.latitude
            userLocation.lng = currentLocation.coords.longitude
        } else {
            // Fallback for if currentLocation is null.
            const granted = await requestPermission();
            if (!granted) return;
            const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
            userLocation.lat = loc.coords.latitude
            userLocation.lng = loc.coords.longitude
        }

        const newRegion: Region = {
            latitude: userLocation.lat,
            longitude: userLocation.lng,
            latitudeDelta: 0.04,
            longitudeDelta: 0.04,
        };

        if (mapReady.current && mapRef.current) {
            mapRef.current.animateToRegion(newRegion, 1700);
        } else {
            setTimeout(() => {
                if (mapRef.current) mapRef.current.animateToRegion(newRegion, 700);
            }, 1000);
        }
    }

    const onMapReady = () => {
        mapReady.current = true;
        moveToUser();
    }

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

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={styles.map}
                showsUserLocation
                onRegionChangeComplete={fetchPosts}
                mapType='standard'
                onPress={selectedPost ? closePreview : () => {}}
                userInterfaceStyle='light'
                onMapReady={onMapReady}
            >
                {posts.map((p) => {
                    const lat = p.lat ? Number(p.lat) : null;
                    const lng = p.lng ? Number(p.lng) : null;
                    if (lat === null || lng === null) return null;
                    return (
                        <Marker 
                            key={p.id}
                            coordinate={{ latitude: lat, longitude: lng }}
                            tracksViewChanges={false}
                            onPress={(e) => {
                                e.stopPropagation();
                                openPreview(p)
                            }}
                        >
                            <PostMarker />
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
            height: -2
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