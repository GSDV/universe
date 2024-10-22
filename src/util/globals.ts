import { PixelRatio } from 'react-native';



export const DOMAIN = process.env.EXPO_PUBLIC_DOMAIN;
export const BRAND = 'IlliniTalk';

export const AUTH_TOKEN_COOKIE_KEY = 'auth_token';
export const USER_ID_COOKIE_KEY = 'id_token';



export const MIN_USERNAME_LENGTH = 4;
export const MAX_USERNAME_LENGTH = 30;



export const PRIMARY_1 = 'rgb(16, 61, 133)';
export const PRIMARY_2 = 'rgb(36, 82, 156)';
export const SECONDARY_1 = '#049DD9';
export const BLACK = 'rgb(20, 20, 20)';
export const GRAY = 'rgb(117, 117, 117)';
export const WHITE = 'rgb(232, 230, 229)';

export const COLORS = {
    black: BLACK,
    gray: GRAY,
    white: WHITE,
    primary_1: PRIMARY_1,
    primary_2: PRIMARY_2,
    secondary_1: SECONDARY_1,
    text: BLACK,
    background: WHITE,
    orange: 'rgb(253, 166, 58)',
    tint: 'rgb(10, 126, 164)'
}

export type ColorType = 'primary_1' | 'primary_2' | 'secondary_1' | 'text' | 'background' | 'tint';



const baseFontSize = 16;
export const FONT_SIZES = {
    s: PixelRatio.getFontScale() * baseFontSize * 0.8,
    m: PixelRatio.getFontScale() * baseFontSize,
    l: PixelRatio.getFontScale() * baseFontSize * 1.2,
    xl: PixelRatio.getFontScale() * baseFontSize * 1.4,
    xxl: PixelRatio.getFontScale() * baseFontSize * 1.8
};


export const DEFAULT_PFP_STR = '@assets/ui/default-profile-picture.png';
export const DEFAULT_PFP = require('@assets/ui/default-profile-picture.png');

export const imgUrl = (key: string) => `https://buyillini.s3.us-east-2.amazonaws.com/${key}`;



export const formatPostDate = (date: string) => {
    const post = new Date(date);
    const now = new Date();
    const diff = Math.abs(now.getTime() - post.getTime()); // ms

    const diffSeconds = Math.floor(diff / 1000);
    if (diffSeconds < 60) {
        if (diffSeconds == 1) return `${diffSeconds} second ago`;
        return `${diffSeconds} seconds ago`;
    }

    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) {
        if (diffMinutes == 1) return `${diffMinutes} minute ago`;
        return `${diffMinutes} minutes ago`;
    }

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) {
        if (diffHours == 1) return `${diffHours} hour ago`;
        return `${diffHours} hours ago`;
    }

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) {
        if (diffDays == 1) return `${diffDays} day ago`;
        return `${diffDays} days ago`;
    }

    const diffWeeks = Math.floor(diffDays / 7);
    if (diffWeeks < 5) {
        if (diffWeeks == 1) return `${diffWeeks} week ago`;
        return `${diffWeeks} weeks ago`;
    }

    const diffMonths = Math.floor(diffWeeks / 4);
    if (diffMonths < 12) {
        if (diffMonths==1) return `${diffMonths} month ago`;
        return `${diffMonths} months ago`;
    }

    // Display the raw date if post was over a year ago
    return `${post.getMonth()+1}/${post.getDate()}/${post.getFullYear()}`;
}



export const INITIAL_MAP_REGION = {
    latitude: 40.1055826,
    longitude: -88.22841,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1
}