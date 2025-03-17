import { useEffect, useState } from 'react';

import {
    Switch,
    Text,
    View,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Keyboard,
    Pressable,
    ScrollView
} from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { usePostStore } from '@hooks/PostStore';
import { useAccountPost } from '@providers/AccountPostProvider';

import Feather from '@expo/vector-icons/Feather';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { DisplayUploadedMedia, UploadedAsset } from '@components/post/media/Display';
import Pfp from '@components/Pfp';
import { Alert, AlertType } from '@components/Alert';
import { CheckIfLoading } from '@components/Loading';

import { MAX_POST_CONTENT_LENGTH, MAX_POST_MEDIA, MIN_POST_CONTENT_LENGTH } from '@util/global';
import { COLORS, FONT_SIZES, TAB_BAR_HEIGHT } from '@util/global-client';

import { fetchWithAuth } from '@util/fetch';
import { getMediaKeys, hasCameraPermissions, hasMediaPermissions, promptCameraPermissions, promptMediaPermissions } from '@util/media/s3';
import { getMedia, takeMedia } from '@util/media/pick';
import { getUniqueString } from '@util/unique';

import { PostDataInput, RedactedUserType } from '@util/types';
import { showActionSheet } from '@util/action';
import { useLocation } from '@providers/LocationProvider';



export default function CreatePost({ userPrisma }: { userPrisma: RedactedUserType }) {
    const router = useRouter();

    const accountPostContext = useAccountPost();
    const addPost = usePostStore((state) => state.addPost);

    const [loading, setLoading] = useState<boolean>(false);
    const [loadingMedia, setLoadingMedia] = useState<boolean>(false);
    const [alert, setAlert] = useState<AlertType | null>(null);

    const [content, setContent] = useState<string>('');
    const [media, setMedia] = useState<UploadedAsset[]>([]);
    const [includesLocation, setIncludesLocation] = useState<boolean>(true);

    const validContent: boolean = (content.replace(/\s+/g, '').length >= MIN_POST_CONTENT_LENGTH);
    const canSubmit: boolean = (validContent && !loading && !loadingMedia);

    const handleInput = (input: string) => setContent((input.length > MAX_POST_CONTENT_LENGTH) ? input.slice(0, MAX_POST_CONTENT_LENGTH) : input);

    const { 
        location: currentLocation, 
        hasPermission: locationPermissionGranted,
        getCurrentLocation
    } = useLocation();


    const attemptTakeMedia = async () => {
        const havePermissions = await hasCameraPermissions();
        if (!havePermissions) await promptCameraPermissions();
        setLoadingMedia(true);
        const { optimizedMedia, resp } = await takeMedia();
        if (optimizedMedia === null) setAlert(resp);
        else setMedia((prev) => [...prev, ...optimizedMedia]);
        setLoadingMedia(false);
    }

    const attemptGetMedia = async () => {
        const havePermissions = await hasMediaPermissions();
        if (!havePermissions) await promptMediaPermissions();
        setLoadingMedia(true);
        const { optimizedMedia, resp } = await getMedia(MAX_POST_MEDIA-media.length);
        if (optimizedMedia === null) setAlert(resp);
        else setMedia((prev) => [...prev, ...optimizedMedia]);
        setLoadingMedia(false);
    }

    const mediaPrompt = async () => {
        setAlert(null);
        if (media.length >= MAX_POST_MEDIA) return;

        showActionSheet([
            { label: 'Use camera', action: attemptTakeMedia },
            { label: 'Upload from library', action: attemptGetMedia }
        ]);
    }

    const removeMedia = (index: number) => {
        setMedia(prevItems => prevItems.filter((_, i) => i !== index));
    }

    const attemptPost = async () => {
        setLoading(true);
        setAlert(null);
        Keyboard.dismiss();

        let location: { lat?: number, lng?: number } = {};

        if (includesLocation) {
            if (locationPermissionGranted && currentLocation) {
                location = { lat: currentLocation.coords.latitude, lng: currentLocation.coords.longitude };
            } else {
                // Fallback for if currentLocation is null.
                const loc = await getCurrentLocation();
                if (!loc.granted || loc.location == null) {
                    setLoading(false);
                    setAlert({ msg: `Turn on location in settings if you want your post to appear on the map.`, cStatus: 400 });
                    return;
                }
                location = { lat: loc.location.coords.latitude, lng: loc.location.coords.longitude };
            }
        }

        const { mediaKeys, resp } = await getMediaKeys(media);
        if (mediaKeys === null) {
            setAlert(resp);
            setLoading(false);
            return;
        }

        const postDataInput: PostDataInput = {
            content: content,
            hasLocation: includesLocation,
            ...location,
            media: mediaKeys
        }

        const body = JSON.stringify({ postDataInput });
        const resJson = await fetchWithAuth('post', 'POST', body);
        if (resJson.cStatus == 200) {
            accountPostContext.emitOperation({ name: 'CREATE_POST', postData: resJson.post });
            addPost(resJson.post);
            router.replace({
                pathname: `/(tabs)/(account)/post/[postId]/view`,
                params: {
                    postId: resJson.post.id,
                    viewId: getUniqueString(resJson.post.id)
                }
            });
            setMedia([]);
            setContent('');
            setIncludesLocation(true);
        } else {
            setAlert(resJson);
        }
        setLoading(false);
    }

    return (
        <Pressable onPress={Keyboard.dismiss} style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={{ flex: 1, paddingBottom: (useSafeAreaInsets().bottom + TAB_BAR_HEIGHT + 10) }}>
                <Header userPrisma={userPrisma} attemptPost={attemptPost} canSubmit={canSubmit} />
                <CheckIfLoading loading={loading}>
                    <View style={{ flex: 1, padding: 20, gap: 30 }}>
                        <View style={{ flex: 3, gap: 3 }}>
                            {alert && <Alert alert={alert} />}

                            <View style={{width: '100%', height: 1, backgroundColor: '#cfcfcf'}} />
                            <TextInput
                                autoCapitalize='sentences'
                                textAlignVertical='top'
                                style={{ flex: 1, padding: 5, fontSize: FONT_SIZES.l, color: COLORS.black }} 
                                placeholder={`What's happening?`} 
                                value={content} 
                                onChangeText={handleInput} 
                                multiline={true} 
                                maxLength={MAX_POST_CONTENT_LENGTH}
                            />
                            <Text style={{ color: (validContent ? COLORS.gray : 'red'), fontSize: FONT_SIZES.m }}>{content.length}/{MAX_POST_CONTENT_LENGTH} characters</Text>
                            <View style={{ width: '100%', height: 1, backgroundColor: '#cfcfcf' }} />
                        </View>

                        <View style={{ width: '100%', gap: 5 }}>
                            <View style={{ width: '100%', flexDirection: 'row', gap: 5, alignItems: 'center' }}>
                                <Text style={{ color: COLORS.black, fontSize: FONT_SIZES.l }}>Location: </Text>
                                <Switch
                                    style={{ transform: [{scaleX: .8}, {scaleY: .8}] }}
                                    trackColor={{ true: COLORS.primary }}
                                    onValueChange={() => setIncludesLocation((prev)=>!prev)}
                                    value={includesLocation}
                                />
                            </View>
                            {includesLocation && <Text style={{ color: COLORS.gray, fontSize: FONT_SIZES.m }}>your post will appear on the map</Text>}
                        </View>

                        <View style={{ flex: 7, gap: 10 }}>
                            <CheckIfLoading loading={loadingMedia}>
                                <TouchableOpacity disabled={media.length==MAX_POST_MEDIA} style={{ flexDirection: 'row', alignItems: 'center', maxWidth: 150, gap: 5 }} onPress={mediaPrompt}>
                                    <Text style={{ fontSize: FONT_SIZES.l, color: (media.length<MAX_POST_MEDIA ? COLORS.primary : COLORS.gray) }}>Add Media</Text>
                                    <MaterialIcons name='add-photo-alternate' size={25} color={media.length<MAX_POST_MEDIA ? COLORS.primary : COLORS.gray} />
                                </TouchableOpacity>
                                <DisplayUploadedMedia media={media} removeMedia={removeMedia} />
                            </CheckIfLoading>
                        </View>
                    </View>
                </CheckIfLoading>
            </ScrollView>
        </Pressable>
    );
}



function Header({ userPrisma, attemptPost, canSubmit }: { userPrisma: RedactedUserType, attemptPost: ()=>void, canSubmit: boolean }) {
    const sendStyles = canSubmit ? COLORS.primary : COLORS.gray;

    return (
        <View style={styles.header}>
            <View style={{ flex: 1, display: 'flex', flexDirection: 'row', gap: 5, alignItems: 'center' }}>
                <Pfp pfpKey={userPrisma.pfpKey} style={styles.pfp} />
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



const styles = StyleSheet.create({
    header: {
        position: 'relative',
        padding: 20,
        paddingVertical: 5,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15
    },
    pfp: {
        borderRadius: 50,
        width: 50,
        height: 50
    },
    displayName: {
        color: COLORS.black,
        fontSize: FONT_SIZES.m,
        fontWeight: 500
    },
    username: {
        color: COLORS.gray,
        fontSize: FONT_SIZES.m
    }
});