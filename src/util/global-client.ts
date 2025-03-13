import { Dimensions, PixelRatio } from 'react-native';



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
export const WHITE = 'rgb(255, 255, 255)';
export const LIGHT_GRAY = 'rgb(240, 240, 240)';
export const GRAY = 'rgb(130, 130, 130)';
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



const BASE_WDITH = 375;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SCALED_FONT = (size: number): number => {
    const scaleFactor = SCREEN_WIDTH / BASE_WDITH;
    const newSize = size * scaleFactor;
    console.log(Math.round(PixelRatio.roundToNearestPixel(newSize)));
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

export const FONT_SIZES = {
    s: SCALED_FONT(12),
    m: SCALED_FONT(16),
    l: SCALED_FONT(18),
    xl: SCALED_FONT(20),
    xxl: SCALED_FONT(24)
};



export const TAB_BAR_HEIGHT = 80;



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