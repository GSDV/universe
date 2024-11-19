// To be used for media that already exists, NOT recently uploaded media like in create post.

import React from 'react';
import { View, StyleSheet, TouchableOpacity, Pressable, Modal } from 'react-native';

import { ResizeMode, Video } from 'expo-av';
import { Image } from 'expo-image';

import Entypo from '@expo/vector-icons/Entypo';

import { ACCEPTED_IMGS } from '@util/global';
import { COLORS, FONT_SIZES, mediaUrl } from '@util/global-client';



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



interface MediaDisplay {
    media: string[]
    handleMediaPress: (input: string) => void
}

export function MediaDisplay({ media, handleMediaPress }: MediaDisplay) {
    const n = media.length;

    if (n == 0) return <></>;

    if (n  == 1) return (
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 15 }}>
            <TouchableOpacity key={media[0] + '-i0'} onPress={() => handleMediaPress(media[0])} style={styles.mediaContainer}>
                <MediaItem mediaItem={media[0]}/>
            </TouchableOpacity>
        </View>
    );

    if (n  == 2) return (
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 15 }}>
            {media.map((asset, index) => (
                <TouchableOpacity key={asset + index} onPress={() => handleMediaPress(asset)} style={styles.mediaContainer}>
                    <MediaItem mediaItem={asset}/>
                </TouchableOpacity>
            ))}
        </View>
    );

    if (n  == 3) return (
        <View style={{ flex: 1, gap: 15 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 15 }}>
                <TouchableOpacity key={media[0] + '-i0'} onPress={() => handleMediaPress(media[0])} style={styles.mediaContainer}>
                    <MediaItem mediaItem={media[0]}/>
                </TouchableOpacity>
                <TouchableOpacity key={media[1] + '-i1'} onPress={() => handleMediaPress(media[1])} style={styles.mediaContainer}>
                    <MediaItem mediaItem={media[1]}/>
                </TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 15 }}>
                <TouchableOpacity key={media[2] + '-i2'} onPress={() => handleMediaPress(media[2])} style={styles.mediaContainer}>
                    <MediaItem mediaItem={media[2]}/>
                </TouchableOpacity>
                <View style={styles.mediaContainer} />
            </View>
        </View>
    );

    return (
        <View style={{ flex: 1, gap: 15 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 15 }}>
                <TouchableOpacity key={media[0] + '-i0'} onPress={() => handleMediaPress(media[0])} style={styles.mediaContainer}>
                    <MediaItem mediaItem={media[0]}/>
                </TouchableOpacity>
                <TouchableOpacity key={media[1] + '-i1'} onPress={() => handleMediaPress(media[1])} style={styles.mediaContainer}>
                    <MediaItem mediaItem={media[1]}/>
                </TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 15 }}>
                <TouchableOpacity key={media[2] + '-i2'} onPress={() => handleMediaPress(media[2])} style={styles.mediaContainer}>
                    <MediaItem mediaItem={media[2]}/>
                </TouchableOpacity>
                <TouchableOpacity key={media[3] + '-i3'} onPress={() => handleMediaPress(media[3])} style={styles.mediaContainer}>
                    <MediaItem mediaItem={media[3]}/>
                </TouchableOpacity>
            </View>
        </View>
    );
}



function MediaItem({ mediaItem }: { mediaItem: string }) {
    return (
        <View style={{ position: 'relative', flex: 1 }}>         
            {ACCEPTED_IMGS.includes('-image') ?
                <Image source={{ uri: mediaUrl(mediaItem) }} style={styles.mediaComponent} />
            :
                <Video source={{ uri: mediaUrl(mediaItem) }} style={styles.mediaComponent} resizeMode={ResizeMode.COVER} />
            }
        </View>
    )
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