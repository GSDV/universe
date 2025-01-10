import { Image, ImageStyle, StyleProp } from 'react-native';

import { COLORS, DEFAULT_PFP, imgUrl } from '@util/global-client';



export default function Pfp({ pfpKey, style }: { pfpKey: string, style?: StyleProp<ImageStyle> }) {
    return (
        <>{pfpKey=='' ? 
            <Image style={[{backgroundColor: COLORS.background}, style]} source={DEFAULT_PFP} />
        :
            <Image style={[{backgroundColor: COLORS.background}, style]} source={{ uri: imgUrl(pfpKey) }} />
        }</>
    );
}