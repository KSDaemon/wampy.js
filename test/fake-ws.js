/**
 * Project: wampy.js
 * User: KSDaemon
 * Date: 07.04.15
 */

;(typeof define === 'function' ? function (m) { define('Wampy', m); } :
    typeof exports === 'object' ? function (m) { module.exports = m(); } :
    function (m) { this.Wampy = m(); }
)(function () {

    var WAMP_MSG_SPEC = {
        HELLO: 1,
        WELCOME: 2,
        ABORT: 3,
        CHALLENGE: 4,
        AUTHENTICATE: 5,
        GOODBYE: 6,
        HEARTBEAT: 7,
        ERROR: 8,
        PUBLISH: 16,
        PUBLISHED: 17,
        SUBSCRIBE: 32,
        SUBSCRIBED: 33,
        UNSUBSCRIBE: 34,
        UNSUBSCRIBED: 35,
        EVENT: 36,
        CALL: 48,
        CANCEL: 49,
        RESULT: 50,
        REGISTER: 64,
        REGISTERED: 65,
        UNREGISTER: 66,
        UNREGISTERED: 67,
        INVOCATION: 68,
        INTERRUPT: 69,
        YIELD: 70
    },

    testData = [
        { data: JSON.stringify(
            [
                WAMP_MSG_SPEC.WELCOME,
                1,
                {
                    agent: 'Wampy.js test suite',
                    roles: {
                        publisher: {
                            features: {
                                subscriber_blackwhite_listing: true,
                                publisher_exclusion: true,
                                publisher_identification: true
                            }
                        },
                        subscriber: {},
                        caller: {
                            features: {
                                callee_blackwhite_listing: true,
                                caller_exclusion: true,
                                caller_identification: true,
                                progressive_call_results: true,
                                call_canceling: true
                            }
                        },
                        callee: {
                            features: {
                                caller_identification: true
                            }
                        }
                    }
                }
            ]
        ) },
        { data: JSON.stringify(
            [
                WAMP_MSG_SPEC.WELCOME,
                2,
                {
                    agent: 'Wampy.js test suite',
                    roles: {
                        publisher: {
                            features: {
                                subscriber_blackwhite_listing: true,
                                publisher_exclusion: true,
                                publisher_identification: true
                            }
                        },
                        subscriber: {},
                        caller: {
                            features: {
                                callee_blackwhite_listing: true,
                                caller_exclusion: true,
                                caller_identification: true,
                                progressive_call_results: true,
                                call_canceling: true
                            }
                        },
                        callee: {
                            features: {
                                caller_identification: true
                            }
                        }
                    }
                }
            ]
        ) },
        { data: JSON.stringify(
            [
                WAMP_MSG_SPEC.WELCOME,
                3,
                {
                    agent: 'Wampy.js test suite',
                    roles: {
                        publisher: {
                            features: {
                                subscriber_blackwhite_listing: true,
                                publisher_exclusion: true,
                                publisher_identification: true
                            }
                        },
                        subscriber: {},
                        caller: {
                            features: {
                                callee_blackwhite_listing: true,
                                caller_exclusion: true,
                                caller_identification: true,
                                progressive_call_results: true,
                                call_canceling: true
                            }
                        },
                        callee: {
                            features: {
                                caller_identification: true
                            }
                        }
                    }
                }
            ]
        ) }
    ],

    root = (typeof process === 'object' && Object.prototype.toString.call(process) === '[object process]') ?
        global : window,

    WebSocket = function (url, protocols) {
        this.url = url;
        this.protocols = protocols;
        this.binaryType = 'arraybuffer';

        this.onclose = null;
        this.onerror = null;
        this.onmessage = null;
        this.onopen = null;

        this.protocol = '';

        this.readyState = 3;    // Closed

        var self = this;

        root.setTimeout(function () {
            self.readyState = 1;
            self.protocols = 'wamp.2.json';
            self.onopen();
        }, 1);

    };

    WebSocket.prototype.close = function (code, reason) {

    };

    WebSocket.prototype.send = function (data) {
        var self = this;
        root.setTimeout(function () {
            self.onmessage(testData.shift())
        }, 1);
    };

    return WebSocket;

});
