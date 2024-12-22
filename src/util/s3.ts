// Only to be used in client components.
// Useful for bypassing Vercel upload limit by uploading to S3 on client, not server.
'use client';

import { Alert as AlertPopUp, Linking } from 'react-native'

import * as ImagePicker from 'expo-image-picker';

import { AUTH_TOKEN_COOKIE_KEY, DOMAIN } from './global';

import { getAuthCookie } from './storage';



export const promptMediaPermissions = async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) {
        AlertPopUp.alert(
            'Permission Required',
            'Please grant permission to access your photos.',
            [
                { text: 'Open Settings', onPress: () => Linking.openSettings() },
                { text: 'Cancel', style: 'cancel' }
            ]
        );
    }
    return granted;
}



export const clientUploadMediaAndGetKeys = async (media: Blob[]) => {
    const authTokenCookie = await getAuthCookie();
    const keyPromises = media.map((asset) => clientUploadMedia(asset, authTokenCookie));
    const imageKeys = await Promise.all(keyPromises);

    if (imageKeys.includes(null)) return null;
    return imageKeys;
}



export const clientUploadMedia = async (asset: Blob, authTokenCookie?: string | null) => {
    let authToken = !authTokenCookie ? (await getAuthCookie()) : authTokenCookie;

    const resSignAndKey = await fetch(`${DOMAIN}/api/app/post/s3`, {
        method: 'POST',
        body: JSON.stringify({ fileType: asset.type, fileSize: asset.size }),
        headers: { 
            'Content-Type': 'application/json',
            'Cookie': `${AUTH_TOKEN_COOKIE_KEY}=${authToken}`
        }
    });
    if (!resSignAndKey.ok) return null;

    const assetBlob = new Blob([asset], { type: asset.type });

    const resSignAndKeyJson = await resSignAndKey.json();
    if (resSignAndKeyJson.cStatus!=200) return null;

    await fetch(resSignAndKeyJson.signedUrl, {
        method: 'PUT',
        body: assetBlob
    });
    return resSignAndKeyJson.key;
}