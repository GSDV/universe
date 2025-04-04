import { Fragment, useEffect, useState, memo, useCallback } from 'react';
import { View, TouchableOpacity, StyleSheet, Pressable, ActivityIndicator } from 'react-native';

import * as VideoThumbnails from 'expo-video-thumbnails';
import { Image } from 'expo-image';
import { Entypo } from '@expo/vector-icons';

import { MediaPopUp, UploadedMediaPopUp } from './PopUp';

import { ACCEPTED_IMGS, mediaUrl } from '@util/global';
import { COLORS } from '@util/global-client';

// Memoized version of the DisplayMedia component
export const DisplayMedia = memo(({ media }: { media: string[] }) => {
    if (media.length === 0) return <Fragment></Fragment>;

    const [selectedMedia, setSelectedMedia] = useState<string>('');
    const [isMediaModalVisible, setIsMediaModalVisible] = useState(false);

    const openModal = useCallback((item: string) => {
        setSelectedMedia(item);
        setIsMediaModalVisible(true);
    }, []);

    const closeModal = useCallback(() => {
        setIsMediaModalVisible(false);
        setSelectedMedia('');
    }, []);

    return (
        <View style={styles.displayContainer}>
            <View style={styles.displayRow}>
                {media.slice(0, 2).map((asset, i) => (
                    <Media key={`${asset}-${i}`} onPress={() => openModal(asset)} asset={asset} />
                ))}
                {/* If exactly three images, display them in a row */}
                {media.length==3 && <Media key={`${media[2]}-2`} onPress={() => openModal(media[2])} asset={media[2]} />}
            </View>

            {media.length==4 &&
                <View style={styles.displayRow}>
                    {media.slice(2).map((asset, i) => (
                        <Media key={`${asset}-${i}`} onPress={() => openModal(asset)} asset={asset} />
                    ))}
                </View>
            }

            {selectedMedia && <MediaPopUp asset={selectedMedia} isVisible={isMediaModalVisible} closeModal={closeModal} />}
        </View>
    );
});

// Memoized Media component
const Media = memo(({ asset, onPress }: { asset: string, onPress: ()=>void }) => {
    const isImage = asset.includes('-image');
    
    return (
        <Pressable onPress={onPress} style={styles.container}>
            <View style={{ position: 'relative', flex: 1 }}>
                {isImage ?
                    <Image
                        source={{ uri: mediaUrl(asset) }}
                        contentFit='cover'
                        style={styles.asset}
                        cachePolicy='memory'
                    />
                :
                    <VideoThumbnail uri={mediaUrl(asset)} />
                }
            </View>
        </Pressable>
    );
});

// Memoized VideoThumbnail component
const VideoThumbnail = memo(({ uri }: { uri: string }) => {
    const [thumbnailUri, setThumbnailUri] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<boolean>(false);

    useEffect(() => {
        let isMounted = true;
        
        const loadThumbnail = async () => {
            try {
                const { uri: thumbnail } = await VideoThumbnails.getThumbnailAsync(uri, {
                    quality: 0.5, // Lower quality for faster loading
                });
                
                if (isMounted) {
                    setThumbnailUri(thumbnail);
                    setIsLoading(false);
                }
            } catch (e) {
                if (isMounted) {
                    setError(true);
                    setIsLoading(false);
                }
            }
        };
        
        loadThumbnail();
        
        return () => {
            isMounted = false;
        };
    }, [uri]);

    if (isLoading) return (
        <View style={{ width: '100%', height: '100%', borderRadius: 8, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size='small' color={COLORS.primary} />
        </View>
    );

    if (error || thumbnailUri === '') return (
        <View style={{ width: '100%', height: '100%', borderRadius: 8, backgroundColor: COLORS.light_gray, justifyContent: 'center', alignItems: 'center' }}>
            <Entypo name="video" size={24} color={COLORS.gray} />
        </View>
    );

    return (
        <Image
            source={{ uri: thumbnailUri }}
            style={styles.asset}
            contentFit='cover'
            cachePolicy='memory'
        />
    );
});

// Rest of your components with similar optimizations...

export interface UploadedAsset {
    uri: string;
    type: string;
}

interface MediaDisplayProps {
    media: UploadedAsset[];
    removeMedia: (input: number) => void;
}

// Memoized version of DisplayUploadedMedia
export const DisplayUploadedMedia = memo(({ media, removeMedia }: MediaDisplayProps) => {
    if (media.length === 0) return <Fragment></Fragment>;

    const [selectedMedia, setSelectedMedia] = useState<UploadedAsset | null>(null);
    const [isMediaModalVisible, setIsMediaModalVisible] = useState(false);

    const openModal = useCallback((item: UploadedAsset) => {
        setSelectedMedia(item);
        setIsMediaModalVisible(true);
    }, []);

    const closeModal = useCallback(() => {
        setIsMediaModalVisible(false);
        setSelectedMedia(null);
    }, []);

    return (
        <View style={styles.displayContainer}>
            <View style={styles.displayRow}>
                {media.slice(0, 2).map((asset, i) => (
                    <UploadedMedia key={`${asset.uri}-${i}`} onPress={() => openModal(asset)} asset={asset} remove={() => removeMedia(i)}/>
                ))}

                {/* If exactly three images, display them in a row */}
                {media.length==3 && <UploadedMedia key={`${media[2].uri}-2`} onPress={() => openModal(media[2])} asset={media[2]} remove={() => removeMedia(2)}/>}
            </View>

            {media.length==4 &&
                <View style={styles.displayRow}>
                    {media.slice(2).map((asset, i) => (
                        <UploadedMedia key={`${asset.uri}-${i+2}`} onPress={() => openModal(asset)} asset={asset} remove={() => removeMedia(i+2)}/>
                    ))}
                </View>
            }

            {selectedMedia && <UploadedMediaPopUp asset={selectedMedia} isVisible={isMediaModalVisible} closeModal={closeModal} />}
        </View>
    );
});

// Memoized UploadedMedia component
const UploadedMedia = memo(({ asset, remove, onPress }: { asset: UploadedAsset, remove: ()=>void, onPress: ()=>void }) => {
    const isImage = ACCEPTED_IMGS.includes(asset.type);
    
    return (
        <Pressable onPress={onPress} style={styles.container}>
            <View style={{ position: 'relative', flex: 1 }}>
                <Pressable onPress={remove} style={{ position: 'absolute', right: -10, top: -10, borderRadius: 50, backgroundColor: COLORS.background, overflow: 'hidden', zIndex: 5 }}>
                    <Entypo name='circle-with-minus' size={25} color='red' />
                </Pressable>
                
                {isImage ?
                    <Image
                        source={{ uri: asset.uri }}
                        style={styles.asset}
                        contentFit='cover'
                        cachePolicy='memory'
                    />
                :
                    <VideoThumbnail uri={asset.uri} />
                }
            </View>
        </Pressable>
    );
});

const styles = StyleSheet.create({
    displayContainer: {
        width: '100%',
        gap: 15
    },
    displayRow: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-around',
        gap: 15
    },
    container: {
        aspectRatio: 1,
        flex: 1
    },
    asset: {
        width: '100%',
        height: '100%',
        borderRadius: 8,
        backgroundColor: 'black',
        overflow: 'hidden'
    },
    mediaPopUpContainer: {
        width: '80%',
        height: '70%',
        backgroundColor: 'transparent',
        borderRadius: 8,
        overflow: 'hidden'
    },
    media: {
        width: '100%',
        height: '100%'
    }
});