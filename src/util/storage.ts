import AsyncStorage from '@react-native-async-storage/async-storage';

import { AUTH_TOKEN_COOKIE_KEY } from './global';



export const getAuthCookie = async () => {
    const authToken = await AsyncStorage.getItem(AUTH_TOKEN_COOKIE_KEY);
    return authToken;
}

export const setAuthCookie = async (val: string) => {
    await AsyncStorage.setItem(AUTH_TOKEN_COOKIE_KEY, val);
}