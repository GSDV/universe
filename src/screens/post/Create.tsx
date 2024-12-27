import React, { useState } from 'react';

import { Switch, Text, View, StyleSheet, TouchableOpacity, TextInput, Keyboard, Pressable, Modal, ScrollView } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useOperation } from '@components/providers/OperationProvider';

import { ResizeMode, Video } from 'expo-av';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';

import Ionicons from '@expo/vector-icons/Ionicons';
import Feather from '@expo/vector-icons/Feather';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Entypo from '@expo/vector-icons/Entypo';

import { Alert, AlertType } from '@components/Alert';
import { CheckIfLoading } from '@components/Loading';

import { ACCEPTED_FILES, ACCEPTED_IMGS, ACCEPTED_VIDS, IMG_SIZE_LIMIT, IMG_SIZE_LIMIT_TXT, VID_SIZE_LIMIT, VID_SIZE_LIMIT_TXT, DOMAIN, AUTH_TOKEN_COOKIE_KEY, MAX_POST_CONTENT_LENGTH, MAX_POST_MEDIA, MIN_POST_CONTENT_LENGTH } from '@util/global';
import { COLORS, DEFAULT_PFP, FONT_SIZES, imgUrl } from '@util/global-client';

import { clientUploadMediaAndGetKeys, promptMediaPermissions } from '@util/s3';
import { getAuthCookie } from '@util/storage';
import { requestLocation } from '@util/location';
import { PostDataInput, RedactedUserType } from '@util/types';



type MediaItem = {
    uri: string;
    type: string,
}



export default function CreatePostScreen({ userPrisma }: { userPrisma: RedactedUserType }) {
    const router = useRouter();

    const operationContext = useOperation();

    const [loading, setLoading] = useState<boolean>(false);
    const [loadingMedia, setLoadingMedia] = useState<boolean>(false);
    const [alert, setAlert] = useState<AlertType | null>(null);

    const [content, setContent] = useState<string>('');
    const [media, setMedia] = useState<MediaItem[]>([]);
    const [includesLocation, setIncludesLocation] = useState<boolean>(true);

    const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);

    const validContent: boolean = (content.replace(/\s+/g, '').length >= MIN_POST_CONTENT_LENGTH);
    const canSubmit: boolean = (validContent && !loading && !loadingMedia);


    const handleMediaPress = (item: MediaItem) => {
        setSelectedMedia(item);
        setIsModalVisible(true);
    };

    const closeModal = () => {
        setIsModalVisible(false);
        setSelectedMedia(null);
    };

    const handleInput = (input: string) => setContent((input.length > MAX_POST_CONTENT_LENGTH) ? input.slice(0, MAX_POST_CONTENT_LENGTH) : input);

    const uploadMedia = async () => {
        if (media.length >= MAX_POST_MEDIA) return;

        const havePermissions = await promptMediaPermissions();
        if (!havePermissions) return;

        setLoadingMedia(true);

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsMultipleSelection: true,
            orderedSelection: true,
            selectionLimit: (MAX_POST_MEDIA-media.length),
            quality: 1
        });
        if (result.canceled) {
            setLoadingMedia(false);
            return;
        }

        const assets = result.assets.filter((asset) => asset.mimeType !== undefined);

        for (let i = 0; i < assets.length; i++) {
            const asset = assets[i];
            const type = asset.mimeType;
            if (type==undefined || !ACCEPTED_FILES.includes(type)) {
                setAlert({ msg: `Please only upload png, jpg, webp, mp4, or mov files.`, cStatus: 400 });
                setLoadingMedia(false);
                return;
            }
            if (ACCEPTED_IMGS.includes(asset.type as string) && (asset.fileSize ? asset.fileSize : 0) > IMG_SIZE_LIMIT) {
                setAlert({ msg: `Please upload pictures under ${IMG_SIZE_LIMIT_TXT}.`, cStatus: 400 });
                setLoadingMedia(false);
                return;
            }
            if (ACCEPTED_VIDS.includes(asset.type as string) && (asset.fileSize ? asset.fileSize : 0) > VID_SIZE_LIMIT) {
                setAlert({ msg: `Please upload videos under ${VID_SIZE_LIMIT_TXT}.`, cStatus: 400 });
                setLoadingMedia(false);
                return;
            }
        }

        const newMedia: MediaItem[] = assets.map((asset) => ({ uri: asset.uri, type: (asset.mimeType as string) }));
        setMedia([...media, ...newMedia]);
        setLoadingMedia(false);
    }

    const removeMedia = (index: number) => {
        setMedia(prevItems => prevItems.filter((_, i) => i !== index));
    }

    const attemptPost = async () => {
        setLoading(true);
        setAlert(null);
        Keyboard.dismiss();

        let location: { 
            lat?: number, 
            lng?: number 
        } = {}
        if (includesLocation) {
            const loc = await requestLocation();
            if (!loc.granted || loc.location == null) return;
            location.lat = loc.location.coords.latitude;
            location.lng = loc.location.coords.longitude;
        }

        const blobPromises = media.map(async (asset) => {
            try {
                const response = await fetch(asset.uri);
                const blob = await response.blob();
                return blob;
            } catch (error) {
                setAlert({ msg: `Something went wrong while uploading media.`, cStatus: 400 });
                return null;
            }
        });
        const resBlobs = await Promise.all(blobPromises);
        const filteredBlobs = resBlobs.filter(blob => blob !== null);
        const mediaKeys = await clientUploadMediaAndGetKeys(filteredBlobs);
        if (!mediaKeys) {
            setAlert({ msg: `Please upload photos under ${IMG_SIZE_LIMIT_TXT} and videos under ${VID_SIZE_LIMIT_TXT}.`, cStatus: 400 });
            setLoading(false);
            return;
        }

        const postDataInput: PostDataInput = {
            content: content,
            hasLocation: includesLocation,
            ...location,
            media: mediaKeys
        }
        
        const authTokenCookie = await getAuthCookie();
        const res = await fetch(`${DOMAIN}/api/app/post`, {
            method: 'POST',
            body: JSON.stringify({ postDataInput }),
            headers: {
                'Content-Type': 'application/json',
                'Cookie': `${AUTH_TOKEN_COOKIE_KEY}=${authTokenCookie}`
            }
        });
        const resJson = await res.json();

        if (resJson.cStatus == 200) {
            operationContext.emitOperation({ name: 'CREATE', postData: resJson.post })
            const postParam = encodeURIComponent(JSON.stringify(resJson.post));
            router.replace({ pathname: `/post/[postId]/view`, params: {postId: resJson.postId, postParam} });
        } else {
            setAlert(resJson);
            setLoading(false);
        }
    }

    return (
        <Pressable onPress={Keyboard.dismiss} style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={{ flex: 1, paddingBottom: useSafeAreaInsets().bottom }}>
            <Header userPrisma={userPrisma} attemptPost={attemptPost} canSubmit={canSubmit} />
            <CheckIfLoading loading={loading}>
            <View style={{ flex: 1, padding: 20, gap: 30 }}>
                <View style={{ flex: 3, gap: 3 }}>
                    {alert && <Alert alert={alert} />}

                    <View style={{width: '100%', height: 1, backgroundColor: '#cfcfcf'}} />
                    <TextInput
                        style={{ flex: 1, padding: 5, fontSize: FONT_SIZES.l, color: COLORS.black }} 
                        placeholder={`What's happening?`} 
                        value={content} 
                        onChangeText={handleInput} 
                        multiline={true} 
                        maxLength={MAX_POST_CONTENT_LENGTH}
                        textAlignVertical='top'
                    />
                    <Text style={{ color: (validContent ? COLORS.gray : 'red'), fontSize: FONT_SIZES.m }}>{content.length}/{MAX_POST_CONTENT_LENGTH} characters</Text>
                    <View style={{ width: '100%', height: 1, backgroundColor: '#cfcfcf' }} />
                </View>

                <View style={{ width: '100%', gap: 5 }}>
                    <View style={{ width: '100%', flexDirection: 'row', gap: 5, alignItems: 'center' }}>
                        <Text style={{ color: COLORS.black, fontSize: FONT_SIZES.l }}>Location: </Text>
                        <Switch
                            style={{ transform: [{scaleX: .8}, {scaleY: .8}] }}
                            trackColor={{ true: COLORS.primary_1 }}
                            onValueChange={() => setIncludesLocation((prev)=>!prev)}
                            value={includesLocation}
                        />
                    </View>
                    {includesLocation && <Text style={{ color: COLORS.gray, fontSize: FONT_SIZES.m }}>your post will appear on the map</Text>}
                </View>

                <View style={{ flex: 7, gap: 10 }}>
                    <CheckIfLoading loading={loadingMedia}>
                        <TouchableOpacity disabled={media.length==MAX_POST_MEDIA} style={{ flexDirection: 'row', alignItems: 'center', maxWidth: 150, gap: 5 }} onPress={uploadMedia}>
                            <Text style={{ fontSize: FONT_SIZES.l, color: (media.length<MAX_POST_MEDIA ? COLORS.primary_1 : COLORS.gray) }}>Add Media</Text>
                            <MaterialIcons name='add-photo-alternate' size={25} color={media.length<MAX_POST_MEDIA ? COLORS.primary_1 : COLORS.gray} />
                        </TouchableOpacity>
                        <MediaDisplay media={media} handleMediaPress={handleMediaPress} removeMedia={removeMedia} />
                        {selectedMedia && <MediaPopUp media={selectedMedia} isVisible={isModalVisible} closeModal={closeModal} />}
                    </CheckIfLoading>
                </View>
            </View>
            </CheckIfLoading>
            </ScrollView>
        </Pressable>
    );
}



function Header({ userPrisma, attemptPost, canSubmit }: { userPrisma: RedactedUserType, attemptPost: ()=>void, canSubmit: boolean }) {
    const router = useRouter();

    const sendStyles = canSubmit ? COLORS.primary_1 : COLORS.gray;

    return (
        <View style={styles.header}>
            <TouchableOpacity onPress={router.back}>
                <Ionicons name='chevron-back' size={25} color={COLORS.primary_1} />
            </TouchableOpacity>

            <View style={{ flex: 1, display: 'flex', flexDirection: 'row', gap: 5, alignItems: 'center' }}>
                <Pfp pfpKey={userPrisma.pfpKey} />
                <View style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Text style={styles.displayName}>{userPrisma.displayName}</Text>
                    <Text style={styles.username}>@{userPrisma.username}</Text>
                </View>
            </View>

            <TouchableOpacity disabled={!canSubmit} onPress={attemptPost}>
                <Feather name='send' size={25} color={sendStyles} />
            </TouchableOpacity>
        </View>
    );
}



function Pfp({ pfpKey }: { pfpKey: string }) {
    return (
        <>{pfpKey=='' ? 
            <Image style={styles.pfp} source={DEFAULT_PFP} />
        :
            <Image style={styles.pfp} source={{ uri: imgUrl(pfpKey) }} />
        }</>
    );
}



function Media({ media, remove }: { media: MediaItem, remove: ()=>void }) {
    return (
        <View style={{ position: 'relative', flex: 1 }}>
            <Pressable onPress={remove} style={{ position: 'absolute', right: -10, top: -10, borderRadius: 50, backgroundColor: COLORS.background, overflow: 'hidden', zIndex: 5 }}>
                <Entypo name='circle-with-minus' size={25} color='red' />
            </Pressable>
            
            {ACCEPTED_IMGS.includes(media.type) ?
                <Image source={{ uri: media.uri }} style={styles.mediaComponent} />
            :
                <Video 
                    source={{ uri: media.uri }} style={styles.mediaComponent} 
                    resizeMode={ResizeMode.COVER}
                />
            }
        </View>
    )
}


interface MediaPopUpProps {
    media: MediaItem;
    isVisible: boolean;
    closeModal: () => void;
}

function MediaPopUp({ media, isVisible, closeModal }: MediaPopUpProps) {
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



interface MediaDisplay {
    media: MediaItem[]
    handleMediaPress: (input: MediaItem) => void
    removeMedia: (input: number) => void
}

function MediaDisplay({ media, handleMediaPress, removeMedia }: MediaDisplay) {
    const n = media.length;

    if (n == 0) return <></>;

    if (n  == 1) return (
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 15 }}>
            <TouchableOpacity key={media[0].uri + '-0'} onPress={() => handleMediaPress(media[0])} style={styles.mediaContainer}>
                <Media media={media[0]} remove={()=>removeMedia(0)}/>
            </TouchableOpacity>
        </View>
    );

    if (n  == 2) return (
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 15 }}>
            {media.map((asset, index) => (
                <TouchableOpacity key={asset.uri + index} onPress={() => handleMediaPress(asset)} style={styles.mediaContainer}>
                    <Media media={asset} remove={()=>removeMedia(index)}/>
                </TouchableOpacity>
            ))}
        </View>
    );

    if (n  == 3) return (
        <View style={{ flex: 1, gap: 15 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 15 }}>
                <TouchableOpacity key={media[0].uri + '-i0'} onPress={() => handleMediaPress(media[0])} style={styles.mediaContainer}>
                    <Media media={media[0]} remove={()=>removeMedia(0)}/>
                </TouchableOpacity>
                <TouchableOpacity key={media[1].uri + '-i1'} onPress={() => handleMediaPress(media[1])} style={styles.mediaContainer}>
                    <Media media={media[1]} remove={()=>removeMedia(1)}/>
                </TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 15 }}>
                <TouchableOpacity key={media[2].uri + '-i2'} onPress={() => handleMediaPress(media[2])} style={styles.mediaContainer}>
                    <Media media={media[2]} remove={()=>removeMedia(2)}/>
                </TouchableOpacity>
                <View style={styles.mediaContainer} />
            </View>
        </View>
    );

    return (
        <View style={{ flex: 1, gap: 15 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 15 }}>
                <TouchableOpacity key={media[0].uri + '-i0'} onPress={() => handleMediaPress(media[0])} style={styles.mediaContainer}>
                    <Media media={media[0]} remove={()=>removeMedia(0)}/>
                </TouchableOpacity>
                <TouchableOpacity key={media[1].uri + '-i1'} onPress={() => handleMediaPress(media[1])} style={styles.mediaContainer}>
                    <Media media={media[1]} remove={()=>removeMedia(1)}/>
                </TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 15 }}>
                <TouchableOpacity key={media[2].uri + '-i2'} onPress={() => handleMediaPress(media[2])} style={styles.mediaContainer}>
                    <Media media={media[2]} remove={()=>removeMedia(2)}/>
                </TouchableOpacity>
                <TouchableOpacity key={media[3].uri + '-i3'} onPress={() => handleMediaPress(media[3])} style={styles.mediaContainer}>
                    <Media media={media[3]} remove={()=>removeMedia(3)}/>
                </TouchableOpacity>
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