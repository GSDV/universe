import { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Pressable } from 'react-native';

import { ResizeMode, Video } from 'expo-av';
import { Image } from 'expo-image';
import { Entypo } from '@expo/vector-icons';

import { UploadedMediaPopUp } from './PopUp';

import { ACCEPTED_IMGS } from '@util/global';
import { COLORS } from '@util/global-client';



export interface MediaItem {
    uri: string;
    type: string,
}

interface MediaDisplayProps {
    media: MediaItem[]
    removeMedia: (input: number) => void
}



export function DisplayUploadedMedia({media, removeMedia}: MediaDisplayProps) {
    const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
    const [isMediaModalVisible, setIsMediaModalVisible] = useState(false);

    const openModal = (item: MediaItem) => {
        setSelectedMedia(item);
        setIsMediaModalVisible(true);
    }

    const closeModal = () => {
        setIsMediaModalVisible(false);
        setSelectedMedia(null);
    }

    return (
        <>
            <View style={styles.displayContainer}>
                {media.slice(0, 2).map((asset, i) => (
                    <UploadedMedia key={`${asset.uri}-${i}`} onPress={() => openModal(asset)} asset={asset} remove={() => removeMedia(i)}/>
                ))}
                {media.length==1 && <View style={styles.container} />}
            </View>

            <View style={styles.displayContainer}>
                {media.slice(2).map((asset, i) => (
                    <UploadedMedia key={`${asset.uri}-${i}`} onPress={() => openModal(asset)} asset={asset} remove={() => removeMedia(i)}/>
                ))}
                {media.length==3 && <View style={styles.container} />}
            </View>

            {selectedMedia && <UploadedMediaPopUp media={selectedMedia} isVisible={isMediaModalVisible} closeModal={closeModal} />}
        </>
    );
}



function UploadedMedia({ asset, remove, onPress }: { asset: MediaItem, remove: ()=>void, onPress: ()=>void }) {
    return (
        <TouchableOpacity onPress={onPress} style={styles.container}>
            <View style={{ position: 'relative', flex: 1 }}>
                <Pressable onPress={remove} style={{ position: 'absolute', right: -10, top: -10, borderRadius: 50, backgroundColor: COLORS.background, overflow: 'hidden', zIndex: 5 }}>
                    <Entypo name='circle-with-minus' size={25} color='red' />
                </Pressable>
                
                {ACCEPTED_IMGS.includes(asset.type) ?
                    <Image source={{ uri: asset.uri }} style={styles.asset} />
                :
                    <Video 
                        source={{ uri: asset.uri }} style={styles.asset} 
                        resizeMode={ResizeMode.COVER}
                    />
                }
            </View>
        </TouchableOpacity>
    );
}



const styles = StyleSheet.create({
    displayContainer: {
        padding: 10,
        gap: 20,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-around'
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