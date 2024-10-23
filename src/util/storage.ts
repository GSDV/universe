import AsyncStorage from '@react-native-async-storage/async-storage';

import { AUTH_TOKEN_COOKIE_KEY, USER_ID_COOKIE_KEY } from './globals';



export const getAuthCookie = async () => {
    const authToken = await AsyncStorage.getItem(AUTH_TOKEN_COOKIE_KEY);
    return authToken;
}

export const setAuthCookie = async (val: string) => {
    await AsyncStorage.setItem(AUTH_TOKEN_COOKIE_KEY, val);
}



export const getUserIdCookie = async () => {
    const userId = await AsyncStorage.getItem(USER_ID_COOKIE_KEY);
    return userId;
}

export const setUserIdCookie = async (val: string) => {
    await AsyncStorage.setItem(USER_ID_COOKIE_KEY, val);
}