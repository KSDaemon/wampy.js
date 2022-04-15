/// <reference types="node" />
export declare type Dict<T = any> = {
    [key: string]: T;
};
export declare type Callback = (...args: any[]) => void;
export declare type EventCallback = (event: any, ...args: any[]) => void;
export interface ErrorData {
    error: string;
    details?: string;
}
export declare type ErrorCallback = (error: ErrorData, ...args: any[]) => void;
export interface DefaultCallbacks extends Dict<Callback | undefined> {
    onSuccess?: Callback;
    onError?: ErrorCallback;
    onEvent?: EventCallback;
}
export declare type SuccessOrError = Pick<DefaultCallbacks, "onSuccess" | "onError">;
export interface WampyWs extends Dict {
    onopen?: Callback;
    onclose?: EventCallback;
    onmessage?: EventCallback;
    onerror?: ErrorCallback;
    close?: Callback;
    send?: Callback;
    protocol?: string;
    binaryType?: string;
    readyState?: number;
}
export interface WampyOptions extends Dict {
    /**
     * Logging
     */
    debug: boolean;
    /**
     * Reconnecting flag
     */
    autoReconnect: boolean;
    /**
     * Reconnecting interval (in ms)
     */
    reconnectInterval: number;
    /**
     * Maximum reconnection retries
     */
    maxRetries: number;
    /**
     * WAMP Realm to join
     */
    realm: string | null;
    /**
     * Custom attributes to send to router on hello
     */
    helloCustomDetails: Dict | null;
    /**
     * Validation of the topic URI structure
     */
    uriValidation: "strict" | "loose";
    /**
     * Authentication id to use in challenge
     */
    authid: string | null;
    /**
     * Supported authentication methods
     */
    authmethods: any[];
    /**
     * onChallenge callback
     * @type {Callback}
     */
    onChallenge: Callback | null;
    /**
     * onConnect callback
     * @type {Callback}
     */
    onConnect: Callback | null;
    /**
     * onClose callback
     * @type {Callback}
     */
    onClose: Callback | null;
    /**
     * onError callback
     * @type {ErrorCallback}
     */
    onError: ErrorCallback | null;
    /**
     * onReconnect callback
     * @type {Callback}
     */
    onReconnect: Callback | null;
    /**
     * onReconnectSuccess callback
     */
    onReconnectSuccess: Callback | null;
    /**
     * User provided WebSocket class
     */
    ws: typeof WebSocket | null;
    /**
     * User provided additional HTTP headers (for use in Node.js enviroment)
     * @type {Dict}
     */
    additionalHeaders: Dict | null;
    /**
     * User provided WS Client Config Options (for use in Node.js enviroment)
     */
    wsRequestOptions: Dict | null;
    /**
     * User provided msgpack class
     */
    serializer: Serializer;
}
export interface RpcRegistration extends Dict {
    id: string;
    callbacks: Callback[];
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
    serverWampFeatures?: {
        roles: Dict<string>;
    };
    /**
     * Are we in state of saying goodbye
     */
    isSayingGoodbye?: boolean;
    /**
     * Status of last operation
     */
    opStatus?: {
        /**
         * Status code\
         * `0` if success
         * >0 if error
         */
        code: number;
        /**
         * Details about the error
         */
        description: string;
        /**
         * Last send request id
         */
        reqId?: number;
    };
    /**
     * Timer for reconnection
     */
    timer?: NodeJS.Timeout | null;
    /**
     * Reconnection attempts
     */
    reconnectingAttempts?: number;
}
export interface Serializer {
    protocol: string;
    isBinary: boolean;
    encode(data: any): any;
    decode(data: any): Promise<Dict>;
}
export interface PublishAdvancedOptions {
    /**
     * WAMP session id(s) that won't receive a published event,\
     * even though they may be subscribed
     */
    exclude?: number | number[];
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
    eligible?: number | number[];
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
export interface WampyData extends Dict {
    details: Dict;
    argsList: any[];
    argsDict: Dict;
}
export interface WampyErrorData extends WampyData {
    error: any;
}
export interface TopicType {
    /**
     * Topic name
     */
    topic: string;
    /**
     * Is it pattern based
     */
    patternBased: boolean;
    /**
     * Does it allow wamp?
     */
    allowWAMP: boolean;
}
//# sourceMappingURL=typedefs.d.ts.map