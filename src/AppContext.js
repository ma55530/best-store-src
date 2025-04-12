import { createContext, useState, useEffect } from 'react';
import { storageService } from './utils/storageService';

export const AppContext = createContext();

export function AppProvider({ children }) {
    const [userCredentials, setUserCredentials] = useState(() => {
        // Try to get stored credentials on app load
        return storageService.local.get('userCredentials') || null;
    });

    // Update storage whenever credentials change
    useEffect(() => {
        if (userCredentials) {
            storageService.local.set('userCredentials', userCredentials);
            // Optional: Also store in session/cookies
            storageService.session.set('userSession', userCredentials);
            storageService.cookies.set('userToken', userCredentials.accessToken);
        } else {
            storageService.local.remove('userCredentials');
            storageService.session.remove('userSession');
            storageService.cookies.remove('userToken');
        }
    }, [userCredentials]);

    return (
        <AppContext.Provider value={{ userCredentials, setUserCredentials }}>
            {children}
        </AppContext.Provider>
    );
}