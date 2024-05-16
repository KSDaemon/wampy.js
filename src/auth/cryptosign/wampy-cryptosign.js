/**
 * Wampy.js Cryptosign-based Authentication plugin
 *
 * Copyright 2022 KSDaemon. Licensed under the MIT License.
 * See @license text at http://www.opensource.org/licenses/mit-license.php
 *
 */

import tweetnacl from 'tweetnacl';
const { sign: NaclSign } = tweetnacl;

export function hex2bytes(str) {
    // Converting hex string to array of bytes
    return new Uint8Array(str.match(/../g).map(h=>Number.parseInt(h,16)));
}

export function bytes2hex(bytes) {
    return bytes ? Array.from(bytes, function (byte) {
            return ('0' + (byte & 0xFF).toString(16)).slice(-2);
        }).join('') : null;
}

export function sign(privateKey) {
    const keyPair = privateKey.length === 64 ? NaclSign.keyPair.fromSeed(hex2bytes(privateKey)) :
        NaclSign.keyPair.fromSecretKey(hex2bytes(privateKey));

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
