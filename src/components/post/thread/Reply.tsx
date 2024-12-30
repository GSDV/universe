import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, Animated, Keyboard, Dimensions, StyleSheet, KeyboardAvoidingView, Platform, Pressable, Modal, ScrollView } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';

import { useOperation } from '@components/providers/OperationProvider';

import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

import { Alert, AlertType } from '@components/Alert';
import { CheckIfLoading } from '@components/Loading';
import { UploadedAsset, DisplayUploadedMedia } from '@components/post/media/Display';

import { ACCEPTED_FILES, ACCEPTED_IMGS, ACCEPTED_VIDS, IMG_SIZE_LIMIT, IMG_SIZE_LIMIT_TXT, MAX_POST_CONTENT_LENGTH, MAX_POST_MEDIA, MIN_REPLY_CONTENT_LENGTH, VID_SIZE_LIMIT, VID_SIZE_LIMIT_TXT } from '@util/global';
import { COLORS, FONT_SIZES } from '@util/global-client';

import { fetchWithAuth } from '@util/fetch';
import { clientUploadMediaAndGetKeys, promptMediaPermissions } from '@util/s3';

import { PostDataInput } from '@util/types';



export default function ReplyInput() {
    const [isExpanded, setIsExpanded] = useState(false);
    const expandAnimation = useRef(new Animated.Value(0)).current;
    const fadeAnimation = useRef(new Animated.Value(0)).current;
    const inputRef = useRef<TextInput>(null);
    const insets = useSafeAreaInsets();

    const expandHeight = Dimensions.get('window').height * 0.4;
    const buttonSize = 56;

    const toggleExpand = () => {
        if (!isExpanded) {
            setIsExpanded(true);
            Animated.parallel([
                Animated.spring(expandAnimation, {
                    toValue: 1,
                    useNativeDriver: false,
                    friction: 8,
                }),
                Animated.timing(fadeAnimation, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                })
            ]).start(() => {
                inputRef.current?.focus();
            });
        } else {
            Keyboard.dismiss();
            Animated.parallel([
                Animated.spring(expandAnimation, {
                    toValue: 0,
                    useNativeDriver: false,
                    friction: 8,
                }),
                Animated.timing(fadeAnimation, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                })
            ]).start(() => {
                setIsExpanded(false);
            });
        }
    };

    const animatedHeight = expandAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [buttonSize, expandHeight],
    });

    const animatedWidth = expandAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [buttonSize, Dimensions.get('window').width],
    });

    const animatedRadius = expandAnimation.interpolate({
        inputRange: [0, 0.5],
        outputRange: [buttonSize / 2, 0],
        extrapolate: 'clamp'
    });

    const animatedLeft = expandAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [20, 0],
    });

    const animatedBottom = expandAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [20 + insets.bottom, 0],
    });

    return (
        <KeyboardAvoidingView 
            style={[ styles.mainContainer, { paddingBottom: insets.bottom } ]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
            <KeyboardAvoidingView>
                <Animated.View
                    style={[
                        styles.container,
                        {
                            height: animatedHeight,
                            width: animatedWidth,
                            left: animatedLeft,
                            bottom: animatedBottom,
                            borderRadius: animatedRadius,
                        },
                    ]}
                >
                    {!isExpanded && <Button toggleExpand={toggleExpand} />}

                    <Animated.View
                        style={[
                            styles.expandedContainer,
                            {
                                opacity: fadeAnimation,
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                            }
                        ]}
                        pointerEvents={isExpanded ? 'auto' : 'none'}
                    >
                        <DraftArea  
                            inputRef={inputRef} 
                            toggleExpand={toggleExpand}
                            isExpanded={isExpanded}
                        />
                    </Animated.View>
                </Animated.View>
            </KeyboardAvoidingView>
        </KeyboardAvoidingView>
    );
}



function Button({ toggleExpand }: { toggleExpand: ()=>void }) {
    return (
        <TouchableOpacity
            style={styles.collapsedButton}
            onPress={toggleExpand}
            activeOpacity={0.8}
        >
            <Ionicons name='chatbubble-outline' size={24} color={COLORS.white} />
        </TouchableOpacity>
    );
}



interface DraftAreaProps {
    inputRef: React.RefObject<TextInput>;
    toggleExpand: ()=>void;
    isExpanded: boolean;
}

function DraftArea({ inputRef, toggleExpand, isExpanded }: DraftAreaProps) {
    const operationContext = useOperation();
    const insets = useSafeAreaInsets();

    const postId = useLocalSearchParams().postId as string;

    const [loading, setLoading] = useState<boolean>(false);
    const [loadingMedia, setLoadingMedia] = useState<boolean>(false);
    const [alert, setAlert] = useState<AlertType | null>(null);

    const [content, setContent] = useState<string>('');
    const [media, setMedia] = useState<UploadedAsset[]>([]);

    const validContent: boolean = (content.replace(/\s+/g, '').length >= MIN_REPLY_CONTENT_LENGTH);
    const canSubmit: boolean = (validContent && !loading && !loadingMedia);


    const handleInput = (input: string) => setContent((input.length > MAX_POST_CONTENT_LENGTH) ? input.slice(0, MAX_POST_CONTENT_LENGTH) : input);

    const uploadMedia = async () => {
        try {
            setAlert(null);
            if (media.length >= MAX_POST_MEDIA) return;

            const havePermissions = await promptMediaPermissions();
            if (!havePermissions) return;

            setLoadingMedia(true);

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.All,
                allowsMultipleSelection: true,
                orderedSelection: true,
                selectionLimit: (MAX_POST_MEDIA-media.length),
                quality: 0.8,
                videoMaxDuration: 60
            });
            if (!result || result.canceled) {
                setLoadingMedia(false);
                return;
            }



            const assets = result.assets.filter((asset: any) => asset.mimeType !== undefined);

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

            const optimizedMedia = await Promise.all(
                assets.map(async (asset) => {
                    const isVideo = asset.type === 'video';
        
                    if (isVideo) {
                        // No compression for now
                        return { uri: asset.uri, type: (asset.mimeType as string) };
                    } else {
                        const optimized = await ImageManipulator.manipulateAsync(
                            asset.uri,
                            [{ resize: { width: 1080 } }],
                            { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
                        );
        
                        return { uri: optimized.uri, type: (asset.mimeType as string) };
                    }
                })
            );

            setMedia((currMedia) => [...currMedia, ...optimizedMedia]);
            setLoadingMedia(false);
        } catch (err) {
            setAlert({ msg: `Something went wrong while uploading media.`, cStatus: 400 });
            setLoadingMedia(false);
        }
    }

    const removeMedia = (index: number) => {
        setMedia(prevItems => prevItems.filter((_, i) => i !== index));
    }


    const attemptPost = async () => {
        setLoading(true);
        setAlert(null);
        Keyboard.dismiss();

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

        const replyDataInput: PostDataInput = {
            content: content,
            hasLocation: false,
            media: mediaKeys
        }

        const body = JSON.stringify({ replyDataInput, parentPostId: postId });
        const resJson = await fetchWithAuth(`reply`, 'POST', body);

        if (resJson.cStatus == 200) {
            operationContext.emitOperation({ name: 'CREATE_REPLY', replyData: resJson.reply });
            if (isExpanded) toggleExpand();
            setContent('');
            setMedia([]);
        } else {
            setAlert(resJson);
        }
        setLoading(false);
    }

    return (
        <View style={{ flex: 1, padding: 15, paddingBottom: 0 }}>
            <View style={styles.buttonContainer}>
                <TouchableOpacity onPress={toggleExpand} >
                    <Ionicons name='close-outline' size={25} color={COLORS.primary_1} />
                </TouchableOpacity>

                <TouchableOpacity onPress={attemptPost} disabled={!canSubmit}>
                    <Text style={{ fontSize: FONT_SIZES.m, color: (canSubmit ? COLORS.primary_1 : COLORS.gray) }}>Reply</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ gap: 10, paddingBottom: insets.bottom }} showsVerticalScrollIndicator={false}>
                <CheckIfLoading loading={loading}>
                    {alert && <Alert alert={alert} />}

                    <View style={{ width: '100%', height: 1, backgroundColor: '#cfcfcf' }} />
                    <TextInput
                        ref={inputRef} 
                        style={{ minHeight: 70, maxHeight: 150, padding: 5, fontSize: FONT_SIZES.m, color: COLORS.black }} 
                        placeholder={`What's happening?`} 
                        value={content} 
                        onChangeText={handleInput} 
                        multiline={true} 
                        maxLength={MAX_POST_CONTENT_LENGTH} 
                        textAlignVertical='top'
                    />
                    <Text style={{ color: (canSubmit ? COLORS.gray : 'red'), fontSize: FONT_SIZES.m }}>{content.length}/{MAX_POST_CONTENT_LENGTH} characters</Text>
                    <View style={{ width: '100%', height: 1, backgroundColor: '#cfcfcf' }} />

                    <View style={{ paddingBottom: 10, gap: 5 }}>
                        <CheckIfLoading loading={loadingMedia}>
                            <TouchableOpacity disabled={media.length==MAX_POST_MEDIA} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }} onPress={uploadMedia}>
                                <Text style={{ fontSize: FONT_SIZES.l, color: (media.length<MAX_POST_MEDIA ? COLORS.primary_1 : COLORS.gray) }}>Add Media</Text>
                                <MaterialIcons name='add-photo-alternate' size={25} color={media.length<MAX_POST_MEDIA ? COLORS.primary_1 : COLORS.gray} />
                            </TouchableOpacity>
                            <DisplayUploadedMedia media={media} removeMedia={removeMedia} />
                        </CheckIfLoading>
                    </View>
                </CheckIfLoading>
            </ScrollView>
        </View>
    );
}





const styles = StyleSheet.create({
    mainContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: COLORS.background,
    },
    container: {
        position: 'absolute',
        backgroundColor: COLORS.primary_1,
    },
    collapsedButton: {
        width: 56,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center'
    },
    expandedContainer: {
        flex: 1,
        backgroundColor: COLORS.background,
        shadowColor: 'black',
        shadowOffset: {
            width: 0,
            height: -20,
        },
        shadowOpacity: 0.3,
        shadowRadius: 25
    },
    input: {
        flex: 1,
        fontSize: 16,
        textAlignVertical: 'top',
    },
    buttonContainer: {
        padding: 5,
        flexDirection: 'row',
        justifyContent: 'space-between'
    }
});