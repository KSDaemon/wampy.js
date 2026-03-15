/**
 * Common interface for WAMP serializers.
 *
 * All serializers must implement this interface to be used with Wampy.
 */
export interface Serializer {
    /** WAMP sub-protocol identifier (e.g. 'json', 'cbor', 'msgpack') */
    protocol: string;

    /** Whether the serializer produces binary output */
    isBinary: boolean;

    /** Encode a value into a serialized form suitable for transmission */
    encode(data: unknown): string | ArrayBuffer | Uint8Array;

    /** Decode a serialized value back into a JavaScript object */
    decode(data: string | ArrayBuffer | Uint8Array): unknown;
}
