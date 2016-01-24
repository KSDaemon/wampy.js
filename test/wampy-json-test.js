/**
 * Project: wampy.js
 * User: KSDaemon
 * Date: 07.04.15
 */

var expect = require('chai').expect,
    routerUrl = 'ws://fake.server.org/ws/',
    anotherRouterUrl = 'ws://another.server.org/ws/',
    WebSocket,
    Wampy,
    root = (typeof process === 'object' &&
            Object.prototype.toString.call(process) === '[object process]') ?
            global : window,
    WAMP_ERROR_MSG = require('./wamp-error-msg.json');

describe('Wampy.js [with JSON encoder]', function () {
    this.timeout(5000);

    before(function () {
        delete require.cache[require.resolve('./send-data')];
        delete require.cache[require.resolve('./fake-ws')];
        delete require.cache[require.resolve('./../src/wampy')];

        WebSocket = require('./fake-ws'),
        Wampy = require('./../src/wampy');
    });

    describe('Constructor', function () {

        it('allows to connect on instantiation if all required options specified', function (done) {
            var wampy = new Wampy(routerUrl, {
                realm: 'AppRealm',
                onConnect: done,
                ws: WebSocket
            });
        });

        it('disallows to connect on instantiation without url', function () {
            var wampy = new Wampy({ realm: 'AppRealm' }),
                opStatus = wampy.getOpStatus();

            expect(opStatus).to.be.deep.equal(WAMP_ERROR_MSG.NO_WS_OR_URL);
        });

        it('disallows to connect on instantiation without realm', function () {
            var wampy = new Wampy(routerUrl),
                opStatus = wampy.getOpStatus();

            expect(opStatus).to.be.deep.equal(WAMP_ERROR_MSG.NO_REALM);
        });

        it('allows to set different options on instantiation', function (done) {
            var wampy = new Wampy(routerUrl, {
                    autoReconnect: true,
                    reconnectInterval: 10000,
                    maxRetries: 50,
                    transportEncoding: 'json',
                    realm: 'AppRealm',
                    onConnect: done,
                    onClose: done,
                    onError: done,
                    onReconnect: done,
                    ws: WebSocket
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
            wampy = new Wampy(routerUrl, {
                debug: false,
                autoReconnect: true,
                reconnectInterval: 2000,
                maxRetries: 7,
                transportEncoding: 'json',
                realm: 'AppRealm',
                onConnect: function () { done(); },
                onClose: function () { done('Reached close'); },
                onError: function () { done('Reached error'); },
                onReconnect: function () { done('Reached reconnection'); },
                ws: WebSocket
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

        it('allows to disconnect while connecting to server', function (done) {
            wampy.options({ onClose: done })
                .connect();

            root.setTimeout(function () {
                wampy.disconnect();
                expect(wampy.getOpStatus()).to.be.deep.equal(WAMP_ERROR_MSG.SUCCESS);
            }, 1);
        });

        it('allows to connect to same WAMP server', function (done) {
            wampy.options({ onConnect: done })
                .connect();
        });

        it('allows to connect to different WAMP server', function (done) {
            wampy.options({
                onClose: function () {
                    root.setTimeout(function () {
                        wampy.connect(anotherRouterUrl);
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
                            .connect(anotherRouterUrl);

                        root.setTimeout(function () {
                            wampy.abort();
                        }, 1);

                    }, 1);
                },
                onConnect: function () {
                    done('We reach connection');
                }
            }).disconnect();

        });

        it('autoreconnects to WAMP server on network errors', function (done) {
            wampy.options({
                onConnect: function () {
                    wampy
                        .subscribe('subscribe.reconnect1', {
                            onSuccess: function () { },
                            onError: function () { done('Error during subscribing'); },
                            onEvent: function (e) { }
                        })
                        .subscribe('subscribe.reconnect2', {
                            onSuccess: function () { },
                            onError: function () { done('Error during subscribing'); },
                            onEvent: function (e) { }
                        })
                        .register('register.reconnect1', {
                            rpc: function (e) { },
                            onSuccess: function () { },
                            onError: function () { done('Error during RPC registration'); }
                        })
                        .register('register.reconnect2', {
                            rpc: function (e) { },
                            onSuccess: function () { },
                            onError: function () { done('Error during RPC registration'); }
                        })
                        .register('register.reconnect3', {
                            rpc: function (e) { },
                            onSuccess: function () { },
                            onError: function () { done('Error during RPC registration'); }
                        });

                },
                onClose: function () { },
                onError: function () { },
                onReconnect: function () {
                    var t = root.setInterval(function () {
                        if (wampy._subsTopics.length === 2 && wampy._rpcNames.length === 3) {
                            root.clearInterval(t);
                            t = null;
                            wampy.options({
                                onReconnect: null
                            });
                            done();
                        }
                    }, 15);
                }
            }).connect();
        });

        it('allows to call handler on websocket errors', function (done) {
            wampy.options({
                onClose: function () {
                    root.setTimeout(function () {
                        wampy.connect();
                    }, 1);
                },
                onConnect: function () { },
                onError: done
            }).disconnect();
        });

        it('calls error handler if server sends abort message', function (done) {
            wampy.options({
                onError: function (e) { done(); }
            }).connect();
        });

        describe('PubSub module', function () {

            before(function (done) {
                wampy.options({ onConnect: function () { done(); } })
                     .connect();
            });

            it('disallows to subscribe to topic if server does not provide BROKER role', function () {
                wampy.subscribe('qwe.asd.zxc', function (e) { });
                expect(wampy.getOpStatus()).to.be.deep.equal(WAMP_ERROR_MSG.NO_BROKER);

                wampy.subscribe('qwe.asd.zxc',
                    {
                        onSuccess: function (e) { },
                        onError: function (e) {
                            expect(e).to.be.equal(WAMP_ERROR_MSG.NO_BROKER.description);
                        }
                    }
                );
            });

            it('disallows to unsubscribe from topic if server does not provide BROKER role', function () {
                wampy.unsubscribe('qwe.asd.zxc');
                expect(wampy.getOpStatus()).to.be.deep.equal(WAMP_ERROR_MSG.NO_BROKER);

                wampy.unsubscribe('qwe.asd.zxc',
                    {
                        onSuccess: function (e) { },
                        onError: function (e) {
                            expect(e).to.be.equal(WAMP_ERROR_MSG.NO_BROKER.description);
                        }
                    }
                );
            });

            it('disallows to publish to topic if server does not provide BROKER role', function () {
                wampy.publish('qwe.asd.zxc', 'payload');
                expect(wampy.getOpStatus()).to.be.deep.equal(WAMP_ERROR_MSG.NO_BROKER);

                wampy.publish('qwe.asd.zxc', 'payload',
                    {
                        onSuccess: function (e) { },
                        onError: function (e) {
                            expect(e).to.be.equal(WAMP_ERROR_MSG.NO_BROKER.description);
                        }
                    }
                );
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

                        wampy.subscribe('q.w.e', function (e) { });
                        expect(wampy.getOpStatus()).to.be.deep.equal(WAMP_ERROR_MSG.URI_ERROR);

                        wampy.subscribe('q.w.e',
                            {
                                onSuccess: function (e) { },
                                onError: function (e) {
                                    expect(e).to.be.equal(WAMP_ERROR_MSG.URI_ERROR.description);
                                }
                            }
                        );

                        done();

                    }
                }).disconnect();

            });

            it('disallows to subscribe to topic without specifying callback', function (done) {
                wampy.subscribe('qqq.www.eee');
                expect(wampy.getOpStatus()).to.be.deep.equal(WAMP_ERROR_MSG.NO_CALLBACK_SPEC);

                wampy.subscribe('qqq.www.eee', { });
                expect(wampy.getOpStatus()).to.be.deep.equal(WAMP_ERROR_MSG.NO_CALLBACK_SPEC);

                wampy.subscribe('qqq.www.eee', { onError: function (e) {
                    expect(e).to.be.equal(WAMP_ERROR_MSG.NO_CALLBACK_SPEC.description);
                    done();
                } });
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
                wampy.subscribe('subscribe.topic2', {
                    onEvent: function (e) { },
                    onSuccess: function (e) { }
                });
                expect(wampy.getOpStatus().code).to.be.equal(WAMP_ERROR_MSG.SUCCESS.code);
            });

            it('allows to publish/subscribe event without payload', function (done) {
                wampy.subscribe('subscribe.topic3', function (e) {
                    expect(e).to.be.null;
                    done();
                })
                .publish('subscribe.topic3', null, { exclude_me: false });
                expect(wampy.getOpStatus().code).to.be.equal(WAMP_ERROR_MSG.SUCCESS.code);
            });

            it('allows to publish/subscribe event with int payload', function (done) {
                wampy.subscribe('subscribe.topic4', function (e) {
                    expect(e).to.be.an('array');
                    expect(e[0]).to.be.equal(25);
                    done();
                })
                .publish('subscribe.topic4', 25, { exclude_me: false });
                expect(wampy.getOpStatus().code).to.be.equal(WAMP_ERROR_MSG.SUCCESS.code);
            });

            it('allows to publish/subscribe event with string payload', function (done) {
                wampy.subscribe('subscribe.topic5', function (e) {
                    expect(e).to.be.an('array');
                    expect(e[0]).to.be.equal('payload');
                    done();
                })
                .publish('subscribe.topic5', 'payload', { exclude_me: false });
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
                .publish('subscribe.topic6', [1, 2, 3, 4, 5], { exclude_me: false });
                expect(wampy.getOpStatus().code).to.be.equal(WAMP_ERROR_MSG.SUCCESS.code);
            });

            it('allows to publish/subscribe event with hash-table payload', function (done) {
                var payload = { key1: 100, key2: 'string-key' };

                wampy.subscribe('subscribe.topic7', function (e) {
                    expect(e).to.be.an('object');
                    expect(e).to.be.deep.equal(payload);
                    done();
                })
                .publish('subscribe.topic7', payload, { exclude_me: false });
                expect(wampy.getOpStatus().code).to.be.equal(WAMP_ERROR_MSG.SUCCESS.code);
            });

            it('allows to publish event with different advanced options', function (done) {
                wampy.subscribe('subscribe.topic8', function (e) {
                    expect(e).to.be.an('array');
                    expect(e[0]).to.be.equal('payload');
                    done();
                })
                .publish('subscribe.topic8', 'payload',
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

                wampy.publish('qq:www:ee', 'payload',
                    {
                        onSuccess: function (e) { },
                        onError: function (e) {
                            expect(e).to.be.equal(WAMP_ERROR_MSG.URI_ERROR.description);
                        }
                    }
                );
            });

            it('checks for valid advanced options during publishing to topic', function () {
                wampy.publish(
                    'qqq.www.eee',
                    'payload',
                    {
                        onSuccess: function (e) { },
                        onError: function (e) { }
                    },
                    'string instead of object'
                );
                expect(wampy.getOpStatus()).to.be.deep.equal(WAMP_ERROR_MSG.INVALID_PARAM);

                wampy.publish(
                    'qqq.www.eee',
                    'payload',
                    {
                        onSuccess: function (e) { },
                        onError: function (e) { }
                    },
                    123
                );
                expect(wampy.getOpStatus()).to.be.deep.equal(WAMP_ERROR_MSG.INVALID_PARAM);

                wampy.publish(
                    'qqq.www.eee',
                    'payload',
                    {
                        onSuccess: function (e) { },
                        onError: function (e) { }
                    },
                    function () {}
                );
                expect(wampy.getOpStatus()).to.be.deep.equal(WAMP_ERROR_MSG.INVALID_PARAM);

                wampy.publish(
                    'qqq.www.eee',
                    'payload',
                    {
                        onSuccess: function (e) { },
                        onError: function (e) { }
                    },
                    {
                        exclude: 'string instead of number or array',
                        eligible: 1234567
                    }
                );
                expect(wampy.getOpStatus()).to.be.deep.equal(WAMP_ERROR_MSG.INVALID_PARAM);

                wampy.publish(
                    'qqq.www.eee',
                    'payload',
                    {
                        onSuccess: function (e) { },
                        onError: function (e) { }
                    },
                    {
                        exclude: {},
                        eligible: 1234567
                    }
                );
                expect(wampy.getOpStatus()).to.be.deep.equal(WAMP_ERROR_MSG.INVALID_PARAM);

                wampy.publish(
                    'qqq.www.eee',
                    'payload',
                    {
                        onSuccess: function (e) { },
                        onError: function (e) { }
                    },
                    {
                        exclude: 1234567,
                        eligible: 'string instead of number or array'
                    }
                );
                expect(wampy.getOpStatus()).to.be.deep.equal(WAMP_ERROR_MSG.INVALID_PARAM);

                wampy.publish(
                    'qqq.www.eee',
                    'payload',
                    {
                        onSuccess: function (e) { },
                        onError: function (e) { }
                    },
                    {
                        exclude: 1234567,
                        eligible: {}
                    }
                );
                expect(wampy.getOpStatus()).to.be.deep.equal(WAMP_ERROR_MSG.INVALID_PARAM);

                wampy.publish(
                    'qqq.www.eee',
                    'payload',
                    {
                        onSuccess: function (e) { },
                        onError: function (e) {
                            expect(e).to.be.equal(WAMP_ERROR_MSG.INVALID_PARAM.description);
                        }
                    },
                    {
                        exclude: {},
                        eligible: {}
                    }
                );

                wampy.publish(
                    'qqq.www.eee',
                    'payload',
                    {
                        onSuccess: function (e) { },
                        onError: function (e) {
                            expect(e).to.be.equal(WAMP_ERROR_MSG.INVALID_PARAM.description);
                        }
                    },
                    {
                        exclude: 'invalid string',
                        eligible: 'invalid string'
                    }
                );
            });

            it('allows to unsubscribe from topic only specified handler', function (done) {

                var handler3 = function (e) { done('Called removed handler'); },
                    handler2 = function (e) { done(); },
                    handler1 = function (e) { done('Called removed handler'); };

                wampy.subscribe('subscribe.topic9', {
                    onSuccess: function () {
                        wampy.subscribe('subscribe.topic9', handler2)
                            .subscribe('subscribe.topic9', handler3)
                            .unsubscribe('subscribe.topic9', handler1)
                            .unsubscribe('subscribe.topic9', { onEvent: handler3 })
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

                wampy.unsubscribe('subscribe.topic2', {
                    onSuccess: function (e) { },
                    onError: function (e) {
                        expect(e).to.be.equal(WAMP_ERROR_MSG.NON_EXIST_UNSUBSCRIBE.description);
                    }
                });
            });

            it('fires error callback if error occurred during subscribing', function (done) {
                wampy.subscribe('subscribe.topic10', {
                    onSuccess: function () { },
                    onError: function (e) { done(); },
                    onEvent: function (e) { }
                });
            });

            it('fires error callback if error occurred during unsubscribing', function (done) {
                wampy.unsubscribe('subscribe.topic3', {
                    onSuccess: function () { },
                    onError: function (e) { done(); }
                });

            });

            it('fires error callback if error occurred during publishing', function (done) {
                wampy.publish('subscribe.topic4', null, {
                    onSuccess: function () { },
                    onError: function (e) { done(); }
                });
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

                wampy.call('call.rpc1', 'payload',
                    {
                        onSuccess: function (e) { },
                        onError: function (e) {
                            expect(e).to.be.equal(WAMP_ERROR_MSG.NO_DEALER.description);
                        }
                    }
                );

            });

            it('disallows to cancel rpc if server does not provide DEALER role', function () {
                wampy.cancel(1234567, function (e) { });
                expect(wampy.getOpStatus()).to.be.deep.equal(WAMP_ERROR_MSG.NO_DEALER);

                wampy.cancel(1234567,
                    {
                        onSuccess: function (e) { },
                        onError: function (e) {
                            expect(e).to.be.equal(WAMP_ERROR_MSG.NO_DEALER.description);
                        }
                    }
                );
            });

            it('disallows to register rpc if server does not provide DEALER role', function () {
                wampy.register('call.rpc2', function (e) { });
                expect(wampy.getOpStatus()).to.be.deep.equal(WAMP_ERROR_MSG.NO_DEALER);

                wampy.register('call.rpc2',
                    {
                        rpc: function (e) {},
                        onSuccess: function (e) { },
                        onError: function (e) {
                            expect(e).to.be.equal(WAMP_ERROR_MSG.NO_DEALER.description);
                        }
                    }
                );
            });

            it('disallows to unregister rpc if server does not provide DEALER role', function () {
                wampy.unregister('call.rpc3', function (e) { });
                expect(wampy.getOpStatus()).to.be.deep.equal(WAMP_ERROR_MSG.NO_DEALER);

                wampy.unregister('call.rpc3',
                    {
                        onSuccess: function (e) { },
                        onError: function (e) {
                            expect(e).to.be.equal(WAMP_ERROR_MSG.NO_DEALER.description);
                        }
                    }
                );
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

                        wampy.register('qq:www:ee',
                            {
                                rpc: function (e) {},
                                onSuccess: function (e) { },
                                onError: function (e) {
                                    expect(e).to.be.equal(WAMP_ERROR_MSG.URI_ERROR.description);
                                }
                            }
                        );

                        done();

                    }
                }).disconnect();
            });

            it('allows to register RPC', function (done) {
                wampy.register('register.rpc1', function (e) { });
                expect(wampy.getOpStatus().code).to.be.equal(WAMP_ERROR_MSG.SUCCESS.code);
                root.setTimeout(function () { done(); }, 10);
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

                wampy.call('qq:www:ee', 'payload', {
                    onSuccess: function (e) { },
                    onError: function (e) {
                        expect(e).to.be.equal(WAMP_ERROR_MSG.URI_ERROR.description);
                    }
                });
            });

            it('disallows to call RPC without specifying result handler', function () {
                wampy.call('qqq.www.eee', 'payload');
                expect(wampy.getOpStatus()).to.be.deep.equal(WAMP_ERROR_MSG.NO_CALLBACK_SPEC);

                wampy.call('qqq.www.eee', 'payload', {
                    onError: function (e) {
                        expect(e).to.be.equal(WAMP_ERROR_MSG.NO_CALLBACK_SPEC.description);
                    }
                });
            });

            it('checks for valid advanced options on calling RPC', function () {
                wampy.call(
                    'qqq.www.eee',
                    'payload',
                    {
                        onSuccess: function (e) { },
                        onError: function (e) { }
                    },
                    'string instead of object'
                );
                expect(wampy.getOpStatus()).to.be.deep.equal(WAMP_ERROR_MSG.INVALID_PARAM);

                wampy.call(
                    'qqq.www.eee',
                    'payload',
                    {
                        onSuccess: function (e) { },
                        onError: function (e) { }
                    },
                    123
                );
                expect(wampy.getOpStatus()).to.be.deep.equal(WAMP_ERROR_MSG.INVALID_PARAM);

                wampy.call(
                    'qqq.www.eee',
                    'payload',
                    {
                        onSuccess: function (e) { },
                        onError: function (e) { }
                    },
                    function () {}
                );
                expect(wampy.getOpStatus()).to.be.deep.equal(WAMP_ERROR_MSG.INVALID_PARAM);

                wampy.call(
                    'qqq.www.eee',
                    'payload',
                    {
                        onSuccess: function (e) { },
                        onError: function (e) { }
                    },
                    {
                        exclude: 'string instead of number or array',
                        eligible: 1234567
                    }
                );
                expect(wampy.getOpStatus()).to.be.deep.equal(WAMP_ERROR_MSG.INVALID_PARAM);

                wampy.call(
                    'qqq.www.eee',
                    'payload',
                    {
                        onSuccess: function (e) { },
                        onError: function (e) { }
                    },
                    {
                        exclude: {},
                        eligible: 1234567
                    }
                );
                expect(wampy.getOpStatus()).to.be.deep.equal(WAMP_ERROR_MSG.INVALID_PARAM);

                wampy.call(
                    'qqq.www.eee',
                    'payload',
                    {
                        onSuccess: function (e) { },
                        onError: function (e) { }
                    },
                    {
                        exclude: 1234567,
                        eligible: 'string instead of number or array'
                    }
                );
                expect(wampy.getOpStatus()).to.be.deep.equal(WAMP_ERROR_MSG.INVALID_PARAM);

                wampy.call(
                    'qqq.www.eee',
                    'payload',
                    {
                        onSuccess: function (e) { },
                        onError: function (e) { }
                    },
                    {
                        exclude: 1234567,
                        eligible: {}
                    }
                );
                expect(wampy.getOpStatus()).to.be.deep.equal(WAMP_ERROR_MSG.INVALID_PARAM);

                wampy.call(
                    'qqq.www.eee',
                    'payload',
                    {
                        onSuccess: function (e) { },
                        onError: function (e) {
                            expect(e).to.be.equal(WAMP_ERROR_MSG.INVALID_PARAM.description);
                        }
                    },
                    {
                        exclude: {},
                        eligible: {}
                    }
                );

                wampy.call(
                    'qqq.www.eee',
                    'payload',
                    {
                        onSuccess: function (e) { },
                        onError: function (e) {
                            expect(e).to.be.equal(WAMP_ERROR_MSG.INVALID_PARAM.description);
                        }
                    },
                    {
                        exclude: 'invalid string',
                        eligible: 'invalid string'
                    }
                );
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
                    'payload',
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

            it('allows to invoke asynchronous RPC without value', function (done) {
                wampy.register('register.rpc3', {
                    rpc: function (e) {
                        return new Promise(function (resolve, reject) {
                            setTimeout(function () {
                                resolve();
                            }, 10);
                        });
                    },
                    onSuccess: function (e) {
                        wampy.call(
                            'register.rpc3',
                            null,
                            function (e) {
                                expect(e).to.be.null;
                                done();
                            },
                            { exclude_me: false }
                        );
                    },
                    onError: function (e) {
                        done('Error during RPC registration!');
                    }
                });
                expect(wampy.getOpStatus().code).to.be.equal(WAMP_ERROR_MSG.SUCCESS.code);
            });

            it('allows to invoke asynchronous RPC with single value', function (done) {
                wampy.register('register.rpc4', {
                    rpc: function (e) {
                        return new Promise(function (resolve, reject) {
                            setTimeout(function () {
                                resolve(100);
                            }, 10);
                        });
                    },
                    onSuccess: function (e) {
                        wampy.call(
                            'register.rpc4',
                            100,
                            function (e) {
                                expect(e).to.be.an('array');
                                expect(e[0]).to.be.equal(100);
                                done();
                            },
                            { exclude_me: false }
                        );
                    },
                    onError: function (e) {
                        done('Error during RPC registration!');
                    }
                });
                expect(wampy.getOpStatus().code).to.be.equal(WAMP_ERROR_MSG.SUCCESS.code);
            });

            it('allows to invoke asynchronous RPC with array value', function (done) {
                wampy.register('register.rpc5', {
                    rpc: function (e) {
                        return new Promise(function (resolve, reject) {
                            setTimeout(function () {
                                resolve([1, 2, 3, 4, 5]);
                            }, 10);
                        });
                    },
                    onSuccess: function (e) {
                        wampy.call(
                            'register.rpc5',
                            [1, 2, 3, 4, 5],
                            function (e) {
                                expect(e).to.be.an('array');
                                expect(e).to.have.length(5);
                                expect(e[0]).to.be.equal(1);
                                expect(e[4]).to.be.equal(5);
                                done();
                            },
                            { exclude_me: false }
                        );
                    },
                    onError: function (e) {
                        done('Error during RPC registration!');
                    }
                });
                expect(wampy.getOpStatus().code).to.be.equal(WAMP_ERROR_MSG.SUCCESS.code);
            });

            it('allows to invoke asynchronous RPC with hash-table value', function (done) {
                var payload = { key1: 100, key2: 'string-key' };
                wampy.register('register.rpc6', {
                    rpc: function (e) {
                        return new Promise(function (resolve, reject) {
                            setTimeout(function () {
                                resolve(payload);
                            }, 10);
                        });
                    },
                    onSuccess: function (e) {
                        wampy.call(
                            'register.rpc6',
                            payload,
                            function (e) {
                                expect(e).to.be.an('object');
                                expect(e).to.be.deep.equal(payload);
                                done();
                            },
                            { exclude_me: false }
                        );
                    },
                    onError: function (e) {
                        done('Error during RPC registration!');
                    }
                });
                expect(wampy.getOpStatus().code).to.be.equal(WAMP_ERROR_MSG.SUCCESS.code);
            });

            it('allows to reject asynchronous RPC', function (done) {
                wampy.register('register.rpc7', {
                    rpc: function (e) {
                        return new Promise(function (resolve, reject) {
                            setTimeout(function () {
                                reject('Rejecting promise rpc');
                            }, 10);
                        });
                    },
                    onSuccess: function (e) {
                        wampy.call(
                            'register.rpc7',
                            100,
                            {
                                onSuccess: function () { },
                                onError: function () {
                                    done();
                                }
                            },
                            { exclude_me: false }
                        );
                    },
                    onError: function (e) {
                        done('Error during RPC registration!');
                    }
                });
                expect(wampy.getOpStatus().code).to.be.equal(WAMP_ERROR_MSG.SUCCESS.code);
            });

            it('calls error handler on trying to unregister non existent RPC', function () {
                wampy.unregister(
                    'register.nonexistent',
                    {
                        onSuccess: function (e) { },
                        onError: function (e) {
                            expect(e).to.be.equal(WAMP_ERROR_MSG.NON_EXIST_RPC_UNREG.description);
                        }
                    }
                );
            });

            it('disallows to unregister RPC with invalid URI', function () {
                wampy.unregister(
                    'q:w:e',
                    {
                        onSuccess: function (e) { },
                        onError: function (e) {
                            expect(e).to.be.equal(WAMP_ERROR_MSG.URI_ERROR.description);
                        }
                    }
                );
            });

            it('disallows to register RPC without providing rpc itself', function () {
                wampy.register(
                    'register.rpc8',
                    {
                        onSuccess: function (e) { },
                        onError: function (e) {
                            expect(e).to.be.equal(WAMP_ERROR_MSG.NO_CALLBACK_SPEC.description);
                        }
                    }
                );
            });

            it('disallows to register RPC with the same name', function (done) {
                wampy.register('register.rpc9', {
                    rpc: function (e) { },
                    onSuccess: function (e) {
                        wampy.register('register.rpc9', {
                            rpc: function (e) { },
                            onSuccess: function (e) { },
                            onError: function (e) {
                                expect(e).to.be.equal(WAMP_ERROR_MSG.RPC_ALREADY_REGISTERED.description);
                                done();
                            }
                        });
                    },
                    onError: function (e) {
                        done('Error during RPC registration!');
                    }
                });
                expect(wampy.getOpStatus().code).to.be.equal(WAMP_ERROR_MSG.SUCCESS.code);
            });

            it('disallows to cancel non existent rpc invocation', function () {
                wampy.cancel(1234567, function (e) { });
                expect(wampy.getOpStatus()).to.be.deep.equal(WAMP_ERROR_MSG.NON_EXIST_RPC_REQ_ID);

                wampy.cancel(1234567,
                    {
                        onSuccess: function (e) { },
                        onError: function (e) {
                            expect(e).to.be.equal(WAMP_ERROR_MSG.NON_EXIST_RPC_REQ_ID.description);
                        }
                    }
                );
            });

            it('fires error callback if error occurred during registering', function (done) {
                wampy.register('call.rpc10', {
                    rpc: function () { },
                    onSuccess: function () { },
                    onError: function (e) { done(); }
                });
            });

            it('fires error callback if error occurred during unregistering', function (done) {
                wampy.unregister('register.rpc9', {
                    onSuccess: function () { },
                    onError: function (e) { done(); }
                });

            });

            it('fires error handler if error occurred during RPC call', function (done) {
                var i = 0;
                wampy.call('call.rpc1', null, {
                    onSuccess: function (e) {
                        done('Reached success. Check Server side');
                    },
                    onError: function (e) {
                        expect(e).to.be.null;

                        i++;
                        if (i === 3) {
                            done();
                        }
                    }
                });

                wampy.call(
                    'call.rpc1',
                    [1, 2, 3, 4, 5],
                    {
                        onSuccess: function (e) {
                            done('Reached success. Check Server side');
                        },
                        onError: function (e) {
                            expect(e).to.be.an('array');
                            expect(e).to.have.length(5);
                            expect(e[0]).to.be.equal(1);
                            expect(e[4]).to.be.equal(5);

                            i++;
                            if (i === 3) {
                                done();
                            }
                        }
                    }
                );

                wampy.call(
                    'call.rpc1',
                    { k1: 1, k2: 2 },
                    {
                        onSuccess: function (e) {
                            done('Reached success. Check Server side');
                        },
                        onError: function (e) {
                            expect(e).to.be.an('object');
                            expect(e).to.be.deep.equal({ k1: 1, k2: 2 });

                            i++;
                            if (i === 3) {
                                done();
                            }
                        }
                    }
                );
            });

        });

    });

});
