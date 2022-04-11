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
import type { Dict, Callback, ErrorCallback, EventCallback, DefaultCallbacks, WampFeatures, WampyCache, WampyWs, AdvancedOptions } from "./typedefs";
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
    protected _ws: WampyWs;
    protected _wsQueue: any[];
    protected _requests: Dict;
    protected _calls: Dict | null;
    protected _subscriptions: Dict;
    protected _subsTopics: Set<string>;
    protected _rpcRegs: Dict;
    protected _rpcNames: Set<string>;
    protected _options: Dict;
    /**
     * @param url Ws URL
     * @param options Wampy Options
     */
    constructor(url: string, options?: Dict);
    /**
     * Internal logger
     * @protected
     */
    protected _log(...args: any): void;
    /**
     * Get the new unique request id
     * @returns {number}
     * @protected
     */
    protected _getReqId(): number;
    /**
     * Merge argument objects into one
     * @returns {Dict}
     * @protected
     */
    protected _merge(...args: Dict[]): Dict;
    /**
     * Check if value is array
     * @param {*} obj
     * @returns {obj is Array}
     * @protected
     */
    protected _isArray(obj: any): obj is Array<any>;
    /**
     * Check if value is object literal
     * @param obj
     */
    protected _isPlainObject(obj: any): obj is Dict;
    /**
     * Check if value is an object
     * @param {*} obj
     * @returns {boolean}
     * @protected
     */
    protected _isObject(obj: any): boolean;
    /**
     * Fix websocket protocols based on options
     * @protected
     */
    protected _setWsProtocols(): void;
    /**
     * Prerequisite checks for any wampy api call
     * @param topicType { topic: URI, patternBased: true|false, allowWAMP: true|false }
     * @param  role
     * @param callbacks
     * @returns {boolean}
     * @protected
     */
    protected _preReqChecks(topicType: {
        topic: string;
        patternBased: boolean;
        allowWAMP: boolean;
    }, role: string, callbacks: Callback | DefaultCallbacks): boolean;
    /**
     * Validate uri
     * @param {string} uri
     * @param {boolean} patternBased
     * @param {boolean} allowWAMP
     * @returns {boolean}
     * @protected
     */
    protected _validateURI(uri: string, patternBased: boolean, allowWAMP: boolean): boolean;
    /**
     * Encode WAMP message
     * @param {any[]} msg
     * @returns {*}
     * @protected
     */
    protected _encode(msg: any[]): any;
    /**
     * Decode WAMP message
     * @param  msg
     * @returns {Promise}
     * @protected
     */
    protected _decode(msg: any): Promise<any>;
    /**
     * Hard close of connection due to protocol violations
     * @param {string} errorUri
     * @param {string} details
     * @protected
     */
    protected _hardClose(errorUri: string, details: string): void;
    /**
     * Send encoded message to server
     * @param {any[]} [msg]
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
    protected _wsOnOpen(): this | undefined;
    /**
     * Internal websocket on close callback
     * @param {object} event
     * @protected
     */
    protected _wsOnClose(event: object): void;
    /**
     * Internal websocket on event callback
     * @param {object} event
     * @protected
     */
    protected _wsOnMessage(event: Dict): void;
    /**
     * Internal websocket on error callback
     * @param {object} error
     * @protected
     */
    protected _wsOnError(error: object): void;
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
     * To get options - call without parameters
     * To set options - pass hash-table with options values
     *
     * @param {object} [opts]
     * @returns {*}
     */
    options(opts: object): any;
    /**
     * Get the status of last operation
     *
     * @returns {object} with 2 fields: code, description
     *      code: 0 - if operation was successful
     *      code > 0 - if error occurred
     *      description contains details about error
     *      reqId: last send request ID
     */
    getOpStatus(): WampyCache["opStatus"];
    /**
     * Get the WAMP Session ID
     *
     * @returns {string} Session ID
     */
    getSessionId(): string;
    /**
     * Connect to server
     * @param {string} [url] New url (optional)
     * @returns {this}
     */
    connect(url?: string): this;
    /**
     * Disconnect from server
     * @returns {this}
     */
    disconnect(): this;
    /**
     * Abort WAMP session establishment
     *
     * @returns {this}
     */
    abort(): this;
    /**
     * Subscribe to a topic on a broker
     *
     * @param {string} topicURI
     * @param {function|object} callbacks - if it is a function - it will be treated as published event callback
     *                          or it can be hash table of callbacks:
     *                          { onSuccess: will be called when subscribe would be confirmed
     *                            onError: will be called if subscribe would be aborted
     *                            onEvent: will be called on receiving published event }
     * @param {{match: 'prefix'|'wildcard'}} advancedOptions - optional parameter. Must include any or all of the options:\
     *                          { match: string matching policy ("prefix"|"wildcard") }
     *
     * @returns {this}
     */
    subscribe(topicURI: string, callbacks: Callback | DefaultCallbacks, advancedOptions: {
        match: "prefix" | "wildcard";
    }): this;
    /**
     * Unsubscribe from topic
     * @param {string} topicURI
     * @param {EventCallback|import('./typedefs').DefaultCallbacks} callbacks - if it is a function - it will be treated as
     *                          published event callback to remove or it can be hash table of callbacks:
     *                          { onSuccess: will be called when unsubscribe would be confirmed
     *                            onError: will be called if unsubscribe would be aborted
     *                            onEvent: published event callback to remove }
     * @returns {this}
     */
    unsubscribe(topicURI: string, callbacks: EventCallback | DefaultCallbacks): this;
    /**
     * Publish a event to topic
     * @param {string} topicURI
     * @param {string|number|any[]|object} payload - can be either a value of any type or null.  Also it
     *                          is possible to pass array and object-like data simultaneously.
     *                          In this case pass a hash-table with next attributes:
     *                          {
     *                             argsList: array payload (may be omitted)
     *                             argsDict: object payload (may be omitted)
     *                          }
     * @param {{onSuccess?: Callback, onError?: Callback}} [callbacks] - optional hash table of callbacks:
     *                          { onSuccess: will be called when publishing would be confirmed
     *                            onError: will be called if publishing would be aborted }
     * @param {import('./typedefs').AdvancedOptions} [advancedOptions] - optional parameter. Must include any or all of the options:
     *                          { exclude: integer|array WAMP session id(s) that won't receive a published event,
     *                                      even though they may be subscribed
     *                            exclude_authid: string|array Authentication id(s) that won't receive
     *                                      a published event, even though they may be subscribed
     *                            exclude_authrole: string|array Authentication role(s) that won't receive
     *                                      a published event, even though they may be subscribed
     *                            eligible: integer|array WAMP session id(s) that are allowed
     *                                      to receive a published event
     *                            eligible_authid: string|array Authentication id(s) that are allowed
     *                                      to receive a published event
     *                            eligible_authrole: string|array Authentication role(s) that are allowed
     *                                      to receive a published event
     *                            exclude_me: bool flag of receiving publishing event by initiator
     *                            disclose_me: bool flag of disclosure of publisher identity (its WAMP session ID)
     *                                      to receivers of a published event }
     * @returns {this}
     */
    publish(topicURI: string, payload: string | number | any[] | Dict, callbacks: {
        onSuccess?: Callback;
        onError?: Callback;
    }, advancedOptions: AdvancedOptions): this;
    /**
     * Remote Procedure Call
     * @param topicURI - Uri to call
     * @param payload - can be either a value of any type or null.\
     *                  Also it is possible to pass array and object-like data simultaneously.\
     *                  In this case pass a hash-table with next attributes:\
     *                  {\
     *                      argsList: array payload (may be omitted)\
     *                      argsDict: object payload (may be omitted)\
     *                  }
     * @param  callbacks - if it is a function - it will be treated as result callback function\
     *                     or it can be hash table of callbacks:\
     *                     {\
     *                          onSuccess: will be called with result on successful call\
     *                          onError: will be called if invocation would be aborted\
     *                     }
     * @param advancedOptions - optional parameter. Must include any or all of the options:
     *                          { disclose_me: bool flag of disclosure of Caller identity (WAMP session ID)
     *                                  to endpoints of a routed call
     *                            receive_progress: bool flag for receiving progressive results. In this case
     *                                  onSuccess function will be called every time on receiving result
     *                            timeout: integer timeout (in ms) for the call to finish }
     * @returns {this}
     */
    call(topicURI: string, payload: string | number | any[] | Dict | {
        argsList: any[];
        argsDict: Dict;
    }, callbacks: Callback | DefaultCallbacks, advancedOptions: {
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
     * @param callbacks - if it is a function - it will be called if successfully
     *                          sent canceling message or it can be hash table of callbacks:
     *                          { onSuccess: will be called if successfully sent canceling message
     *                            onError: will be called if some error occurred }
     * @param {object} advancedOptions - optional parameter. Must include any or all of the options:
     *                          { mode: string|one of the possible modes:
     *                                  "skip" | "kill" | "killnowait". Skip is default.
     *                          }
     *
     * @returns {this}
     */
    cancel(reqId: number, callbacks: Callback | DefaultCallbacks, advancedOptions: {
        mode?: "skip" | "kill" | "killnowait";
    }): this;
    /**
     * RPC registration for invocation
     * @param {string} topicURI
     * @param  callbacks - if it is a function - it will be treated as rpc itself
     *                          or it can be hash table of callbacks:
     *                          { rpc: registered procedure
     *                            onSuccess: will be called on successful registration
     *                            onError: will be called if registration would be aborted }
     * @param advancedOptions - optional parameter
     * @returns {this}
     */
    register(topicURI: string, 
    /**
     * if it is a function - it will be treated as rpc itself\
     * it can be hash table of callbacks
     */
    callbacks: Callback | {
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
     * @param {string} topicURI
     * @param {function|object} callbacks - if it is a function, it will be called on successful unregistration
     *                          or it can be hash table of callbacks:
     *                          { onSuccess: will be called on successful unregistration
     *                            onError: will be called if unregistration would be aborted }
     * @returns {this}
     */
    unregister(topicURI: string, callbacks: Callback | Dict<Callback>): this;
}
export default Wampy;
//# sourceMappingURL=wampy.d.ts.map