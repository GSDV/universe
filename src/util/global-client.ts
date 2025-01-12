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



// UI
export const PRIMARY = 'rgb(232, 70, 70)';
export const SECONDARY = 'rgb(157, 2, 7)';
export const WHITE = 'rgb(245, 245, 245)';
export const LIGHT_GRAY = 'rgb(230, 230, 230)';
export const GRAY = 'rgb(117, 117, 117)';
export const BLACK = 'rgb(20, 20, 20)';
export const COLORS = {
    white: WHITE,
    light_gray: LIGHT_GRAY,
    gray: GRAY,
    black: BLACK,
    primary: PRIMARY,
    secondary: SECONDARY,
    text: BLACK,
    background: WHITE,
    tint: PRIMARY
};

const baseFontSize = 16;
export const FONT_SIZES = {
    s: PixelRatio.getFontScale() * baseFontSize * 0.8,
    m: PixelRatio.getFontScale() * baseFontSize,
    l: PixelRatio.getFontScale() * baseFontSize * 1.2,
    xl: PixelRatio.getFontScale() * baseFontSize * 1.4,
    xxl: PixelRatio.getFontScale() * baseFontSize * 1.8
};



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