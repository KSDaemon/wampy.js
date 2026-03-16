/**
 * Core type definitions for Wampy.js
 *
 * Contains all interfaces, types, and enums used by the Wampy class
 * and its internal structures.
 */

import type { Serializer } from './serializers/serializer.js';
import type { Deferred } from './utils.js';
import type { WAMP_MSG_SPEC } from './constants.js';

// ---------------------------------------------------------------------------
// WAMP Message IDs
// ---------------------------------------------------------------------------

/** Union of all WAMP message type numeric IDs */
export type WampMessageType = (typeof WAMP_MSG_SPEC)[keyof typeof WAMP_MSG_SPEC];

/** A WAMP message is an array whose first element is the message type */
export type WampMessage = [WampMessageType, ...unknown[]];

// ---------------------------------------------------------------------------
// Operation Status
// ---------------------------------------------------------------------------

/** Status of the last Wampy operation */
export interface WampyOpStatus {
    /** 0 if operation was successful, > 0 if error occurred */
    code: number;
    /** Error instance containing details, or null on success */
    error: Error | null;
    /** Request ID of the last successfully sent operation */
    reqId: number;
}

// ---------------------------------------------------------------------------
// Callback Data Types
// ---------------------------------------------------------------------------

/** Data received in a subscription event callback */
export interface EventData {
    details: Record<string, unknown>;
    argsList?: unknown[];
    argsDict?: Record<string, unknown>;
}

/** Data received in a call result callback */
export interface CallResult {
    details: Record<string, unknown>;
    argsList?: unknown[];
    argsDict?: Record<string, unknown>;
}

/** Data received by a registered RPC invocation handler */
export interface InvocationData {
    details: Record<string, unknown>;
    argsList?: unknown[];
    argsDict?: Record<string, unknown>;
    result_handler: (result?: InvocationResult | null) => void;
    error_handler: (error: InvocationErrorData) => void;
}

/** Data returned/thrown by an RPC invocation handler */
export interface InvocationResult {
    argsList?: unknown[];
    argsDict?: Record<string, unknown>;
    options?: InvocationResultOptions;
}

/** Options that can be included in an invocation result */
export interface InvocationResultOptions {
    progress?: boolean;
    ppt_scheme?: string;
    ppt_serializer?: string;
    ppt_cipher?: string;
    ppt_keyid?: string;
    [key: string]: unknown;
}

/** Error data for invocation error handler */
export interface InvocationErrorData {
    error?: string;
    details?: Record<string, unknown>;
    argsList?: unknown[];
    argsDict?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Callback Function Types
// ---------------------------------------------------------------------------

/** Callback for subscription events */
export type EventCallback = (data: EventData) => void | Promise<void>;

/** Callback for RPC invocations */
export type RPCCallback = (data: InvocationData) => InvocationResult | null | void | Promise<InvocationResult | null | void>;

/** Callback for challenge authentication (manual mode) */
export type OnChallengeCallback = (authMethod: string, extra: Record<string, unknown>) => string | Promise<string>;

/** Auth plugin function (auto mode) */
export type AuthPlugin = (authMethod: string, extra: Record<string, unknown>) => string | Promise<string>;

/** Callback for successful subscribe result */
export interface SubscribeSuccessResult {
    topic: string;
    requestId: number;
    subscriptionId: number;
    subscriptionKey: string;
}

/** Callback for successful unsubscribe result */
export interface UnsubscribeSuccessResult {
    topic: string;
    requestId: number;
}

/** Callback for successful publish result */
export interface PublishSuccessResult {
    topic: string;
    requestId: number;
    publicationId: number;
}

/** Callback for successful register result */
export interface RegisterSuccessResult {
    topic: string;
    requestId: number;
    registrationId: number;
}

/** Callback for successful unregister result */
export interface UnregisterSuccessResult {
    topic: string;
    requestId: number;
}

// ---------------------------------------------------------------------------
// User-supplied Payload
// ---------------------------------------------------------------------------

/** Payload that can be passed to publish, call, or yielded from an RPC */
export type Payload = unknown[] | Record<string, unknown> | PayloadWithArgsKwargs | string | number | boolean | null;

/** Payload with explicit argsList and argsDict */
export interface PayloadWithArgsKwargs {
    argsList?: unknown[];
    argsDict?: Record<string, unknown>;
    [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// PPT (Payload Passthru) Payload
// ---------------------------------------------------------------------------

/** Result of packing a PPT payload */
export interface PackPPTPayloadResult {
    err: boolean;
    payloadItems: unknown[];
}

/** Result of unpacking a PPT payload */
export interface UnpackPPTPayloadResult {
    err?: Error | false;
    args?: unknown[];
    kwargs?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Advanced Options for Public API
// ---------------------------------------------------------------------------

/** Advanced options for subscribe() */
export interface SubscribeAdvancedOptions {
    /** Matching policy */
    match?: 'exact' | 'prefix' | 'wildcard';
    /** Request access to the Retained Event */
    get_retained?: boolean;
    /** Custom WAMP attributes (must match `_[a-z0-9_]{3,}` pattern) */
    [key: string]: unknown;
}

/** Advanced options for publish() */
export interface PublishAdvancedOptions {
    /** WAMP session ID(s) that won't receive a published event */
    exclude?: number | number[];
    /** Authentication ID(s) that won't receive a published event */
    exclude_authid?: string | string[];
    /** Authentication role(s) that won't receive a published event */
    exclude_authrole?: string | string[];
    /** WAMP session ID(s) that are allowed to receive a published event */
    eligible?: number | number[];
    /** Authentication ID(s) that are allowed to receive a published event */
    eligible_authid?: string | string[];
    /** Authentication role(s) that are allowed to receive a published event */
    eligible_authrole?: string | string[];
    /** Flag of receiving publishing event by initiator */
    exclude_me?: boolean;
    /** Flag of disclosure of publisher identity to receivers */
    disclose_me?: boolean;
    /** Identifies the Payload Schema */
    ppt_scheme?: string;
    /** Specifies what serializer was used to encode the payload */
    ppt_serializer?: string;
    /** Specifies the cryptographic algorithm that was used to encrypt the payload */
    ppt_cipher?: string;
    /** Contains the encryption key id that was used to encrypt the payload */
    ppt_keyid?: string;
    /** Ask broker to mark this event as retained */
    retain?: boolean;
    /** Custom WAMP attributes (must match `_[a-z0-9_]{3,}` pattern) */
    [key: string]: unknown;
}

/** Advanced options for call() */
export interface CallAdvancedOptions {
    /** Flag of disclosure of Caller identity to endpoints of a routed call */
    disclose_me?: boolean;
    /** Function for handling progressive call results */
    progress_callback?: (data: CallResult) => void | Promise<void>;
    /** Timeout (in ms) for the call to finish */
    timeout?: number;
    /** Identifies the Payload Schema */
    ppt_scheme?: string;
    /** Specifies what serializer was used to encode the payload */
    ppt_serializer?: string;
    /** Specifies the cryptographic algorithm that was used to encrypt the payload */
    ppt_cipher?: string;
    /** Contains the encryption key id that was used to encrypt the payload */
    ppt_keyid?: string;
    /** Custom WAMP attributes (must match `_[a-z0-9_]{3,}` pattern) */
    [key: string]: unknown;
}

/** Advanced options for progressiveCall sendData() */
export interface ProgressiveCallSendDataOptions {
    /**
     * Flag indicating the ongoing (true) or final (false) call invocation.
     * If omitted, treated as true (ongoing). For the final call, set to false.
     */
    progress?: boolean;
    /** Custom WAMP attributes (must match `_[a-z0-9_]{3,}` pattern) */
    [key: string]: unknown;
}

/** Advanced options for cancel() */
export interface CancelAdvancedOptions {
    /** Cancellation mode */
    mode?: 'skip' | 'kill' | 'killnowait';
    /** Custom WAMP attributes (must match `_[a-z0-9_]{3,}` pattern) */
    [key: string]: unknown;
}

/** Advanced options for register() */
export interface RegisterAdvancedOptions {
    /** Matching policy */
    match?: 'exact' | 'prefix' | 'wildcard';
    /** Invocation policy for shared registrations */
    invoke?: 'single' | 'roundrobin' | 'random' | 'first' | 'last';
    /** Custom WAMP attributes (must match `_[a-z0-9_]{3,}` pattern) */
    [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Progressive Call Types
// ---------------------------------------------------------------------------

/** Function to send additional data in a progressive call */
export type ProgressiveCallSendData = (payload?: Payload, advancedOptions?: ProgressiveCallSendDataOptions) => void;

/** Return value of progressiveCall() */
export interface ProgressiveCallReturn {
    /** A promise that resolves to the result of the RPC call */
    result: Promise<CallResult>;
    /** A function to send additional data to the ongoing RPC call */
    sendData: ProgressiveCallSendData;
}

// ---------------------------------------------------------------------------
// WampyOptions — Constructor / setOptions configuration
// ---------------------------------------------------------------------------

/** User-provided WebSocket constructor type */
export type WebSocketConstructor = {
    new (url: string, protocols?: string[], origin?: null, headers?: Record<string, string>, requestOptions?: Record<string, unknown>): WebSocket;
};

/** Configuration options for the Wampy class */
export interface WampyOptions {
    /** Enable debug logging */
    debug?: boolean;

    /** Custom logger function */
    logger?: ((...args: unknown[]) => void) | null;

    /** Automatically reconnect on connection loss */
    autoReconnect?: boolean;

    /** Reconnection interval in milliseconds */
    reconnectInterval?: number;

    /** Maximum number of reconnection retries (0 = unlimited) */
    maxRetries?: number;

    /** WAMP Realm to join */
    realm?: string | null;

    /** Custom attributes to send to router on hello */
    helloCustomDetails?: Record<string, unknown> | null;

    /** Validation of the topic URI structure */
    uriValidation?: 'strict' | 'loose';

    /** Authentication ID to use in challenge */
    authid?: string | null;

    /** Supported authentication methods */
    authmethods?: string[];

    /** Additional authentication options (e.g., used in WAMP CryptoSign) */
    authextra?: Record<string, unknown>;

    /** Authentication helpers for processing different authmethods challenge flows */
    authPlugins?: Record<string, AuthPlugin>;

    /** Mode of authorization flow */
    authMode?: 'manual' | 'auto';

    /** Callback for challenge-based authentication */
    onChallenge?: OnChallengeCallback | null;

    /** Callback when connection closes */
    onClose?: (() => void) | null;

    /** Callback when an error occurs */
    onError?: ((error: Error) => void | Promise<void>) | null;

    /** Callback when reconnecting */
    onReconnect?: (() => void) | null;

    /** Callback when reconnection succeeds */
    onReconnectSuccess?: ((details: Record<string, unknown>) => void | Promise<void>) | null;

    /** User-provided WebSocket class */
    ws?: WebSocketConstructor | null;

    /** Additional HTTP headers (for use in Node.js environment) */
    additionalHeaders?: Record<string, string> | null;

    /** WS Client Config Options (for use in Node.js environment) */
    wsRequestOptions?: Record<string, unknown> | null;

    /** Serializer to use for WAMP messages */
    serializer?: Serializer;

    /** Serializers for Payload Passthru Mode, keyed by serializer name */
    payloadSerializers?: Record<string, Serializer>;
}

// ---------------------------------------------------------------------------
// Internal Cache / State
// ---------------------------------------------------------------------------

/** Internal cache for Wampy object lifetime */
export interface WampyCache {
    /** WAMP Session ID */
    sessionId: number | null;

    /** WAMP Session scope requests ID counter */
    reqId: number;

    /** Server WAMP roles and features */
    server_wamp_features: ServerWampFeatures;

    /** Whether we are in the process of saying goodbye */
    isSayingGoodbye?: boolean;

    /** Status of last operation */
    opStatus: WampyOpStatus;

    /** Timer for reconnection */
    timer: ReturnType<typeof setTimeout> | null;

    /** Reconnection attempts counter */
    reconnectingAttempts: number;

    /** Promise for onConnect */
    connectPromise: Deferred<Record<string, unknown>> | null;

    /** Promise for onClose */
    closePromise: Deferred<void> | null;
}

/** Server WAMP features as returned in the WELCOME message */
export interface ServerWampFeatures {
    roles: Record<string, ServerWampRole>;
    [key: string]: unknown;
}

/** A single WAMP server role with its features */
export interface ServerWampRole {
    features: Record<string, boolean>;
}

// ---------------------------------------------------------------------------
// WAMP Features (Client-side)
// ---------------------------------------------------------------------------

/** Client-side WAMP features structure sent in HELLO */
export interface WampFeatures {
    agent: string;
    roles: {
        publisher: { features: Record<string, boolean> };
        subscriber: { features: Record<string, boolean> };
        caller: { features: Record<string, boolean> };
        callee: { features: Record<string, boolean> };
    };
}

// ---------------------------------------------------------------------------
// Internal Subscription and Registration Types
// ---------------------------------------------------------------------------

/** Internal subscription structure stored by ID or key */
export interface SubscriptionCallbacksHash {
    id: number;
    topic: string;
    advancedOptions?: SubscribeAdvancedOptions;
    callbacks: EventCallback[];
}

/** Internal RPC registration structure */
export interface RegistrationCallbacksHash {
    id: number;
    callbacks: RPCCallback[];
    options?: RegisterAdvancedOptions;
}

// ---------------------------------------------------------------------------
// Internal Request Types
// ---------------------------------------------------------------------------

/** Deferred with additional callback properties for subscribe requests */
export interface SubscribeRequestCallbacks extends Deferred<SubscribeSuccessResult> {
    onEvent: EventCallback;
}

/** Deferred with an additional rpc property for register requests */
export interface RegisterRequestCallbacks extends Deferred<RegisterSuccessResult> {
    rpc: RPCCallback;
}

/** Internal pending subscribe request */
export interface SubscribeRequest {
    topic: string;
    callbacks: SubscribeRequestCallbacks;
    advancedOptions?: SubscribeAdvancedOptions;
}

/** Internal pending unsubscribe request */
export interface UnsubscribeRequest {
    topic: string;
    callbacks: Deferred<UnsubscribeSuccessResult>;
    advancedOptions?: SubscribeAdvancedOptions;
}

/** Internal pending publish request */
export interface PublishRequest {
    topic: string;
    callbacks: Deferred<PublishSuccessResult>;
}

/** Internal pending register request */
export interface RegisterRequest {
    topic: string;
    callbacks: RegisterRequestCallbacks;
    options?: RegisterAdvancedOptions;
}

/** Internal pending unregister request */
export interface UnregisterRequest {
    topic: string;
    callbacks: Deferred<UnregisterSuccessResult>;
}

/** Internal pending request stored in `_requests` */
export type WampRequest = SubscribeRequest | UnsubscribeRequest | PublishRequest | RegisterRequest | UnregisterRequest;

/** Internal pending call stored in `_calls` */
export interface WampCall extends Deferred<CallResult> {
    onProgress?: (data: CallResult) => void | Promise<void>;
}

// ---------------------------------------------------------------------------
// Topic Type check parameter
// ---------------------------------------------------------------------------

/** Parameter for _preReqChecks topic type validation */
export interface TopicType {
    topic: string;
    patternBased: boolean;
    allowWAMP: boolean;
}

// ---------------------------------------------------------------------------
// WAMP Roles (for _preReqChecks)
// ---------------------------------------------------------------------------

/** WAMP Router roles used in prerequisite checks */
export type WampRole = 'dealer' | 'broker';
