export type Dict<T = any> = { [key: string]: T };

export type Callback = (...args: any[]) => void;

export type EventCallback = (event: any, ...args: any[]) => void;

export type ErrorCallback = (error: any, ...args: any[]) => void;

export interface DefaultCallbacks extends Dict<Callback | undefined> {
    onSuccess?: Callback;
    onError?: ErrorCallback;
    onEvent?: Callback;
}
export interface WampyWs extends Dict {
    onopen?: Callback;
    onclose?: EventCallback;
    onmessage?: EventCallback;
    onerror?: ErrorCallback;
    close?: Callback;
    send?: Callback;
    binaryType?: string;
    readyState?: number;
}

/**
 * WAMP features, supported by Wampy
 */
export interface WampFeatures {
    agent: string;
    roles: {
        publisher: {
            features: {
                subscriber_blackwhite_listing: boolean;
                publisher_exclusion: boolean;
                publisher_identification: boolean;
            };
        };
        subscriber: {
            features: {
                pattern_based_subscription: boolean;
                publication_trustlevels: boolean;
                publisher_identification: boolean;
            };
        };
        caller: {
            features: {
                caller_identification: boolean;
                progressive_call_results: boolean;
                call_canceling: boolean;
                call_timeout: boolean;
            };
        };
        callee: {
            features: {
                caller_identification: boolean;
                call_trustlevels: boolean;
                pattern_based_registration: boolean;
                shared_registration: boolean;
            };
        };
    };
}

/**
 * Internal cache for object lifetime
 */
export interface WampyCache {
    /**
     * WAMP Session ID
     */
    sessionId?: string | null;
    /**
     * WAMP Session scope requests ID
     */
    reqId: number;

    /**
     * Server WAMP roles and features
     */
    serverWampFeatures?: { roles: Dict<string> };
    /**
     * Are we in state of saying goodbye
     */
    isSayingGoodbye?: boolean;
    /**
     * Status of last operation
     */
    opStatus?: { code: number; description: string; reqId?: number };
    timer?: NodeJS.Timeout | null;
    reconnectingAttempts?: number;
}

export interface Serializer {
    protocol: string;
    isBinary: boolean;
    encode(data: any): any;
    decode(data: any): Dict;
}

export interface AdvancedOptions {
    /**
     * WAMP session id(s) that won't receive a published event,\
     * even though they may be subscribed
     */
    exclude?: Int | Int[];
    /**
     * Authentication id(s) that won't receive a published event,\
     * even though they may be subscribed
     */
    exclude_authid?: string | string[];
    /**
     * Authentication role(s) that won't receive a published event,\
     * even though they may be subscribed
     */
    exclude_authrole?: string | string[];
    /**
     * WAMP session id(s) that are allowed to receive a published event
     */
    eligible?: Int | Int[];
    /**
     * Authentication id(s) that are allowed to receive a published event
     */
    eligible_authid?: string | string[];
    /**
     * Authentication role(s) that are allowed to receive a published event
     */
    eligible_authrole?: string | string[];
    /**
     * Flag of receiving publishing event by initiator
     */
    exclude_me: boolean;
    /**
     * flag of disclosure of publisher identity (its WAMP session ID) to receivers of a published event
     */
    disclose_me: boolean;
}

export type Int = number;

export interface WampyData extends Dict {
    details: Dict;
    argsList: any[];
    argsDict: Dict;
}

export interface WampyErrorData extends WampyData {
    error: any;
}
