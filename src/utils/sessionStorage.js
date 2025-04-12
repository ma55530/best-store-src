export const sessionStorage = {
    set: (key, value) => {
        window.sessionStorage.setItem(key, JSON.stringify(value));
    },
    get: (key) => {
        const item = window.sessionStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    },
    remove: (key) => {
        window.sessionStorage.removeItem(key);
    },
    clear: () => {
        window.sessionStorage.clear();
    }
};