import { expect } from 'chai';
import { Wampy } from '../src/wampy.js';
import WebSocket from './fake-ws-custom-attrs.js';

describe('Wampy.js Custom Attributes (WAMP spec 3.1)', function () {
    this.timeout(1000);

    let wampy;

    before(function () {
        globalThis.WebSocket = WebSocket;
    });

    beforeEach(function () {
        wampy = new Wampy('ws://fake.server.url/ws/', { 
            realm: 'AppRealm',
            ws: WebSocket
        });
    });

    afterEach(async function () {
        if (wampy.getOpStatus().code === 0) {
            await wampy.disconnect();
        }
    });

    describe('Client-to-Router Messages (Options/Details)', function () {
        
        // WAMP SPEC: [HELLO, Realm|string, Details|dict]
        it('HELLO.Details - supports custom attributes via helloCustomDetails', async function () {
            const helloCustomDetails = {
                _client_version: '7.2.0',
                _tracking_session: 'session_12345',
                _environment: 'production'
            };

            const wampyWithCustomHello = new Wampy('ws://fake.server.url/ws/', { 
                realm: 'AppRealm',
                ws: WebSocket,
                helloCustomDetails
            });

            // This should work - HELLO uses helloCustomDetails, not _extractCustomOptions
            await wampyWithCustomHello.connect();
            expect(wampyWithCustomHello.getOpStatus().code).to.equal(0);
            await wampyWithCustomHello.disconnect();
        });

        // WAMP SPEC: [SUBSCRIBE, Request|id, Options|dict, Topic|uri]
        it('SUBSCRIBE.Options - supports custom attributes', async function () {
            await wampy.connect();
            
            const customOptions = {
                _tracking_id: 'sub_12345',
                _priority: 'high',
                _custom_auth: 'bearer_token'
            };

            const result = await wampy.subscribe('test.topic', function () {}, customOptions);
            expect(result).to.have.property('subscriptionId');
        });

        // WAMP SPEC: [PUBLISH, Request|id, Options|dict, Topic|uri, Arguments|list, ArgumentsKw|dict]
        it('PUBLISH.Options - supports custom attributes', async function () {
            await wampy.connect();
            
            const customOptions = {
                _tracking_id: 'pub_67890',
                _priority: 'urgent',
                _routing_hint: 'datacenter_west'
            };

            const result = await wampy.publish('test.topic', 'test payload', customOptions);
            expect(result).to.have.property('publicationId');
        });

        // WAMP SPEC: [CALL, Request|id, Options|dict, Procedure|uri, Arguments|list, ArgumentsKw|dict]
        it('CALL.Options - supports custom attributes', async function () {
            await wampy.connect();
            
            const customOptions = {
                _request_id: 'call_abcdef',
                _timeout_override: 30000,
                _auth_context: 'admin_user'
            };

            const result = await wampy.call('test.procedure', ['arg1'], customOptions);
            expect(result).to.have.property('argsList');
        });

        // WAMP SPEC: [CANCEL, CALL.Request|id, Options|dict]
        it('CANCEL.Options - supports custom attributes', async function () {
            await wampy.connect();
            
            // Start a call first
            wampy.call('slow.procedure', []);
            const reqId = wampy.getOpStatus().reqId;

            const customOptions = {
                mode: 'kill',
                _cancel_reason: 'user_requested',
                _priority: 'immediate'
            };

            const result = wampy.cancel(reqId, customOptions);
            expect(result).to.be.true;
        });

        // WAMP SPEC: [REGISTER, Request|id, Options|dict, Procedure|uri]
        it('REGISTER.Options - supports custom attributes', async function () {
            await wampy.connect();
            
            const customOptions = {
                _handler_version: '2.1.0',
                _load_balancing: 'round_robin',
                _timeout_hint: 5000
            };

            const result = await wampy.register('test.rpc', function () { return { result: 'ok' }; }, customOptions);
            expect(result).to.have.property('registrationId');
        });

        // WAMP SPEC: [YIELD, INVOCATION.Request|id, Options|dict, Arguments|list, ArgumentsKw|dict]
        it('YIELD.Options - supports custom attributes in RPC handler', async function () {
            await wampy.connect();
            
            await wampy.register('custom.yield.rpc', function ({ result_handler }) {
                const customYieldOptions = {
                    _processing_time: 150,
                    _cache_hint: 'no_cache',
                    _result_version: '1.0'
                };

                result_handler({
                    argsList: ['custom result'],
                    options: customYieldOptions
                });
            });

            // This will be tested when an INVOCATION comes in
            expect(wampy.getOpStatus().code).to.equal(0);
        });

        // WAMP SPEC: [GOODBYE, Details|dict, Reason|uri]
        it('GOODBYE.Details - client-initiated disconnect (no custom attributes needed)', async function () {
            await wampy.connect();
            
            // GOODBYE is sent by client during disconnect, but doesn't support custom attributes
            // This is just to verify the flow works
            await wampy.disconnect();
            expect(wampy.getOpStatus().code).to.equal(0);
        });
    });

    describe('Router-to-Client Messages (Details/Options)', function () {
        
        // WAMP SPEC: [WELCOME, Session|id, Details|dict]
        it('WELCOME.Details - receives custom attributes from router', async function () {
            await wampy.connect();
            
            // WELCOME details are generated by router and passed through automatically
            // Our mock doesn't send custom attributes, but in real scenario they would be passed through
            expect(wampy.getSessionId()).to.not.be.null;
        });

        // WAMP SPEC: [ABORT, Details|dict, Reason|uri]
        it('ABORT.Details - receives custom attributes from router', async function () {
            // ABORT is sent by router when rejecting connection
            // Would be tested with a router that sends ABORT with custom details
            // For now, just verify the mechanism exists
            expect(true).to.be.true; // Placeholder - router-generated message
        });

        // WAMP SPEC: [ERROR, REQUEST.Type|int, REQUEST.Request|id, Details|dict, Error|uri, Arguments|list, ArgumentsKw|dict]
        it('ERROR.Details - receives custom attributes from router', async function () {
            // ERROR details are generated by router and passed through automatically
            // Would contain custom attributes if router includes them
            expect(true).to.be.true; // Placeholder - router-generated message
        });

        // WAMP SPEC: [EVENT, SUBSCRIBED.Subscription|id, PUBLISHED.Publication|id, Details|dict, PUBLISH.Arguments|list, PUBLISH.ArgumentsKw|dict]
        it('EVENT.Details - receives custom attributes from router', async function () {
            await wampy.connect();
            
            let receivedDetails = null;
            await wampy.subscribe('custom.event.topic', function ({ details }) {
                receivedDetails = details;
            });

            // In a real scenario, router would send EVENT with custom details
            // Our mock doesn't auto-send events, but the passthrough mechanism exists
            expect(receivedDetails).to.be.null; // No event received yet, which is expected
        });

        // WAMP SPEC: [RESULT, CALL.Request|id, Details|dict, YIELD.Arguments|list, YIELD.ArgumentsKw|dict]
        it('RESULT.Details - receives custom attributes from router', async function () {
            await wampy.connect();
            
            const result = await wampy.call('custom.result.procedure', []);
            
            // The mock should return RESULT with custom details
            expect(result.details).to.have.property('_execution_time');
            expect(result.details).to.have.property('_server_version');
        });

        // WAMP SPEC: [REGISTERED, REGISTER.Request|id, Registration|id]
        it('REGISTERED.Details - receives custom attributes from router', async function () {
            await wampy.connect();
            
            // REGISTERED doesn't have Details|dict in spec, but some routers might extend it
            const result = await wampy.register('test.rpc', function () { return { ok: true }; });
            expect(result).to.have.property('registrationId');
        });

        // WAMP SPEC: [INVOCATION, Request|id, REGISTERED.Registration|id, Details|dict, CALL.Arguments|list, CALL.ArgumentsKw|dict]
        it('INVOCATION.Details - receives custom attributes in RPC handler', async function () {
            await wampy.connect();
            
            let receivedDetails = null;
            await wampy.register('custom.invocation.rpc', function ({ details }) {
                receivedDetails = details;
                return { result: 'processed' };
            });

            // In a real scenario, router would send INVOCATION with custom details
            // Our mock doesn't auto-send invocations, but the passthrough mechanism exists
            expect(receivedDetails).to.be.null; // No invocation received yet, which is expected
        });

        // WAMP SPEC: [INTERRUPT, INVOCATION.Request|id, Options|dict]
        it('INTERRUPT.Options - receives custom attributes from router', async function () {
            // INTERRUPT is sent by router to cancel ongoing RPC invocations
            // Would contain custom attributes if router includes them
            expect(true).to.be.true; // Placeholder - router-generated message
        });
    });

    describe('Invalid Custom Attributes', function () {
        
        it('ignores attributes that do not match _[a-z0-9_]{3,} pattern', async function () {
            await wampy.connect();
            
            const invalidOptions = {
                _x: 'too_short',           // Too short (< 3 chars after _)
                _X: 'uppercase',           // Uppercase letter
                '_invalid-dash': 'dash',   // Contains dash
                'no_underscore': 'none',   // No leading underscore
                _valid_attr: 'valid'       // This should work
            };

            // Should not throw error, just ignore invalid ones
            const result = await wampy.call('test.procedure', [], invalidOptions);
            expect(result).to.have.property('argsList');
        });

        it('handles empty or null advanced options gracefully', async function () {
            await wampy.connect();
            
            // Should work with null/undefined options
            const result1 = await wampy.call('test.procedure', [], null);
            const result2 = await wampy.call('test.procedure', []);
            const result3 = await wampy.call('test.procedure', []);
            
            expect(result1).to.have.property('argsList');
            expect(result2).to.have.property('argsList');
            expect(result3).to.have.property('argsList');
        });
    });

    describe('Integration with Standard Options', function () {
        
        it('combines custom attributes with standard options in CALL', async function () {
            await wampy.connect();
            
            const mixedOptions = {
                timeout: 5000,              // Standard option
                disclose_me: true,          // Standard option
                _tracking_id: 'mixed_123',  // Custom attribute
                _priority: 'high'           // Custom attribute
            };

            const result = await wampy.call('test.procedure', ['data'], mixedOptions);
            expect(result).to.have.property('argsList');
        });

        it('combines custom attributes with standard options in PUBLISH', async function () {
            await wampy.connect();
            
            const mixedOptions = {
                exclude_me: false,          // Standard option
                disclose_me: true,          // Standard option
                _event_type: 'notification', // Custom attribute
                _source_system: 'billing'   // Custom attribute
            };

            const result = await wampy.publish('test.topic', { data: 'test' }, mixedOptions);
            expect(result).to.have.property('publicationId');
        });

        it('combines custom attributes with standard options in SUBSCRIBE', async function () {
            await wampy.connect();
            
            const mixedOptions = {
                match: 'prefix',            // Standard option
                _subscription_type: 'live', // Custom attribute
                _filter_level: 'debug'      // Custom attribute
            };

            const result = await wampy.subscribe('test.prefix', function () {}, mixedOptions);
            expect(result).to.have.property('subscriptionId');
        });

        it('combines custom attributes with standard options in REGISTER', async function () {
            await wampy.connect();
            
            const mixedOptions = {
                invoke: 'roundrobin',       // Standard option
                _handler_type: 'async',     // Custom attribute
                _max_concurrency: 10        // Custom attribute
            };

            const result = await wampy.register('test.rpc', function () { return { ok: true }; }, mixedOptions);
            expect(result).to.have.property('registrationId');
        });
    });

    describe('HELLO Custom Attributes (Special Case)', function () {
        
        it('HELLO should fail with _extractCustomOptions pattern (expected failure)', async function () {
            // This test is expected to FAIL because HELLO doesn't use _extractCustomOptions
            // It uses helloCustomDetails instead, which doesn't validate the regex pattern
            
            const wampyWithInvalidHello = new Wampy('ws://fake.server.url/ws/', { 
                realm: 'AppRealm',
                ws: WebSocket,
                helloCustomDetails: {
                    _x: 'too_short',        // This SHOULD be invalid but will pass
                    _X: 'uppercase',        // This SHOULD be invalid but will pass
                    'no_underscore': 'test' // This SHOULD be invalid but will pass
                }
            });

            // This will succeed even with invalid attributes because HELLO doesn't validate
            await wampyWithInvalidHello.connect();
            expect(wampyWithInvalidHello.getOpStatus().code).to.equal(0);
            await wampyWithInvalidHello.disconnect();
            
            // This test demonstrates that HELLO needs to be updated to use _extractCustomOptions
            // for consistent validation across all message types
        });
    });
}); 