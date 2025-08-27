// detect if code is running on the server (SSR) or client
export const isServer = typeof window === 'undefined';

// detect if code is running on the client
export const isClient = !isServer;

// safe access to window object that returns undefined on server
export const safeWindow = isClient ? window : undefined;

// safe access to document object that returns undefined on server
export const safeDocument = isClient ? document : undefined;

// safe localStorage access that returns null on server
export const safeLocalStorage = isClient ? localStorage : null;
