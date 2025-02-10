// Only to be used in client components.
// Useful for bypassing Vercel upload limit by uploading to S3 on client, not server.
'use client';

import { Alert as AlertPopUp } from 'react-native'

import * as ImagePicker from 'expo-image-picker';

import { UploadedAsset } from '@components/post/media/Display';

import { IMG_SIZE_LIMIT_TXT, VID_SIZE_LIMIT_TXT } from '@util/global';
import { fetchWithAuth } from '@util/fetch';



export const promptMediaPermissions = async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) {
        AlertPopUp.alert(
            'Permission Required',
            'To upload photos, this app must have permission to access your photo library.',
            [
                {
                    text: 'Ok',
                    style: 'cancel',
                    onPress: () => {}
                }
            ]
        );
    }
    return granted;
}



export const getMediaKeys = async (media: UploadedAsset[]) => {
    try {
        const blobPromises = media.map(async (asset) => {
            try {
                const response = await fetch(asset.uri);
                const blob = await response.blob();
                return blob;
            } catch (error) {
                return null;
            }
        });
        const resBlobs = await Promise.all(blobPromises);

        if (resBlobs.includes(null)) {
            return {
                mediaKeys: null,
                resp: { msg: `Something went wrong while uploading media.`, cStatus: 400 }
            };
        }

        // For TypeScript:
        const filteredBlobs = resBlobs.filter(blob => blob !== null);

        const mediaKeys = await clientUploadMediaAndGetKeys(filteredBlobs);
        if (!mediaKeys || mediaKeys.includes(null)) {
            return {
                mediaKeys: null,
                resp: { msg: `Please upload photos under ${IMG_SIZE_LIMIT_TXT} and videos under ${VID_SIZE_LIMIT_TXT}.`, cStatus: 400 }
            };
        }
        return {
            mediaKeys: mediaKeys as string[],
            resp: { msg: `Success.`, cStatus: 200 }
        };
    } catch (err) {
        return {
            mediaKeys: null,
            resp: { msg: `Something went wrong while uploading media.`, cStatus: 400 }
        };
    }
}



export const clientUploadMediaAndGetKeys = async (assets: Blob[]) => {
    const keyPromises = assets.map((asset) => clientUploadMedia(asset));
    const imageKeys = await Promise.all(keyPromises);

    if (imageKeys.includes(null)) return null;
    return imageKeys;
}



export const clientUploadMedia = async (asset: Blob) => {
    const body = JSON.stringify({ fileType: asset.type, fileSize: asset.size });
    const resSignAndKeyJson = await fetchWithAuth(`post/s3`, 'POST', body);
    if (resSignAndKeyJson.cStatus!=200) return null;

    const resS3 = await fetch(resSignAndKeyJson.signedUrl, {
        method: 'PUT',
        body: asset,
        headers: {
            'Content-Type': asset.type
        }
    });

    return (resS3.ok) ? resSignAndKeyJson.key as string : null;
}



export const clientUploadPfp = async (asset: Blob) => {
    const body = JSON.stringify({ fileType: asset.type, fileSize: asset.size });
    const resSignAndKeyJson = await fetchWithAuth(`pfp/s3`, 'POST', body);
    if (resSignAndKeyJson.cStatus!=200) return null;

    const resS3 = await fetch(resSignAndKeyJson.signedUrl, {
        method: 'PUT',
        body: asset,
        headers: {
            'Content-Type': asset.type
        }
    });

    return (resS3.ok) ? resSignAndKeyJson.key as string : null;
}