import { AUTH_TOKEN_COOKIE_KEY } from './global';

import { API_VERSION } from './global-client'

import { getAuthCookie } from './storage';



type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';



export const fetchBasic = async (route: string, method: Method, body?: string) => {
    try {
        const DOMAIN = process.env.EXPO_PUBLIC_DOMAIN;
        if (DOMAIN === undefined) throw new Error('EXPO_PUBLIC_DOMAIN is undefined.');

        const res = await fetch(`${DOMAIN}/api/${API_VERSION}/app/${route}`, {
            method,
            body,
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const resJson = await res.json();
        return resJson;
    } catch (err) {
        return { msg: `Something went wrong.`, cStatus: 800 };
    }
}



export const fetchWithAuth = async (route: string, method: Method, body?: string) => {
    try {
        const DOMAIN = process.env.EXPO_PUBLIC_DOMAIN;
        if (DOMAIN === undefined) throw new Error('EXPO_PUBLIC_DOMAIN is undefined.');

        const authTokenCookie = await getAuthCookie();
        const res = await fetch(`${DOMAIN}/api/${API_VERSION}/app/${route}`, {
            method,
            body,
            headers: {
                'Content-Type': 'application/json',
                'Cookie': `${AUTH_TOKEN_COOKIE_KEY}=${authTokenCookie}`
            }
        });
        const resJson = await res.json();
        return resJson;
    } catch (err) {
        return { msg: `Something went wrong.`, cStatus: 800 };
    }
}