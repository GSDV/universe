import { useState } from 'react';

import { View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity, Image, Keyboard } from 'react-native';

import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

import { useUser } from '@components/providers/UserProvider';

import GoBackHeader from '@components/GoBackHeader';
import Button from '@components/Button';
import { Alert, AlertType } from '@components/Alert';

import { AUTH_TOKEN_COOKIE_KEY, DOMAIN, IMG_SIZE_LIMIT_TXT, isValidDisplayName, isValidUsername, MAX_DISPLAY_NAME_LENGTH, MAX_USERNAME_LENGTH, MIN_DISPLAY_NAME_LENGTH, MIN_USERNAME_LENGTH } from '@util/global';
import { COLORS, FONT_SIZES, pfpUri } from '@util/global-client';

import { clientUploadPfp, promptMediaPermissions } from '@util/s3';
import { CheckIfLoading } from '@components/Loading';
import { getAuthCookie } from '@util/storage';
import { useOperation } from '@components/providers/OperationProvider';
import { fetchWithAuth } from '@util/fetch';



export default function Index() {
    const router = useRouter();

    const userContext = useUser();
    const user = useUser().user;
    // For TypeScript:
    if (!user) return <Text>Something went wrong.</Text>

    const [userData, setUserData] = useState({
        displayName: user.displayName,
        username: user.username,
        pfpUri: pfpUri(user.pfpKey)
    });

    const canSave = ((userData.pfpUri !== pfpUri(user.pfpKey)) || (userData.displayName !== user.displayName) ||  (userData.username !== user.username));
    const [loading, setLoading] = useState<boolean>(false);
    const [alert, setAlert] = useState<AlertType | null>(null);

    const handleChange = (name: string, value: any) => {
        if (name == 'username') value = value.toLowerCase();
        if (value.length > MAX_USERNAME_LENGTH) value = value.substring(0, MAX_USERNAME_LENGTH+1);

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

        if (userData.username !== user.username) {
            if (!isValidUsername(userData.username)) {
                setAlert({ msg: `Usernames must be ${MIN_USERNAME_LENGTH}-${MAX_USERNAME_LENGTH} characters, and start with a letter.`, cStatus: 400 });
                setLoading(false);
                return;
            }
            newUserData.username = userData.username;
        }



        const body = JSON.stringify({ data: newUserData });
        const res = await fetchWithAuth(`user/edit`, 'POST', body);

        const resJson = await res.json();
        if (resJson.cStatus == 200) {
            // resJson.user.pfpKey += `?t=${Date.now()}`;
            // operationContext.emitOperation({

            // });
            userContext.setUser(resJson.user);
            router.replace(`/account`);
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
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5
        });

        if (!result || result.canceled) return;

        const optimized = await ImageManipulator.manipulateAsync(
            result.assets[0].uri,
            [{ resize: { width: 300, height: 300 } }],
            {
                compress: 0.5,
                format: ImageManipulator.SaveFormat.JPEG
            }
        );

        handleChange('pfpUri', {uri: optimized.uri});
    };

    return (
        <View style={{ flex: 1, gap: 10 }}>
            <GoBackHeader />
            <ScrollView contentContainerStyle={{ padding: 10, flex: 1, alignItems: 'center' }}>
                <Text style={styles.title}>Edit Profile</Text>

                <CheckIfLoading loading={loading}>
                    <View style={styles.container}>
                        <TouchableOpacity style={cl_styles.imageContainer} onPress={pickImage}>
                            <Image source={userData.pfpUri} style={cl_styles.profileImage} />
                            <View style={cl_styles.editIconContainer}>
                                <MaterialIcons name='edit' size={20} color='white' />
                            </View>
                        </TouchableOpacity>

                        <View style={{ gap: 2 }}>
                            <Text style={{color: COLORS.black, fontSize: FONT_SIZES.m}}>Display Name</Text>
                            <TextInput
                                style={{ padding: 5, width: '100%', backgroundColor: 'white', fontSize: FONT_SIZES.m }}
                                value={userData.displayName}
                                onChangeText={(v: string) => handleChange('displayName', v)}
                            />
                        </View>

                        <View style={{ gap: 2 }}>
                            <Text style={{color: COLORS.black, fontSize: FONT_SIZES.m}}>Username</Text>
                            <TextInput
                                style={{ padding: 5, width: '100%', backgroundColor: 'white', fontSize: FONT_SIZES.m }}
                                value={userData.username}
                                onChangeText={(v: string) => handleChange('username', v)}
                            />
                        </View>
                        
                        <Button onPress={onSubmit} disabled={!canSave}>Save</Button>
                        {alert && <Alert alert={alert} />}
                    </View>
                </CheckIfLoading>
            </ScrollView>
        </View>
    )
}



const styles = StyleSheet.create({
    container: {
        padding: 15,
        flex: 1,
        alignSelf: 'center',
        width: '80%',
        display: 'flex',
        flexDirection: 'column',
        gap: 30
    },
    title: {
        marginBottom: 20,
        textAlign: 'center',
        fontSize: FONT_SIZES.xxl,
        fontWeight: 'bold',
        color: COLORS.primary_1
    }
});



const cl_styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: 'white',
    },
    imageContainer: {
        alignSelf: 'center',
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
    },
    editIconContainer: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: COLORS.primary_2,
        borderRadius: 15,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    }
});