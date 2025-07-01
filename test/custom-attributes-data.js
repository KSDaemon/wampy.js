import { WAMP_MSG_SPEC } from '../src/constants.js';

const customAttrsData = [
    // EVENT with custom details for custom.event.topic subscription
    {
        trigger: {
            messageType: WAMP_MSG_SPEC.SUBSCRIBE,
            condition: (msg) => msg[3] === 'custom.event.topic'
        },
        response: [WAMP_MSG_SPEC.SUBSCRIBED, 'REQUEST_ID', 5001]
    },
    {
        // Auto-send EVENT after subscription
        trigger: {
            messageType: WAMP_MSG_SPEC.SUBSCRIBED
        },
        response: [WAMP_MSG_SPEC.EVENT, 5001, 9001, {
            _publisher_info: 'system_publisher',
            _event_priority: 'high',
            _timestamp: Date.now()
        }, ['event', 'data']],
        delay: 5
    },

    // RESULT with custom details for custom.result.procedure call
    {
        trigger: {
            messageType: WAMP_MSG_SPEC.CALL,
            condition: (msg) => msg[3] === 'custom.result.procedure'
        },
        response: [WAMP_MSG_SPEC.RESULT, 'REQUEST_ID', {
            _execution_time: 42,
            _server_version: '2.1.0',
            _cache_hit: true
        }, ['custom', 'result']]
    },

    // INVOCATION with custom details for custom.invocation.rpc registration
    {
        trigger: {
            messageType: WAMP_MSG_SPEC.REGISTER,
            condition: (msg) => msg[3] === 'custom.invocation.rpc'
        },
        response: [WAMP_MSG_SPEC.REGISTERED, 'REQUEST_ID', 6001]
    },
    {
        // Auto-send INVOCATION after registration
        trigger: {
            messageType: WAMP_MSG_SPEC.REGISTERED
        },
        response: [WAMP_MSG_SPEC.INVOCATION, 7001, 6001, {
            _caller_info: 'admin_client',
            _priority_level: 9,
            _auth_context: 'elevated'
        }, ['invoke', 'args']],
        delay: 5
    },

    // Test custom attributes in outgoing messages by checking what client sends
    {
        trigger: {
            messageType: WAMP_MSG_SPEC.SUBSCRIBE,
            condition: (msg) => {
                const options = msg[2];
                // Verify custom attributes are present in SUBSCRIBE options
                return options._tracking_id === 'sub_12345' && 
                       options._priority === 'high' && 
                       options._custom_auth === 'bearer_token';
            }
        },
        response: [WAMP_MSG_SPEC.SUBSCRIBED, 'REQUEST_ID', 1001]
    },

    {
        trigger: {
            messageType: WAMP_MSG_SPEC.PUBLISH,
            condition: (msg) => {
                const options = msg[2];
                // Verify custom attributes are present in PUBLISH options
                return options._tracking_id === 'pub_67890' && 
                       options._priority === 'urgent' && 
                       options._routing_hint === 'datacenter_west';
            }
        },
        response: [WAMP_MSG_SPEC.PUBLISHED, 'REQUEST_ID', 2001]
    },

    {
        trigger: {
            messageType: WAMP_MSG_SPEC.CALL,
            condition: (msg) => {
                const options = msg[2];
                // Verify custom attributes are present in CALL options
                return options._request_id === 'call_abcdef' && 
                       options._timeout_override === 30000 && 
                       options._auth_context === 'admin_user';
            }
        },
        response: [WAMP_MSG_SPEC.RESULT, 'REQUEST_ID', {}, [{ argsList: ['custom', 'call', 'result'] }]]
    },

    {
        trigger: {
            messageType: WAMP_MSG_SPEC.CANCEL,
            condition: (msg) => {
                const options = msg[2];
                // Verify custom attributes are present in CANCEL options
                return options._cancel_reason === 'user_requested' && 
                       options._priority === 'immediate' &&
                       options.mode === 'kill';
            }
        },
        // CANCEL doesn't get a direct response, but we can verify it was received
        response: null
    },

    {
        trigger: {
            messageType: WAMP_MSG_SPEC.REGISTER,
            condition: (msg) => {
                const options = msg[2];
                // Verify custom attributes are present in REGISTER options
                return options._handler_version === '2.1.0' && 
                       options._load_balancing === 'round_robin' && 
                       options._timeout_hint === 5000;
            }
        },
        response: [WAMP_MSG_SPEC.REGISTERED, 'REQUEST_ID', 3001]
    },

    // Test mixed standard + custom options
    {
        trigger: {
            messageType: WAMP_MSG_SPEC.CALL,
            condition: (msg) => {
                const options = msg[2];
                // Verify both standard and custom attributes
                return options.timeout === 5000 && 
                       options.disclose_me === true &&
                       options._tracking_id === 'mixed_123' && 
                       options._priority === 'high';
            }
        },
        response: [WAMP_MSG_SPEC.RESULT, 'REQUEST_ID', {}, [{ argsList: ['mixed', 'options', 'result'] }]]
    },

    {
        trigger: {
            messageType: WAMP_MSG_SPEC.PUBLISH,
            condition: (msg) => {
                const options = msg[2];
                // Verify both standard and custom attributes
                return options.exclude_me === false && 
                       options.disclose_me === true &&
                       options._event_type === 'notification' && 
                       options._source_system === 'billing';
            }
        },
        response: [WAMP_MSG_SPEC.PUBLISHED, 'REQUEST_ID', 4001]
    },

    {
        trigger: {
            messageType: WAMP_MSG_SPEC.SUBSCRIBE,
            condition: (msg) => {
                const options = msg[2];
                // Verify both standard and custom attributes for prefix subscription
                return options.match === 'prefix' &&
                       options._subscription_type === 'live' && 
                       options._filter_level === 'debug';
            }
        },
        response: [WAMP_MSG_SPEC.SUBSCRIBED, 'REQUEST_ID', 5002]
    },

    {
        trigger: {
            messageType: WAMP_MSG_SPEC.REGISTER,
            condition: (msg) => {
                const options = msg[2];
                // Verify both standard and custom attributes
                return options.invoke === 'roundrobin' &&
                       options._handler_type === 'async' && 
                       options._max_concurrency === 10;
            }
        },
        response: [WAMP_MSG_SPEC.REGISTERED, 'REQUEST_ID', 6002]
    },

    // Test invalid custom attributes (should be filtered out)
    {
        trigger: {
            messageType: WAMP_MSG_SPEC.CALL,
            condition: (msg) => {
                const options = msg[2];
                // Should only have valid custom attributes, invalid ones filtered
                return options._valid_attr === 'valid' &&
                       !options._x &&  // Too short - should be filtered
                       !options._X &&  // Uppercase - should be filtered  
                       !options['_invalid-dash'] && // Contains dash - should be filtered
                       !options.no_underscore; // No underscore - should be filtered
            }
        },
        response: [WAMP_MSG_SPEC.RESULT, 'REQUEST_ID', {}, [{ argsList: ['filtered', 'result'] }]]
    }
];

export default customAttrsData; 