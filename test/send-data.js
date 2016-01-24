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
                WAMP_MSG_SPEC.GOODBYE,
                {},
                'wamp.error.goodbye_and_out'
            ]
        },
        {
            data: [
                WAMP_MSG_SPEC.WELCOME,
                555,
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
            ],
            abort: true
        },
        {
            data: [
                WAMP_MSG_SPEC.WELCOME,
                275,
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
            ],
            next: true
        },
        {
            data: [
                WAMP_MSG_SPEC.ABORT,
                {},
                'wamp.error.abort'
            ]
        },
        // Begin of PubSub module
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
        // allows to publish/subscribe event without payload
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
                {}
            ]
        },
        // allows to publish/subscribe event with int payload
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
        // allows to publish/subscribe event with string payload
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
        // allows to publish/subscribe event with array payload
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
        // allows to publish/subscribe event with hash-table payload
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
                [],
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
                {},
                [100]
            ],
            from: [1],
            to: [1]
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
                {},
                [1, 2, 3, 4, 5]
            ],
            from: [1],
            to: [1]
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
                {},
                [],
                { key1: 100, key2: 'string-key' }
            ],
            from: [1],
            to: [1]
        },
        // allows to reject asynchronous RPC
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
                26, // Registration ID
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
                null,
                { k1: 1, k2: 2 }
            ],
            from: [1],
            to: [2]
        }
    ];

module.exports = sendData;
