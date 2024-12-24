import { AUTH_TOKEN_COOKIE_KEY, DOMAIN } from './global';

import { getAuthCookie } from './storage';



type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';



export const fetchBasic = async (route: string, method: Method, body?: string) => {
    const res = await fetch(`${DOMAIN}/api/app/${route}`, {
        method,
        body
    });
    return res;
}



export const fetchWithAuth = async (route: string, method: Method, body?: string) => {
    const authTokenCookie = await getAuthCookie();
    const res = await fetch(`${DOMAIN}/api/app/${route}`, {
        method,
        body,
        headers: {
            'Content-Type': 'application/json',
            'Cookie': `${AUTH_TOKEN_COOKIE_KEY}=${authTokenCookie}`
        }
    });
    return res;
}