import * as SecureStore from 'expo-secure-store';

import { AUTH_TOKEN_COOKIE_KEY } from './global';



export const getAuthCookie = async () => {
    const authToken = await SecureStore.getItemAsync(AUTH_TOKEN_COOKIE_KEY);
    return authToken;
}

export const setAuthCookie = async (val: string) => {
    await SecureStore.setItemAsync(AUTH_TOKEN_COOKIE_KEY, val);
}