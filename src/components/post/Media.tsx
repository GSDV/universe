// To be used for media that already exists, NOT recently uploaded media like in create post.

import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Pressable, Modal } from 'react-native';

import { ResizeMode, Video } from 'expo-av';
import { Image } from 'expo-image';

import Entypo from '@expo/vector-icons/Entypo';

import { COLORS, FONT_SIZES, mediaUrl } from '@util/global-client';



export function MediaDisplay({ media }: { media: string[] }) {
    const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);

    const handleMediaPress = (item: string) => {
        setSelectedMedia(item);
        setIsModalVisible(true);
    };

    const closeModal = () => {
        setIsModalVisible(false);
        setSelectedMedia(null);
    };

    const n = media.length;

    if (n == 0) return <></>;

    return (
        <View style={{ gap: 5 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 5 }}>
                {(n >= 1) && <MediaItem mediaItem={media[0]} handleMediaPress={handleMediaPress} /> }
                {(n >= 2) && <MediaItem mediaItem={media[1]} handleMediaPress={handleMediaPress} /> }

                {/* For only three posts, display them on the same line */}
                {(n == 3) && <MediaItem mediaItem={media[2]} handleMediaPress={handleMediaPress} /> }
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 5 }}>
                {(n == 4) && <MediaItem mediaItem={media[2]} handleMediaPress={handleMediaPress} /> }
                {(n == 4) && <MediaItem mediaItem={media[3]} handleMediaPress={handleMediaPress} /> }
            </View>
            {selectedMedia && <MediaPopUp mediaItem={selectedMedia} isVisible={isModalVisible} closeModal={closeModal} />}
        </View>
    );
}



function MediaItem({ mediaItem, handleMediaPress }: { mediaItem: string, handleMediaPress: (v: string)=>void }) {
    const url = mediaUrl(mediaItem);

    return (
        <TouchableOpacity onPress={() => handleMediaPress(mediaItem)} style={styles.mediaContainer}>
            <View style={{ position: 'relative', flex: 1 }}>         
                {mediaItem.includes('-image') ?
                    <Image source={{ uri: url }} style={styles.mediaComponent} />
                :
                    <Video source={{ uri: url }} style={styles.mediaComponent} resizeMode={ResizeMode.COVER} />
                }
            </View>
        </TouchableOpacity>
    );
}



interface MediaPopUpProps {
    mediaItem: string;
    isVisible: boolean;
    closeModal: () => void;
}

export function MediaPopUp({ mediaItem, isVisible, closeModal }: MediaPopUpProps) {
    return (
        <Modal visible={isVisible} transparent={true} animationType='fade' statusBarTranslucent >
            <Pressable onPress={closeModal} style={styles.overlay}>
                <View style={styles.mediaPopUpContainer}>
                    <Pressable style={{backgroundColor: 'black'}}>
                        {mediaItem.includes('-image') ?
                            <Image
                                source={{ uri: mediaUrl(mediaItem) }}
                                contentFit='contain'
                                style={styles.media}
                            />
                        :
                            <Video
                                source={{ uri: mediaUrl(mediaItem) }}
                                style={styles.media}
                                useNativeControls 
                                shouldPlay 
                            />
                        }
                    </Pressable>
                </View>

                <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                    <Entypo name='cross' size={35} color='white' />
                </TouchableOpacity>
            </Pressable>
        </Modal>
    );
}



// For displaing media on feed, take out pop-up onPress functionality.
// If a user taps on media of a feed post, just have the default feed post onPress of opening in focus view.
export function FeedMediaDisplay({ media }: { media: string[] }) {
    const n = media.length;

    if (n == 0) return <></>;

    return (
        <View style={{ gap: 5 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 5 }}>
                {(n >= 1) && <FeedMediaItem mediaItem={media[0]} /> }
                {(n >= 2) && <FeedMediaItem mediaItem={media[1]} /> }

                {/* For only three posts, display them on the same line */}
                {(n == 3) && <FeedMediaItem mediaItem={media[2]} /> }
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 5 }}>
                {(n == 4) && <FeedMediaItem mediaItem={media[2]} /> }
                {(n == 4) && <FeedMediaItem mediaItem={media[3]} /> }
            </View>
        </View>
    );
}



function FeedMediaItem({ mediaItem }: { mediaItem: string }) {
    const url = mediaUrl(mediaItem);

    return (
        <View style={styles.mediaContainer}>
            <View style={{ position: 'relative', flex: 1 }}>         
                {mediaItem.includes('-image') ?
                    <Image source={{ uri: url }} style={styles.mediaComponent} />
                :
                    <Video source={{ uri: url }} style={styles.mediaComponent} resizeMode={ResizeMode.COVER} />
                }
            </View>
        </View>
    );
}



const styles = StyleSheet.create({
    header: {
        position: 'relative',
        padding: 10,
        paddingVertical: 5,
        display: 'flex',
        flexDirection: 'row',
        gap: 15,
        alignItems: 'center'
    },
    pfp: {
        borderRadius: 50,
        width: 50,
        height: 50
    },
    displayName: {
        color: COLORS.black,
        fontSize: FONT_SIZES.m,
        fontWeight: 900
    },
    username: {
        color: COLORS.gray,
        fontSize: FONT_SIZES.m
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 2
    },
    mediaContainer: {
        flex: 1,
        aspectRatio: 1
    },
    mediaComponent: {
        flex: 1,
        aspectRatio: 1,
        borderRadius: 8,
        backgroundColor: 'black',
        overflow: 'hidden'
    },
    mediaPopUpContainer: {
        width: '80%',
        height: '70%',
        backgroundColor: 'transparent',
        borderRadius: 8,
        overflow: 'hidden',
    },
    media: {
        width: '100%',
        height: '100%',
    }
});