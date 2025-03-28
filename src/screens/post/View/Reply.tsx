import { useState, useRef, RefObject } from 'react';

import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Animated,
    Keyboard,
    Dimensions,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView
} from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';

import { replyButtonAnimation } from '@hooks/useTabBarScroll';

import { Ionicons, MaterialIcons } from '@expo/vector-icons';

import { Alert, AlertType } from '@components/Alert';
import { CheckIfLoading } from '@components/Loading';
import { UploadedAsset, DisplayUploadedMedia } from '@components/post/media/Display';

import { MAX_POST_CONTENT_LENGTH, MAX_POST_MEDIA, MIN_REPLY_CONTENT_LENGTH } from '@util/global';
import { COLORS, FONT_SIZES, TAB_BAR_HEIGHT } from '@util/global-client';

import { fetchWithAuth } from '@util/fetch';
import {
    getMediaKeys,
    hasCameraPermissions,
    hasMediaPermissions,
    promptCameraPermissions,
    promptMediaPermissions
} from '@util/media/s3';
import { getMedia, takeMedia } from '@util/media/pick';

import { PostDataInput, PostType } from '@util/types';
import { showActionSheet } from '@util/action';



export default function ReplyInput({ addNewReply }: { addNewReply: (reply: PostType)=>void }) {
    const insets = useSafeAreaInsets();

    const inputRef = useRef<TextInput>(null);
    const expandAnimation = useRef(new Animated.Value(0)).current;
    const fadeAnimation = useRef(new Animated.Value(0)).current;

    const [isExpanded, setIsExpanded] = useState(false);

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

    // Combining replyButton bottom animation and expanded view.
    const animatedCombined = Animated.add(
        expandAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [20 + insets.bottom, 0],
        }),
        replyButtonAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [(isExpanded ? 0 : 50), -(-20 + insets.bottom)], // Negative because we're moving up.
        })
    );

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
                            borderRadius: animatedRadius,
                            left: animatedLeft,
                            bottom: animatedCombined
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
                            addNewReply={addNewReply}
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
    inputRef: RefObject<TextInput>;
    toggleExpand: () => void;
    isExpanded: boolean;
    addNewReply: (reply: PostType)=>void;
}

function DraftArea({ inputRef, toggleExpand, isExpanded, addNewReply }: DraftAreaProps) {
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

        const { mediaKeys, resp } = await getMediaKeys(media);
        if (mediaKeys === null) {
            setAlert(resp);
            setLoading(false);
            return;
        }

        const replyDataInput: PostDataInput = {
            content: content,
            hasLocation: false,
            media: mediaKeys
        };

        const body = JSON.stringify({ replyDataInput, parentPostId: postId });
        const resJson = await fetchWithAuth(`reply`, 'POST', body);

        if (resJson.cStatus == 200) {
            if (isExpanded) {
                requestAnimationFrame(() => {
                    toggleExpand();
                    setLoading(false);
                });
            }

            addNewReply(resJson.reply);
            setContent('');
            setMedia([]);
        } else {
            setAlert(resJson);
            setLoading(false);
        }
    }

    return (
        <View style={{ flex: 1, padding: 15, paddingBottom: 0 }}>
            <View style={styles.buttonContainer}>
                <TouchableOpacity onPress={toggleExpand} >
                    <Ionicons name='close-outline' size={25} color={COLORS.primary} />
                </TouchableOpacity>

                <TouchableOpacity onPress={attemptPost} disabled={!canSubmit}>
                    <Text style={{ fontSize: FONT_SIZES.m, color: (canSubmit ? COLORS.primary : COLORS.gray) }}>Reply</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ gap: 10, paddingBottom: TAB_BAR_HEIGHT }} showsVerticalScrollIndicator={false}>
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

                    <View style={{ padding: 10, gap: 15 }}>
                        <CheckIfLoading loading={loadingMedia}>
                            <TouchableOpacity disabled={media.length==MAX_POST_MEDIA} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }} onPress={mediaPrompt}>
                                <Text style={{ fontSize: FONT_SIZES.l, color: (media.length<MAX_POST_MEDIA ? COLORS.primary : COLORS.gray) }}>Add Media</Text>
                                <MaterialIcons name='add-photo-alternate' size={25} color={media.length<MAX_POST_MEDIA ? COLORS.primary : COLORS.gray} />
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
        backgroundColor: COLORS.primary,
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