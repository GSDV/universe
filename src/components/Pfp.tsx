import { Image, ImageStyle, StyleProp } from 'react-native';

import { DEFAULT_PFP, imgUrl } from '@util/global-client';



export default function Pfp({ pfpKey, style }: { pfpKey: string, style?: StyleProp<ImageStyle> }) {
    return (
        <>{pfpKey=='' ? 
            <Image style={style} source={DEFAULT_PFP} />
        :
            <Image style={style} source={{ uri: imgUrl(pfpKey) }} />
        }</>
    );
}