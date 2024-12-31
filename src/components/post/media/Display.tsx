import { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Pressable } from 'react-native';

import { ResizeMode, Video } from 'expo-av';
import { Image } from 'expo-image';
import { Entypo } from '@expo/vector-icons';

import { MediaPopUp, UploadedMediaPopUp } from './PopUp';

import { ACCEPTED_IMGS, mediaUrl } from '@util/global';
import { COLORS } from '@util/global-client';



export function DisplayMedia({ media }: { media: string[] }) {
    if (media.length === 0) return <></>;

    const [selectedMedia, setSelectedMedia] = useState<string>('');
    const [isMediaModalVisible, setIsMediaModalVisible] = useState(false);

    const openModal = (item: string) => {
        setSelectedMedia(item);
        setIsMediaModalVisible(true);
    }

    const closeModal = () => {
        setIsMediaModalVisible(false);
        setSelectedMedia('');
    }

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
}



function Media({ asset, onPress }: { asset: string, onPress: ()=>void }) {
    return (
        <TouchableOpacity onPress={onPress} style={styles.container}>
            <View style={{ position: 'relative', flex: 1 }}>
                {asset.includes('-image') ?
                    <Image
                        source={{ uri: mediaUrl(asset) }}
                        contentFit='cover'
                        style={styles.asset}
                    />
                :
                    <Video
                        source={{ uri: mediaUrl(asset) }}
                        style={styles.asset}
                        useNativeControls 
                        shouldPlay 
                        resizeMode={ResizeMode.COVER}
                    />
                }
            </View>
        </TouchableOpacity>
    );
}



export interface UploadedAsset {
    uri: string;
    type: string;
}

interface MediaDisplayProps {
    media: UploadedAsset[];
    removeMedia: (input: number) => void;
}

export function DisplayUploadedMedia({ media, removeMedia }: MediaDisplayProps) {
    if (media.length === 0) return <></>;

    const [selectedMedia, setSelectedMedia] = useState<UploadedAsset | null>(null);
    const [isMediaModalVisible, setIsMediaModalVisible] = useState(false);

    const openModal = (item: UploadedAsset) => {
        setSelectedMedia(item);
        setIsMediaModalVisible(true);
    }

    const closeModal = () => {
        setIsMediaModalVisible(false);
        setSelectedMedia(null);
    }

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
                        <UploadedMedia key={`${asset.uri}-${i}`} onPress={() => openModal(asset)} asset={asset} remove={() => removeMedia(i)}/>
                    ))}
                </View>
            }

            {selectedMedia && <UploadedMediaPopUp asset={selectedMedia} isVisible={isMediaModalVisible} closeModal={closeModal} />}
        </View>
    );
}



function UploadedMedia({ asset, remove, onPress }: { asset: UploadedAsset, remove: ()=>void, onPress: ()=>void }) {
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