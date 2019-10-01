/**
 * Project: wampy.js
 * User: KSDaemon
 * Date: 07.04.15
 */

const isNode = typeof process === 'object' &&
    Object.prototype.toString.call(process) === '[object process]',
    routerUrl = 'ws://fake.server.org/ws/',
    anotherRouterUrl = 'ws://another.server.org/ws/';

import { expect } from 'chai';
import * as WebSocketModule from './fake-ws';
import { Wampy } from './../src/wampy';
import { JsonSerializer } from '../src/serializers/JsonSerializer';
import { WAMP_ERROR_MSG } from './../src/constants';

describe('Wampy.js [with JSON serializer]', function () {
    this.timeout(10000);

    before(function () {
        WebSocketModule.startTimers();
    });

    after(function () {
        WebSocketModule.clearTimers();
        WebSocketModule.resetCursor();
    });

    describe('Constructor', function () {

        it('allows to connect on instantiation if all required options specified', function (done) {
            let wampy = new Wampy(routerUrl, {
                realm: 'AppRealm',
                onConnect: function () {
                    done();
                },
                ws: WebSocketModule.WebSocket,
                serializer: new JsonSerializer()
            });
            expect(wampy).to.be.an('object');
        });

        it('passes welcome details to onConnect() callback', function (done) {
            let wampy = new Wampy(routerUrl, {
                realm: 'AppRealm',
                onConnect: function (welcomeDetails) {
                    expect(welcomeDetails).to.be.an('object');
                    done();
                },
                ws: WebSocketModule.WebSocket,
                serializer: new JsonSerializer()
            });
            expect(wampy).to.be.an('object');
        });

        it('passes welcome details to onReconnectSuccess() callback', function (done) {
            let wampy = new Wampy(routerUrl, {
                autoReconnect: true,
                reconnectInterval : 500,
                realm: 'AppRealm',
                onReconnectSuccess: function (welcomeDetails) {
                    expect(welcomeDetails).to.be.an('object');
                    done();
                },
                ws: WebSocketModule.WebSocket,
                serializer: new JsonSerializer()
            });
            expect(wampy).to.be.an('object');
        });

        it('allows to set different options on instantiation', function (done) {
            let helloCustomDetails = {
                    customFiled1: 25,
                    customFiled2: 'string',
                    customFiled3: [1, 2, 3, 4, 5]
                },
                setoptions = {
                    autoReconnect: true,
                    reconnectInterval: 10000,
                    maxRetries: 50,
                    realm: 'AppRealm',
                    uriValidation: 'loose',
                    helloCustomDetails: helloCustomDetails,
                    onChallenge: function () {
                        done('Reached onChallenge');
                    },
                    authid: 'userid',
                    authmethods: ['wampcra'],
                    onConnect: function () {
                        done();
                    },
                    onClose: function () {
                        done('Reached onClose');
                    },
                    onError: function () {
                        done('Reached onError');
                    },
                    onReconnect: function () {
                        done('Reached onReconnect');
                    },
                    onReconnectSuccess: function () {
                        done('Reached onReconnectSuccess');
                    },
                    ws: WebSocketModule.WebSocket
                },
                wampy = new Wampy(setoptions),
                options = wampy.options();

            expect(options.autoReconnect).to.be.true;
            expect(options.reconnectInterval).to.be.equal(10000);
            expect(options.maxRetries).to.be.equal(50);
            expect(options.realm).to.be.equal('AppRealm');
            expect(options.uriValidation).to.be.equal('loose');
            expect(options.helloCustomDetails).to.be.deep.equal(helloCustomDetails);
            expect(options.onChallenge).to.be.a('function');
            expect(options.authid).to.be.equal('userid');
            expect(options.authmethods).to.be.an('array');
            expect(options.authmethods[0]).to.be.equal('wampcra');
            expect(options.onConnect).to.be.a('function');
            expect(options.onClose).to.be.a('function');
            expect(options.onError).to.be.a('function');
            expect(options.onReconnect).to.be.a('function');
            expect(options.onReconnectSuccess).to.be.a('function');

            wampy = new Wampy(routerUrl, setoptions);
            options = wampy.options();

            expect(options.autoReconnect).to.be.true;
            expect(options.reconnectInterval).to.be.equal(10000);
            expect(options.maxRetries).to.be.equal(50);
            expect(options.realm).to.be.equal('AppRealm');
            expect(options.uriValidation).to.be.equal('loose');
            expect(options.helloCustomDetails).to.be.deep.equal(helloCustomDetails);
            expect(options.onChallenge).to.be.a('function');
            expect(options.authid).to.be.equal('userid');
            expect(options.authmethods).to.be.an('array');
            expect(options.authmethods[0]).to.be.equal('wampcra');
            expect(options.onConnect).to.be.a('function');
            expect(options.onClose).to.be.a('function');
            expect(options.onError).to.be.a('function');
            expect(options.onReconnect).to.be.a('function');
            expect(options.onReconnectSuccess).to.be.a('function');
        });

        it('allows to use Challenge Response Authentication while connecting to server', function (done) {
            let wampy = new Wampy(routerUrl, {
                realm: 'AppRealm',
                onChallenge: function (method, info) {
                    return 'secretKey';
                },
                authid: 'user1',
                authmethods: ['wampcra'],
                onConnect: function () {
                    done();
                },
                onClose: function () {
                    done('Reached onClose');
                },
                onError: function () {
                    done('Reached onError');
                },
                onReconnect: function () {
                    done('Reached onReconnect');
                },
                onReconnectSuccess: function () {
                    done('Reached onReconnectSuccess');
                },
                ws: WebSocketModule.WebSocket
            });
            expect(wampy).to.be.an('object');
        });

        it('drops connection on receiving WELCOME message after session was established', function (done) {
            let wampy = new Wampy(routerUrl, {
                realm: 'AppRealm',
                autoReconnect: false,
                onClose: done,
                onError: function (e) {
                    expect(e).to.be.an('object');
                    expect(e.error).to.be.equal('wamp.error.protocol_violation');
                    expect(e.details).to.be.equal('Received WELCOME message after session was established');
                },
                ws: WebSocketModule.WebSocket
            });
        });

        it('drops connection on receiving CHALLENGE message after session was established', function (done) {
            let wampy = new Wampy(routerUrl, {
                realm: 'AppRealm',
                autoReconnect: false,
                onClose: done,
                onError: function (e) {
                    expect(e).to.be.an('object');
                    expect(e.error).to.be.equal('wamp.error.protocol_violation');
                    expect(e.details).to.be.equal('Received CHALLENGE message after session was established');
                },
                ws: WebSocketModule.WebSocket
            });
        });

        it('drops connection on receiving GOODBYE message before session was established', function (done) {
            let wampy = new Wampy(routerUrl, {
                realm: 'AppRealm',
                autoReconnect: false,
                onClose: done,
                onError: function (e) {
                    expect(e).to.be.an('object');
                    expect(e.error).to.be.equal('wamp.error.protocol_violation');
                    expect(e.details).to.be.equal('Received GOODBYE message before session was established');
                },
                ws: WebSocketModule.WebSocket
            });
        });

        it('drops connection on receiving ERROR message before session was established', function (done) {
            let wampy = new Wampy(routerUrl, {
                realm: 'AppRealm',
                autoReconnect: false,
                onClose: done,
                onError: function (e) {
                    expect(e).to.be.an('object');
                    expect(e.error).to.be.equal('wamp.error.protocol_violation');
                    expect(e.details).to.be.equal('Received ERROR message before session was established');
                },
                ws: WebSocketModule.WebSocket
            });
        });

        it('drops connection on receiving invalid ERROR message after session was established', function (done) {
            let wampy = new Wampy(routerUrl, {
                realm: 'AppRealm',
                autoReconnect: false,
                onClose: done,
                onError: function (e) {
                    expect(e).to.be.an('object');
                    expect(e.error).to.be.equal('wamp.error.protocol_violation');
                    expect(e.details).to.be.equal('Received invalid ERROR message');
                },
                ws: WebSocketModule.WebSocket
            });
        });

        it('drops connection on receiving SUBSCRIBED message before session was established', function (done) {
            let wampy = new Wampy(routerUrl, {
                realm: 'AppRealm',
                autoReconnect: false,
                onClose: done,
                onError: function (e) {
                    expect(e).to.be.an('object');
                    expect(e.error).to.be.equal('wamp.error.protocol_violation');
                    expect(e.details).to.be.equal('Received SUBSCRIBED message before session was established');
                },
                ws: WebSocketModule.WebSocket
            });
        });

        it('drops connection on receiving UNSUBSCRIBED message before session was established', function (done) {
            let wampy = new Wampy(routerUrl, {
                realm: 'AppRealm',
                autoReconnect: false,
                onClose: done,
                onError: function (e) {
                    expect(e).to.be.an('object');
                    expect(e.error).to.be.equal('wamp.error.protocol_violation');
                    expect(e.details).to.be.equal('Received UNSUBSCRIBED message before session was established');
                },
                ws: WebSocketModule.WebSocket
            });
        });

        it('drops connection on receiving PUBLISHED message before session was established', function (done) {
            let wampy = new Wampy(routerUrl, {
                realm: 'AppRealm',
                autoReconnect: false,
                onClose: done,
                onError: function (e) {
                    expect(e).to.be.an('object');
                    expect(e.error).to.be.equal('wamp.error.protocol_violation');
                    expect(e.details).to.be.equal('Received PUBLISHED message before session was established');
                },
                ws: WebSocketModule.WebSocket
            });
        });

        it('drops connection on receiving EVENT message before session was established', function (done) {
            let wampy = new Wampy(routerUrl, {
                realm: 'AppRealm',
                autoReconnect: false,
                onClose: done,
                onError: function (e) {
                    expect(e).to.be.an('object');
                    expect(e.error).to.be.equal('wamp.error.protocol_violation');
                    expect(e.details).to.be.equal('Received EVENT message before session was established');
                },
                ws: WebSocketModule.WebSocket
            });
        });

        it('drops connection on receiving RESULT message before session was established', function (done) {
            let wampy = new Wampy(routerUrl, {
                realm: 'AppRealm',
                autoReconnect: false,
                onClose: done,
                onError: function (e) {
                    expect(e).to.be.an('object');
                    expect(e.error).to.be.equal('wamp.error.protocol_violation');
                    expect(e.details).to.be.equal('Received RESULT message before session was established');
                },
                ws: WebSocketModule.WebSocket
            });
        });

        it('drops connection on receiving REGISTERED message before session was established', function (done) {
            let wampy = new Wampy(routerUrl, {
                realm: 'AppRealm',
                autoReconnect: false,
                onClose: done,
                onError: function (e) {
                    expect(e).to.be.an('object');
                    expect(e.error).to.be.equal('wamp.error.protocol_violation');
                    expect(e.details).to.be.equal('Received REGISTERED message before session was established');
                },
                ws: WebSocketModule.WebSocket
            });
        });

        it('drops connection on receiving UNREGISTERED message before session was established', function (done) {
            let wampy = new Wampy(routerUrl, {
                realm: 'AppRealm',
                autoReconnect: false,
                onClose: done,
                onError: function (e) {
                    expect(e).to.be.an('object');
                    expect(e.error).to.be.equal('wamp.error.protocol_violation');
                    expect(e.details).to.be.equal('Received UNREGISTERED message before session was established');
                },
                ws: WebSocketModule.WebSocket
            });
        });

        it('drops connection on receiving INVOCATION message before session was established', function (done) {
            let wampy = new Wampy(routerUrl, {
                realm: 'AppRealm',
                autoReconnect: false,
                onClose: done,
                onError: function (e) {
                    expect(e).to.be.an('object');
                    expect(e.error).to.be.equal('wamp.error.protocol_violation');
                    expect(e.details).to.be.equal('Received INVOCATION message before session was established');
                },
                ws: WebSocketModule.WebSocket
            });
        });

        it('drops connection on receiving non-compliant WAMP message', function (done) {
            let wampy = new Wampy(routerUrl, {
                realm: 'AppRealm',
                autoReconnect: false,
                onClose: done,
                onError: function (e) {
                    expect(e).to.be.an('object');
                    expect(e.error).to.be.equal('wamp.error.protocol_violation');
                    expect(e.details).to.be.equal('Received non-compliant WAMP message');
                },
                ws: WebSocketModule.WebSocket
            });
        });

    });

    describe('Instance', function () {
        let wampy;

        before(function (done) {
            wampy = new Wampy(routerUrl, {
                debug: false,
                autoReconnect: true,
                reconnectInterval: 2000,
                maxRetries: 7,
                realm: 'AppRealm',
                onConnect: function () {
                    done();
                },
                onClose: function () {
                    done('Reached close');
                },
                onError: function () {
                    done('Reached error');
                },
                onReconnect: function () {
                    done('Reached reconnection');
                },
                onReconnectSuccess: function () {
                    done('Reached reconnection success');
                },
                ws: WebSocketModule.WebSocket
            });
        });

        it('disallows to connect to a router if no url was specified during instantiation', function () {

            if (!isNode) {
                return;
            }

            let wampy = new Wampy({ realm: 'AppRealm' }),
                opStatus = wampy.connect().getOpStatus();

            expect(opStatus).to.be.deep.equal(WAMP_ERROR_MSG.NO_WS_OR_URL);
        });

        it('allows to get and set different options', function () {
            let helloCustomDetails = {
                    customFiled1: 25,
                    customFiled2: 'string',
                    customFiled3: [1, 2, 3, 4, 5]
                },
                options = wampy.options({
                    autoReconnect     : true,
                    reconnectInterval : 1000,
                    maxRetries        : 5,
                    uriValidation     : 'loose',
                    helloCustomDetails: helloCustomDetails,
                    onChallenge       : function () {
                    },
                    authid            : 'userid',
                    authmethods       : ['wampcra'],
                }).options();

            expect(options.autoReconnect).to.be.true;
            expect(options.reconnectInterval).to.be.equal(1000);
            expect(options.maxRetries).to.be.equal(5);
            expect(options.uriValidation).to.be.equal('loose');
            expect(options.helloCustomDetails).to.be.deep.equal(helloCustomDetails);
            expect(options.onChallenge).to.be.a('function');
            expect(options.authid).to.be.equal('userid');
            expect(options.authmethods).to.be.an('array');
            expect(options.authmethods[0]).to.be.equal('wampcra');
            expect(options.onConnect).to.be.a('function');
            expect(options.onClose).to.be.a('function');
            expect(options.onError).to.be.a('function');
            expect(options.onReconnect).to.be.a('function');
            expect(options.onReconnectSuccess).to.be.a('function');
        });

        it('allows to get current WAMP Session ID', function () {
            let s = wampy.getSessionId();
            expect(s).to.be.a('number');
            expect(s).to.be.above(0);
        });

        it('allows to disconnect from connected server', function (done) {
            wampy.options({ onConnect: null, onClose: done })
                .disconnect();
        });

        it('disallows to connect on instantiation without specifying all of [onChallenge, authid, authmethods]', function () {
            let opStatus;

            wampy.options({ authid: 'userid', authmethods: ['wampcra'], onChallenge: null }).connect();
            opStatus = wampy.getOpStatus();
            expect(opStatus).to.be.deep.equal(WAMP_ERROR_MSG.NO_CRA_CB_OR_ID);

            wampy.options({ authid: null, authmethods: ['wampcra'], onChallenge: null }).connect();
            opStatus = wampy.getOpStatus();
            expect(opStatus).to.be.deep.equal(WAMP_ERROR_MSG.NO_CRA_CB_OR_ID);

            wampy.options({
                authid: null, onChallenge: function () {
                }
            }).connect();
            opStatus = wampy.getOpStatus();
            expect(opStatus).to.be.deep.equal(WAMP_ERROR_MSG.NO_CRA_CB_OR_ID);

            wampy.options({
                authid: null, authmethods: [], onChallenge: function () {
                }
            }).connect();
            opStatus = wampy.getOpStatus();
            expect(opStatus).to.be.deep.equal(WAMP_ERROR_MSG.NO_CRA_CB_OR_ID);

            wampy.options({
                authid: 'userid', authmethods: 'string', onChallenge: function () {
                }
            }).connect();
            opStatus = wampy.getOpStatus();
            expect(opStatus).to.be.deep.equal(WAMP_ERROR_MSG.NO_CRA_CB_OR_ID);

            wampy.options({ authid: null, onChallenge: null });
        });

        it('calls onError handler if authentication using CRA fails', function (done) {
            wampy.options({
                authid: 'user1',
                authmethods: ['wampcra'],
                onChallenge: function (method, info) {
                    throw new Error('Error occured in authentication');
                },
                onError: function (e) {
                    done();
                },
                onConnect: null,
                onClose: null
            })
                .connect();
        });

        it('calls onError handler if server requests authentication, but no credentials were provided', function (done) {
            wampy.options({
                onError: function (e) {
                    done();
                },
                onConnect: null,
                onClose: null,
                authid: null,
                authmethods: null,
                onChallenge: null
            })
                .connect();
        });

        it('automatically sends goodbye message on server initiated disconnect', function (done) {
            wampy.options({ onConnect: null, onClose: done })
                .connect();
        });

        it('allows to disconnect while connecting to server', function (done) {
            wampy.options({
                onConnect: function () {
                    done('Reached onConnect');
                },
                onClose: done
            }).connect();

            setTimeout(function () {
                wampy.disconnect();
            }, 10);
        });

        it('allows to connect to same WAMP server', function (done) {
            wampy.options({ onConnect: function () { done(); } })
                .connect();
        });

        it('allows to connect to different WAMP server', function (done) {
            wampy.options({
                onClose: function () {
                    setTimeout(function () {
                        wampy.connect(anotherRouterUrl);
                    }, 1);
                },
                onConnect: function () {
                    done();
                }
            }).disconnect();
        });

        it('allows to abort WebSocketModule.WebSocket/WAMP session establishment', function (done) {
            wampy.options({
                onClose: function () {
                    setTimeout(function () {
                        wampy.options({ onClose: done })
                            .connect(anotherRouterUrl);

                        setTimeout(function () {
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
                            onSuccess: function () {
                            },
                            onError: function () {
                                done('Error during subscribing');
                            },
                            onEvent: function (e) {
                            }
                        })
                        .subscribe('subscribe.reconnect2', {
                            onSuccess: function () {
                            },
                            onError: function () {
                                done('Error during subscribing');
                            },
                            onEvent: function (e) {
                            }
                        })
                        .register('register.reconnect1', {
                            rpc: function (e) {
                            },
                            onSuccess: function () {
                            },
                            onError: function () {
                                done('Error during RPC registration');
                            }
                        })
                        .register('register.reconnect2', {
                            rpc: function (e) {
                            },
                            onSuccess: function () {
                            },
                            onError: function () {
                                done('Error during RPC registration');
                            }
                        })
                        .register('register.reconnect3', {
                            rpc: function (e) {
                            },
                            onSuccess: function () {
                            },
                            onError: function () {
                                done('Error during RPC registration');
                            }
                        });

                },
                onClose: function () {
                },
                onError: function () {
                },
                onReconnect: function () {
                    let t = setInterval(function () {
                        if (wampy._subsTopics.size === 2 && wampy._rpcNames.size === 3) {
                            clearInterval(t);
                            t = null;
                            wampy.options({ onReconnect: null })
                                .subscribe('subscribe.reconnection.check', {
                                    onSuccess: done,
                                    onError: function () {
                                        done('Error during subscribing');
                                    },
                                    onEvent: function (e) {
                                    }
                                });
                        }
                    }, 1);
                },
                onReconnectSuccess: function () {
                }
            }).connect();
        });

        it('allows to call handler when autoreconnect to WAMP server succeeded', function (done) {
            wampy.options({
                autoReconnect: true,
                onClose: function () {
                    setTimeout(function () {
                        wampy.connect();
                    }, 1);
                },
                onConnect: null,
                onReconnect: null,
                onReconnectSuccess: function () {
                    done();
                },
                onError: null
            }).disconnect();
        });

        it('allows to call handler on websocket errors', function (done) {
            wampy.options({
                autoReconnect: false,
                onClose: function () {
                    setTimeout(function () {
                        wampy.connect();
                    }, 1);
                },
                onConnect: function () {
                    done('We reach connection');
                },
                onReconnect: null,
                onError: function () {
                    done();
                }
            }).disconnect();
        });

        it('calls error handler if server sends abort message', function (done) {
            wampy.options({
                onClose: null,
                onError: function (e) {
                    done();
                }
            }).connect();
        });

        describe('PubSub module', function () {

            before(function (done) {
                wampy.options({
                    uriValidation: 'strict',
                    onConnect    : function () {
                        done();
                    },
                    onClose      : null,
                    onReconnect  : null,
                    onError      : null
                })
                    .connect();
            });

            it('disallows to subscribe to topic if server does not provide BROKER role', function () {
                wampy.subscribe('qwe.asd.zxc', function (e) {
                });
                expect(wampy.getOpStatus()).to.be.deep.equal(WAMP_ERROR_MSG.NO_BROKER);

                wampy.subscribe('qwe.asd.zxc',
                    {
                        onSuccess: function (e) {
                        },
                        onError: function (e) {
                            expect(e.error).to.be.equal(WAMP_ERROR_MSG.NO_BROKER.description);
                        }
                    }
                );
            });

            it('disallows to unsubscribe from topic if server does not provide BROKER role', function () {
                wampy.unsubscribe('qwe.asd.zxc');
                expect(wampy.getOpStatus()).to.be.deep.equal(WAMP_ERROR_MSG.NO_BROKER);

                wampy.unsubscribe('qwe.asd.zxc',
                    {
                        onSuccess: function (e) {
                        },
                        onError: function (e) {
                            expect(e.error).to.be.equal(WAMP_ERROR_MSG.NO_BROKER.description);
                        }
                    }
                );
            });

            it('disallows to publish to topic if server does not provide BROKER role', function () {
                wampy.publish('qwe.asd.zxc', 'payload');
                expect(wampy.getOpStatus()).to.be.deep.equal(WAMP_ERROR_MSG.NO_BROKER);

                wampy.publish('qwe.asd.zxc', 'payload',
                    {
                        onSuccess: function (e) {
                        },
                        onError: function (e) {
                            expect(e.error).to.be.equal(WAMP_ERROR_MSG.NO_BROKER.description);
                        }
                    }
                );
            });

            it('disallows to subscribe to topic with invalid URI', function (done) {
                wampy.options({
                    onClose: function () {
                        setTimeout(function () {
                            wampy.options({
                                onConnect: function () {

                                    wampy.subscribe('qwe.asd.zxc.', function (e) {
                                    });
                                    expect(wampy.getOpStatus()).to.be.deep.equal(WAMP_ERROR_MSG.URI_ERROR);

                                    wampy.subscribe('qwe.asd..zxc', function (e) {
                                    });
                                    expect(wampy.getOpStatus()).to.be.deep.equal(WAMP_ERROR_MSG.URI_ERROR);

                                    wampy.subscribe('qq,ww,ee', function (e) {
                                    });
                                    expect(wampy.getOpStatus()).to.be.deep.equal(WAMP_ERROR_MSG.URI_ERROR);

                                    wampy.subscribe('qq:www:ee', function (e) {
                                    });
                                    expect(wampy.getOpStatus()).to.be.deep.equal(WAMP_ERROR_MSG.URI_ERROR);

                                    wampy.subscribe('qwe.asd.zxc.',
                                        {
                                            onSuccess: function (e) {
                                            },
                                            onError: function (e) {
                                                expect(e.error).to.be.equal(WAMP_ERROR_MSG.URI_ERROR.description);
                                            }
                                        }
                                    );

                                    done();
                                }
                            }).connect();
                        }, 1);
                    }
                }).disconnect();
            });

            it('disallows to subscribe to topic without specifying callback', function () {
                wampy.subscribe('qqq.www.eee');
                expect(wampy.getOpStatus()).to.be.deep.equal(WAMP_ERROR_MSG.NO_CALLBACK_SPEC);

                wampy.subscribe('qqq.www.eee', {});
                expect(wampy.getOpStatus()).to.be.deep.equal(WAMP_ERROR_MSG.NO_CALLBACK_SPEC);

                wampy.subscribe('qqq.www.eee', {
                    onError: function (e) {
                        expect(e.error).to.be.equal(WAMP_ERROR_MSG.NO_CALLBACK_SPEC.description);
                    }
                });
            });

            it('allows to subscribe to topic with notification on subscribing', function (done) {
                wampy.subscribe('subscribe.topic2', {
                    onSuccess: done,
                    onError: function () {
                        done('Error during subscribing');
                    },
                    onEvent: function (e) {
                    }
                });
                expect(wampy.getOpStatus().code).to.be.equal(WAMP_ERROR_MSG.SUCCESS.code);
            });

            it('allows to setup multiple handlers to same topic', function () {
                wampy.subscribe('subscribe.topic2', function (e) {
                });
                expect(wampy.getOpStatus().code).to.be.equal(WAMP_ERROR_MSG.SUCCESS.code);
                wampy.subscribe('subscribe.topic2', function (e) {
                });
                expect(wampy.getOpStatus().code).to.be.equal(WAMP_ERROR_MSG.SUCCESS.code);
                wampy.subscribe('subscribe.topic2', {
                    onEvent: function (e) {
                    },
                    onSuccess: function (e) {
                    }
                });
                expect(wampy.getOpStatus().code).to.be.equal(WAMP_ERROR_MSG.SUCCESS.code);
            });

            it('allows to subscribe to prefix-based topic', function (done) {
                let i = 1;
                wampy.subscribe('subscribe.prefix', function (e) {
                    expect(e).to.be.an('object');

                    if (i === 2) {
                        expect(e.details).to.have.property('topic', 'subscribe.prefix.two.three');
                        done();
                    } else {
                        expect(e.details).to.have.property('topic', 'subscribe.prefix.one');
                        i++;
                    }
                }, { match: 'prefix' })
                    .publish('subscribe.prefix.one', null, { exclude_me: false })
                    .publish('subscribe.prefix.two.three', null, { exclude_me: false });
                expect(wampy.getOpStatus().code).to.be.equal(WAMP_ERROR_MSG.SUCCESS.code);
            });

            it('allows to subscribe to wildcard-based topic', function (done) {
                let i = 1;
                wampy.subscribe('subscribe..wildcard', function (e) {
                    expect(e).to.be.an('object');

                    if (i === 2) {
                        expect(e.details).to.have.property('topic', 'subscribe.two.wildcard');
                        done();
                    } else {
                        expect(e.details).to.have.property('topic', 'subscribe.one.wildcard');
                        i++;
                    }
                }, { match: 'wildcard' })
                    .publish('subscribe.one.wildcard', null, { exclude_me: false })
                    .publish('subscribe.two.wildcard', null, { exclude_me: false });
                expect(wampy.getOpStatus().code).to.be.equal(WAMP_ERROR_MSG.SUCCESS.code);
            });

            it('allows to publish event without payload', function (done) {
                let i = 1;
                wampy.subscribe('subscribe.topic3', function (e) {
                    expect(e).to.be.an('object');
                    expect(e.argsList).to.be.undefined;
                    expect(e.argsDict).to.be.undefined;

                    if (i === 2) {
                        done();
                    } else {
                        i++;
                    }
                })
                    .publish('subscribe.topic3')
                    .publish('subscribe.topic3', null, { exclude_me: false, disclose_me: true });
                expect(wampy.getOpStatus().code).to.be.equal(WAMP_ERROR_MSG.SUCCESS.code);
            });

            it('allows to publish event with int payload', function (done) {
                let i = 1;
                wampy.subscribe('subscribe.topic4', function (e) {
                    expect(e).to.be.an('object');
                    expect(e.argsList).to.be.an('array');
                    expect(e.argsDict).to.be.undefined;
                    expect(e.argsList[0]).to.be.equal(25);

                    if (i === 2) {
                        done();
                    } else {
                        i++;
                    }
                })
                    .publish('subscribe.topic4', 25)
                    .publish('subscribe.topic4', 25, null, { exclude_me: false, disclose_me: true });
                expect(wampy.getOpStatus().code).to.be.equal(WAMP_ERROR_MSG.SUCCESS.code);
            });

            it('allows to publish event with string payload', function (done) {
                let i = 1;
                wampy.subscribe('subscribe.topic5', function (e) {
                    expect(e).to.be.an('object');
                    expect(e.argsList).to.be.an('array');
                    expect(e.argsDict).to.be.undefined;
                    expect(e.argsList[0]).to.be.equal('payload');

                    if (i === 2) {
                        done();
                    } else {
                        i++;
                    }
                })
                    .publish('subscribe.topic5', 'payload')
                    .publish('subscribe.topic5', 'payload', null, { exclude_me: false, disclose_me: true });
                expect(wampy.getOpStatus().code).to.be.equal(WAMP_ERROR_MSG.SUCCESS.code);
            });

            it('allows to publish event with array payload', function (done) {
                let i = 1;
                wampy.subscribe('subscribe.topic6', function (e) {
                    expect(e).to.be.an('object');
                    expect(e.argsList).to.be.an('array');
                    expect(e.argsDict).to.be.undefined;
                    expect(e.argsList[0]).to.be.equal(1);
                    expect(e.argsList[4]).to.be.equal(5);

                    if (i === 2) {
                        done();
                    } else {
                        i++;
                    }
                })
                    .publish('subscribe.topic6', [1, 2, 3, 4, 5])
                    .publish('subscribe.topic6', [1, 2, 3, 4, 5], null, { exclude_me: false, disclose_me: true });
                expect(wampy.getOpStatus().code).to.be.equal(WAMP_ERROR_MSG.SUCCESS.code);
            });

            it('allows to publish event with hash-table payload', function (done) {
                let i = 1, payload = { key1: 100, key2: 'string-key' };

                wampy.subscribe('subscribe.topic7', function (e) {
                    expect(e).to.be.an('object');
                    expect(e.argsList).to.be.an('array');
                    expect(e.argsList).to.have.lengthOf(0);
                    expect(e.argsDict).to.be.an('object');
                    expect(e.argsDict).to.be.deep.equal(payload);

                    if (i === 3) {
                        done();
                    } else {
                        i++;
                    }
                })
                    .publish('subscribe.topic7', payload)
                    .publish('subscribe.topic7', payload, null, { exclude_me: false, disclose_me: true })
                    .publish('subscribe.topic7', { argsDict: payload }, null, { exclude_me: false, disclose_me: true });
                expect(wampy.getOpStatus().code).to.be.equal(WAMP_ERROR_MSG.SUCCESS.code);
            });

            it('allows to publish event with both array and hash-table payload', function (done) {
                let i = 1, dictpayload = { key1: 100, key2: 'string-key' },
                    payload = { argsList: [1, 2, 3, 4, 5], argsDict: dictpayload };

                wampy.subscribe('subscribe.topic77', function (e) {
                    expect(e).to.be.an('object');
                    expect(e.argsList).to.be.an('array');
                    expect(e.argsList[0]).to.be.equal(1);
                    expect(e.argsList[4]).to.be.equal(5);
                    expect(e.argsDict).to.be.an('object');
                    expect(e.argsDict).to.be.deep.equal(dictpayload);

                    if (i === 2) {
                        done();
                    } else {
                        i++;
                    }
                })
                    .publish('subscribe.topic77', payload)
                    .publish('subscribe.topic77', payload, null, { exclude_me: false, disclose_me: true });
                expect(wampy.getOpStatus().code).to.be.equal(WAMP_ERROR_MSG.SUCCESS.code);
            });

            it('allows to publish event with different advanced options', function (done) {
                wampy.subscribe('subscribe.topic8', function (e) {
                    expect(e).to.be.an('object');
                    expect(e.argsList).to.be.an('array');
                    expect(e.argsDict).to.be.undefined;
                    expect(e.argsList[0]).to.be.equal('payload');
                    done();
                })
                    .publish('subscribe.topic8', 'payload',
                        {
                            onSuccess: function () {
                            },
                            onError: function () {
                            }
                        },
                        {
                            exclude: [1234567],
                            exclude_authid: ['iuhfiruhfhr'],
                            exclude_authrole: ['user-role'],
                            eligible: [wampy.getSessionId(), 7654321],
                            eligible_authid: ['dsvsdvsfgdfg'],
                            eligible_authrole: ['admin-role'],
                            exclude_me: false,
                            disclose_me: true
                        }
                    );
                expect(wampy.getOpStatus().code).to.be.equal(WAMP_ERROR_MSG.SUCCESS.code);
            });

            it('disallows to publish event to topic with invalid URI', function () {
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
                        onSuccess: function (e) {
                        },
                        onError: function (e) {
                            expect(e.error).to.be.equal(WAMP_ERROR_MSG.URI_ERROR.description);
                        }
                    }
                );
            });

            it('checks for valid advanced options during publishing to topic', function () {
                wampy.publish(
                    'qqq.www.eee',
                    'payload',
                    {
                        onSuccess: function (e) {
                        },
                        onError: function (e) {
                        }
                    },
                    'string instead of object'
                );
                expect(wampy.getOpStatus()).to.be.deep.equal(WAMP_ERROR_MSG.INVALID_PARAM);

                wampy.publish(
                    'qqq.www.eee',
                    'payload',
                    {
                        onSuccess: function (e) {
                        },
                        onError: function (e) {
                        }
                    },
                    123
                );
                expect(wampy.getOpStatus()).to.be.deep.equal(WAMP_ERROR_MSG.INVALID_PARAM);

                wampy.publish(
                    'qqq.www.eee',
                    'payload',
                    {
                        onSuccess: function (e) {
                        },
                        onError: function (e) {
                        }
                    },
                    function () {
                    }
                );
                expect(wampy.getOpStatus()).to.be.deep.equal(WAMP_ERROR_MSG.INVALID_PARAM);

                wampy.publish(
                    'qqq.www.eee',
                    'payload',
                    {
                        onSuccess: function (e) {
                        },
                        onError: function (e) {
                        }
                    },
                    {
                        exclude: 'string instead of number or array',
                        eligible: 1234567,
                        exclude_authid: 1234567,
                        exclude_authrole: 1234567,
                        eligible_authid: 1234567,
                        eligible_authrole: 1234567
                    }
                );
                expect(wampy.getOpStatus()).to.be.deep.equal(WAMP_ERROR_MSG.INVALID_PARAM);

                wampy.publish(
                    'qqq.www.eee',
                    'payload',
                    {
                        onSuccess: function (e) {
                        },
                        onError: function (e) {
                        }
                    },
                    {
                        exclude: {},
                        eligible: 1234567,
                        exclude_authid: {},
                        exclude_authrole: false,
                        eligible_authid: {},
                        eligible_authrole: true
                    }
                );
                expect(wampy.getOpStatus()).to.be.deep.equal(WAMP_ERROR_MSG.INVALID_PARAM);

                wampy.publish(
                    'qqq.www.eee',
                    'payload',
                    {
                        onSuccess: function (e) {
                        },
                        onError: function (e) {
                        }
                    },
                    {
                        exclude: 1234567,
                        eligible: 'string instead of number or array',
                        exclude_authid: [],
                        exclude_authrole: [],
                        eligible_authid: [],
                        eligible_authrole: []
                    }
                );
                expect(wampy.getOpStatus()).to.be.deep.equal(WAMP_ERROR_MSG.INVALID_PARAM);

                wampy.publish(
                    'qqq.www.eee',
                    'payload',
                    {
                        onSuccess: function (e) {
                        },
                        onError: function (e) {
                        }
                    },
                    {
                        exclude: 1234567,
                        eligible: [],
                        exclude_authid: 'asdfsdafdsaf',
                        exclude_authrole: 'role-one',
                        eligible_authid: 'sadfdfdfdsa',
                        eligible_authrole: 'role-two'
                    }
                );
                expect(wampy.getOpStatus()).to.be.deep.equal(WAMP_ERROR_MSG.INVALID_PARAM);

                wampy.publish(
                    'qqq.www.eee',
                    'payload',
                    {
                        onSuccess: function (e) {
                        },
                        onError: function (e) {
                            expect(e.error).to.be.equal(WAMP_ERROR_MSG.INVALID_PARAM.description);
                        }
                    },
                    {
                        exclude: {},
                        eligible: {},
                        exclude_authid: ['asdfsdafdsaf', 'sddfdfsfdf'],
                        exclude_authrole: ['role-one', 'role-three'],
                        eligible_authid: ['sadfdfdfdsa', 'dsafdfhdfgh'],
                        eligible_authrole: ['role-two', 'role-four']
                    }
                );

                wampy.publish(
                    'qqq.www.eee',
                    'payload',
                    {
                        onSuccess: function (e) {
                        },
                        onError: function (e) {
                            expect(e.error).to.be.equal(WAMP_ERROR_MSG.INVALID_PARAM.description);
                        }
                    },
                    {
                        exclude: 'invalid string',
                        eligible: 'invalid string'
                    }
                );
            });

            it('allows to unsubscribe from topic only specified handler', function (done) {

                let handler3 = function (e) {
                        done('Called removed handler');
                    },
                    handler2 = function (e) {
                        done();
                    },
                    handler1 = function (e) {
                        done('Called removed handler');
                    };

                wampy.subscribe('subscribe.topic9', {
                    onSuccess: function () {
                        wampy.subscribe('subscribe.topic9', handler2)
                            .subscribe('subscribe.topic9', handler3)
                            .unsubscribe('subscribe.topic9', handler1)
                            .unsubscribe('subscribe.topic9', { onEvent: handler3 })
                            .publish('subscribe.topic9', 'payload', null, { exclude_me: false });
                    },
                    onError: function () {
                    },
                    onEvent: handler1
                });
            });

            it('allows to unsubscribe all handlers from topic', function () {
                wampy.unsubscribe('subscribe.topic9');
                expect(wampy.getOpStatus().code).to.be.equal(WAMP_ERROR_MSG.SUCCESS.code);
            });

            it('allows to unsubscribe from topic with notification on unsubscribing', function (done) {
                wampy.unsubscribe('subscribe.topic2', {
                    onSuccess: function (e) {
                        done();
                    }
                });
                expect(wampy.getOpStatus().code).to.be.equal(WAMP_ERROR_MSG.SUCCESS.code);
            });

            it('receives error when trying to unsubscribe from non existent subscription', function () {
                wampy.unsubscribe('subscribe.topic2');
                expect(wampy.getOpStatus().code).to.be.equal(WAMP_ERROR_MSG.NON_EXIST_UNSUBSCRIBE.code);

                wampy.unsubscribe('subscribe.topic2', {
                    onSuccess: function (e) {
                    },
                    onError: function (e) {
                        expect(e.error).to.be.equal(WAMP_ERROR_MSG.NON_EXIST_UNSUBSCRIBE.description);
                    }
                });
            });

            it('fires error callback if error occurred during subscribing', function (done) {
                wampy.subscribe('subscribe.topic10', {
                    onSuccess: function () {
                    },
                    onError: function (e) {
                        done();
                    },
                    onEvent: function (e) {
                    }
                });
            });

            it('fires error callback if error occurred during unsubscribing', function (done) {
                wampy.unsubscribe('subscribe.topic3', {
                    onSuccess: function () {
                    },
                    onError: function (e) {
                        done();
                    }
                });

            });

            it('fires error callback if error occurred during publishing', function (done) {
                wampy.publish('subscribe.topic4', null, {
                    onSuccess: function () {
                    },
                    onError: function (e) {
                        done();
                    }
                });
            });

        });

        describe('RPC module', function () {

            before(function (done) {
                wampy.options({
                    onClose: function () {
                        setTimeout(function () {
                            wampy.options({
                                onConnect: function () {
                                    done();
                                }
                            })
                                .connect();
                        }, 1);
                    }
                }).disconnect();
            });

            it('disallows to call rpc if server does not provide DEALER role', function () {
                wampy.call('call.rpc1', 'payload', function (e) {
                });
                expect(wampy.getOpStatus()).to.be.deep.equal(WAMP_ERROR_MSG.NO_DEALER);

                wampy.call('call.rpc1', 'payload',
                    {
                        onSuccess: function (e) {
                        },
                        onError: function (e) {
                            expect(e.error).to.be.equal(WAMP_ERROR_MSG.NO_DEALER.description);
                        }
                    }
                );

            });

            it('disallows to cancel rpc if server does not provide DEALER role', function () {
                wampy.cancel(1234567, function (e) {
                });
                expect(wampy.getOpStatus()).to.be.deep.equal(WAMP_ERROR_MSG.NO_DEALER);

                wampy.cancel(1234567,
                    {
                        onSuccess: function (e) {
                        },
                        onError: function (e) {
                            expect(e.error).to.be.equal(WAMP_ERROR_MSG.NO_DEALER.description);
                        }
                    }
                );
            });

            it('disallows to register rpc if server does not provide DEALER role', function () {
                wampy.register('call.rpc2', function (e) {
                });
                expect(wampy.getOpStatus()).to.be.deep.equal(WAMP_ERROR_MSG.NO_DEALER);

                wampy.register('call.rpc2',
                    {
                        rpc: function (e) {
                        },
                        onSuccess: function (e) {
                        },
                        onError: function (e) {
                            expect(e.error).to.be.equal(WAMP_ERROR_MSG.NO_DEALER.description);
                        }
                    }
                );
            });

            it('disallows to unregister rpc if server does not provide DEALER role', function () {
                wampy.unregister('call.rpc3', function (e) {
                });
                expect(wampy.getOpStatus()).to.be.deep.equal(WAMP_ERROR_MSG.NO_DEALER);

                wampy.unregister('call.rpc3',
                    {
                        onSuccess: function (e) {
                        },
                        onError: function (e) {
                            expect(e.error).to.be.equal(WAMP_ERROR_MSG.NO_DEALER.description);
                        }
                    }
                );
            });

            it('disallows to register RPC with invalid URI', function (done) {
                wampy.options({
                    onClose: function () {
                        setTimeout(function () {
                            wampy.connect();
                        }, 1);
                    },
                    onConnect: function () {

                        wampy.register('qwe.asd.zxc.', function (e) {
                        });
                        expect(wampy.getOpStatus()).to.be.deep.equal(WAMP_ERROR_MSG.URI_ERROR);

                        wampy.register('qwe.asd..zxc', function (e) {
                        });
                        expect(wampy.getOpStatus()).to.be.deep.equal(WAMP_ERROR_MSG.URI_ERROR);

                        wampy.register('qq,ww,ee', function (e) {
                        });
                        expect(wampy.getOpStatus()).to.be.deep.equal(WAMP_ERROR_MSG.URI_ERROR);

                        wampy.register('qq:www:ee', function (e) {
                        });
                        expect(wampy.getOpStatus()).to.be.deep.equal(WAMP_ERROR_MSG.URI_ERROR);

                        wampy.register('qq:www:ee',
                            {
                                rpc: function (e) {
                                },
                                onSuccess: function (e) {
                                },
                                onError: function (e) {
                                    expect(e.error).to.be.equal(WAMP_ERROR_MSG.URI_ERROR.description);
                                }
                            }
                        );

                        done();

                    }
                }).disconnect();
            });

            it('checks for valid advanced options during RPC registration', function () {
                wampy.register(
                    'qqq.www.eee',
                    {
                        rpc: function (e) { },
                        onSuccess: function (e) { },
                        onError: function (e) {
                            expect(e).to.have.property('error', WAMP_ERROR_MSG.INVALID_PARAM.description);
                        }
                    },
                    {
                        match: 'invalidoption',
                        invoke: 'invalidoption'
                    }
                );
                expect(wampy.getOpStatus()).to.be.deep.equal(WAMP_ERROR_MSG.INVALID_PARAM);
                wampy.register(
                    'qqq.www.eee',
                    {
                        rpc: function (e) { },
                        onSuccess: function (e) { },
                        onError: function (e) {
                            expect(e).to.have.property('error', WAMP_ERROR_MSG.INVALID_PARAM.description);
                        }
                    },
                    'string instead of object'
                );
                expect(wampy.getOpStatus()).to.be.deep.equal(WAMP_ERROR_MSG.INVALID_PARAM);
            });

            it('allows to register RPC', function (done) {
                wampy.register('register.rpc1', function (e) {
                });
                expect(wampy.getOpStatus().code).to.be.equal(WAMP_ERROR_MSG.SUCCESS.code);
                setTimeout(function () {
                    done();
                }, 10);
            });

            it('allows to register RPC with notification on registration', function (done) {
                wampy.register('register.rpc2', {
                    rpc: function (e) {
                    },
                    onSuccess: function () {
                        done();
                    },
                    onError: function () {
                        done('Error during RPC registration');
                    }
                });
            });

            it('allows to register prefix-based RPC', function (done) {
                wampy.register('register.prefix', {
                    rpc: function (e) {
                    },
                    onSuccess: function () {
                        done();
                    },
                    onError: function () {
                        done('Error during RPC registration');
                    }
                }, { match: 'prefix' });
                expect(wampy.getOpStatus().code).to.be.equal(WAMP_ERROR_MSG.SUCCESS.code);
            });

            it('allows to register wildcard-based RPC', function (done) {
                wampy.register('register..wildcard', {
                    rpc: function (e) {
                    },
                    onSuccess: function () {
                        done();
                    },
                    onError: function () {
                        done('Error during RPC registration');
                    }
                }, { match: 'wildcard' });
                expect(wampy.getOpStatus().code).to.be.equal(WAMP_ERROR_MSG.SUCCESS.code);
            });

            it('allows to specify invocation policy during RPC registration', function (done) {
                wampy.register('register.invocation.policy', {
                    rpc: function (e) {
                    },
                    onSuccess: function () {
                        done();
                    },
                    onError: function () {
                        done('Error during RPC registration');
                    }
                }, { invoke: 'roundrobin' });
                expect(wampy.getOpStatus().code).to.be.equal(WAMP_ERROR_MSG.SUCCESS.code);
            });

            it('disallows to register RPC with same name', function () {
                wampy.register('register.rpc2', function (e) {
                });
                expect(wampy.getOpStatus()).to.be.deep.equal(WAMP_ERROR_MSG.RPC_ALREADY_REGISTERED);
            });

            it('disallows to call RPC with invalid URI', function () {
                wampy.call('qwe.asd.zxc.', 'payload', function (e) {
                });
                expect(wampy.getOpStatus()).to.be.deep.equal(WAMP_ERROR_MSG.URI_ERROR);

                wampy.call('qwe.asd..zxc', 'payload', function (e) {
                });
                expect(wampy.getOpStatus()).to.be.deep.equal(WAMP_ERROR_MSG.URI_ERROR);

                wampy.call('qq,ww,ee', 'payload', function (e) {
                });
                expect(wampy.getOpStatus()).to.be.deep.equal(WAMP_ERROR_MSG.URI_ERROR);

                wampy.call('qq:www:ee', 'payload', function (e) {
                });
                expect(wampy.getOpStatus()).to.be.deep.equal(WAMP_ERROR_MSG.URI_ERROR);

                wampy.call('qq:www:ee', 'payload', {
                    onSuccess: function (e) {
                    },
                    onError: function (e) {
                        expect(e.error).to.be.equal(WAMP_ERROR_MSG.URI_ERROR.description);
                    }
                });
            });

            it('disallows to call RPC without specifying result handler', function () {
                wampy.call('qqq.www.eee', 'payload');
                expect(wampy.getOpStatus()).to.be.deep.equal(WAMP_ERROR_MSG.NO_CALLBACK_SPEC);

                wampy.call('qqq.www.eee', 'payload', {
                    onError: function (e) {
                        expect(e.error).to.be.equal(WAMP_ERROR_MSG.NO_CALLBACK_SPEC.description);
                    }
                });
            });

            it('checks for valid advanced options on calling RPC', function () {
                wampy.call(
                    'qqq.www.eee',
                    'payload',
                    {
                        onSuccess: function (e) {
                        },
                        onError: function (e) {
                        }
                    },
                    'string instead of object'
                );
                expect(wampy.getOpStatus()).to.be.deep.equal(WAMP_ERROR_MSG.INVALID_PARAM);

                wampy.call(
                    'qqq.www.eee',
                    'payload',
                    {
                        onSuccess: function (e) {
                        },
                        onError: function (e) {
                        }
                    },
                    123
                );
                expect(wampy.getOpStatus()).to.be.deep.equal(WAMP_ERROR_MSG.INVALID_PARAM);

                wampy.call(
                    'qqq.www.eee',
                    'payload',
                    {
                        onSuccess: function (e) {
                        },
                        onError: function (e) {
                        }
                    },
                    function () {
                    }
                );
                expect(wampy.getOpStatus()).to.be.deep.equal(WAMP_ERROR_MSG.INVALID_PARAM);

                wampy.call(
                    'qqq.www.eee',
                    'payload',
                    {
                        onSuccess: function (e) {
                        },
                        onError: function (e) {
                        }
                    },
                    {
                        timeout: 'string instead of number'
                    }
                );
                expect(wampy.getOpStatus()).to.be.deep.equal(WAMP_ERROR_MSG.INVALID_PARAM);

                wampy.call(
                    'qqq.www.eee',
                    'payload',
                    {
                        onSuccess: function (e) {
                        },
                        onError: function (e) {
                        }
                    },
                    {
                        timeout: {}
                    }
                );
                expect(wampy.getOpStatus()).to.be.deep.equal(WAMP_ERROR_MSG.INVALID_PARAM);

                wampy.call(
                    'qqq.www.eee',
                    'payload',
                    {
                        onSuccess: function (e) {
                        },
                        onError: function (e) {
                        }
                    },
                    {
                        timeout: true
                    }
                );
                expect(wampy.getOpStatus()).to.be.deep.equal(WAMP_ERROR_MSG.INVALID_PARAM);
            });

            it('disallows to unregister rpc if there is no such registration', function () {
                wampy.unregister('call.rpc4', function (e) {
                });
                expect(wampy.getOpStatus()).to.be.deep.equal(WAMP_ERROR_MSG.NON_EXIST_RPC_UNREG);
            });

            it('allows to call RPC without payload', function (done) {
                wampy.call('call.rpc1', null, function (e) {
                    expect(e).to.be.an('object');
                    expect(e.argsList).to.be.undefined;
                    expect(e.argsDict).to.be.undefined;
                    done();
                });
            });

            it('allows to call RPC with int payload', function (done) {
                wampy.call('call.rpc2', 25, function (e) {
                    expect(e).to.be.an('object');
                    expect(e.argsList).to.be.an('array');
                    expect(e.argsDict).to.be.undefined;
                    expect(e.argsList[0]).to.be.equal(25);
                    done();
                });
            });

            it('allows to call RPC with string payload', function (done) {
                wampy.call('call.rpc3', 'payload', function (e) {
                    expect(e).to.be.an('object');
                    expect(e.argsList).to.be.an('array');
                    expect(e.argsDict).to.be.undefined;
                    expect(e.argsList[0]).to.be.equal('payload');
                    done();
                });
            });

            it('allows to call RPC with array payload', function (done) {
                wampy.call('call.rpc4', [1, 2, 3, 4, 5], function (e) {
                    expect(e).to.be.an('object');
                    expect(e.argsList).to.be.an('array');
                    expect(e.argsDict).to.be.undefined;
                    expect(e.argsList[0]).to.be.equal(1);
                    expect(e.argsList[4]).to.be.equal(5);
                    done();
                });
            });

            it('allows to call RPC with hash-table payload', function (done) {
                let i = 1, payload = { key1: 100, key2: 'string-key' },
                    cb = function (e) {
                        expect(e).to.be.an('object');
                        expect(e.argsList).to.be.an('array');
                        expect(e.argsList).to.have.lengthOf(0);
                        expect(e.argsDict).to.be.an('object');
                        expect(e.argsDict).to.be.deep.equal(payload);

                        if (i === 2) {
                            done();
                        } else {
                            i++;
                        }
                    };

                wampy.call('call.rpc5', payload, cb)
                    .call('call.rpc5', { argsDict: payload }, cb);
            });

            it('allows to call RPC with both array and hash-table payload', function (done) {
                let dictpayload = { key1: 100, key2: 'string-key' },
                    payload = { argsList: [1, 2, 3, 4, 5], argsDict: dictpayload };

                wampy.call('call.rpc5', payload, function (e) {
                    expect(e).to.be.an('object');
                    expect(e.argsList).to.be.an('array');
                    expect(e.argsList[0]).to.be.equal(1);
                    expect(e.argsList[4]).to.be.equal(5);
                    expect(e.argsDict).to.be.an('object');
                    expect(e.argsDict).to.be.deep.equal(dictpayload);
                    done();
                });
            });

            it('allows to call RPC with different advanced options', function (done) {
                wampy.call(
                    'call.rpc6',
                    'payload',
                    function (e) {
                        expect(e).to.be.an('object');
                        expect(e.argsList).to.be.an('array');
                        expect(e.argsDict).to.be.undefined;
                        expect(e.argsList[0]).to.be.equal('payload');
                        done();
                    },
                    {
                        disclose_me: true,
                        receive_progress: false,
                        timeout: 5000
                    }
                );
            });

            it('allows to call RPC with progressive result receiving', function (done) {
                wampy.call(
                    'call.rpc7',
                    'payload',
                    function (e) {
                        expect(e).to.be.an('object');
                        expect(e.argsList).to.be.an('array');
                        expect(e.argsDict).to.be.undefined;
                        if (e.argsList[0] == 100) {
                            done();
                        }
                    },
                    {
                        receive_progress: true
                    }
                );
            });

            it('checks options during canceling RPC invocation', function (done) {
                let reqId;

                wampy.call(
                    'call.rpc8',
                    'payload',
                    {
                        onSuccess: function (e) {
                            expect(e).to.be.an('object');
                            expect(e.argsList).to.be.an('array');

                            wampy.cancel(reqId,
                                {
                                    onSuccess: function () {
                                    },
                                    onError: function (e) {
                                        expect(e).to.be.an('object');
                                        expect(e).to.have.property('error', WAMP_ERROR_MSG.INVALID_PARAM.description);
                                    }
                                },
                                {
                                    mode: 'falseoption'
                                }
                            );
                            wampy.cancel(reqId,
                                {
                                    onSuccess: function () {
                                    },
                                    onError: function (e) {
                                        expect(e).to.be.an('object');
                                        expect(e).to.have.property('error', WAMP_ERROR_MSG.INVALID_PARAM.description);
                                    }
                                },
                                'string_instead_of_object'
                            );
                            done();
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

            it('allows to cancel RPC invocation', function (done) {
                let reqId;

                wampy.call(
                    'call.rpc8',
                    'payload',
                    {
                        onSuccess: function (e) {
                            expect(e).to.be.an('object');
                            expect(e.argsList).to.be.an('array');

                            wampy.cancel(
                                reqId,
                                {
                                    onSuccess: function () {
                                    },
                                    onError: function () {
                                        done('Error occured during call canceling');
                                    }
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
                            }, 1);
                        });
                    },
                    onSuccess: function (e) {
                        wampy.call(
                            'register.rpc3',
                            null,
                            function (e) {
                                expect(e).to.be.an('object');
                                expect(e.argsList).to.be.undefined;
                                expect(e.argsDict).to.be.undefined;
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

            it('allows to invoke asynchronous RPC without value but with extra options', function (done) {
                wampy.register('register.rpc33', {
                    rpc: function (e) {
                        return new Promise(function (resolve, reject) {
                            setTimeout(function () {
                                resolve({ options: { extra: true } });
                            }, 1);
                        });
                    },
                    onSuccess: function (e) {
                        wampy.call(
                            'register.rpc33',
                            null,
                            function (e) {
                                expect(e).to.be.an('object');
                                expect(e.details).to.be.an('object');
                                expect(e.details.extra).to.be.true;
                                expect(e.argsList).to.be.undefined;
                                expect(e.argsDict).to.be.undefined;
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

            it('allows to invoke pattern-based RPC providing original uri in options', function (done) {
                wampy.register('register.prefixbased', {
                    rpc: function (e) {

                        return new Promise(function (resolve, reject) {
                            setTimeout(function () {
                                expect(e.details).to.have.property('topic', 'register.prefixbased.maiden');
                                resolve();
                            }, 1);
                        });
                    },
                    onSuccess: function (e) {
                        wampy.call(
                            'register.prefixbased.maiden',
                            null,
                            function (e) {
                                expect(e).to.be.an('object');
                                expect(e.details).to.be.an('object');
                                expect(e.argsList).to.be.undefined;
                                expect(e.argsDict).to.be.undefined;
                                done();
                            },
                            { exclude_me: false }
                        );
                    },
                    onError: function (e) {
                        done('Error during RPC registration!');
                    }
                }, { match: 'prefix' });
                expect(wampy.getOpStatus().code).to.be.equal(WAMP_ERROR_MSG.SUCCESS.code);
            });

            it('allows to invoke asynchronous RPC with single value', function (done) {
                wampy.register('register.rpc4', {
                    rpc: function (e) {
                        return new Promise(function (resolve, reject) {
                            setTimeout(function () {
                                resolve({ options: {}, argsList: 100 });
                            }, 1);
                        });
                    },
                    onSuccess: function (e) {
                        wampy.call(
                            'register.rpc4',
                            100,
                            function (e) {
                                expect(e).to.be.an('object');
                                expect(e.argsList).to.be.an('array');
                                expect(e.argsDict).to.be.undefined;
                                expect(e.argsList[0]).to.be.equal(100);
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
                                resolve({ options: {}, argsList: [1, 2, 3, 4, 5] });
                            }, 1);
                        });
                    },
                    onSuccess: function (e) {
                        wampy.call(
                            'register.rpc5',
                            [1, 2, 3, 4, 5],
                            function (e) {
                                expect(e).to.be.an('object');
                                expect(e.argsList).to.be.an('array');
                                expect(e.argsDict).to.be.undefined;
                                expect(e.argsList[0]).to.be.equal(1);
                                expect(e.argsList[4]).to.be.equal(5);
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
                let payload = { key1: 100, key2: 'string-key' };
                wampy.register('register.rpc6', {
                    rpc: function (e) {
                        return new Promise(function (resolve, reject) {
                            setTimeout(function () {
                                resolve({ options: {}, argsDict: payload });
                            }, 1);
                        });
                    },
                    onSuccess: function (e) {
                        wampy.call(
                            'register.rpc6',
                            payload,
                            function (e) {
                                expect(e).to.be.an('object');
                                expect(e.argsList).to.be.an('array');
                                expect(e.argsList).to.have.lengthOf(0);
                                expect(e.argsDict).to.be.an('object');
                                expect(e.argsDict).to.be.deep.equal(payload);
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

            it('allows to return progressive results from asynchronous RPC', function (done) {
                let payload = 1;
                wampy.register('register.rpc61', {
                    rpc: function (e) {

                        return new Promise(function (resolve, reject) {
                            for (let i = 1; i <= 5; i++) {
                                (function (j, p) {
                                    setTimeout(function () {
                                        e.result_handler({ options: { progress: p }, argsList: j });
                                    }, 10 * j);
                                }(i, i < 5));
                            }

                            setTimeout(function () {
                                resolve({ options: { progress: true }, argsList: 0 });
                            }, 1);
                        });
                    },
                    onSuccess: function (e) {
                        wampy.call(
                            'register.rpc61',
                            payload,
                            function (e) {
                                expect(e).to.be.an('object');
                                expect(e.argsList).to.be.an('array');
                                expect(e.argsList).to.have.lengthOf(1);
                                //expect(e.argsDict).to.be.undefined;

                                if (e.argsList[0] < 5) {
                                    expect(e.details.progress).to.be.true;
                                } else {
                                    expect(e.details.progress).to.be.false;
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

            it('calls error handler if asynchronous RPC was rejected', function (done) {
                wampy.register('register.rpc7', {
                    rpc: function (e) {
                        return new Promise(function (resolve, reject) {
                            setTimeout(function () {
                                reject('Rejecting promise rpc');
                            }, 1);
                        });
                    },
                    onSuccess: function (e) {
                        wampy.call(
                            'register.rpc7',
                            100,
                            {
                                onSuccess: function () {
                                },
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

            it('calls error handler if asynchronous RPC raised exception', function (done) {
                wampy.register('register.rpc77', {
                    rpc: function (e) {
                        throw new Error('Raised exception in RPC');
                    },
                    onSuccess: function (e) {
                        wampy.call(
                            'register.rpc77',
                            100,
                            {
                                onSuccess: function () {
                                },
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

            it('calls error handler with custom data if asynchronous RPC raised exception', function (done) {
                let definedUri = 'app.error.custom_invocation_exception',
                    definedDetails = { key1: 'key1', key2: true, key3: 25 },
                    definedArgsList = [1, 2, 3, 4, 5],
                    definedArgsDict = { key1: 'key1', key2: true, key3: 25 };

                wampy.register('register.rpc88', {
                    rpc: function (e) {
                        let UserException = function () {
                            this.error = definedUri;
                            this.details = definedDetails;
                            this.argsList = definedArgsList;
                            this.argsDict = definedArgsDict;
                        };

                        throw new UserException();
                    },
                    onSuccess: function (e) {
                        wampy.call(
                            'register.rpc88',
                            100,
                            {
                                onSuccess: function () {
                                },
                                onError: function (e) {
                                    expect(e.error).to.be.equal(definedUri);
                                    expect(e.details).to.be.deep.equal(definedDetails);
                                    expect(e.argsList).to.be.an('array');
                                    expect(e.argsList[0]).to.be.equal(1);
                                    expect(e.argsDict).to.be.deep.equal(definedArgsDict);

                                    wampy.register('register.rpc99', {
                                        rpc: function (e) {
                                            let UserException = function () {
                                                this.error = definedUri;
                                                // no details
                                                // no args list, only args dict
                                                this.argsDict = definedArgsDict;
                                            };

                                            throw new UserException();
                                        },
                                        onSuccess: function (e) {
                                            wampy.call(
                                                'register.rpc99',
                                                100,
                                                {
                                                    onSuccess: function () {
                                                    },
                                                    onError: function (e) {
                                                        expect(e.error).to.be.equal(definedUri);
                                                        expect(e.details).to.be.deep.equal({});
                                                        expect(e.argsList).to.be.an('array');
                                                        expect(e.argsList).to.have.lengthOf(0);
                                                        expect(e.argsDict).to.be.deep.equal(definedArgsDict);
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

            it('calls error handler on trying to call nonexistent RPC', function (done) {
                wampy.call(
                    'nonexistent.rpc',
                    100,
                    {
                        onSuccess: function () {
                        },
                        onError: function () {
                            done();
                        }
                    }
                );
            });

            it('calls error handler on trying to unregister non existent RPC', function () {
                wampy.unregister(
                    'register.nonexistent',
                    {
                        onSuccess: function (e) {
                        },
                        onError: function (e) {
                            expect(e.error).to.be.equal(WAMP_ERROR_MSG.NON_EXIST_RPC_UNREG.description);
                        }
                    }
                );
            });

            it('disallows to unregister RPC with invalid URI', function () {
                wampy.unregister(
                    'q:w:e',
                    {
                        onSuccess: function (e) {
                        },
                        onError: function (e) {
                            expect(e.error).to.be.equal(WAMP_ERROR_MSG.URI_ERROR.description);
                        }
                    }
                );
            });

            it('disallows to register RPC without providing rpc itself', function () {
                wampy.register(
                    'register.rpc8',
                    {
                        onSuccess: function (e) {
                        },
                        onError: function (e) {
                            expect(e.error).to.be.equal(WAMP_ERROR_MSG.NO_CALLBACK_SPEC.description);
                        }
                    }
                );
            });

            it('disallows to register RPC with the same name', function (done) {
                wampy.register('register.rpc9', {
                    rpc: function (e) {
                    },
                    onSuccess: function (e) {
                        wampy.register('register.rpc9', {
                            rpc: function (e) {
                            },
                            onSuccess: function (e) {
                            },
                            onError: function (e) {
                                expect(e.error).to.be.equal(WAMP_ERROR_MSG.RPC_ALREADY_REGISTERED.description);
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
                wampy.cancel(1234567, function (e) {
                });
                expect(wampy.getOpStatus()).to.be.deep.equal(WAMP_ERROR_MSG.NON_EXIST_RPC_REQ_ID);

                wampy.cancel(1234567,
                    {
                        onSuccess: function (e) {
                        },
                        onError: function (e) {
                            expect(e.error).to.be.equal(WAMP_ERROR_MSG.NON_EXIST_RPC_REQ_ID.description);
                        }
                    }
                );
            });

            it('fires error callback if error occurred during registering', function (done) {
                wampy.register('call.rpc10', {
                    rpc: function () {
                    },
                    onSuccess: function () {
                    },
                    onError: function (e) {
                        done();
                    }
                });
            });

            it('fires error callback if error occurred during unregistering', function (done) {
                wampy.unregister('register.rpc9', {
                    onSuccess: function () {
                    },
                    onError: function (e) {
                        done();
                    }
                });

            });

            it('fires error handler if error occurred during RPC call', function (done) {
                let i = 0;
                wampy.call('call.rpc1', null, {
                    onSuccess: function (e) {
                        done('Reached success. Check Server side');
                    },
                    onError: function (e) {
                        expect(e.error).to.be.equal('call.error');

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
                            expect(e.error).to.be.equal('call.error');
                            expect(e.argsList).to.be.an('array');
                            expect(e.argsList[0]).to.be.equal(1);
                            expect(e.argsList[4]).to.be.equal(5);
                            expect(e.argsList).to.have.lengthOf(5);
                            expect(e.argsDict).to.be.undefined;

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
                            expect(e.error).to.be.equal('call.error');
                            expect(e.argsList).to.be.an('array');
                            expect(e.argsList).to.have.lengthOf(0);
                            expect(e.argsDict).to.be.deep.equal({ k1: 1, k2: 2 });

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
