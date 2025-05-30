import { View, TouchableOpacity, Pressable, Modal, StyleSheet } from 'react-native';

import { Image } from 'expo-image';
import { useVideoPlayer, VideoView } from 'expo-video'

import { Entypo } from '@expo/vector-icons';

import { UploadedAsset } from './Display';

import { ACCEPTED_IMGS, mediaUrl } from '@util/global';



export interface MediaPopUpProps {
    asset: string;
    isVisible: boolean;
    closeModal: () => void;
}

export function MediaPopUp({ asset, isVisible, closeModal }: MediaPopUpProps) {
    return (
        <Modal visible={isVisible} transparent={true} animationType='fade' statusBarTranslucent >
            <Pressable onPress={closeModal} style={styles.overlay}>
                <View style={styles.mediaPopUpContainer}>
                    <Pressable style={{backgroundColor: 'black'}}>
                        {asset.includes('-image') ?
                            <Image
                                source={{ uri: mediaUrl(asset) }}
                                contentFit='contain'
                                style={styles.media}
                            />
                        :
                            <Video uri={mediaUrl(asset)} />
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



export interface UploadedMediaPopUpProps {
    asset: UploadedAsset;
    isVisible: boolean;
    closeModal: () => void;
}

export function UploadedMediaPopUp({ asset, isVisible, closeModal }: UploadedMediaPopUpProps) {
    return (
        <Modal visible={isVisible} transparent={true} animationType='fade' statusBarTranslucent >
            <Pressable onPress={closeModal} style={styles.overlay}>
                <View style={styles.mediaPopUpContainer}>
                    <Pressable style={{backgroundColor: 'black'}}>
                        {ACCEPTED_IMGS.includes(asset.type) ?
                            <Image
                                source={{ uri: asset.uri }}
                                contentFit='contain'
                                style={styles.media}
                            />
                        :
                            <Video uri={asset.uri} />
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



function Video({ uri }: { uri: string }) {
    const player = useVideoPlayer({ uri }, player => {
        player.loop = true;
        player.play();
    });

    return (
        <VideoView
            style={styles.media}
            player={player}
            allowsFullscreen
            nativeControls
        />
    );
}



const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    closeButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 2
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