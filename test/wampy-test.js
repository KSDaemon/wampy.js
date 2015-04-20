/**
 * Project: wampy.js
 * User: KSDaemon
 * Date: 07.04.15
 */

var expect = require('chai').expect,
    WebSocket = require('./fake-ws'),
    Wampy = require('./../src/wampy'),
    root = (typeof process === 'object' &&
            Object.prototype.toString.call(process) === '[object process]') ?
            global : window,
    WAMP_ERROR_MSG = {
        SUCCESS: {
            code: 0,
            description: 'Success!'
        },
        URI_ERROR: {
            code: 1,
            description: 'Topic URI doesn\'t meet requirements!'
        },
        NO_BROKER: {
            code: 2,
            description: 'Server doesn\'t provide broker role!'
        },
        NO_CALLBACK_SPEC: {
            code: 3,
            description: 'No required callback function specified!'
        },
        INVALID_PARAM: {
            code: 4,
            description: 'Invalid parameter(s) specified!'
        },
        NON_EXIST_SUBSCRIBE_CONFIRM: {
            code: 5,
            description: 'Received subscribe confirmation to non existent subscription!'
        },
        NON_EXIST_SUBSCRIBE_ERROR: {
            code: 6,
            description: 'Received error for non existent subscription!'
        },
        NON_EXIST_UNSUBSCRIBE: {
            code: 7,
            description: 'Trying to unsubscribe from non existent subscription!'
        },
        NON_EXIST_SUBSCRIBE_UNSUBSCRIBED: {
            code: 8,
            description: 'Received unsubscribe confirmation to non existent subscription!'
        },
        NON_EXIST_PUBLISH_ERROR: {
            code: 9,
            description: 'Received error for non existent publication!'
        },
        NON_EXIST_PUBLISH_PUBLISHED: {
            code: 10,
            description: 'Received publish confirmation for non existent publication!'
        },
        NON_EXIST_SUBSCRIBE_EVENT: {
            code: 11,
            description: 'Received event for non existent subscription!'
        },
        NO_DEALER: {
            code: 12,
            description: 'Server doesn\'t provide dealer role!'
        },
        NON_EXIST_CALL_RESULT: {
            code: 13,
            description: 'Received rpc result for non existent call!'
        },
        NON_EXIST_CALL_ERROR: {
            code: 14,
            description: 'Received rpc call error for non existent call!'
        },
        RPC_ALREADY_REGISTERED: {
            code: 15,
            description: 'RPC already registered!'
        },
        NON_EXIST_RPC_REG: {
            code: 16,
            description: 'Received rpc registration confirmation for non existent rpc!'
        },
        NON_EXIST_RPC_UNREG: {
            code: 17,
            description: 'Received rpc unregistration confirmation for non existent rpc!'
        },
        NON_EXIST_RPC_ERROR: {
            code: 18,
            description: 'Received error for non existent rpc!'
        },
        NON_EXIST_RPC_INVOCATION: {
            code: 19,
            description: 'Received invocation for non existent rpc!'
        },
        NON_EXIST_RPC_REQ_ID: {
            code: 20,
            description: 'No RPC calls in action with specified request ID!'
        },
        NO_REALM: {
            code: 21,
            description: 'No realm specified!'
        },
        NO_WS_URL: {
            code: 22,
            description: 'No websocket URL specified or URL is incorrect!'
        }
    };

root.WebSocket = root.WebSocket || WebSocket;

describe('Wampy.js', function () {

    describe('Constructor', function () {

        it('allows to connect on instantiation if all required options specified', function (done) {
            var wampy = new Wampy('ws://fake.server.org/ws/', {
                    debug: true,
                    realm: 'AppRealm',
                    onConnect: done
                });
        });

        it('disallows to connect on instantiation without url', function () {
            var wampy = new Wampy({ realm: 'AppRealm' }),
                opStatus = wampy.getOpStatus();

            expect(opStatus).to.be.deep.equal(WAMP_ERROR_MSG.NO_WS_URL);
        });

        it('disallows to connect on instantiation without realm', function () {
            var wampy = new Wampy('ws://fake.server.org/ws/'),
                opStatus = wampy.getOpStatus();

            expect(opStatus).to.be.deep.equal(WAMP_ERROR_MSG.NO_REALM);
        });

        it('allows to set different options on instantiation', function (done) {
            var wampy = new Wampy('ws://fake.server.org/ws/', {
                    debug: true,
                    autoReconnect: true,
                    reconnectInterval: 10000,
                    maxRetries: 50,
                    transportEncoding: 'json',
                    realm: 'AppRealm',
                    onConnect: done,
                    onClose: done,
                    onError: done,
                    onReconnect: done
                }),
                options = wampy.options();

            expect(options.autoReconnect).to.be.true;
            expect(options.reconnectInterval).to.be.equal(10000);
            expect(options.maxRetries).to.be.equal(50);
            expect(options.transportEncoding).to.be.equal('json');
            expect(options.realm).to.be.equal('AppRealm');
            expect(options.onConnect).to.be.a('function');
            expect(options.onClose).to.be.a('function');
            expect(options.onError).to.be.a('function');
            expect(options.onReconnect).to.be.a('function');
        });

    });

    describe('Instance', function () {
        var wampy;

        before(function (done) {
            wampy = new Wampy('ws://fake.server.org/ws/', {
                    debug: true,
                    autoReconnect: false,
                    reconnectInterval: 2000,
                    maxRetries: 7,
                    transportEncoding: 'json',
                    realm: 'AppRealm',
                    onConnect: function () { done(); },
                    onClose: function () { done(); },
                    onError: function () { done(); },
                    onReconnect: function () { done(); }
                });
        });

        it('allows to get and set different options', function () {
            var options = wampy.options({
                autoReconnect: true,
                reconnectInterval: 1000,
                maxRetries: 5,
                transportEncoding: 'json'
            }).options();

            expect(options.autoReconnect).to.be.true;
            expect(options.reconnectInterval).to.be.equal(1000);
            expect(options.maxRetries).to.be.equal(5);
            expect(options.transportEncoding).to.be.equal('json');
            expect(options.onConnect).to.be.a('function');
            expect(options.onClose).to.be.a('function');
            expect(options.onError).to.be.a('function');
            expect(options.onReconnect).to.be.a('function');
        });

        it('allows to get current WAMP Session ID', function () {
            var s = wampy.getSessionId();
            expect(s).to.be.a('number');
            expect(s).to.be.above(0);
        });

        it('allows to disconnect from connected server', function (done) {
            wampy.options({ onClose: function () { done(); } });
            wampy.disconnect();
        });

        it('allows to connect to same WAMP server', function (done) {
            wampy.options({ onConnect: function () { done(); } });
            wampy.connect();
        });
/*
        it('allows to connect to different WAMP server', function (done) {
            wampy.options({
                onClose: function () {
                    wampy.options({ onConnect: function () { done(); } })
                    wampy.connect('ws://another.server.org/ws/');
                }
            }).disconnect();
        }); */
/*
        it('allows to abort WebSocket/WAMP session establishment', function (done) {
            wampy.options({
                onClose: function () {
                    wampy.connect('ws://anotherfake.server.org/ws/');
                },
                onConnect: function () { done(); }
            });
            wampy.disconnect();

            //wampy.options({ onClose: function () { done(); } });
            //wampy.connect('ws://anotherfake.server.org/ws/');
            //wampy.abort();

            wampy.options({ onClose: function () {
                wampy.connect('ws://anotherfake.server.org/ws/');
                wampy.abort();

                expect(wampy.getOpStatus()).to.be.deep.equal(WAMP_ERROR_MSG.SUCCESS);

            } });
            wampy.disconnect();
        });
*/
        describe('PubSub module', function () {

            it('disallows to subscribe to topic with invalid URI');

            it('disallows to subscribe to topic without specifying callback');

            it('allows to subscribe to topic');

            it('allows to subscribe to topic with notification on subscribing');

            it('allows to setup multiple handlers to same topic');

            it('allows to publish event without payload');

            it('allows to publish event with int payload');

            it('allows to publish event with string payload');

            it('allows to publish event with array payload');

            it('allows to publish event with hash-table payload');

            it('allows to publish event with notification on publishing');

            it('allows to publish event with different advanced options');

            it('disallows to publish event to topic with invalid URI');

            it('allows to unsubscribe from topic only specified handler');

            it('allows to unsubscribe all handlers from topic');

            it('allows to unsubscribe from topic with notification on unsubscribing');
        });

        describe('RPC module', function () {

            it('allows to register RPC');

            it('allows to register RPC with notification on registration');

            it('disallows to register RPC with invalid URI');

            it('disallows to call RPC with invalid URI');

            it('disallows to call RPC without specifying result handler');

            it('allows to call RPC without payload');

            it('allows to call RPC with int payload');

            it('allows to call RPC with string payload');

            it('allows to call RPC with array payload');

            it('allows to call RPC with hash-table payload');

            it('allows to call RPC with different advanced options');

            it('allows to call RPC with progressive result receiving');

            it('allows to cancel RPC invocation');

            it('allows to unregister RPC');

            it('allows to unregister RPC with notification on unregistering');
        });

    });

})
