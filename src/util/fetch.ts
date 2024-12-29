import { AUTH_TOKEN_COOKIE_KEY, DOMAIN } from './global';

import { getAuthCookie } from './storage';



type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';



export const fetchBasic = async (route: string, method: Method, body?: string) => {
    try {
        const res = await fetch(`${DOMAIN}/api/app/${route}`, {
            method,
            headers: {
                'Content-Type': 'application/json'
            },
            body
        });
        const resJson = await res.json();
        return resJson;
    } catch (err) {
        return { msg: `Something went wrong.`, cStatus: 800 };
    }
}



export const fetchWithAuth = async (route: string, method: Method, body?: string) => {
    try {
        const authTokenCookie = await getAuthCookie();
        const res = await fetch(`${DOMAIN}/api/app/${route}`, {
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