/**
 * Wampy.js Challenge Response Authentication plugin
 *
 * Copyright 2016 KSDaemon. Licensed under the MIT License.
 * See @license text at http://www.opensource.org/licenses/mit-license.php
 *
 */

const isNode = (typeof process === 'object' && Object.prototype.toString.call(process) === '[object process]');
const cryptoModule = isNode ? await import('node:crypto') : globalThis.crypto;
const subtle: SubtleCrypto = ('subtle' in cryptoModule ? cryptoModule : (cryptoModule as Crypto)).subtle as SubtleCrypto;

/**
 * Information required for WAMP-CRA signing.
 */
interface WampCraInfo {
    challenge: string;
    salt?: string;
    iterations?: number;
    keylen?: number;
}

/**
 * Derives a key using PBKDF2 algorithm.
 */
export async function deriveKey(secret: string, salt: string, iterations: number = 1000, keylen: number = 32): Promise<string> {
    // This is how it can be done shorter using node specific API
    // if (isNode) {
    //     const key = crypto.pbkdf2Sync(secret, salt, iterations, keylen, 'sha256');
    //     return key.toString('base64');
    // } else {
        const encoder = new TextEncoder();
        const secretBuffer = encoder.encode(secret);
        const saltBuffer = encoder.encode(salt);
        const algorithm = { name: 'PBKDF2', hash: 'SHA-256', iterations };
        const derivedKey = await subtle.importKey(
            'raw', secretBuffer, algorithm, false, ['deriveBits']);
        const keyBuffer = await subtle.deriveBits(
            { name: 'PBKDF2', salt: saltBuffer, iterations, hash: 'SHA-256' },
            derivedKey,
            keylen * 8
        );
        const keyArray = [...new Uint8Array(keyBuffer)];
        return btoa(String.fromCodePoint(...keyArray));
    // }
}

/**
 * Signs a challenge using the manual method.
 */
export async function signManual(key: string, challenge: string): Promise<string> {
    // This is how it can be done shorter using node specific API
    // if (isNode) {
    //     const hmac = crypto.createHmac('sha256', key);
    //     hmac.update(challenge);
    //     return hmac.digest('base64');
    // } else {
        const encoder = new TextEncoder();
        const keyBuffer = encoder.encode(key);
        const challengeBuffer = encoder.encode(challenge);
        const keyData = await subtle.importKey('raw',
            keyBuffer,
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['sign']);
        const signature = await subtle.sign('HMAC', keyData, challengeBuffer);
        const signatureArray = [...new Uint8Array(signature)];
        return btoa(String.fromCodePoint(...signatureArray));
    // }
}

/**
 * Creates a signing function using the specified secret.
 */
export function sign(secret: string): (method: string, info: WampCraInfo) => Promise<string> {
    /**
     * Signs a challenge using the wampcra method.
     */
    return async function (method: string, info: WampCraInfo): Promise<string> {
        if (method === 'wampcra') {
            return signManual(
                info.salt ? await deriveKey(secret, info.salt, info.iterations, info.keylen) : secret,
                info.challenge);
        }
        throw new Error('Unknown authentication method requested!');
    };
}
