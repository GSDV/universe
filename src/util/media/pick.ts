
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

import {
    ACCEPTED_FILES,
    ACCEPTED_IMGS,
    ACCEPTED_VIDS,
    IMG_SIZE_LIMIT,
    IMG_SIZE_LIMIT_TXT,
    VID_SIZE_LIMIT,
    VID_SIZE_LIMIT_TXT
} from '@util/global';



export const optimizeMedia = async (asset: ImagePicker.ImagePickerAsset) => {
    const isVideo = asset.type === 'video';
    
    // No optimizations for now.
    if (isVideo) return { uri: asset.uri, type: (asset.mimeType as string) };

    const optimized = await ImageManipulator.manipulateAsync(
        asset.uri,
        [{ resize: { width: 1080 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
    );
    return { uri: optimized.uri, type: (asset.mimeType as string) };
}



export const isValidAsset = (asset: ImagePicker.ImagePickerAsset) => {
    const type = asset.mimeType;
    if (type==undefined || !ACCEPTED_FILES.includes(type)) return `Please only upload png, jpg, webp, mp4, or mov files.`;
    if (ACCEPTED_IMGS.includes(asset.type as string) && (asset.fileSize ? asset.fileSize : 0) > IMG_SIZE_LIMIT) return `Please upload pictures under ${IMG_SIZE_LIMIT_TXT}.`;
    if (ACCEPTED_VIDS.includes(asset.type as string) && (asset.fileSize ? asset.fileSize : 0) > VID_SIZE_LIMIT) return `Please upload videos under ${VID_SIZE_LIMIT_TXT}.`;
    return '';
}



export const takeMedia = async () => {
    try {
        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ['videos', 'images'],
            quality: 0.8,
            videoMaxDuration: 60,
            videoExportPreset: ImagePicker.VideoExportPreset.MediumQuality,
            videoQuality: 1
        });

        if (!result || result.canceled || result.assets.length != 1) {
            return {
                optimizedMedia: [], 
                resp: { msg: `User canceled.`, cStatus: 200 }
            };
        }
        const asset = result.assets[0];

        const validRes = isValidAsset(asset);
        if (validRes !== '') return { optimizedMedia: [], resp: { msg: validRes, cStatus: 400} };

        const optimizedAsset = await optimizeMedia(asset);
        const optimizedMedia = [optimizedAsset];

        return {
            optimizedMedia,
            resp: { msg: `Success.`, cStatus: 200 }
        };
    } catch (err) {
        return {
            optimizedMedia: null,
            resp: { msg: `Something went wrong while uploading media.`, cStatus: 400 }
        };
    }
}



export const getMedia = async (selectionLimit: number) => {
    try {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['videos', 'images'],
            allowsMultipleSelection: true,
            orderedSelection: true,
            selectionLimit,
            quality: 0.8,
            videoMaxDuration: 60,
            videoExportPreset: ImagePicker.VideoExportPreset.MediumQuality,
            videoQuality: 1
        });
        if (!result || result.canceled) {
            return {
                optimizedMedia: [], 
                resp: { msg: `User canceled.`, cStatus: 200 }
            };
        }

        const assets = result.assets.filter((asset: any) => asset.mimeType !== undefined);

        for (let i = 0; i < assets.length; i++) {
            const asset = assets[i];
            const validRes = isValidAsset(asset);
            if (validRes !== '') return { optimizedMedia: [], resp: { msg: validRes, cStatus: 400} };
        }

        const optimizedMedia = await Promise.all(
            assets.map(async (asset) => optimizeMedia(asset))
        );

        return {
            optimizedMedia, 
            resp: { msg: `Success.`, cStatus: 200 }
        };
    } catch (err) {
        return {
            optimizedMedia: null, 
            resp: { msg: `Something went wrong while uploading media.`, cStatus: 400 }
        };
    }
}