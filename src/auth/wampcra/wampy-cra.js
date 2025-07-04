/**
 * Wampy.js Challenge Response Authentication plugin
 *
 * Copyright 2016 KSDaemon. Licensed under the MIT License.
 * See @license text at http://www.opensource.org/licenses/mit-license.php
 *
 */

const isNode = (typeof process === 'object' && Object.prototype.toString.call(process) === '[object process]');
const crypto = isNode ? await import('node:crypto') : globalThis.crypto;

/**
 * Derives a key using PBKDF2 algorithm.
 * @param {string} secret - The secret key.
 * @param {string} salt - The salt value.
 * @param {number} [iterations=1000] - The number of iterations.
 * @param {number} [keylen=32] - The length of the key.
 * @returns {Promise<string>} The derived key as a base64-encoded string.
 */
export async function deriveKey(secret, salt, iterations = 1000, keylen = 32) {
    // This is how it can be done shorter using node specific API
    // if (isNode) {
    //     const key = crypto.pbkdf2Sync(secret, salt, iterations, keylen, 'sha256');
    //     return key.toString('base64');
    // } else {
        const encoder = new TextEncoder();
        const secretBuffer = encoder.encode(secret);
        const saltBuffer = encoder.encode(salt);
        const algorithm = { name: 'PBKDF2', hash: 'SHA-256', iterations };
        const derivedKey = await crypto.subtle.importKey(
            'raw', secretBuffer, algorithm, false, ['deriveBits']);
        const keyBuffer = await crypto.subtle.deriveBits(
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
 * @param {string} key - The key used for signing.
 * @param {string} challenge - The challenge to sign.
 * @returns {Promise<string>} The signature as a base64-encoded string.
 */
export async function signManual(key, challenge) {
    // This is how it can be done shorter using node specific API
    // if (isNode) {
    //     const hmac = crypto.createHmac('sha256', key);
    //     hmac.update(challenge);
    //     return hmac.digest('base64');
    // } else {
        const encoder = new TextEncoder();
        const keyBuffer = encoder.encode(key);
        const challengeBuffer = encoder.encode(challenge);
        const keyData = await crypto.subtle.importKey('raw',
            keyBuffer,
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['sign']);
        const signature = await crypto.subtle.sign('HMAC', keyData, challengeBuffer);
        const signatureArray = [...new Uint8Array(signature)];
        return btoa(String.fromCodePoint(...signatureArray));
    // }
}

/**
 * Creates a signing function using the specified secret.
 * @param {string} secret - The secret key.
 * @returns {function(string, object): Promise<string>} A signing function.
 */
export function sign(secret) {
    /**
     * Signs a challenge using the wampcra method.
     * @param {string} method - The authentication method.
     * @param {object} info - Information required for signing.
     * @param {string} info.challenge - The challenge to sign.
     * @returns {string} The signed challenge.
     * @throws {Error} If the provided authentication method is unknown or no challenge is provided.
     */
    return async function (method, info) {
        if (method === 'wampcra') {
            return info.salt ? signManual(await deriveKey(secret, info.salt, info.iterations, info.keylen),
                info.challenge) : signManual(secret, info.challenge);
        } else {
            throw new Error('Unknown authentication method requested!');
        }
    };
}
