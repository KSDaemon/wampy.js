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
            description: 'Received rpc unregistration for non existent rpc!'
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

        it('allows to connect to different WAMP server', function (done) {
            wampy.options({
                onClose: function () {
                    root.setTimeout(function () {
                        wampy.connect('ws://another.server.org/ws/');
                    }, 1);
                },
                onConnect: function () { done(); }
            }).disconnect();
        });

        it('allows to abort WebSocket/WAMP session establishment', function (done) {
            wampy.options({
                onClose: function () {
                    root.setTimeout(function () {
                        wampy.options({ onClose: done })
                            .connect('ws://another.server.org/ws/')
                            .abort();

                        expect(wampy.getOpStatus()).to.be.deep.equal(WAMP_ERROR_MSG.SUCCESS);

                    }, 1);
                },
                onConnect: function () {
                    done(new Error('We reach connection'));
                }
            }).disconnect();

        });

        describe('PubSub module', function () {

            before(function (done) {
                wampy.options({ onConnect: function () { done(); } })
                     .connect();
            });

            it('disallows to subscribe to topic if server does not provide BROKER role', function () {
                wampy.subscribe('qwe.asd.zxc', function (e) { });
                expect(wampy.getOpStatus()).to.be.deep.equal(WAMP_ERROR_MSG.NO_BROKER);
            });

            it('disallows to unsubscribe from topic if server does not provide BROKER role', function () {
                wampy.unsubscribe('qwe.asd.zxc');
                expect(wampy.getOpStatus()).to.be.deep.equal(WAMP_ERROR_MSG.NO_BROKER);
            });

            it('disallows to publish to topic if server does not provide BROKER role', function () {
                wampy.publish('qwe.asd.zxc', 'payload');
                expect(wampy.getOpStatus()).to.be.deep.equal(WAMP_ERROR_MSG.NO_BROKER);
            });

            it('disallows to subscribe to topic with invalid URI', function (done) {
                wampy.options({
                    onClose: function () {
                        root.setTimeout(function () {
                            wampy.connect();
                        }, 1);
                    },
                    onConnect: function () {

                        wampy.subscribe('q.w.e', function (e) { });
                        expect(wampy.getOpStatus()).to.be.deep.equal(WAMP_ERROR_MSG.URI_ERROR);

                        wampy.subscribe('qwe.asd.zxc.', function (e) { });
                        expect(wampy.getOpStatus()).to.be.deep.equal(WAMP_ERROR_MSG.URI_ERROR);

                        wampy.subscribe('qwe.asd..zxc', function (e) { });
                        expect(wampy.getOpStatus()).to.be.deep.equal(WAMP_ERROR_MSG.URI_ERROR);

                        wampy.subscribe('qq,ww,ee', function (e) { });
                        expect(wampy.getOpStatus()).to.be.deep.equal(WAMP_ERROR_MSG.URI_ERROR);

                        wampy.subscribe('qq:www:ee', function (e) { });
                        expect(wampy.getOpStatus()).to.be.deep.equal(WAMP_ERROR_MSG.URI_ERROR);

                        done();

                    }
                }).disconnect();

            });

            it('disallows to subscribe to topic without specifying callback', function () {
                wampy.subscribe('qqq.www.eee');
                expect(wampy.getOpStatus()).to.be.deep.equal(WAMP_ERROR_MSG.NO_CALLBACK_SPEC);
            });

            it('allows to subscribe to topic', function () {
                wampy.subscribe('subscribe.topic1', function (e) { });
                expect(wampy.getOpStatus().code).to.be.equal(WAMP_ERROR_MSG.SUCCESS.code);
            });

            it('allows to subscribe to topic with notification on subscribing', function (done) {
                wampy.subscribe('subscribe.topic2', {
                    onSuccess: function () {
                        done();
                    },
                    onError: function () { done('Error during subscribing'); },
                    onEvent: function (e) { }
                });
                expect(wampy.getOpStatus().code).to.be.equal(WAMP_ERROR_MSG.SUCCESS.code);
            });

            it('allows to setup multiple handlers to same topic', function () {
                wampy.subscribe('subscribe.topic2', function (e) { });
                expect(wampy.getOpStatus().code).to.be.equal(WAMP_ERROR_MSG.SUCCESS.code);
                wampy.subscribe('subscribe.topic2', function (e) { });
                expect(wampy.getOpStatus().code).to.be.equal(WAMP_ERROR_MSG.SUCCESS.code);
            });

            it('allows to publish/subscribe event without payload', function (done) {
                wampy.subscribe('subscribe.topic3', function (e) {
                    expect(e).to.be.null;
                    done();
                })
                .publish('publish.topic3', null, {
                    onSuccess: function () { }
                },
                {
                    exclude_me: false
                });
                expect(wampy.getOpStatus().code).to.be.equal(WAMP_ERROR_MSG.SUCCESS.code);
            });

            it('allows to publish/subscribe event with int payload', function (done) {
                wampy.subscribe('subscribe.topic4', function (e) {
                    expect(e).to.be.an('array');
                    expect(e[0]).to.be.equal(25);
                    done();
                })
                .publish('publish.topic4', 25, {
                    onSuccess: function () { }
                },
                {
                    exclude_me: false
                });
                expect(wampy.getOpStatus().code).to.be.equal(WAMP_ERROR_MSG.SUCCESS.code);
            });

            it('allows to publish/subscribe event with string payload', function (done) {
                wampy.subscribe('subscribe.topic5', function (e) {
                    expect(e).to.be.an('array');
                    expect(e[0]).to.be.equal('payload');
                    done();
                })
                .publish('publish.topic4', 'payload', {
                    onSuccess: function () { }
                },
                {
                    exclude_me: false
                });
                expect(wampy.getOpStatus().code).to.be.equal(WAMP_ERROR_MSG.SUCCESS.code);
            });

            it('allows to publish/subscribe event with array payload', function (done) {
                wampy.subscribe('subscribe.topic6', function (e) {
                    expect(e).to.be.an('array');
                    expect(e).to.have.length(5);
                    expect(e[0]).to.be.equal(1);
                    expect(e[4]).to.be.equal(5);
                    done();
                })
                .publish('publish.topic4', [1, 2, 3, 4, 5], {
                    onSuccess: function () { }
                },
                {
                    exclude_me: false
                });
                expect(wampy.getOpStatus().code).to.be.equal(WAMP_ERROR_MSG.SUCCESS.code);
            });

            it('allows to publish/subscribe event with hash-table payload', function (done) {
                var payload = { key1: 100, key2: 'string-key' };

                wampy.subscribe('subscribe.topic7', function (e) {
                    expect(e).to.be.an('object');
                    expect(e).to.be.deep.equal(payload);
                    done();
                })
                .publish('publish.topic4', payload, {
                    onSuccess: function () { }
                },
                {
                    exclude_me: false
                });
                expect(wampy.getOpStatus().code).to.be.equal(WAMP_ERROR_MSG.SUCCESS.code);
            });

            it('allows to publish event with different advanced options', function (done) {
                wampy.subscribe('subscribe.topic8', function (e) {
                    expect(e).to.be.an('array');
                    expect(e[0]).to.be.equal('payload');
                    done();
                })
                .publish('publish.topic8', 'payload',
                    {
                        onSuccess: function () { },
                        onError: function () { }
                    },
                    {
                        exclude: [1234567],
                        eligible: [wampy.getSessionId(), 7654321],
                        exclude_me: false,
                        disclose_me: true
                    }
                );
                expect(wampy.getOpStatus().code).to.be.equal(WAMP_ERROR_MSG.SUCCESS.code);
            });

            it('disallows to publish event to topic with invalid URI', function () {
                wampy.publish('q.w.e', 'payload');
                expect(wampy.getOpStatus()).to.be.deep.equal(WAMP_ERROR_MSG.URI_ERROR);

                wampy.publish('qwe.asd.zxc.', 'payload');
                expect(wampy.getOpStatus()).to.be.deep.equal(WAMP_ERROR_MSG.URI_ERROR);

                wampy.publish('qwe.asd..zxc', 'payload');
                expect(wampy.getOpStatus()).to.be.deep.equal(WAMP_ERROR_MSG.URI_ERROR);

                wampy.publish('qq,ww,ee', 'payload');
                expect(wampy.getOpStatus()).to.be.deep.equal(WAMP_ERROR_MSG.URI_ERROR);

                wampy.publish('qq:www:ee', 'payload');
                expect(wampy.getOpStatus()).to.be.deep.equal(WAMP_ERROR_MSG.URI_ERROR);
            });

            it('allows to unsubscribe from topic only specified handler', function (done) {

                var handler2 = function (e) { done(); },
                    handler1 = function (e) { done('Called removed handler'); };

                wampy.subscribe('subscribe.topic9', {
                    onSuccess: function () {
                        wampy.subscribe('subscribe.topic9', handler2)
                        .unsubscribe('subscribe.topic9', handler1)
                        .publish('subscribe.topic9', 'payload', null, { exclude_me: false });
                    },
                    onError: function () { },
                    onEvent: handler1
                });
            });

            it('allows to unsubscribe all handlers from topic', function () {
                wampy.unsubscribe('subscribe.topic1');
                expect(wampy.getOpStatus().code).to.be.equal(WAMP_ERROR_MSG.SUCCESS.code);
            });

            it('allows to unsubscribe from topic with notification on unsubscribing', function (done) {
                wampy.unsubscribe('subscribe.topic2', {
                    onSuccess: function (e) { done(); }
                });
                expect(wampy.getOpStatus().code).to.be.equal(WAMP_ERROR_MSG.SUCCESS.code);
            });

            it('receives error when trying to unsubscribe from non existent subscription', function () {
                wampy.unsubscribe('subscribe.topic2');
                expect(wampy.getOpStatus().code).to.be.equal(WAMP_ERROR_MSG.NON_EXIST_UNSUBSCRIBE.code);
            });

        });

        describe('RPC module', function () {

            before(function (done) {
                wampy.options({ onClose: function () {
                    root.setTimeout(function () {
                        wampy.options({ onConnect: function () { done(); } })
                            .connect();
                    }, 1);
                } }).disconnect();
            });

            it('disallows to call rpc if server does not provide DEALER role', function () {
                wampy.call('call.rpc1', 'payload', function (e) { });
                expect(wampy.getOpStatus()).to.be.deep.equal(WAMP_ERROR_MSG.NO_DEALER);
            });

            it('disallows to cancel rpc if server does not provide DEALER role', function () {
                wampy.cancel(1234567, function (e) { });
                expect(wampy.getOpStatus()).to.be.deep.equal(WAMP_ERROR_MSG.NO_DEALER);
            });

            it('disallows to register rpc if server does not provide DEALER role', function () {
                wampy.register('call.rpc2', function (e) { });
                expect(wampy.getOpStatus()).to.be.deep.equal(WAMP_ERROR_MSG.NO_DEALER);
            });

            it('disallows to unregister rpc if server does not provide DEALER role', function () {
                wampy.unregister('call.rpc3', function (e) { });
                expect(wampy.getOpStatus()).to.be.deep.equal(WAMP_ERROR_MSG.NO_DEALER);
            });

            it('disallows to register RPC with invalid URI', function (done) {
                wampy.options({
                    onClose: function () {
                        root.setTimeout(function () {
                            wampy.connect();
                        }, 1);
                    },
                    onConnect: function () {

                        wampy.register('q.w.e', function (e) { });
                        expect(wampy.getOpStatus()).to.be.deep.equal(WAMP_ERROR_MSG.URI_ERROR);

                        wampy.register('qwe.asd.zxc.', function (e) { });
                        expect(wampy.getOpStatus()).to.be.deep.equal(WAMP_ERROR_MSG.URI_ERROR);

                        wampy.register('qwe.asd..zxc', function (e) { });
                        expect(wampy.getOpStatus()).to.be.deep.equal(WAMP_ERROR_MSG.URI_ERROR);

                        wampy.register('qq,ww,ee', function (e) { });
                        expect(wampy.getOpStatus()).to.be.deep.equal(WAMP_ERROR_MSG.URI_ERROR);

                        wampy.register('qq:www:ee', function (e) { });
                        expect(wampy.getOpStatus()).to.be.deep.equal(WAMP_ERROR_MSG.URI_ERROR);

                        done();

                    }
                }).disconnect();
            });

            it('allows to register RPC', function () {
                wampy.register('register.rpc1', function (e) { });
                expect(wampy.getOpStatus().code).to.be.equal(WAMP_ERROR_MSG.SUCCESS.code);
            });

            it('allows to register RPC with notification on registration', function (done) {
                wampy.register('register.rpc2', {
                    rpc: function (e) { },
                    onSuccess: function () {
                        done();
                    },
                    onError: function () { done('Error during RPC registration'); }
                });
            });

            it('disallows to register RPC with same name', function () {
                wampy.register('register.rpc2', function (e) { });
                expect(wampy.getOpStatus()).to.be.deep.equal(WAMP_ERROR_MSG.RPC_ALREADY_REGISTERED);
            });

            it('disallows to call RPC with invalid URI', function () {
                wampy.call('q.w.e', 'payload', function (e) { });
                expect(wampy.getOpStatus()).to.be.deep.equal(WAMP_ERROR_MSG.URI_ERROR);

                wampy.call('qwe.asd.zxc.', 'payload', function (e) { });
                expect(wampy.getOpStatus()).to.be.deep.equal(WAMP_ERROR_MSG.URI_ERROR);

                wampy.call('qwe.asd..zxc', 'payload', function (e) { });
                expect(wampy.getOpStatus()).to.be.deep.equal(WAMP_ERROR_MSG.URI_ERROR);

                wampy.call('qq,ww,ee', 'payload', function (e) { });
                expect(wampy.getOpStatus()).to.be.deep.equal(WAMP_ERROR_MSG.URI_ERROR);

                wampy.call('qq:www:ee', 'payload', function (e) { });
                expect(wampy.getOpStatus()).to.be.deep.equal(WAMP_ERROR_MSG.URI_ERROR);
            });

            it('disallows to call RPC without specifying result handler', function () {
                wampy.call('qqq.www.eee', 'payload');
                expect(wampy.getOpStatus()).to.be.deep.equal(WAMP_ERROR_MSG.NO_CALLBACK_SPEC);
            });

            it('disallows to unregister rpc if there is no such registration', function () {
                wampy.unregister('call.rpc4', function (e) { });
                expect(wampy.getOpStatus()).to.be.deep.equal(WAMP_ERROR_MSG.NON_EXIST_RPC_UNREG);
            });

            it('allows to call RPC without payload', function (done) {
                wampy.call('call.rpc1', null, function (e) {
                    expect(e).to.be.null;
                    done();
                });
            });

            it('allows to call RPC with int payload', function (done) {
                wampy.call('call.rpc2', 25, function (e) {
                    expect(e).to.be.an('array');
                    expect(e[0]).to.be.equal(25);
                    done();
                });
            });

            it('allows to call RPC with string payload', function (done) {
                wampy.call('call.rpc3', 'payload', function (e) {
                    expect(e).to.be.an('array');
                    expect(e[0]).to.be.equal('payload');
                    done();
                });
            });

            it('allows to call RPC with array payload', function (done) {
                wampy.call('call.rpc4', [1, 2, 3, 4, 5], function (e) {
                    expect(e).to.be.an('array');
                    expect(e).to.have.length(5);
                    expect(e[0]).to.be.equal(1);
                    expect(e[4]).to.be.equal(5);
                    done();
                });
            });

            it('allows to call RPC with hash-table payload', function (done) {
                var payload = { key1: 100, key2: 'string-key' };

                wampy.call('call.rpc5', {}, function (e) {
                    expect(e).to.be.an('object');
                    expect(e).to.be.deep.equal(payload);
                    done();
                });
            });

            it('allows to call RPC with different advanced options', function (done) {
                wampy.call(
                    'call.rpc6',
                    'payload',
                    function (e) {
                        expect(e).to.be.an('array');
                        expect(e[0]).to.be.equal('payload');
                        done();
                    },
                    {
                        exclude: [1234567],
                        eligible: [wampy.getSessionId(), 7654321],
                        exclude_me: false,
                        disclose_me: true,
                        receive_progress: false
                    }
                );
            });

            it('allows to call RPC with progressive result receiving', function (done) {
                wampy.call(
                    'call.rpc7',
                    'progress',
                    function (e) {
                        expect(e).to.be.an('array');
                        if (e[0] == 100) {
                            done();
                        }
                    },
                    {
                        receive_progress: true
                    }
                );
            });

            it('allows to cancel RPC invocation', function (done) {
                var reqId;

                wampy.call(
                    'call.rpc8',
                    'payload',
                    {
                        onSuccess: function (e) {
                            expect(e).to.be.an('array');

                            wampy.cancel(
                                reqId,
                                {
                                    onSuccess: function () {},
                                    onError: function () { done('Error occured during call canceling'); }
                                },
                                {
                                    mode: 'kill'
                                }
                            );
                        },
                        onError: function (e) {
                            done();
                        }
                    },
                    {
                        receive_progress: true
                    }
                );

                reqId = wampy.getOpStatus().reqId;
            });

            it('allows to unregister RPC', function (done) {
                wampy.unregister('register.rpc1', function (e) {
                    expect(wampy.getOpStatus().code).to.be.equal(WAMP_ERROR_MSG.SUCCESS.code);
                    done();
                });
            });

            it('allows to unregister RPC with notification on unregistering', function (done) {
                wampy.unregister(
                    'register.rpc2',
                    {
                        onSuccess: function (e) {
                            expect(wampy.getOpStatus().code).to.be.equal(WAMP_ERROR_MSG.SUCCESS.code);
                            done();
                        },
                        onError: function (e) {
                            done('Error during RPC unregistration!');
                        }
                    }
                );
            });
        });

    });

})
