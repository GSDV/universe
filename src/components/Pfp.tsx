import { Fragment } from 'react';

import { ImageStyle, StyleProp } from 'react-native';

import { Image } from 'expo-image';

import { COLORS, DEFAULT_PFP, imgUrl } from '@util/global-client';



interface PfpProps {
    pfpKey: string;
    style?: StyleProp<ImageStyle>;
    isOwnPfp?: boolean; // Is this the user's pfp? (used on account screen)
}

export default function Pfp({ pfpKey, style, isOwnPfp }: PfpProps) {
    return (
        <Fragment>
            {pfpKey=='' ? 
                <Image
                    style={[{backgroundColor: COLORS.background}, style]}
                    source={DEFAULT_PFP}
                />
            :
                <Image
                    style={[{backgroundColor: COLORS.background}, style]}
                    source={{ uri: imgUrl(pfpKey) }}
                    cachePolicy={isOwnPfp ? 'none' : 'memory-disk'}
                />
            }
        </Fragment>
    );
}