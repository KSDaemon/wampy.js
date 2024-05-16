/**
 * Wampy.js Cryptosign-based Authentication plugin
 *
 * Copyright 2022 KSDaemon. Licensed under the MIT License.
 * See @license text at http://www.opensource.org/licenses/mit-license.php
 *
 */

import tweetnacl from 'tweetnacl';
const { sign: NaclSign } = tweetnacl;

/**
 * Converts a hexadecimal string to an array of bytes.
 * @param {string} str - The hexadecimal string to convert.
 * @returns {Uint8Array} The array of bytes.
 */
export function hex2bytes(str) {
    // Converting hex string to array of bytes
    return new Uint8Array(str.match(/../g).map(h=>Number.parseInt(h,16)));
}

/**
 * Converts an array of bytes to a hexadecimal string.
 * @param {Uint8Array} bytes - The array of bytes to convert.
 * @returns {string} The hexadecimal string.
 */
export function bytes2hex(bytes) {
    return bytes ? Array.from(bytes, function (byte) {
            return ('0' + (byte & 0xFF).toString(16)).slice(-2);
        }).join('') : null;
}

/**
 * Creates a signing function using the specified private key.
 * @param {string} privateKey - The private key in hexadecimal format.
 * @returns {function(string, object): string} A signing function.
 */
export function sign(privateKey) {
    const keyPair = privateKey.length === 64 ? NaclSign.keyPair.fromSeed(hex2bytes(privateKey)) :
        NaclSign.keyPair.fromSecretKey(hex2bytes(privateKey));

    /**
     * Signs a challenge using the cryptosign method.
     * @param {string} method - The authentication method.
     * @param {object} info - Information required for signing.
     * @param {string} info.challenge - The challenge to sign.
     * @returns {string} The signed challenge.
     * @throws {Error} If the provided authentication method is unknown or no challenge is provided.
     */
    return function (method, info) {
        if (method === 'cryptosign') {
            if (!info.challenge) {
                throw new Error('No challenge provided!');
            }

            const l = info.challenge.length;
            if ((l % 2) !== 0) {
                throw new Error('Expected challenge to be an even number of characters!');
            }
            const signature = NaclSign.detached(hex2bytes(info.challenge), keyPair.secretKey);

            return bytes2hex(signature) + info.challenge;

        } else {
            throw new Error('Unknown authentication method requested!');
        }
    };
}

export default sign;
