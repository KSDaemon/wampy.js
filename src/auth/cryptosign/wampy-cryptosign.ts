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
 * Information required for Cryptosign signing.
 */
interface CryptosignInfo {
    challenge: string;
}

/**
 * Converts a hexadecimal string to an array of bytes.
 */
export function hex2bytes(str: string): Uint8Array {
    // Converting hex string to array of bytes
    return new Uint8Array((str.match(/../g) as RegExpMatchArray).map(h => Number.parseInt(h, 16)));
}

/**
 * Converts an array of bytes to a hexadecimal string.
 */
export function bytes2hex(bytes: Uint8Array): string | null {
    return bytes ? Array.from(bytes, function (byte: number) {
            return ('0' + (byte & 0xFF).toString(16)).slice(-2);
        }).join('') : null;
}

/**
 * Creates a signing function using the specified private key.
 */
export function sign(privateKey: string): (method: string, info: CryptosignInfo) => string {
    const keyPair = privateKey.length === 64 ? NaclSign.keyPair.fromSeed(hex2bytes(privateKey)) :
        NaclSign.keyPair.fromSecretKey(hex2bytes(privateKey));

    /**
     * Signs a challenge using the cryptosign method.
     */
    return function (method: string, info: CryptosignInfo): string {
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
