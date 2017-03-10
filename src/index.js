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

import { Wampy } from './wampy';
import { MsgpackSerializer } from './serialization/MsgpackSerializer';

(function (getWampy) {
    if (typeof window !== 'undefined') {
        window['Wampy'] = getWampy();
        window['WampyMsgpackSerializer'] = MsgpackSerializer;
    }

    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['exports'], getWampy);
    } else if (typeof exports === 'object' && typeof exports.nodeName !== 'string') {
        // CommonJS
        module.exports = { Wampy: getWampy(), MsgpackSerializer: MsgpackSerializer };
    }
}(function () {
    return Wampy;
}));
