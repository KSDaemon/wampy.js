/**
 * Project: wampy.js
 *
 * https://github.com/KSDaemon/wampy.js
 *
 * A lightweight client-side implementation of
 * WAMP (The WebSocket Application Messaging Protocol v2)
 * http://wamp.ws
 *
 * Provides asynchronous RPC/PubSub over WebSocket.
 *
 * Copyright 2014 KSDaemon. Licensed under the MIT License.
 * See @license text at http://www.opensource.org/licenses/mit-license.php
 *
 */
import type { Dict, Callback, ErrorCallback, EventCallback, DefaultCallbacks, WampFeatures, WampyCache, WampyWs, PublishAdvancedOptions, RpcRegistration, WampyOptions, SuccessOrError, TopicType, ErrorData } from "./typedefs";
/**
 *
 */
/**
 * WAMP Client Class
 */
export declare class Wampy {
    /**
     * Wampy version
     */
    protected version: string;
    /**
     * WS Url
     */
    protected _url: string | null;
    /**
     * WS protocols
     */
    protected _protocols: string[];
    /**
     * WAMP features, supported by Wampy
     */
    protected _wamp_features: WampFeatures;
    /**
     * Internal cache for object lifetime
     */
    protected _cache: WampyCache;
    /**
     * WebSocket object
     */
    protected _ws: WampyWs | null;
    /**
     * Internal queue for websocket requests, for case of disconnect
     */
    protected _wsQueue: any[];
    /**
     * Internal queue for wamp requests
     */
    protected _requests: Dict;
    /**
     * Stored RPC
     */
    protected _calls: Dict | null;
    /**
     * Stored Pub/Sub
     */
    protected _subscriptions: Dict;
    /**
     * Stored Pub/Sub topics
     */
    protected _subsTopics: Set<string>;
    /**
     * Stored RPC Registrations
     */
    protected _rpcRegs: Dict<RpcRegistration>;
    /**
     * Stored RPC names
     */
    protected _rpcNames: Set<string>;
    /**
     * Options hash-table
     */
    protected _options: WampyOptions;
    /**
     * @param url Ws URL
     * @param options Wampy Options
     */
    constructor(url: string, options?: Dict);
    /**
     * Internal logger for debugging
     * @param args Args to pass into `console.log`
     * @internal
     * @protected
     */
    protected _log(...args: any): void;
    /**
     * Get the new unique request id
     * @internal
     * @protected
     */
    protected _getReqId(): number;
    /**
     * Merge argument objects into one
     * @param args - Objects to merge into one
     * @internal
     * @protected
     */
    protected _merge(...args: Dict[]): Dict;
    /**
     * Checks if a value is an array
     * @param obj - value to check
     * @internal
     * @protected
     */
    protected _isArray(obj: unknown): obj is any[];
    /**
     * Checks if a value is an object literal
     * @param obj Value to check
     * @internal
     * @protected
     */
    protected _isPlainObject(obj: unknown): obj is Dict;
    /**
     * Check if value is an object
     * @param obj Value to check
     * @internal
     * @protected
     */
    protected _isObject(obj: unknown): obj is object;
    /**
     * Fix websocket protocols based on options
     * @protected
     */
    protected _setWsProtocols(): void;
    /**
     * Prerequisite checks for any wampy api call
     * @param topicType
     * @param role
     * @param callbacks
     * @protected
     */
    protected _preReqChecks(topicType: TopicType, role: string, callbacks?: {
        onError: ErrorCallback;
    } | SuccessOrError | DefaultCallbacks | Callback): boolean;
    /**
     * Validate uri
     * @param uri Uri of the topic
     * @param patternBased boolean
     * @param allowWAMP boolean
     * @protected
     */
    protected _validateURI(uri: string, patternBased: boolean, allowWAMP: boolean): boolean;
    /**
     * Encode WAMP message
     * @param msg Array of messages to encode
     * @protected
     */
    protected _encode(msg: any[]): any;
    /**
     * Decode WAMP message
     * @param msg Message to decode
     * @protected
     */
    protected _decode(msg: any): Promise<any>;
    /**
     * Hard close of connection due to protocol violations
     * @param errorUri url of the error
     * @param details Details about the error
     * @protected
     */
    protected _hardClose(errorUri: string, details: string): void;
    /**
     * Send encoded message to server
     * @param msg Message to send to server
     * @protected
     */
    protected _send(msg?: any[]): void;
    /**
     * Reset internal state and cache
     * @protected
     */
    protected _resetState(): void;
    /**
     * Initialize internal websocket callbacks
     * @protected
     */
    protected _initWsCallbacks(): void;
    /**
     * Internal websocket on open callback
     * @protected
     */
    protected _wsOnOpen(): this;
    /**
     * Internal websocket on close callback
     * @param event
     * @protected
     */
    protected _wsOnClose(event: Dict): void;
    /**
     * Internal websocket onEvent callback
     * @param event Event for callback
     * @protected
     */
    protected _wsOnMessage(event: Dict): void;
    /**
     * Internal websocket on error callback
     * @param error Error arg to pass into onError callback
     * @protected
     */
    protected _wsOnError(error: ErrorData): void;
    /**
     * Reconnect to server in case of websocket error
     * @protected
     */
    protected _wsReconnect(): void;
    /**
     * Resubscribe to topics in case of communication error
     * @protected
     */
    protected _renewSubscriptions(): void;
    /**
     * Reregister RPCs in case of communication error
     * @protected
     */
    protected _renewRegistrations(): void;
    /**
     * Get or set Wampy options
     *
     * To get options - call without parameters\
     * To set options - pass hash-table with options values
     * @param opts WampyOptions to merge with current options
     */
    options(opts?: Partial<WampyOptions>): this | WampyOptions;
    /**
     * Get the status of last operation
     */
    getOpStatus(): WampyCache["opStatus"];
    /**
     * Get the WAMP Session ID
     */
    getSessionId(): string;
    /**
     * Connect to server
     * @param url New url (optional)
     */
    connect(url?: string): this;
    /**
     * Disconnect from server
     */
    disconnect(): this;
    /**
     * Abort WAMP session establishment
     */
    abort(): this;
    /**
     * Subscribe to a topic on a broker
     * @param topicURI - Uri to subscribe to
     * @param callbacks - if it is a function, it will be treated as published event callback or it can be hash table of callbacks
     * @param  advancedOptions - optional parameter
     */
    subscribe(topicURI: string, callbacks: EventCallback | DefaultCallbacks, advancedOptions?: {
        match: "prefix" | "wildcard";
    }): this;
    /**
     * Unsubscribe from topic
     * @param topicURI Topic to unsubscribe from
     * @param callbacks - if it is a function, it will be treated as published event callback to remove. Or it can be hash table of callbacks
     */
    unsubscribe(topicURI: string, callbacks?: EventCallback | DefaultCallbacks): this;
    /**
     * Publish a event to topic
     * @param topicURI
     * @param payload - payload to publish
     * @param callbacks - optional hash table of callbacks:
     * @param advancedOptions - optional parameter
     */
    publish(topicURI: string, payload: string | number | any[] | {
        argsList: any[];
        argsDict: Dict;
    }, callbacks?: SuccessOrError, advancedOptions?: PublishAdvancedOptions): this;
    /**
     * Remote Procedure Call
     * @param topicURI - Uri to call
     * @param payload - Payload to call with
     * @param  callbacks - if it is a function, it will be treated `as onSuccess` callback function, or hash table of callbacks
     * @param advancedOptions - optional parameter. Must include any or all of the options:
     * ```ts
     * {
     *      disclose_me: boolean // flag of disclosure of Caller identity (WAMP session ID) to endpoints of a routed call
     *      receive_progress: boolean // flag for receiving progressive results. In this case onSuccess function will be called every time on receiving result
     *      timeout: number // (in ms) for the call to finish
     * }
     * ```
     * @returns {this}
     */
    call(topicURI: string, payload: string | number | any[] | Dict | {
        argsList: any[];
        argsDict: Dict;
    }, callbacks?: Callback | DefaultCallbacks, advancedOptions?: {
        /**
         * flag of disclosure of Caller identity (WAMP session ID) to endpoints of a routed call
         */
        disclose_me?: boolean;
        /**
         * flag for receiving progressive results.\
         * In this case onSuccess function will be called every time on receiving result
         */
        receive_progress?: boolean;
        /**
         * Integer timeout (in ms) for the call to finish
         */
        timeout?: number;
    }): this;
    /**
     * RPC invocation cancelling
     *
     * @param reqId RPC call request ID
     * @param callbacks - if it is a function, it will be treated as `onSuccess` callback
     * @param advancedOptions - optional parameter. Must include any or all of the options:
     * ```ts
     * {
     *      mode: "skip" | "kill" | "killnowait"// Skip is default.
     * }
     * ```
     */
    cancel(reqId: number, callbacks?: Callback | DefaultCallbacks, advancedOptions?: {
        mode?: "skip" | "kill" | "killnowait";
    }): this;
    /**
     * RPC registration for invocation
     * @param topicURI uri of the topic
     * @param  callbacks - if it is a function, it will be treated as rpc callback
     *                          or it can be hash table of callbacks:
     * ```ts
     * {
     *      rpc: Callback
     *      onSuccess: Callback
     *      onError: ErrorCallback
     * }
     * ```
     * @param advancedOptions - optional parameter
     * ```ts
     * {
     *      match: "prefix"|"wildcard";
     *      invoke: "single" | "roundrobin" | "random" | "first" | "last";
     * }
     * ```
     */
    register(topicURI: string, 
    /**
     * if it is a function - it will be treated as rpc itself\
     * it can be hash table of callbacks
     */
    callbacks?: Callback | {
        /**
         * registered procedure
         */
        rpc?: Callback;
        /**
         * will be called on successful registration
         */
        onSuccess?: Callback;
        /**
         * will be called if registration would be aborted
         */
        onError?: ErrorCallback;
    }, advancedOptions?: {
        /**
         * string matching policy
         */
        match?: "prefix" | "wildcard";
        /**
         * string invocation policy
         */
        invoke?: "single" | "roundrobin" | "random" | "first" | "last";
    }): this;
    /**
     * RPC unregistration for invocation
     * @param topicURI - topic to unregister from
     * @param callbacks - if it is a function, it will treated as onSuccess callback
     */
    unregister(topicURI: string, callbacks?: Callback | Pick<DefaultCallbacks, "onSuccess" | "onError">): this;
}
export default Wampy;
//# sourceMappingURL=wampy.d.ts.map