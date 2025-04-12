import { localStorage } from './localStorage';
import { sessionStorage } from './sessionStorage';
import { cookies } from './cookies';

export const storageService = {
    local: localStorage,
    session: sessionStorage,
    cookies: cookies
};