import { isNode } from './constants.js';

/**
 * Deferred promise object with exposed resolve and reject callbacks.
 */
export interface Deferred<T = unknown> {
    promise: Promise<T>;
    onSuccess: (value: T | PromiseLike<T>) => void;
    onError: (reason?: unknown) => void;
}

/**
 * Configuration object for getWebSocket.
 */
interface GetWebSocketConfig {
    url?: string;
    protocols?: string[];
    options?: {
        ws?: { new (url: string, protocols?: string[], origin?: null, headers?: Record<string, string>, requestOptions?: Record<string, unknown>): WebSocket };
        additionalHeaders?: Record<string, string>;
        wsRequestOptions?: Record<string, unknown>;
    };
    isBrowserMock?: boolean;
}

function isWebSocketSchemeSpecified (url: string): boolean {
    return /^ws(s)?:\/\//.test(url);
}

function getServerUrlForNode (url: string): string | null {
    return isWebSocketSchemeSpecified(url) ? url : null;
}

function getServerUrlForBrowser (url?: string): string | null {
    if (url && isWebSocketSchemeSpecified(url)) {
        return url;
    }

    const isSecureProtocol = globalThis.location.protocol === 'https:';
    const scheme = isSecureProtocol ? 'wss://' : 'ws://';
    const port = globalThis.location.port ? `:${globalThis.location.port}` : '';

    if (!url) {
        return `${scheme}${globalThis.location.hostname}${port}/ws`;
    }

    if (url.startsWith('/')) {    // just path on current server
        return `${scheme}${globalThis.location.hostname}${port}${url}`;
    }

    // assuming just domain + path
    return `${scheme}${url}`;
}

/** Get a WebSocket object from the browser's window global variable */
function getWebSocketFromWindowObject (parsedUrl: string, protocols?: string[]): WebSocket | null {
    if (globalThis?.WebSocket) {
        return new globalThis.WebSocket(parsedUrl, protocols);
    }

    return null;
}

/** Get a WebSocket object according to the user's current environment */
export function getWebSocket ({ url, protocols, options, isBrowserMock }: GetWebSocketConfig = {}): WebSocket | null {
    const { ws, additionalHeaders, wsRequestOptions } = options || {};
    const isActualNode = isNode && !isBrowserMock;

    if (!ws && isActualNode) {
        return null;
    }

    const parsedUrl = isActualNode ? getServerUrlForNode(url!) : getServerUrlForBrowser(url);

    if (!parsedUrl) {
        return null;
    }

    if (ws) {    // User-provided WebSocket class
        return new ws(parsedUrl, protocols, null, additionalHeaders, wsRequestOptions);
    }

    return getWebSocketFromWindowObject(parsedUrl, protocols);
}

/** Create a new deferred promise with exposed resolve and reject callbacks */
export function getNewPromise<T = unknown> (): Deferred<T> {
    const deferred = {} as Deferred<T>;

    deferred.promise = new Promise<T>(function (resolve, reject) {
        deferred.onSuccess = resolve;
        deferred.onError = reject;
    });

    return deferred;
}
