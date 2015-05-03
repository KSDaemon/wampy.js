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

    sendData = [
        { data: JSON.stringify(
            [
                WAMP_MSG_SPEC.WELCOME,
                1,
                {
                    agent: 'Wampy.js test suite',
                    roles: {
                        broker: {
                            features: {
                                subscriber_blackwhite_listing: true,
                                publisher_exclusion: true,
                                publisher_identification: true
                            }
                        },
                        dealer: {
                            features: {
                                callee_blackwhite_listing: true,
                                caller_exclusion: true,
                                caller_identification: true,
                                progressive_call_results: true
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
                        broker: {
                            features: {
                                subscriber_blackwhite_listing: true,
                                publisher_exclusion: true,
                                publisher_identification: true
                            }
                        },
                        dealer: {
                            features: {
                                callee_blackwhite_listing: true,
                                caller_exclusion: true,
                                caller_identification: true,
                                progressive_call_results: true
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
                        broker: {
                            features: {
                                subscriber_blackwhite_listing: true,
                                publisher_exclusion: true,
                                publisher_identification: true
                            }
                        },
                        dealer: {
                            features: {
                                callee_blackwhite_listing: true,
                                caller_exclusion: true,
                                caller_identification: true,
                                progressive_call_results: true
                            }
                        }
                    }
                }
            ]
        ) },
        { data: JSON.stringify(
            [
                WAMP_MSG_SPEC.GOODBYE,
                {},
                'wamp.error.goodbye_and_out'
            ]
        ) },
        { data: JSON.stringify(
            [
                WAMP_MSG_SPEC.WELCOME,
                4,
                {
                    agent: 'Wampy.js test suite',
                    roles: {
                        broker: {
                            features: {
                                subscriber_blackwhite_listing: true,
                                publisher_exclusion: true,
                                publisher_identification: true
                            }
                        },
                        dealer: {
                            features: {
                                callee_blackwhite_listing: true,
                                caller_exclusion: true,
                                caller_identification: true,
                                progressive_call_results: true
                            }
                        }
                    }
                }
            ]
        ) },
        { data: JSON.stringify(
            [
                WAMP_MSG_SPEC.GOODBYE,
                {},
                'wamp.error.goodbye_and_out'
            ]
        ) },
        { data: JSON.stringify(
            [
                WAMP_MSG_SPEC.WELCOME,
                5,
                {
                    agent: 'Wampy.js test suite',
                    roles: {
                        broker: {
                            features: {
                                subscriber_blackwhite_listing: true,
                                publisher_exclusion: true,
                                publisher_identification: true
                            }
                        },
                        dealer: {
                            features: {
                                callee_blackwhite_listing: true,
                                caller_exclusion: true,
                                caller_identification: true,
                                progressive_call_results: true
                            }
                        }
                    }
                }
            ]
        ) },
        { data: JSON.stringify(
            [
                WAMP_MSG_SPEC.GOODBYE,
                {},
                'wamp.error.goodbye_and_out'
            ]
        ) },
        { data: JSON.stringify(
            [
                WAMP_MSG_SPEC.WELCOME,
                6,
                {
                    agent: 'Wampy.js test suite',
                    roles: {
                        //broker: {
                        //    features: {
                        //        subscriber_blackwhite_listing: true,
                        //        publisher_exclusion: true,
                        //        publisher_identification: true
                        //    }
                        //},
                        dealer: {
                            features: {
                                callee_blackwhite_listing: true,
                                caller_exclusion: true,
                                caller_identification: true,
                                progressive_call_results: true
                            }
                        }
                    }
                }
            ]
        ) },
        { data: JSON.stringify(
            [
                WAMP_MSG_SPEC.GOODBYE,
                {},
                'wamp.error.goodbye_and_out'
            ]
        ) },
        { data: JSON.stringify(
            [
                WAMP_MSG_SPEC.WELCOME,
                6,
                {
                    agent: 'Wampy.js test suite',
                    roles: {
                        broker: {
                            features: {
                                subscriber_blackwhite_listing: true,
                                publisher_exclusion: true,
                                publisher_identification: true
                            }
                        },
                        dealer: {
                            features: {
                                callee_blackwhite_listing: true,
                                caller_exclusion: true,
                                caller_identification: true,
                                progressive_call_results: true
                            }
                        }
                    }
                }
            ]
        ) }
    ],

    receivedData = [
        [WAMP_MSG_SPEC.HELLO, 'AppRealm', {}],
        [WAMP_MSG_SPEC.HELLO, 'AppRealm', {}],
        [WAMP_MSG_SPEC.HELLO, 'AppRealm', {}],
        [WAMP_MSG_SPEC.GOODBYE, {}, 'wamp.error.goodbye_and_out'],
        [WAMP_MSG_SPEC.HELLO, 'AppRealm', {}],
        [WAMP_MSG_SPEC.GOODBYE, {}, 'wamp.error.goodbye_and_out'],
        [WAMP_MSG_SPEC.HELLO, 'AppRealm', {}],
        []
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

        this.openTimer = root.setTimeout(function () {
            self.readyState = 1;    // Open
            self.protocol = 'wamp.2.json';
            self.onopen();
        }, 5);

    };

    WebSocket.prototype.close = function (code, reason) {
        var self = this;
        this.readyState = 3;    // Closed
        if (this.openTimer) {
            root.clearTimeout(this.openTimer);
            this.openTimer = null;
        }
        if (this.sendTimer) {
            root.clearTimeout(this.sendTimer);
            this.sendTimer = null;
        }
        root.setTimeout(function () {
            self.onclose();
        }, 5);
    };

    WebSocket.prototype.send = function (data) {
        var self = this;
        this.sendTimer = root.setTimeout(function () {
            self.onmessage(sendData.shift());
        }, 5);
    };

    return WebSocket;

});
