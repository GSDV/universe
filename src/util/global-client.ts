import { PixelRatio } from 'react-native';



export const API_VERSION = 'v1';



// LISTENER KEYS
export const POST_OPERATION_EVENT_KEY = 'POST_OPERATION_EVENT_KEY';



// MEDIA:
export const DEFAULT_PFP_STR = '@assets/ui/default-profile-picture.png';
export const DEFAULT_PFP = require('@assets/ui/default-profile-picture.png');

export const pfpUrl = (key: string) => (key === '') ? DEFAULT_PFP_STR : `https://uni-verse.s3.us-east-2.amazonaws.com/${key}`;
export const pfpUri = (key: string) => (key === '') ? DEFAULT_PFP : {uri: pfpUrl(key)};

export const imgUrl = (key: string) => `https://uni-verse.s3.us-east-2.amazonaws.com/${key}`;



export const PRIMARY_1 = 'rgb(232, 70, 70)';
export const PRIMARY_2 = 'rgb(212, 59, 59)';
export const SECONDARY_1 = 'rgb(157, 2, 7)';
export const WHITE = 'rgb(232, 230, 229)';
export const LIGHT_GRAY = 'rgb(220, 220, 220)';
export const GRAY = 'rgb(117, 117, 117)';
export const DARK_GRAY = 'rgb(220, 220, 220)';
export const BLACK = 'rgb(20, 20, 20)';

export const COLORS = {
    white: WHITE,
    light_gray: LIGHT_GRAY,
    gray: GRAY,
    dark_gray: DARK_GRAY,
    black: BLACK,
    primary_1: PRIMARY_1,
    primary_2: PRIMARY_2,
    secondary_1: SECONDARY_1,
    text: BLACK,
    background: WHITE,
    tint: PRIMARY_1
}



const baseFontSize = 16;
export const FONT_SIZES = {
    s: PixelRatio.getFontScale() * baseFontSize * 0.8,
    m: PixelRatio.getFontScale() * baseFontSize,
    l: PixelRatio.getFontScale() * baseFontSize * 1.2,
    xl: PixelRatio.getFontScale() * baseFontSize * 1.4,
    xxl: PixelRatio.getFontScale() * baseFontSize * 1.8
};



export const INITIAL_MAP_REGION = {
    latitude: 40.1055826,
    longitude: -88.22841,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1
}



// UI FORMATTING:
export const formatPostDate = (date: string) => {
    const post = new Date(date);
    const now = new Date();
    const diff = Math.abs(now.getTime() - post.getTime()); // ms

    const diffSeconds = Math.floor(diff / 1000);
    if (diffSeconds < 60) return `${diffSeconds}s`;

    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d`;

    const postYear = post.getFullYear();
    const currentYear = now.getFullYear();

    // "Jun 6"
    if (postYear === currentYear) return post.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    // "Jun 6, 2020"
    return post.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}


// For formatting the like and reply count on a post
export const formatInteraction = (num: number) => {
    // Just in case
    if (num < 0) return `0`;

    // "125"
    if (num < 1000) return `${num}`;

    // "4.5k"
    if (num < 1000000) return `${Number((num / 1000).toFixed(1))}k`;

    // "7.2m"
    return `${Number((num / 1000000).toFixed(1))}m`;
}