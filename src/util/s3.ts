// Only to be used in client components.
// Useful for bypassing Vercel upload limit by uploading to S3 on client, not server.
'use client';

import { Alert as AlertPopUp, Linking } from 'react-native'

import * as ImagePicker from 'expo-image-picker';

import { fetchWithAuth } from './fetch';



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
    const keyPromises = media.map((asset) => clientUploadMedia(asset));
    const imageKeys = await Promise.all(keyPromises);

    if (imageKeys.includes(null)) return null;
    return imageKeys;
}



export const clientUploadMedia = async (asset: Blob) => {
    const body = JSON.stringify({ fileType: asset.type, fileSize: asset.size });
    const resSignAndKeyJson = await fetchWithAuth(`post/s3`, 'POST', body);
    if (resSignAndKeyJson.cStatus!=200) return null;

    const assetBlob = new Blob([asset], { type: asset.type });

    const resS3 = await fetch(resSignAndKeyJson.signedUrl, {
        method: 'PUT',
        body: assetBlob
    });

    return (resS3.ok) ? resSignAndKeyJson.key : null;
}



export const clientUploadPfp = async (asset: Blob) => {
    const body = JSON.stringify({ fileType: asset.type, fileSize: asset.size });
    const resSignAndKeyJson = await fetchWithAuth(`pfp/s3`, 'POST', body);
    if (resSignAndKeyJson.cStatus!=200) return null;

    const assetBlob = new Blob([asset], { type: asset.type });

    if (resSignAndKeyJson.cStatus!=200) return null;

    const resS3 = await fetch(resSignAndKeyJson.signedUrl, {
        method: 'PUT',
        body: assetBlob
    });

    return (resS3.ok) ? resSignAndKeyJson.key : null;
}