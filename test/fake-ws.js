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

    TIMEOUT = 1,

    sendData = [
        {
            data: [
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
        },
        {
            data: [
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
        },
        {
            data: [
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
        },
        {
            data: [
                WAMP_MSG_SPEC.GOODBYE,
                {},
                'wamp.error.goodbye_and_out'
            ]
        },
        {
            data: [
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
        },
        {
            data: [
                WAMP_MSG_SPEC.GOODBYE,
                {},
                'wamp.error.goodbye_and_out'
            ]
        },
        {
            data: [
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
        },
        {
            data: [
                WAMP_MSG_SPEC.GOODBYE,
                {},
                'wamp.error.goodbye_and_out'
            ]
        },
        {
            data: [
                WAMP_MSG_SPEC.WELCOME,
                6,
                {
                    agent: 'Wampy.js test suite',
                    roles: {
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
        },
        {
            data: [
                WAMP_MSG_SPEC.GOODBYE,
                {},
                'wamp.error.goodbye_and_out'
            ]
        },
        {
            data: [
                WAMP_MSG_SPEC.WELCOME,
                7,
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
        },
        {
            data: [
                WAMP_MSG_SPEC.SUBSCRIBED,
                'RequestId',
                1
            ],
            from: [1],
            to: [1]
        },
        {
            data: [
                WAMP_MSG_SPEC.SUBSCRIBED,
                'RequestId',
                2
            ],
            from: [1],
            to: [1]
        },
        {
            data: [
                WAMP_MSG_SPEC.SUBSCRIBED,
                'RequestId',
                3   // Subscription id need in next publish msg
            ],
            from: [1],
            to: [1]
        },
        {
            data: [
                WAMP_MSG_SPEC.PUBLISHED,
                'RequestId',
                4
            ],
            from: [1],
            to: [1],
            next: true
        },
        {
            data: [
                WAMP_MSG_SPEC.EVENT,
                3,
                4,
                {},
                null
            ]
        },
        {
            data: [
                WAMP_MSG_SPEC.SUBSCRIBED,
                'RequestId',
                5   // Subscription id need in next publish msg
            ],
            from: [1],
            to: [1]
        },
        {
            data: [
                WAMP_MSG_SPEC.PUBLISHED,
                'RequestId',
                6
            ],
            from: [1],
            to: [1],
            next: true
        },
        {
            data: [
                WAMP_MSG_SPEC.EVENT,
                5,
                6,
                {},
                [25]
            ]
        },
        {
            data: [
                WAMP_MSG_SPEC.SUBSCRIBED,
                'RequestId',
                7   // Subscription id need in next publish msg
            ],
            from: [1],
            to: [1]
        },
        {
            data: [
                WAMP_MSG_SPEC.PUBLISHED,
                'RequestId',
                8
            ],
            from: [1],
            to: [1],
            next: true
        },
        {
            data: [
                WAMP_MSG_SPEC.EVENT,
                7,
                8,
                {},
                ['payload']
            ]
        },
        {
            data: [
                WAMP_MSG_SPEC.SUBSCRIBED,
                'RequestId',
                9   // Subscription id need in next publish msg
            ],
            from: [1],
            to: [1]
        },
        {
            data: [
                WAMP_MSG_SPEC.PUBLISHED,
                'RequestId',
                10
            ],
            from: [1],
            to: [1],
            next: true
        },
        {
            data: [
                WAMP_MSG_SPEC.EVENT,
                9,
                10,
                {},
                [1, 2, 3, 4, 5]
            ]
        },
        {
            data: [
                WAMP_MSG_SPEC.SUBSCRIBED,
                'RequestId',
                11   // Subscription id need in next publish msg
            ],
            from: [1],
            to: [1]
        },
        {
            data: [
                WAMP_MSG_SPEC.PUBLISHED,
                'RequestId',
                12
            ],
            from: [1],
            to: [1],
            next: true
        },
        {
            data: [
                WAMP_MSG_SPEC.EVENT,
                11,
                12,
                {},
                { key1: 100, key2: 'string-key' }
            ]
        },
        {
            data: [
                WAMP_MSG_SPEC.SUBSCRIBED,
                'RequestId',
                13   // Subscription id need in next publish msg
            ],
            from: [1],
            to: [1]
        },
        {
            data: [
                WAMP_MSG_SPEC.PUBLISHED,
                'RequestId',
                14
            ],
            from: [1],
            to: [1],
            next: true
        },
        {
            data: [
                WAMP_MSG_SPEC.EVENT,
                13,
                14,
                {},
                ['payload']
            ]
        },
        {
            data: [
                WAMP_MSG_SPEC.SUBSCRIBED,
                'RequestId',
                15   // Subscription id need in next publish msg
            ],
            from: [1],
            to: [1],
            next: true
        },
        {
            data: [
                WAMP_MSG_SPEC.EVENT,
                15,
                16,
                {},
                ['payload']
            ]
        },
        {
            data: null  // TODO Doubled messages - dirty hack, i don't know how to make it clean
        },
        {
            data: null
        },
        {
            data: [
                WAMP_MSG_SPEC.UNSUBSCRIBED,
                'RequestId'
            ],
            from: [1],
            to: [1]
        },
        {
            data: [
                WAMP_MSG_SPEC.GOODBYE,
                {},
                'wamp.error.goodbye_and_out'
            ]
        },
        {
            data: [
                WAMP_MSG_SPEC.WELCOME,
                17,
                {
                    agent: 'Wampy.js test suite',
                    roles: {
                        broker: {
                            features: {
                                subscriber_blackwhite_listing: true,
                                publisher_exclusion: true,
                                publisher_identification: true
                            }
                        }
                    }
                }
            ]
        },
        {
            data: [
                WAMP_MSG_SPEC.GOODBYE,
                {},
                'wamp.error.goodbye_and_out'
            ]
        },
        {
            data: [
                WAMP_MSG_SPEC.WELCOME,
                18,
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
        },
        {
            data: [
                WAMP_MSG_SPEC.REGISTERED,
                'RequestId',
                19   // Registration ID
            ],
            from: [1],
            to: [1]
        },
        {
            data: [
                WAMP_MSG_SPEC.REGISTERED,
                'RequestId',
                20   // Registration ID
            ],
            from: [1],
            to: [1]
        },
        {
            data: [
                WAMP_MSG_SPEC.RESULT,
                'RequestId',
                {}
            ],
            from: [1],
            to: [1]
        },
        {
            data: [
                WAMP_MSG_SPEC.RESULT,
                'RequestId',
                {},
                [25]
            ],
            from: [1],
            to: [1]
        },
        {
            data: [
                WAMP_MSG_SPEC.RESULT,
                'RequestId',
                {},
                ['payload']
            ],
            from: [1],
            to: [1]
        },
        {
            data: [
                WAMP_MSG_SPEC.RESULT,
                'RequestId',
                {},
                [1, 2, 3, 4, 5]
            ],
            from: [1],
            to: [1]
        },
        {
            data: [
                WAMP_MSG_SPEC.RESULT,
                'RequestId',
                {},
                { key1: 100, key2: 'string-key' }
            ],
            from: [1],
            to: [1]
        },
        {
            data: [
                WAMP_MSG_SPEC.RESULT,
                'RequestId',
                {},
                ['payload']
            ],
            from: [1],
            to: [1]
        },
        {
            data: [
                WAMP_MSG_SPEC.RESULT,
                'RequestId',
                { progress: true },
                [1]
            ],
            from: [1],
            to: [1],
            next: true
        },
        {
            data: [
                WAMP_MSG_SPEC.RESULT,
                'RequestId',
                { progress: true },
                [25]
            ],
            from: [1],
            to: [1],
            next: true
        },
        {
            data: [
                WAMP_MSG_SPEC.RESULT,
                'RequestId',
                { progress: true },
                [50]
            ],
            from: [1],
            to: [1],
            next: true
        },
        {
            data: [
                WAMP_MSG_SPEC.RESULT,
                'RequestId',
                { progress: true },
                [75]
            ],
            from: [1],
            to: [1],
            next: true
        },
        {
            data: [
                WAMP_MSG_SPEC.RESULT,
                'RequestId',
                {},
                [100]
            ],
            from: [1],
            to: [1]
        },
        {
            data: [
                WAMP_MSG_SPEC.RESULT,
                'RequestId',
                { progress: true },
                [50]
            ],
            from: [1],
            to: [1]
        },
        {
            data: [
                WAMP_MSG_SPEC.ERROR,
                WAMP_MSG_SPEC.CALL,
                'RequestId',
                {},
                'call.canceled'
            ],
            from: [1],
            to: [2]
        },
        {
            data: [
                WAMP_MSG_SPEC.UNREGISTERED,
                'RequestId'
            ],
            from: [1],
            to: [1]
        },
        {
            data: [
                WAMP_MSG_SPEC.UNREGISTERED,
                'RequestId'
            ],
            from: [1],
            to: [1]
        },
        {
            data: [
                WAMP_MSG_SPEC.REGISTERED,
                'RequestId',
                21   // Registration ID
            ],
            from: [1],
            to: [1]
        },
        {
            data: [
                WAMP_MSG_SPEC.INVOCATION,
                'RequestId',
                21, // Registration ID
                {},
                [100]
            ],
            from: [1],
            to: [1]
        },
        {
            data: [
                WAMP_MSG_SPEC.RESULT,
                'RequestId',
                {},
                [100]
            ],
            from: [1],
            to: [1]
        },
        {
            data: [
                WAMP_MSG_SPEC.REGISTERED,
                'RequestId',
                22   // Registration ID
            ],
            from: [1],
            to: [1]
        },
        {
            data: [
                WAMP_MSG_SPEC.INVOCATION,
                'RequestId',
                22, // Registration ID
                {},
                [100]
            ],
            from: [1],
            to: [1]
        },
        {
            data: [
                WAMP_MSG_SPEC.ERROR,
                WAMP_MSG_SPEC.CALL,
                'RequestId',
                {},
                'wamp.error.invocation_exception'
            ],
            from: [2],
            to: [2]
        },
        {
            data: [
                WAMP_MSG_SPEC.REGISTERED,
                'RequestId',
                23   // Registration ID
            ],
            from: [1],
            to: [1]
        }
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
        }, TIMEOUT);

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
        }, TIMEOUT);
    };

    WebSocket.prototype.send = function (data) {
        var self = this;
        this.sendTimer = root.setTimeout(function () {
            var send_data, enc_data, rec_data, i;

            rec_data = JSON.parse(data);
            send_data = sendData.shift();

            // console.log('Data to send to server:', data);
            // console.log('Data to send to client:', send_data.data);
            if (send_data.data) {
                // Prepare answer (copy request id from request to answer, etc)
                if (send_data.from) {
                    i = send_data.from.length;
                    while (i--) {
                        send_data.data[send_data.to[i]] = rec_data[send_data.from[i]]
                    }
                }

                enc_data = { data: JSON.stringify(send_data.data) };
                self.onmessage(enc_data);
            }

            // Send to client next message
            if (send_data.next) {
                self.send(data);
            }

        }, TIMEOUT);
    };

    return WebSocket;

});
