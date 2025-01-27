import { useState, useRef } from 'react';

import {
    View,
    Text,
    TextInput,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Image,
    Keyboard,
    KeyboardAvoidingView,
    TouchableWithoutFeedback
} from 'react-native';

import { useUser } from '@providers/UserProvider';

import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

import Input from '@screens/onboarding/Input';
import Button from '@components/Button';
import { Alert, AlertType } from '@components/Alert';
import { CheckIfLoading } from '@components/Loading';

import {
    IMG_SIZE_LIMIT_TXT,
    isValidBio,
    isValidDisplayName,
    isValidUsername,
    MAX_BIO_LENGTH,
    MAX_DISPLAY_NAME_LENGTH,
    MAX_USERNAME_LENGTH,
    MIN_DISPLAY_NAME_LENGTH,
    MIN_USERNAME_LENGTH
} from '@util/global';
import { COLORS, FONT_SIZES, pfpUri } from '@util/global-client';

import { clientUploadPfp, promptMediaPermissions } from '@util/media/s3';
import { fetchWithAuth } from '@util/fetch';



export default function ProfileEdit() {
    const router = useRouter();

    const userContext = useUser();
    const user = useUser().user;
    // For TypeScript:
    if (!user) return <Text>Something went wrong.</Text>

    const scrollViewRef = useRef<ScrollView>(null);

    const [userData, setUserData] = useState({
        displayName: user.displayName,
        username: user.username,
        pfpUri: pfpUri(user.pfpKey),
        bio: user.bio
    });

    const [bioLength, setBioLength] = useState<number>(user.bio.length);

    const canSave = ((userData.pfpUri !== pfpUri(user.pfpKey)) || (userData.displayName !== user.displayName) || (userData.username !== user.username) || (userData.bio !== user.bio));
    const [loading, setLoading] = useState<boolean>(false);
    const [alert, setAlert] = useState<AlertType | null>(null);

    const handleChange = (name: string, value: any) => {
        if (name == 'username') {
            value = value.toLowerCase();
            if (value.length > MAX_USERNAME_LENGTH) value = value.substring(0, MAX_USERNAME_LENGTH+1);
        } else if (name == 'displayName') {
            if (value.length > MAX_DISPLAY_NAME_LENGTH) value = value.substring(0, MAX_DISPLAY_NAME_LENGTH+1);
        } else if (name == 'bio') {
            setBioLength(value.length);
        }

        setUserData(prevState => ({
            ...prevState,
            [name]: value,
        }));
    };

    const onSubmit = async () => {
        setLoading(true);
        setAlert(null);
        Keyboard.dismiss();

        const newUserData: any = {};

        if (userData.pfpUri !== pfpUri(user.pfpKey)) {
            try {
                const response = await fetch(userData.pfpUri.uri);
                const blob = await response.blob();
                const avatarKey = await clientUploadPfp(blob);
                if (!avatarKey) {
                    setAlert({ msg: `Please upload photos under ${IMG_SIZE_LIMIT_TXT}.`, cStatus: 400 });
                    setLoading(false);
                    return;
                }
                newUserData.pfpKey = avatarKey;
            } catch (error) {
                setAlert({ msg: `Something went wrong while uploading profile picture.`, cStatus: 400 });
                setLoading(false);
                return;
            }
        }

        if (userData.displayName !== user.displayName) {
            if (!isValidDisplayName(userData.displayName)) {
                setAlert({ msg: `Display names must be ${MIN_DISPLAY_NAME_LENGTH}-${MAX_DISPLAY_NAME_LENGTH} characters.`, cStatus: 400 });
                setLoading(false);
                return;
            }
            newUserData.displayName = userData.displayName;
        }

        const trimmedUsername = userData.username.trim();
        if (trimmedUsername !== user.username) {
            if (!isValidUsername(trimmedUsername)) {
                setAlert({ msg: `Usernames must be ${MIN_USERNAME_LENGTH}-${MAX_USERNAME_LENGTH} characters, and start with a letter.`, cStatus: 400 });
                setLoading(false);
                return;
            }
            newUserData.username = trimmedUsername;
        }

        if (userData.bio !== user.bio) {
            if (!isValidBio(userData.bio)) {
                setAlert({ msg: `Bios must be ${MAX_BIO_LENGTH} characters or under.`, cStatus: 400 });
                setLoading(false);
                return;
            }
            newUserData.bio = userData.bio;
        }

        const body = JSON.stringify({ data: newUserData });
        const resJson = await fetchWithAuth(`user/edit`, 'POST', body);

        if (resJson.cStatus == 200) {
            userContext.setUser(resJson.user);
            router.replace(`/(tabs)/(account)`);
        }
        else {
            setAlert(resJson);
            setLoading(false);
        }
    }


    const pickImage = async () => {
        const havePermissions = await promptMediaPermissions();
        if (!havePermissions) return;

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: 'images',
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1
        });

        if (!result || result.canceled) return;

        const optimized = await ImageManipulator.manipulateAsync(
            result.assets[0].uri,
            [{ resize: { width: 300, height: 300 } }],
            { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG }
        );

        handleChange('pfpUri', {uri: optimized.uri});
    }

    const handleFocus = () => {
        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior='padding'
            keyboardVerticalOffset={-20}
        >
            <ScrollView 
                ref={scrollViewRef}
                contentContainerStyle={styles.scrollViewContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps='handled'
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View>
                        <Text style={styles.title}>Edit Profile</Text>

                        <CheckIfLoading loading={loading}>
                            <View style={styles.container}>
                                <TouchableOpacity 
                                    style={styles.profileImageContainer} 
                                    onPress={pickImage}
                                >
                                    <Image source={userData.pfpUri} style={styles.profileImage} />
                                    <View style={styles.editIconContainer}>
                                        <MaterialIcons name='edit' size={20} color='white' />
                                    </View>
                                </TouchableOpacity>

                                <Input
                                    placeholder=''
                                    subtitle='Display Name'
                                    value={userData.displayName}
                                    onChange={(input: string) => handleChange('displayName', input)}
                                />

                                <Input
                                    placeholder=''
                                    subtitle='Username'
                                    value={userData.username}
                                    onChange={(input: string) => handleChange('username', input)}
                                />

                                <View style={styles.inputContainer}>
                                    <Text style={styles.subtitle}>Bio</Text>
                                    <TextInput
                                        style={styles.bioInput}
                                        numberOfLines={4}
                                        multiline={true}
                                        value={userData.bio}
                                        onChangeText={(v: string) => handleChange('bio', v)}
                                        onFocus={handleFocus}
                                    />
                                    <Text style={{ fontSize: FONT_SIZES.s, color: (bioLength<=MAX_BIO_LENGTH ? COLORS.gray : 'red') }}>
                                        {bioLength}/{MAX_BIO_LENGTH} characters
                                    </Text>
                                </View>

                                <View style={styles.buttonContainer}>
                                    <Button onPress={onSubmit} disabled={!canSave}>Save</Button>
                                    {alert && <Alert alert={alert} />}
                                </View>
                            </View>
                        </CheckIfLoading>
                    </View>
                </TouchableWithoutFeedback>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}



const styles = StyleSheet.create({
    scrollViewContent: {
        flexGrow: 1,
        paddingBottom: 120,
    },
    container: {
        padding: 15,
        alignSelf: 'center',
        width: '80%',
        gap: 20,
    },
    profileImageContainer: {
        alignSelf: 'center',
        marginBottom: 10,
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
    },
    title: {
        marginVertical: 20,
        textAlign: 'center',
        fontSize: FONT_SIZES.xxl,
        fontWeight: 'bold',
        color: COLORS.primary
    },
    subtitle: {
        color: COLORS.black,
        fontSize: FONT_SIZES.m,
        marginBottom: 5,
    },
    inputContainer: {
        gap: 2,
        marginBottom: 10,
    },
    bioInput: {
        padding: 10,
        width: '100%',
        height: 100,
        borderRadius: 5,
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: COLORS.black,
        fontSize: FONT_SIZES.m,
        textAlignVertical: 'top'
    },
    buttonContainer: {
        marginTop: 20,
        paddingBottom: 20,
    },
    editIconContainer: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: COLORS.primary,
        borderRadius: 15,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    }
});