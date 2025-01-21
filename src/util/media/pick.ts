
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
                resp: {
                    msg: `User canceled.`,
                    cStatus: 200
                }
            };
        }

        const assets = result.assets.filter((asset: any) => asset.mimeType !== undefined);

        for (let i = 0; i < assets.length; i++) {
            const asset = assets[i];
            const type = asset.mimeType;
            if (type==undefined || !ACCEPTED_FILES.includes(type)) {
                return {
                    optimizedMedia: null, 
                    resp: {
                        msg: `Please only upload png, jpg, webp, mp4, or mov files.`,
                        cStatus: 400
                    }
                };
            }
            if (ACCEPTED_IMGS.includes(asset.type as string) && (asset.fileSize ? asset.fileSize : 0) > IMG_SIZE_LIMIT) {
                return {
                    optimizedMedia: null, 
                    resp: {
                        msg: `Please upload pictures under ${IMG_SIZE_LIMIT_TXT}.`,
                        cStatus: 400
                    }
                };
            }
            if (ACCEPTED_VIDS.includes(asset.type as string) && (asset.fileSize ? asset.fileSize : 0) > VID_SIZE_LIMIT) {
                return {
                    optimizedMedia: null, 
                    resp: { msg: `Please upload videos under ${VID_SIZE_LIMIT_TXT}.`, cStatus: 400 }
                };
            }
        }

        const optimizedMedia = await Promise.all(
            assets.map(async (asset) => {
                const isVideo = asset.type === 'video';
    
                if (isVideo) {
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