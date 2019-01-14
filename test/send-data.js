const WAMP_MSG_SPEC = {
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
        // allows to connect on instantiation if all required options specified
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
                                caller_identification: true,
                                progressive_call_results: true
                            }
                        }
                    }
                }
            ]
        },
        // passes welcome details to onConnect() callback
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
                                caller_identification: true,
                                progressive_call_results: true
                            }
                        }
                    }
                }
            ]
        },
        // passes welcome details to onReconnectSuccess() callback
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
                                caller_identification: true,
                                progressive_call_results: true
                            }
                        }
                    }
                }
            ],
            close: true
        },
        {
            data: [
                WAMP_MSG_SPEC.WELCOME,
                7458547,
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
                                caller_identification: true,
                                progressive_call_results: true
                            }
                        }
                    }
                }
            ]
        },
        // allows to set different options on instantiation
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
                                caller_identification: true,
                                progressive_call_results: true
                            }
                        }
                    }
                }
            ]
        },
        // allows to use Challenge Response Authentication while connecting to server
        {
            data: [
                WAMP_MSG_SPEC.CHALLENGE,
                'wampcra',
                {
                    challenge: '{ "nonce": "LHRTC9zeOIrt_9U3", ' +
                                '"authprovider": "userdb", ' +
                                '"authid": "user1", ' +
                                '"timestamp": "2014-06-22T16:36:25.448Z", ' +
                                '"authrole": "user", ' +
                                '"authmethod": "wampcra", ' +
                                '"session": 123454321 }'
                }
            ]

        },
        {
            data: [
                WAMP_MSG_SPEC.WELCOME,
                123454321,
                {
                    agent       : 'Wampy.js test suite',
                    authid      : 'user1',
                    authrole    : 'user',
                    authmethod  : 'wampcra',
                    authprovider: 'userdb',
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
                                caller_identification: true,
                                progressive_call_results: true
                            }
                        }
                    }
                }
            ]
        },
        // drops connection on receiving WELCOME message after session was established
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
                                caller_identification: true,
                                progressive_call_results: true
                            }
                        }
                    }
                }
            ],
            next: true
        },
        {
            data: [
                WAMP_MSG_SPEC.WELCOME,
                12345,
                {}
            ]
        },
        {
            data: null,
            silent: true
        },
        // drops connection on receiving CHALLENGE message after session was established
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
                                caller_identification: true,
                                progressive_call_results: true
                            }
                        }
                    }
                }
            ],
            next: true
        },
        {
            data: [
                WAMP_MSG_SPEC.CHALLENGE,
                12345,
                {}
            ]
        },
        {
            data: null,
            silent: true
        },
        // drops connection on receiving GOODBYE message before session was established
        {
            data: [
                WAMP_MSG_SPEC.GOODBYE,
                {},
                ''
            ]
        },
        // drops connection on receiving ERROR message before session was established
        {
            data: [
                WAMP_MSG_SPEC.ERROR,
                {},
                ''
            ]
        },
        // drops connection on receiving invalid ERROR message after session was established
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
                                caller_identification: true,
                                progressive_call_results: true
                            }
                        }
                    }
                }
            ],
            next: true
        },
        {
            data: [
                WAMP_MSG_SPEC.ERROR,
                12345,
                12345
            ]
        },
        {
            data: null,
            silent: true
        },
        // drops connection on receiving SUBSCRIBED message before session was established
        {
            data: [
                WAMP_MSG_SPEC.SUBSCRIBED,
                {},
                ''
            ]
        },
        // drops connection on receiving UNSUBSCRIBED message before session was established
        {
            data: [
                WAMP_MSG_SPEC.UNSUBSCRIBED,
                {},
                ''
            ]
        },
        // drops connection on receiving PUBLISHED message before session was established
        {
            data: [
                WAMP_MSG_SPEC.PUBLISHED,
                {},
                ''
            ]
        },
        // drops connection on receiving EVENT message before session was established
        {
            data: [
                WAMP_MSG_SPEC.EVENT,
                {},
                ''
            ]
        },
        // drops connection on receiving RESULT message before session was established
        {
            data: [
                WAMP_MSG_SPEC.RESULT,
                {},
                ''
            ]
        },
        // drops connection on receiving REGISTERED message before session was established
        {
            data: [
                WAMP_MSG_SPEC.REGISTERED,
                {},
                ''
            ]
        },
        // drops connection on receiving UNREGISTERED message before session was established
        {
            data: [
                WAMP_MSG_SPEC.UNREGISTERED,
                {},
                ''
            ]
        },
        // drops connection on receiving INVOCATION message before session was established
        {
            data: [
                WAMP_MSG_SPEC.INVOCATION,
                {},
                ''
            ]
        },
        // drops connection on receiving non-compliant WAMP message
        {
            data: [
                12345,
                {},
                ''
            ]
        },
        // Instance before hook
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
                                caller_identification: true,
                                progressive_call_results: true
                            }
                        }
                    }
                }
            ]
        },
        // allows to disconnect from connected server
        {
            data: [
                WAMP_MSG_SPEC.GOODBYE,
                {},
                'wamp.error.goodbye_and_out'
            ]
        },
        // calls onError handler if authentication using CRA fails
        {
            data: [
                WAMP_MSG_SPEC.CHALLENGE,
                'wampcra',
                {
                    challenge: '{ "nonce": "LHRTC9zeOIrt_9U3", ' +
                                '"authprovider": "userdb", ' +
                                '"authid": "user1", ' +
                                '"timestamp": "2014-06-22T16:36:25.448Z", ' +
                                '"authrole": "user", ' +
                                '"authmethod": "wampcra", ' +
                                '"session": 523454325 }'
                }
            ]

        },
        {
            data: null,
            silent: true
        },
        // calls onError handler if server requests authentication, but no credentials were provided
        {
            data: [
                WAMP_MSG_SPEC.CHALLENGE,
                'wampcra',
                {
                    challenge: '{ "nonce": "LHRTC9zeOIrt_9U3", ' +
                                '"authprovider": "userdb", ' +
                                '"authid": "user1", ' +
                                '"timestamp": "2014-06-22T16:36:25.448Z", ' +
                                '"authrole": "user", ' +
                                '"authmethod": "wampcra", ' +
                                '"session": 523454325 }'
                }
            ]

        },
        {
            data: null,
            silent: true
        },
        // automatically sends goodbye message on server initiated disconnect
        {
            data: [
                WAMP_MSG_SPEC.WELCOME,
                378,
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
                                caller_identification: true,
                                progressive_call_results: true
                            }
                        }
                    }
                }
            ],
            next: true
        },
        {
            data: [
                WAMP_MSG_SPEC.GOODBYE,
                {},
                'wamp.error.goodbye_and_out'
            ]
        },
        {
            data: null,
            silent: true
        },
        // allows to disconnect while connecting to server
        //{
        //    data: null,
        //    silent: true
        //},
        // allows to connect to same WAMP server
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
                                caller_identification: true,
                                progressive_call_results: true
                            }
                        }
                    }
                }
            ]
        },
        // allows to connect to different WAMP server
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
                475,
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
                                caller_identification: true,
                                progressive_call_results: true
                            }
                        }
                    }
                }
            ]
        },
        // allows to abort WebSocket/WAMP session establishment
        {
            data: [
                WAMP_MSG_SPEC.GOODBYE,
                {},
                'wamp.error.goodbye_and_out'
            ]
        },
        //{
        //    data: null,
        //    silent: true
        //},
        // autoreconnects to WAMP server on network errors
        {
            data: [
                WAMP_MSG_SPEC.WELCOME,
                284,
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
                31
            ],
            from: [1],
            to: [1]
        },
        {
            data: [
                WAMP_MSG_SPEC.SUBSCRIBED,
                'RequestId',
                32
            ],
            from: [1],
            to: [1]
        },
        {
            data: [
                WAMP_MSG_SPEC.REGISTERED,
                'RequestId',
                33   // Registration ID
            ],
            from: [1],
            to: [1]
        },
        {
            data: [
                WAMP_MSG_SPEC.REGISTERED,
                'RequestId',
                34   // Registration ID
            ],
            from: [1],
            to: [1]
        },
        {
            data: [
                WAMP_MSG_SPEC.REGISTERED,
                'RequestId',
                35   // Registration ID
            ],
            from: [1],
            to: [1],
            close: true
        },
        {
            data: [
                WAMP_MSG_SPEC.WELCOME,
                28,
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
                36
            ],
            from: [1],
            to: [1]
        },
        {
            data: [
                WAMP_MSG_SPEC.SUBSCRIBED,
                'RequestId',
                37
            ],
            from: [1],
            to: [1]
        },
        {
            data: [
                WAMP_MSG_SPEC.REGISTERED,
                'RequestId',
                38   // Registration ID
            ],
            from: [1],
            to: [1]
        },
        {
            data: [
                WAMP_MSG_SPEC.REGISTERED,
                'RequestId',
                39   // Registration ID
            ],
            from: [1],
            to: [1]
        },
        {
            data: [
                WAMP_MSG_SPEC.REGISTERED,
                'RequestId',
                40   // Registration ID
            ],
            from: [1],
            to: [1]
        },
        {
            data: [
                WAMP_MSG_SPEC.SUBSCRIBED,
                'RequestId',
                311
            ],
            from: [1],
            to: [1]
        },



        // allows to call handler when autoreconnect to WAMP server succeeded
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
                28423,
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
                                caller_identification: true,
                                progressive_call_results: true
                            }
                        }
                    }
                }
            ],
            close: true
        },
        {
            data: [
                WAMP_MSG_SPEC.WELCOME,
                4558,
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
                                caller_identification: true,
                                progressive_call_results: true
                            }
                        }
                    }
                }
            ]
        },
        // allows to call handler on websocket errors
        {
            data: [
                WAMP_MSG_SPEC.GOODBYE,
                {},
                'wamp.error.goodbye_and_out'
            ]
        },
        {
            data: null,
            abort: true
        },
        // calls error handler if server sends abort message
        {
            data: [
                WAMP_MSG_SPEC.ABORT,
                {},
                'wamp.error.abort'
            ]
        },
        // Begin of PubSub module
        // disallows to subscribe to topic if server does not provide BROKER role
        {
            data: [
                WAMP_MSG_SPEC.WELCOME,
                65,
                {
                    agent: 'Wampy.js test suite',
                    roles: {
                        dealer: {
                            features: {
                                caller_identification: true,
                                progressive_call_results: true
                            }
                        }
                    }
                }
            ]
        },
        // disallows to subscribe to topic with invalid URI
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
                                caller_identification: true,
                                progressive_call_results: true
                            }
                        }
                    }
                }
            ]
        },
        //{
        //    data: null,
        //    silent: true
        //},
        {
            data: [
                WAMP_MSG_SPEC.SUBSCRIBED,
                'RequestId',
                2
            ],
            from: [1],
            to: [1]
        },
        // allows to subscribe to prefix-based topic
        {
            data: [
                WAMP_MSG_SPEC.SUBSCRIBED,
                'RequestId',
                399   // Subscription id need in next publish msg
            ],
            from: [1],
            to: [1]
        },
        {
            data: [
                WAMP_MSG_SPEC.PUBLISHED,
                'RequestId',
                419
            ],
            from: [1],
            to: [1]
        },
        {
            data: [
                WAMP_MSG_SPEC.PUBLISHED,
                'RequestId',
                429
            ],
            from: [1],
            to: [1],
            next: true
        },
        {
            data: [
                WAMP_MSG_SPEC.EVENT,
                399,
                419,
                { topic: 'subscribe.prefix.one' }
            ],
            next: true
        },
        {
            data: [
                WAMP_MSG_SPEC.EVENT,
                399,
                429,
                { topic: 'subscribe.prefix.two.three' }
            ]
        },
        // allows to subscribe to wildcard-based topic
        {
            data: [
                WAMP_MSG_SPEC.SUBSCRIBED,
                'RequestId',
                3999   // Subscription id need in next publish msg
            ],
            from: [1],
            to: [1]
        },
        {
            data: [
                WAMP_MSG_SPEC.PUBLISHED,
                'RequestId',
                4199
            ],
            from: [1],
            to: [1]
        },
        {
            data: [
                WAMP_MSG_SPEC.PUBLISHED,
                'RequestId',
                4299
            ],
            from: [1],
            to: [1],
            next: true
        },
        {
            data: [
                WAMP_MSG_SPEC.EVENT,
                3999,
                4199,
                { topic: 'subscribe.one.wildcard' }
            ],
            next: true
        },
        {
            data: [
                WAMP_MSG_SPEC.EVENT,
                3999,
                4299,
                { topic: 'subscribe.two.wildcard' }
            ]
        },
        // allows to publish event without payload
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
                41
            ],
            from: [1],
            to: [1]
        },
        {
            data: [
                WAMP_MSG_SPEC.PUBLISHED,
                'RequestId',
                42
            ],
            from: [1],
            to: [1],
            next: true
        },
        {
            data: [
                WAMP_MSG_SPEC.EVENT,
                3,
                41,
                {}
            ],
            next: true
        },
        {
            data: [
                WAMP_MSG_SPEC.EVENT,
                3,
                42,
                {}
            ]
        },
        // allows to publish event with int payload
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
                61
            ],
            from: [1],
            to: [1]
        },
        {
            data: [
                WAMP_MSG_SPEC.PUBLISHED,
                'RequestId',
                62
            ],
            from: [1],
            to: [1],
            next: true
        },
        {
            data: [
                WAMP_MSG_SPEC.EVENT,
                5,
                61,
                {},
                [25]
            ],
            next: true
        },
        {
            data: [
                WAMP_MSG_SPEC.EVENT,
                5,
                62,
                {},
                [25]
            ]
        },
        // allows to publish event with string payload
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
                81
            ],
            from: [1],
            to: [1]
        },
        {
            data: [
                WAMP_MSG_SPEC.PUBLISHED,
                'RequestId',
                82
            ],
            from: [1],
            to: [1],
            next: true
        },
        {
            data: [
                WAMP_MSG_SPEC.EVENT,
                7,
                81,
                {},
                ['payload']
            ],
            next: true
        },
        {
            data: [
                WAMP_MSG_SPEC.EVENT,
                7,
                82,
                {},
                ['payload']
            ]
        },
        // allows to publish event with array payload
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
                101
            ],
            from: [1],
            to: [1]
        },
        {
            data: [
                WAMP_MSG_SPEC.PUBLISHED,
                'RequestId',
                102
            ],
            from: [1],
            to: [1],
            next: true
        },
        {
            data: [
                WAMP_MSG_SPEC.EVENT,
                9,
                101,
                {},
                [1, 2, 3, 4, 5]
            ],
            next: true
        },
        {
            data: [
                WAMP_MSG_SPEC.EVENT,
                9,
                102,
                {},
                [1, 2, 3, 4, 5]
            ]
        },
        // allows to publish event with hash-table payload
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
                121
            ],
            from: [1],
            to: [1]
        },
        {
            data: [
                WAMP_MSG_SPEC.PUBLISHED,
                'RequestId',
                122
            ],
            from: [1],
            to: [1]
        },
        {
            data: [
                WAMP_MSG_SPEC.PUBLISHED,
                'RequestId',
                123
            ],
            from: [1],
            to: [1],
            next: true
        },
        {
            data: [
                WAMP_MSG_SPEC.EVENT,
                11,
                121,
                {},
                [],
                { key1: 100, key2: 'string-key' }
            ],
            next: true
        },
        {
            data: [
                WAMP_MSG_SPEC.EVENT,
                11,
                122,
                {},
                [],
                { key1: 100, key2: 'string-key' }
            ],
            next: true
        },
        {
            data: [
                WAMP_MSG_SPEC.EVENT,
                11,
                123,
                {},
                [],
                { key1: 100, key2: 'string-key' }
            ]
        },
        // allows to publish event with both array and hash-table payload
        {
            data: [
                WAMP_MSG_SPEC.SUBSCRIBED,
                'RequestId',
                1177   // Subscription id need in next publish msg
            ],
            from: [1],
            to: [1]
        },
        {
            data: [
                WAMP_MSG_SPEC.PUBLISHED,
                'RequestId',
                12177
            ],
            from: [1],
            to: [1]
        },
        {
            data: [
                WAMP_MSG_SPEC.PUBLISHED,
                'RequestId',
                12277
            ],
            from: [1],
            to: [1],
            next: true
        },
        {
            data: [
                WAMP_MSG_SPEC.EVENT,
                1177,
                12177,
                {},
                [1, 2, 3, 4, 5],
                { key1: 100, key2: 'string-key' }
            ],
            next: true
        },
        {
            data: [
                WAMP_MSG_SPEC.EVENT,
                1177,
                12277,
                {},
                [1, 2, 3, 4, 5],
                { key1: 100, key2: 'string-key' }
            ]
        },
        // allows to publish event with different advanced options
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
        // allows to unsubscribe from topic only specified handler
        {
            data: [
                WAMP_MSG_SPEC.SUBSCRIBED,
                'RequestId',
                15   // Subscription id need in next publish msg
            ],
            from: [1],
            to: [1]
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
        // allows to unsubscribe all handlers from topic
        {
            data: null
        },
        // allows to unsubscribe from topic with notification on unsubscribing
        {
            data: [
                WAMP_MSG_SPEC.UNSUBSCRIBED,
                'RequestId'
            ],
            from: [1],
            to: [1]
        },
        // fires error callback if error occurred during subscribing
        {
            data: [
                WAMP_MSG_SPEC.ERROR,
                WAMP_MSG_SPEC.SUBSCRIBE,
                'RequestId',
                {},
                'wamp.subscribe.error'
            ],
            from: [1],
            to: [2]
        },
        // fires error callback if error occurred during unsubscribing
        {
            data: [
                WAMP_MSG_SPEC.ERROR,
                WAMP_MSG_SPEC.UNSUBSCRIBE,
                'RequestId',
                {},
                'wamp.unsubscribe.error'
            ],
            from: [1],
            to: [2]
        },
        // fires error callback if error occurred during publishing
        {
            data: [
                WAMP_MSG_SPEC.ERROR,
                WAMP_MSG_SPEC.PUBLISH,
                'RequestId',
                {},
                'wamp.publish.error'
            ],
            from: [1],
            to: [2]
        },
        // Begin of RPC module
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
        // disallows to register RPC with invalid URI
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
                                caller_identification: true,
                                progressive_call_results: true
                            }
                        }
                    }
                }
            ]
        },
        // allows to register RPC
        {
            data: [
                WAMP_MSG_SPEC.REGISTERED,
                'RequestId',
                19   // Registration ID
            ],
            from: [1],
            to: [1]
        },
        // allows to register RPC with notification on registration
        {
            data: [
                WAMP_MSG_SPEC.REGISTERED,
                'RequestId',
                20   // Registration ID
            ],
            from: [1],
            to: [1]
        },
        // allows to register prefix-based RPC
        {
            data: [
                WAMP_MSG_SPEC.REGISTERED,
                'RequestId',
                209   // Registration ID
            ],
            from: [1],
            to: [1]
        },
        // allows to register wildcard-based RPC
        {
            data: [
                WAMP_MSG_SPEC.REGISTERED,
                'RequestId',
                2099   // Registration ID
            ],
            from: [1],
            to: [1]
        },
        // allows to specify invocation policy during RPC registration
        {
            data: [
                WAMP_MSG_SPEC.REGISTERED,
                'RequestId',
                2599   // Registration ID
            ],
            from: [1],
            to: [1]
        },
        // allows to call RPC without payload
        {
            data: [
                WAMP_MSG_SPEC.RESULT,
                'RequestId',
                {}
            ],
            from: [1],
            to: [1]
        },
        // allows to call RPC with int payload
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
        // allows to call RPC with string payload
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
        // allows to call RPC with array payload
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
        // allows to call RPC with hash-table payload
        {
            data: [
                WAMP_MSG_SPEC.RESULT,
                'RequestId',
                {},
                [],
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
                [],
                { key1: 100, key2: 'string-key' }
            ],
            from: [1],
            to: [1]
        },
        // allows to call RPC with both array and hash-table payload
        {
            data: [
                WAMP_MSG_SPEC.RESULT,
                'RequestId',
                {},
                [1, 2, 3, 4, 5],
                { key1: 100, key2: 'string-key' }
            ],
            from: [1],
            to: [1]
        },
        // allows to call RPC with different advanced options
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
        // allows to call RPC with progressive result receiving
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
        // checks options during canceling RPC invocation
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
        // allows to cancel RPC invocation
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
        // allows to unregister RPC
        {
            data: [
                WAMP_MSG_SPEC.UNREGISTERED,
                'RequestId'
            ],
            from: [1],
            to: [1]
        },
        // allows to unregister RPC with notification on unregistering
        {
            data: [
                WAMP_MSG_SPEC.UNREGISTERED,
                'RequestId'
            ],
            from: [1],
            to: [1]
        },
        // allows to invoke asynchronous RPC without value
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
                {}
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
        // allows to invoke asynchronous RPC without value but with extra options
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
                {}
            ],
            from: [1],
            to: [1]
        },
        {
            data: [
                WAMP_MSG_SPEC.RESULT,
                'RequestId',
                { }
            ],
            from: [1, 2],
            to: [1, 2]
        },
        // allows to invoke pattern-based RPC providing original uri in options
        {
            data: [
                WAMP_MSG_SPEC.REGISTERED,
                'RequestId',
                2292   // Registration ID
            ],
            from: [1],
            to: [1]
        },
        {
            data: [
                WAMP_MSG_SPEC.INVOCATION,
                'RequestId',
                2292, // Registration ID
                { topic: 'register.prefixbased.maiden' }
            ],
            from: [1],
            to: [1]
        },
        {
            data: [
                WAMP_MSG_SPEC.RESULT,
                'RequestId',
                { }
            ],
            from: [1, 2],
            to: [1, 2]
        },
        // allows to invoke asynchronous RPC with single value
        {
            data: [
                WAMP_MSG_SPEC.REGISTERED,
                'RequestId',
                23   // Registration ID
            ],
            from: [1],
            to: [1]
        },
        {
            data: [
                WAMP_MSG_SPEC.INVOCATION,
                'RequestId',
                23, // Registration ID
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
                {}
            ],
            from: [1, 2, 3],
            to: [1, 2, 3]
        },
        // allows to invoke asynchronous RPC with array value
        {
            data: [
                WAMP_MSG_SPEC.REGISTERED,
                'RequestId',
                24   // Registration ID
            ],
            from: [1],
            to: [1]
        },
        {
            data: [
                WAMP_MSG_SPEC.INVOCATION,
                'RequestId',
                24, // Registration ID
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
                {}
            ],
            from: [1, 2, 3],
            to: [1, 2, 3]
        },
        // allows to invoke asynchronous RPC with hash-table value
        {
            data: [
                WAMP_MSG_SPEC.REGISTERED,
                'RequestId',
                25   // Registration ID
            ],
            from: [1],
            to: [1]
        },
        {
            data: [
                WAMP_MSG_SPEC.INVOCATION,
                'RequestId',
                25, // Registration ID
                {},
                [],
                { key1: 100, key2: 'string-key' }
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
            from: [1, 2, 3, 4],
            to: [1, 2, 3, 4]
        },
        // allows to return progressive results from asynchronous RPC
        {
            data: [
                WAMP_MSG_SPEC.REGISTERED,
                'RequestId',
                251   // Registration ID
            ],
            from: [1],
            to: [1]
        },
        {
            data: [
                WAMP_MSG_SPEC.INVOCATION,
                'RequestId',
                251, // Registration ID
                { receive_progress: true },
                [0]
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
            from: [1, 2, 3],
            to: [1, 2, 3]
        },
        {
            data: [
                WAMP_MSG_SPEC.RESULT,
                'RequestId',
                {}
            ],
            from: [1, 2, 3],
            to: [1, 2, 3]
        },
        {
            data: [
                WAMP_MSG_SPEC.RESULT,
                'RequestId',
                {}
            ],
            from: [1, 2, 3],
            to: [1, 2, 3]
        },
        {
            data: [
                WAMP_MSG_SPEC.RESULT,
                'RequestId',
                {}
            ],
            from: [1, 2, 3],
            to: [1, 2, 3]
        },
        {
            data: [
                WAMP_MSG_SPEC.RESULT,
                'RequestId',
                {}
            ],
            from: [1, 2, 3],
            to: [1, 2, 3]
        },
        {
            data: [
                WAMP_MSG_SPEC.RESULT,
                'RequestId',
                {}
            ],
            from: [1, 2, 3],
            to: [1, 2, 3]
        },
        // calls error handler if asynchronous RPC was rejected
        {
            data: [
                WAMP_MSG_SPEC.REGISTERED,
                'RequestId',
                222   // Registration ID
            ],
            from: [1],
            to: [1]
        },
        {
            data: [
                WAMP_MSG_SPEC.INVOCATION,
                'RequestId',
                222, // Registration ID
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
        // calls error handler if asynchronous RPC raised exception
        {
            data: [
                WAMP_MSG_SPEC.REGISTERED,
                'RequestId',
                223   // Registration ID
            ],
            from: [1],
            to: [1]
        },
        {
            data: [
                WAMP_MSG_SPEC.INVOCATION,
                'RequestId',
                223, // Registration ID
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
        // calls error handler with custom data if asynchronous RPC raised exception
        {
            data: [
                WAMP_MSG_SPEC.REGISTERED,
                'RequestId',
                2235   // Registration ID
            ],
            from: [1],
            to: [1]
        },
        {
            data: [
                WAMP_MSG_SPEC.INVOCATION,
                'RequestId',
                2235, // Registration ID
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
                { key1: 'key1', key2: true, key3: 25 },
                'app.error.custom_invocation_exception',
                [1, 2, 3, 4, 5],
                { key1: 'key1', key2: true, key3: 25 }
            ],
            from: [2],
            to: [2]
        },
        {
            data: [
                WAMP_MSG_SPEC.REGISTERED,
                'RequestId',
                2236   // Registration ID
            ],
            from: [1],
            to: [1]
        },
        {
            data: [
                WAMP_MSG_SPEC.INVOCATION,
                'RequestId',
                2236, // Registration ID
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
                'app.error.custom_invocation_exception',
                [],
                { key1: 'key1', key2: true, key3: 25 }
            ],
            from: [2],
            to: [2]
        },
        // calls error handler on trying to call nonexistent RPC
        {
            data: [
                WAMP_MSG_SPEC.INVOCATION,
                'RequestId',
                9879, // Registration ID
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
        // disallows to register RPC with the same name
        {
            data: [
                WAMP_MSG_SPEC.REGISTERED,
                'RequestId',
                297   // Registration ID
            ],
            from: [1],
            to: [1]
        },
        // fires error callback if error occurred during registering
        {
            data: [
                WAMP_MSG_SPEC.ERROR,
                WAMP_MSG_SPEC.REGISTER,
                'RequestId',
                {},
                'wamp.register.error'
            ],
            from: [1],
            to: [2]
        },
        // fires error callback if error occurred during unregistering
        {
            data: [
                WAMP_MSG_SPEC.ERROR,
                WAMP_MSG_SPEC.UNREGISTER,
                'RequestId',
                {},
                'wamp.unregister.error'
            ],
            from: [1],
            to: [2]
        },
        // fires error handler if error occurred during RPC call
        {
            data: [
                WAMP_MSG_SPEC.ERROR,
                WAMP_MSG_SPEC.CALL,
                'RequestId',
                {},
                'call.error'
            ],
            from: [1],
            to: [2]
        },
        {
            data: [
                WAMP_MSG_SPEC.ERROR,
                WAMP_MSG_SPEC.CALL,
                'RequestId',
                {},
                'call.error',
                [1, 2, 3, 4, 5]
            ],
            from: [1],
            to: [2]
        },
        {
            data: [
                WAMP_MSG_SPEC.ERROR,
                WAMP_MSG_SPEC.CALL,
                'RequestId',
                {},
                'call.error',
                [],
                { k1: 1, k2: 2 }
            ],
            from: [1],
            to: [2]
        }
    ];

export default sendData;
