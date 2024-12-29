import { View, TouchableOpacity, Pressable, Modal, StyleSheet } from 'react-native';

import { Video } from 'expo-av';
import { Image } from 'expo-image';
import { Entypo } from '@expo/vector-icons';

import { MediaItem } from '@components/post/media/Display';

import { ACCEPTED_IMGS } from '@util/global';



export interface MediaPopUpProps {
    media: MediaItem;
    isVisible: boolean;
    closeModal: () => void;
}



export function UploadedMediaPopUp({ media, isVisible, closeModal }: MediaPopUpProps) {
    return (
        <Modal visible={isVisible} transparent={true} animationType='fade' statusBarTranslucent >
            <Pressable onPress={closeModal} style={styles.overlay}>
                <View style={styles.mediaPopUpContainer}>
                    <Pressable style={{backgroundColor: 'black'}}>
                        {ACCEPTED_IMGS.includes(media.type) ?
                            <Image
                                source={{ uri: media.uri }}
                                contentFit='contain'
                                style={styles.media}
                            />
                        :
                            <Video
                                source={{ uri: media.uri }}
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