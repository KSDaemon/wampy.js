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
import * as WebSocketModule from './fake-ws.js';
import { Wampy } from '../src/wampy.js';
import * as Errors from '../src/errors.js';
import { JsonSerializer } from '../src/serializers/JsonSerializer.js';
import { MsgpackSerializer } from '../src/serializers/MsgpackSerializer.js';
import { CborSerializer } from '../src/serializers/CborSerializer.js';
import { WAMP_ERROR_MSG, SUCCESS } from '../src/constants.js';

const serializers = [
    { serializer: JsonSerializer, ws: WebSocketModule.WebSocket, name: 'JSON Serializer' },
    { serializer: MsgpackSerializer, ws: WebSocketModule.WebSocket, name: 'MsgPack Serializer' },
    { serializer: CborSerializer, ws: WebSocketModule.WebSocket, name: 'CBOR Serializer' }
];

serializers.forEach(function (item) {

    const { serializer, ws, name } = item;

    describe(`Wampy.js with ${name}`, function () {
        this.timeout(2000);
        let wampy;

        before(function () {
            WebSocketModule.startTimers();
            wampy = new Wampy(routerUrl, {
                realm     : 'AppRealm',
                ws,
                serializer: new serializer()
            });
        });

        after(function () {
            WebSocketModule.clearTimers();
            WebSocketModule.resetCursor();
        });

        describe('Connectivity', function () {

            it('disallows to connect if no realm is specified', async function () {
                try {
                    let wampy = new Wampy(routerUrl, {
                        ws,
                        serializer: new serializer()
                    });
                    await wampy.connect();
                } catch (e) {
                    expect(e).to.be.instanceOf(Errors.NoRealmError);
                }
            });

            it('rejects connection on websocket error', function (done) {
                let wampy = new Wampy(routerUrl, {
                    realm     : 'AppRealm',
                    ws,
                    serializer: new serializer()
                });
                wampy.connect().catch((e) => {
                    done();
                });
            });

            it('aborts connection if it can not encode outgoing message', function (done) {
                const origSerializer = new serializer();
                const testSrlzr = class {
                    constructor () {
                        this.protocol = origSerializer.protocol;
                        this.isBinary = origSerializer.isBinary;
                    }
                    encode() {
                        throw new Error('failed encode')
                    }

                    decode() {
                        throw new Error('failed decode')
                    }
                };
                let wampy = new Wampy(routerUrl, {
                    realm     : 'AppRealm',
                    ws,
                    serializer: new testSrlzr()
                });
                wampy.connect().catch((e) => {
                    done();
                });
            });

            it('aborts connection if it can not decode incoming message', function (done) {
                let wampy = new Wampy(routerUrl, {
                    realm     : 'AppRealm',
                    ws,
                    serializer: new serializer()
                });
                wampy.connect().catch((e) => {
                    done();
                });
            });

            it('passes welcome details to onConnect() callback', async function () {
                let wampy = new Wampy(routerUrl, {
                    realm     : 'AppRealm',
                    ws,
                    serializer: new serializer()
                });
                expect(wampy).to.be.an('object');
                let welcomeDetails = await wampy.connect();
                expect(welcomeDetails).to.be.an('object');
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
                    ws,
                    serializer: new serializer()
                });
                expect(wampy).to.be.an('object');
                wampy.connect();
            });

            it('allows to set different options on instantiation', async function () {
                let helloCustomDetails = {
                        customFiled1: 25,
                        customFiled2: 'string',
                        customFiled3: [1, 2, 3, 4, 5]
                    },
                    setoptions = {
                        debug: true,
                        logger: function () {},
                        autoReconnect: true,
                        reconnectInterval: 10000,
                        maxRetries: 50,
                        realm: 'AppRealm',
                        uriValidation: 'loose',
                        helloCustomDetails: helloCustomDetails,
                        onChallenge: function () {
                            throw new Error('Reached onChallenge');
                        },
                        authid: 'userid',
                        authmethods: ['wampcra'],
                        onClose: function () {
                            throw new Error('Reached onClose');
                        },
                        onError: function () {
                            throw new Error('Reached onError');
                        },
                        onReconnect: function () {
                            throw new Error('Reached onReconnect');
                        },
                        onReconnectSuccess: function () {
                            throw new Error('Reached onReconnectSuccess');
                        },
                        ws,
                        serializer: new serializer()
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
                expect(options.onClose).to.be.a('function');
                expect(options.onError).to.be.a('function');
                expect(options.onReconnect).to.be.a('function');
                expect(options.onReconnectSuccess).to.be.a('function');

                wampy = new Wampy(routerUrl, setoptions);
                await wampy.connect();
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
                expect(options.onClose).to.be.a('function');
                expect(options.onError).to.be.a('function');
                expect(options.onReconnect).to.be.a('function');
                expect(options.onReconnectSuccess).to.be.a('function');
            });

            it('allows to use Ticket-based Authentication while connecting to server', async function () {
                let wampy = new Wampy(routerUrl, {
                    realm: 'AppRealm',
                    onChallenge: function () {
                        return 'secretKey';
                    },
                    authid: 'user1',
                    authmethods: ['ticket'],
                    onClose: function () {
                        throw new Error('Reached onClose');
                    },
                    onError: function () {
                        throw new Error('Reached onError');
                    },
                    onReconnect: function () {
                        throw new Error('Reached onReconnect');
                    },
                    onReconnectSuccess: function () {
                        throw new Error('Reached onReconnectSuccess');
                    },
                    ws,
                    serializer: new serializer()
                });
                expect(wampy).to.be.an('object');
                return wampy.connect();
            });


            it('allows to use Challenge Response Authentication while connecting to server', async function () {
                let wampy = new Wampy(routerUrl, {
                    realm: 'AppRealm',
                    onChallenge: function (method, info) {
                        return 'secretKey';
                    },
                    authid: 'user1',
                    authmethods: ['wampcra'],
                    onClose: function () {
                        throw new Error('Reached onClose');
                    },
                    onError: function () {
                        throw new Error('Reached onError');
                    },
                    onReconnect: function () {
                        throw new Error('Reached onReconnect');
                    },
                    onReconnectSuccess: function () {
                        throw new Error('Reached onReconnectSuccess');
                    },
                    ws,
                    serializer: new serializer()
                });
                expect(wampy).to.be.an('object');
                return wampy.connect();
            });

            it('allows to use Automatically chosen Authentication while connecting to server', async function () {
                let wampy = new Wampy(routerUrl, {
                    realm: 'AppRealm',
                    authid: 'user1',
                    authmethods: ['ticket', 'wampcra', 'cryptosign'],
                    authextra: {    // User public key for Cryptosign-based Authentication
                        pubkey: '545efb0a2192db8d43f118e9bf9aee081466e1ef36c708b96ee6f62dddad9122'
                    },
                    authPlugins: {
                        ticket: () => 'ticketKey',
                        wampcra: () => 'secretKey',
                        cryptosign: () => 'privateKey'
                    },
                    authMode: 'auto',
                    onChallenge: null,
                    onClose: null,
                    onError: function () {
                        throw new Error('Reached onError');
                    },
                    onReconnect: function () {
                        throw new Error('Reached onReconnect');
                    },
                    onReconnectSuccess: function () {
                        throw new Error('Reached onReconnectSuccess');
                    },
                    ws,
                    serializer: new serializer()
                });
                expect(wampy).to.be.an('object');
                await wampy.connect();
                await wampy.disconnect();
                await wampy.connect();
                await wampy.disconnect();
                await wampy.connect();
            });

            it('drops connection on receiving WELCOME message after session was established', function (done) {
                let wampy = new Wampy(routerUrl, {
                    realm: 'AppRealm',
                    autoReconnect: false,
                    onClose: null,
                    onError: function (e) {
                        expect(e).to.be.instanceOf(Errors.ProtocolViolationError);
                        done();
                    },
                    ws,
                    serializer: new serializer()
                });
                wampy.connect();
            });

            it('drops connection on receiving CHALLENGE message after session was established', function (done) {
                let wampy = new Wampy(routerUrl, {
                    realm: 'AppRealm',
                    autoReconnect: false,
                    onClose: null,
                    onError: function (e) {
                        expect(e).to.be.instanceOf(Errors.ProtocolViolationError);
                        done();
                    },
                    ws,
                    serializer: new serializer()
                });
                wampy.connect();
            });

            it('drops connection on receiving GOODBYE message before session was established', function (done) {
                let wampy = new Wampy(routerUrl, {
                    realm: 'AppRealm',
                    autoReconnect: false,
                    onClose: null,
                    onError: function (e) {
                        expect(e).to.be.instanceOf(Errors.ProtocolViolationError);
                        done();
                    },
                    ws,
                    serializer: new serializer()
                });
                wampy.connect();
            });

            it('drops connection on receiving ERROR message before session was established', function (done) {
                let wampy = new Wampy(routerUrl, {
                    realm: 'AppRealm',
                    autoReconnect: false,
                    onClose: null,
                    onError: function (e) {
                        expect(e).to.be.instanceOf(Errors.ProtocolViolationError);
                        done();
                    },
                    ws,
                    serializer: new serializer()
                });
                wampy.connect();
            });

            it('drops connection on receiving invalid ERROR message after session was established', function (done) {
                let wampy = new Wampy(routerUrl, {
                    realm: 'AppRealm',
                    autoReconnect: false,
                    onClose: null,
                    onError: function (e) {
                        expect(e).to.be.instanceOf(Errors.ProtocolViolationError);
                        done();
                    },
                    ws,
                    serializer: new serializer()
                });
                wampy.connect();
            });

            it('drops connection on receiving SUBSCRIBED message before session was established', function (done) {
                let wampy = new Wampy(routerUrl, {
                    realm: 'AppRealm',
                    autoReconnect: false,
                    onClose: null,
                    onError: function (e) {
                        expect(e).to.be.instanceOf(Errors.ProtocolViolationError);
                        done();
                    },
                    ws,
                    serializer: new serializer()
                });
                wampy.connect();
            });

            it('drops connection on receiving UNSUBSCRIBED message before session was established', function (done) {
                let wampy = new Wampy(routerUrl, {
                    realm: 'AppRealm',
                    autoReconnect: false,
                    onClose: null,
                    onError: function (e) {
                        expect(e).to.be.instanceOf(Errors.ProtocolViolationError);
                        done();
                    },
                    ws,
                    serializer: new serializer()
                });
                wampy.connect();
            });

            it('drops connection on receiving PUBLISHED message before session was established', function (done) {
                let wampy = new Wampy(routerUrl, {
                    realm: 'AppRealm',
                    autoReconnect: false,
                    onClose: null,
                    onError: function (e) {
                        expect(e).to.be.instanceOf(Errors.ProtocolViolationError);
                        done();
                    },
                    ws,
                    serializer: new serializer()
                });
                wampy.connect();
            });

            it('drops connection on receiving EVENT message before session was established', function (done) {
                let wampy = new Wampy(routerUrl, {
                    realm: 'AppRealm',
                    autoReconnect: false,
                    onClose: null,
                    onError: function (e) {
                        expect(e).to.be.instanceOf(Errors.ProtocolViolationError);
                        done();
                    },
                    ws,
                    serializer: new serializer()
                });
                wampy.connect();
            });

            it('drops connection on receiving RESULT message before session was established', function (done) {
                let wampy = new Wampy(routerUrl, {
                    realm: 'AppRealm',
                    autoReconnect: false,
                    onClose: null,
                    onError: function (e) {
                        expect(e).to.be.instanceOf(Errors.ProtocolViolationError);
                        done();
                    },
                    ws,
                    serializer: new serializer()
                });
                wampy.connect();
            });

            it('drops connection on receiving REGISTERED message before session was established', function (done) {
                let wampy = new Wampy(routerUrl, {
                    realm: 'AppRealm',
                    autoReconnect: false,
                    onClose: null,
                    onError: function (e) {
                        expect(e).to.be.instanceOf(Errors.ProtocolViolationError);
                        done();
                    },
                    ws,
                    serializer: new serializer()
                });
                wampy.connect();
            });

            it('drops connection on receiving UNREGISTERED message before session was established', function (done) {
                let wampy = new Wampy(routerUrl, {
                    realm: 'AppRealm',
                    autoReconnect: false,
                    onClose: null,
                    onError: function (e) {
                        expect(e).to.be.instanceOf(Errors.ProtocolViolationError);
                        done();
                    },
                    ws,
                    serializer: new serializer()
                });
                wampy.connect();
            });

            it('drops connection on receiving INVOCATION message before session was established', function (done) {
                let wampy = new Wampy(routerUrl, {
                    realm: 'AppRealm',
                    autoReconnect: false,
                    onClose: null,
                    onError: function (e) {
                        expect(e).to.be.instanceOf(Errors.ProtocolViolationError);
                        done();
                    },
                    ws,
                    serializer: new serializer()
                });
                wampy.connect();
            });

            it('drops connection on receiving non-compliant WAMP message', function (done) {
                let wampy = new Wampy(routerUrl, {
                    realm: 'AppRealm',
                    autoReconnect: false,
                    onClose: null,
                    onError: function (e) {
                        expect(e).to.be.instanceOf(Errors.ProtocolViolationError);
                        done();
                    },
                    ws,
                    serializer: new serializer()
                });
                wampy.connect();
            });

            it('calls Error handler on websocket errors', function (done) {
                let wampy = new Wampy(routerUrl, {
                    realm: 'AppRealm',
                    autoReconnect: false,
                    onClose: null,
                    onError: function (e) {
                        done();
                    },
                    ws,
                    serializer: new serializer()
                });
                wampy.connect();
            });

            it('disallows to connect to a router if no url was specified during instantiation', async function () {

                if (!isNode) {
                    return;
                }

                let wampy = new Wampy({ realm: 'AppRealm' });

                try {
                    await wampy.connect();
                } catch (e) {
                    expect(e).to.be.instanceof(Errors.NoWsOrUrlError);
                }
            });

            it('allows to get and set different options', function () {
                let helloCustomDetails = {
                        customFiled1: 25,
                        customFiled2: 'string',
                        customFiled3: [1, 2, 3, 4, 5]
                    },
                    options = wampy.options({
                        realm             : 'AppRealm',
                        autoReconnect     : true,
                        reconnectInterval : 1000,
                        maxRetries        : 5,
                        uriValidation     : 'loose',
                        helloCustomDetails: helloCustomDetails,
                        onChallenge       : function () {},
                        onClose           : function () {},
                        onError           : function () {},
                        onReconnect       : function () {},
                        onReconnectSuccess: function () {},
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
                expect(options.onClose).to.be.a('function');
                expect(options.onError).to.be.a('function');
                expect(options.onReconnect).to.be.a('function');
                expect(options.onReconnectSuccess).to.be.a('function');
            });

            it('allows to get current WAMP Session ID', async function () {
                wampy = new Wampy(routerUrl, {
                    realm     : 'AppRealm',
                    ws,
                    serializer: new serializer()
                });
                await wampy.connect(routerUrl);
                let s = wampy.getSessionId();
                expect(s).to.be.a('number');
                expect(s).to.be.above(0);
            });

            it('allows to disconnect from connected server', function (done) {
                wampy.options({ onConnect: null, onClose: done })
                    .disconnect();
            });

            it('disallows to connect without specifying all of [onChallenge, authid, authmethods]', async function () {
                try {
                    wampy.options({ authid: 'userid', authmethods: ['wampcra'], onChallenge: null }).connect();
                } catch (e) {
                    expect(e).to.be.instanceOf(Errors.NoCRACallbackOrIdError);
                }

                try {
                    wampy.options({ authid: null, authmethods: ['wampcra'], onChallenge: null }).connect();
                } catch (e) {
                    expect(e).to.be.instanceOf(Errors.NoCRACallbackOrIdError);
                }

                try {
                    wampy.options({
                        authid: null, onChallenge: function () {
                        }
                    }).connect();
                } catch (e) {
                    expect(e).to.be.instanceOf(Errors.NoCRACallbackOrIdError);
                }

                try {
                    wampy.options({
                        authid: null, authmethods: [], onChallenge: function () {
                        }
                    }).connect();
                } catch (e) {
                    expect(e).to.be.instanceOf(Errors.NoCRACallbackOrIdError);
                }

                try {
                    wampy.options({
                        authid: 'userid', authmethods: 'string', onChallenge: function () {
                        }
                    }).connect();
                } catch (e) {
                    expect(e).to.be.instanceOf(Errors.NoCRACallbackOrIdError);
                }

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
                    onClose: function () {
                        wampy.options({ onClose: null });
                        done();
                    }
                }).connect();

                setTimeout(function () {
                    wampy.disconnect();
                }, 10);
            });

            it('allows to connect to same WAMP server', async function () {
                return wampy.connect();
            });

            it('allows to connect to different WAMP server', async function () {
                await wampy.disconnect();
                return wampy.connect(anotherRouterUrl);
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
                }).disconnect();
            });

            it('auto-reconnects to WAMP server on network errors', function (done) {
                let onReconnect = false;

                wampy.options({
                    autoReconnect     : true,
                    reconnectInterval : 10,
                    onClose           : null,
                    onError           : null,
                    onReconnect       : function () {
                        onReconnect = true;
                        wampy.options({ onReconnect: null });
                    },
                    onReconnectSuccess: null
                }).connect().then(async () => {
                    try {
                        await wampy.subscribe('subscribe.reconnect1', () => {
                            expect(onReconnect).to.be.true;
                            done();
                        });
                    } catch (e) {
                        done('Expect subscribe to work');
                    }
                    try {
                        await wampy.subscribe('subscribe.reconnect2', () => {});
                    } catch (e) {
                        done('Expect subscribe to work');
                    }
                    try {
                        await wampy.register('register.reconnect1', () => {});
                    } catch (e) {
                        done('Expect register to work');
                    }
                    try {
                        await wampy.register('register.reconnect2', () => {});
                    } catch (e) {
                        done('Expect register to work');
                    }
                    try {
                        await wampy.register('register.reconnect3', () => {});
                    } catch (e) {
                        done('Expect register to work');
                    }
                });
            });

            it('allows to call handler when auto-reconnection to WAMP server succeeded', function (done) {
                wampy = new Wampy(routerUrl, {
                    autoReconnect: true,
                    reconnectInterval: 10,
                    maxRetries: 7,
                    realm: 'AppRealm',
                    onClose: null,
                    onError: null,
                    onReconnect: null,
                    onReconnectSuccess: function () {
                        setTimeout(function () {
                            done();
                        }, 10);
                    },
                    ws,
                    serializer: new serializer()
                });
                wampy.connect();
            });

            it('calls error handler if server sends abort message', function (done) {
                wampy.options({
                    onClose: null,
                    onError: function (e) {
                        done();
                    }
                }).disconnect().then(() => {
                    wampy.connect();
                });
            });
        });

        describe('PubSub module', function () {

            before(async function () {
                await wampy.options({
                    uriValidation: 'strict',
                    onClose      : null,
                    onReconnect  : null,
                    onError      : null
                }).connect();
            });

            it('disallows to subscribe to topic if server does not provide BROKER role', async function () {
                try {
                    await wampy.subscribe('qwe.asd.zxc', (e) => {});
                } catch (e) {
                    expect(e).to.be.instanceOf(Errors.NoBrokerError);
                }
            });

            it('disallows to unsubscribe from topic if server does not provide BROKER role', async function () {
                try {
                    await wampy.unsubscribe('qwe.asd.zxc', (e) => {});
                } catch (e) {
                    expect(e).to.be.instanceOf(Errors.NoBrokerError);
                }
            });

            it('disallows to publish to topic if server does not provide BROKER role', async function () {
                try {
                    await wampy.publish('qwe.asd.zxc', 'payload', (e) => {});
                } catch (e) {
                    expect(e).to.be.instanceOf(Errors.NoBrokerError);
                }
            });

            it('disallows to subscribe to topic with invalid URI', function (done) {
                wampy.options({
                    onClose: function () {
                        wampy.options({ onClose: null });
                        setTimeout(async function () {
                            await wampy.connect();

                            try {
                                await wampy.subscribe('qwe.asd.zxc.', function (e) {});
                            } catch (e) {
                                expect(e).to.be.instanceOf(Errors.UriError);
                            }

                            try {
                                await wampy.subscribe('qwe.asd..zxc', function (e) {});
                            } catch (e) {
                                expect(e).to.be.instanceOf(Errors.UriError);
                            }

                            try {
                                await wampy.subscribe('qq,ww,ee', function (e) {});
                            } catch (e) {
                                expect(e).to.be.instanceOf(Errors.UriError);
                            }

                            try {
                                await wampy.subscribe('qq:www:ee', function (e) {});
                            } catch (e) {
                                expect(e).to.be.instanceOf(Errors.UriError);
                            }

                            try {
                                await wampy.subscribe('qq,ww,ee', function (e) {});
                            } catch (e) {
                                expect(e).to.be.instanceOf(Errors.UriError);
                            }

                            done();

                        }, 1);
                    }
                }).disconnect();
            });

            it('checks for valid advanced options during subscribing to topic', async function () {
                try {
                    await wampy.subscribe('qqq.www.eee', function () {}, 'string instead of object');
                } catch (e) {
                    expect(e).to.be.instanceOf(Errors.InvalidParamError);
                }
                expect(wampy.getOpStatus().error.message).to.be.equal(WAMP_ERROR_MSG.INVALID_PARAM);

                try {
                    await wampy.subscribe('qqq.www.eee', function () {}, 123);
                } catch (e) {
                    expect(e).to.be.instanceOf(Errors.InvalidParamError);
                }
                expect(wampy.getOpStatus().error.message).to.be.equal(WAMP_ERROR_MSG.INVALID_PARAM);

                try {
                    await wampy.subscribe('qqq.www.eee', function () {}, function () {});
                } catch (e) {
                    expect(e).to.be.instanceOf(Errors.InvalidParamError);
                }
                expect(wampy.getOpStatus().error.message).to.be.equal(WAMP_ERROR_MSG.INVALID_PARAM);

                try {
                    await wampy.subscribe('qqq.www.eee', function () {}, { 'match': 'invalid' });
                } catch (e) {
                    expect(e).to.be.instanceOf(Errors.InvalidParamError);
                }
                expect(wampy.getOpStatus().error.message).to.be.equal(WAMP_ERROR_MSG.INVALID_PARAM);
            });

            it('disallows to subscribe to topic without specifying callback', async function () {
                try {
                    await wampy.subscribe('qqq.www.eee');
                } catch (e) {
                    expect(e).to.be.instanceOf(Errors.NoCallbackError);
                }

                try {
                    await wampy.subscribe('qqq.www.eee', {});
                } catch (e) {
                    expect(e).to.be.instanceOf(Errors.NoCallbackError);
                }
            });

            it('allows to subscribe to topic with notification on subscribing', async function () {
                return wampy.subscribe('subscribe.topic2', function (e) { });
            });

            it('allows to subscribe to topic lax URI (with loose check option)', async function () {
                wampy.options({uriValidation: 'loose'});

                try {
                    await wampy.subscribe('qwe//adsa//dfff', function (e) {});
                } catch (e) {
                    throw e
                }
                wampy.options({uriValidation: 'strict'});
            });


            it('allows to setup multiple handlers to same topic', async function () {
                await wampy.subscribe('subscribe.topic2', function (e) {});
                expect(wampy.getOpStatus().code).to.be.equal(SUCCESS.code);

                await wampy.subscribe('subscribe.topic2', function (e) {});
                expect(wampy.getOpStatus().code).to.be.equal(SUCCESS.code);

                await wampy.subscribe('subscribe.topic2', function (e) {});
                expect(wampy.getOpStatus().code).to.be.equal(SUCCESS.code);
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
                }, { match: 'prefix' }).then(() => {
                    wampy.publish('subscribe.prefix.one', null, { exclude_me: false }).then(() => {
                        wampy.publish('subscribe.prefix.two.three', null, { exclude_me: false });
                    });
                });
                expect(wampy.getOpStatus().code).to.be.equal(SUCCESS.code);
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
                }, { match: 'wildcard' }).then(() => {
                    wampy.publish('subscribe.one.wildcard', null, { exclude_me: false }).then(() => {
                        wampy.publish('subscribe.two.wildcard', null, { exclude_me: false });
                    });
                });
                expect(wampy.getOpStatus().code).to.be.equal(SUCCESS.code);
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
                }).then(() => {
                    wampy.publish('subscribe.topic3').then(() => {
                        wampy.publish('subscribe.topic3', null, { exclude_me: false, disclose_me: true });
                    });
                });
                expect(wampy.getOpStatus().code).to.be.equal(SUCCESS.code);
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
                }).then(() => {
                    wampy.publish('subscribe.topic4', 25).then(() => {
                        wampy.publish('subscribe.topic4', 25, { exclude_me: false, disclose_me: true });
                    });
                });
                expect(wampy.getOpStatus().code).to.be.equal(SUCCESS.code);
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
                }).then(() => {
                    wampy.publish('subscribe.topic5', 'payload').then(() => {
                        wampy.publish('subscribe.topic5', 'payload', { exclude_me: false, disclose_me: true });
                    });
                });
                expect(wampy.getOpStatus().code).to.be.equal(SUCCESS.code);
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
                }).then(() => {
                    wampy.publish('subscribe.topic6', [1, 2, 3, 4, 5]).then(() => {
                        wampy.publish('subscribe.topic6', [1, 2, 3, 4, 5], { exclude_me: false, disclose_me: true });
                    });
                });
                expect(wampy.getOpStatus().code).to.be.equal(SUCCESS.code);
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
                }).then(() => {
                    wampy.publish('subscribe.topic7', payload).then(() => {
                        wampy.publish('subscribe.topic7', payload, { exclude_me: false, disclose_me: true }).then(() => {
                            wampy.publish('subscribe.topic7', { argsDict: payload }, { exclude_me: false, disclose_me: true });
                        });
                    });
                });
                expect(wampy.getOpStatus().code).to.be.equal(SUCCESS.code);
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
                }).then(() => {
                    wampy.publish('subscribe.topic77', payload).then(() => {
                        wampy.publish('subscribe.topic77', payload, { exclude_me: false, disclose_me: true });
                    });
                });
                expect(wampy.getOpStatus().code).to.be.equal(SUCCESS.code);
            });

            it('allows to publish event with different advanced options', function (done) {
                wampy.subscribe('subscribe.topic8', function (e) {
                    expect(e).to.be.an('object');
                    expect(e.argsList).to.be.an('array');
                    expect(e.argsDict).to.be.undefined;
                    expect(e.argsList[0]).to.be.equal('payload');
                    done();
                }).then(() => {
                    wampy.publish('subscribe.topic8', 'payload',
                        {
                            exclude: [1234567],
                            exclude_authid: ['iuhfiruhfhr'],
                            exclude_authrole: ['user-role'],
                            eligible: [wampy.getSessionId(), 7654321],
                            eligible_authid: ['dsvsdvsfgdfg'],
                            eligible_authrole: ['admin-role'],
                            exclude_me: false,
                            disclose_me: true
                        });
                });
                expect(wampy.getOpStatus().code).to.be.equal(SUCCESS.code);
            });

            it('disallows to publish event to topic with invalid URI', function () {
                try {
                    wampy.publish('qwe.asd.zxc.', 'payload');
                } catch (e) {
                    expect(e).to.be.instanceOf(Errors.UriError);
                }
                expect(wampy.getOpStatus().error.message).to.be.equal(WAMP_ERROR_MSG.URI_ERROR);

                try {
                    wampy.publish('qwe.asd..zxc', 'payload');
                } catch (e) {
                    expect(e).to.be.instanceOf(Errors.UriError);
                }
                expect(wampy.getOpStatus().error.message).to.be.equal(WAMP_ERROR_MSG.URI_ERROR);

                try {
                    wampy.publish('qq,ww,ee', 'payload');
                } catch (e) {
                    expect(e).to.be.instanceOf(Errors.UriError);
                }
                expect(wampy.getOpStatus().error.message).to.be.equal(WAMP_ERROR_MSG.URI_ERROR);

                try {
                    wampy.publish('qq:www:ee', 'payload');
                } catch (e) {
                    expect(e).to.be.instanceOf(Errors.UriError);
                }
                expect(wampy.getOpStatus().error.message).to.be.equal(WAMP_ERROR_MSG.URI_ERROR);
            });

            it('checks for valid advanced options during publishing to topic', function () {
                try {
                    wampy.publish(
                        'qqq.www.eee',
                        'payload',
                        'string instead of object'
                    );
                } catch (e) {
                    expect(e).to.be.instanceOf(Errors.InvalidParamError);
                }
                expect(wampy.getOpStatus().error.message).to.be.equal(WAMP_ERROR_MSG.INVALID_PARAM);

                try {
                    wampy.publish(
                        'qqq.www.eee',
                        'payload',
                        123
                    );
                } catch (e) {
                    expect(e).to.be.instanceOf(Errors.InvalidParamError);
                }
                expect(wampy.getOpStatus().error.message).to.be.equal(WAMP_ERROR_MSG.INVALID_PARAM);

                try {
                    wampy.publish(
                        'qqq.www.eee',
                        'payload',
                        function () {
                        }
                    );
                } catch (e) {
                    expect(e).to.be.instanceOf(Errors.InvalidParamError);
                }
                expect(wampy.getOpStatus().error.message).to.be.equal(WAMP_ERROR_MSG.INVALID_PARAM);

                try {
                    wampy.publish(
                        'qqq.www.eee',
                        'payload',
                        {
                            exclude: 'string instead of number or array',
                            eligible: 1234567,
                            exclude_authid: 1234567,
                            exclude_authrole: 1234567,
                            eligible_authid: 1234567,
                            eligible_authrole: 1234567
                        }
                    );
                } catch (e) {
                    expect(e).to.be.instanceOf(Errors.InvalidParamError);
                }
                expect(wampy.getOpStatus().error.message).to.be.equal(WAMP_ERROR_MSG.INVALID_PARAM);

                try {
                    wampy.publish(
                        'qqq.www.eee',
                        'payload',
                        {
                            exclude: {},
                            eligible: 1234567,
                            exclude_authid: {},
                            exclude_authrole: false,
                            eligible_authid: {},
                            eligible_authrole: true
                        }
                    );
                } catch (e) {
                    expect(e).to.be.instanceOf(Errors.InvalidParamError);
                }
                expect(wampy.getOpStatus().error.message).to.be.equal(WAMP_ERROR_MSG.INVALID_PARAM);

                try {
                    wampy.publish(
                        'qqq.www.eee',
                        'payload',
                        {
                            exclude: 1234567,
                            eligible: 'string instead of number or array',
                            exclude_authid: [],
                            exclude_authrole: [],
                            eligible_authid: [],
                            eligible_authrole: []
                        }
                    );
                } catch (e) {
                    expect(e).to.be.instanceOf(Errors.InvalidParamError);
                }
                expect(wampy.getOpStatus().error.message).to.be.equal(WAMP_ERROR_MSG.INVALID_PARAM);

                try {
                    wampy.publish(
                        'qqq.www.eee',
                        'payload',
                        {
                            exclude: 1234567,
                            eligible: [],
                            exclude_authid: 'asdfsdafdsaf',
                            exclude_authrole: 'role-one',
                            eligible_authid: 'sadfdfdfdsa',
                            eligible_authrole: 'role-two'
                        }
                    );
                } catch (e) {
                    expect(e).to.be.instanceOf(Errors.InvalidParamError);
                }
                expect(wampy.getOpStatus().error.message).to.be.equal(WAMP_ERROR_MSG.INVALID_PARAM);

                try {
                    wampy.publish(
                        'qqq.www.eee',
                        'payload',
                        {
                            exclude: {},
                            eligible: {},
                            exclude_authid: ['asdfsdafdsaf', 'sddfdfsfdf'],
                            exclude_authrole: ['role-one', 'role-three'],
                            eligible_authid: ['sadfdfdfdsa', 'dsafdfhdfgh'],
                            eligible_authrole: ['role-two', 'role-four']
                        }
                    );
                } catch (e) {
                    expect(e).to.be.instanceOf(Errors.InvalidParamError);
                }

                try {
                    wampy.publish(
                        'qqq.www.eee',
                        'payload',
                        {
                            exclude: 'invalid string',
                            eligible: 'invalid string'
                        }
                    );
                } catch (e) {
                    expect(e).to.be.instanceOf(Errors.InvalidParamError);
                }
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
                    },
                    subscriptionId;

                wampy.subscribe('subscribe.topic9', handler1).then((s) => {
                    subscriptionId = s.subscriptionId;
                    return wampy.subscribe('subscribe.topic9', handler2);
                }).then(() => {
                    return wampy.subscribe('subscribe.topic9', handler3);
                }).then(() => {
                    return wampy.unsubscribe(subscriptionId, handler1);
                }).then(() => {
                    return wampy.unsubscribe(subscriptionId, handler3);
                }).then(() => {
                    return wampy.publish('subscribe.topic9', 'payload', { exclude_me: false });
                });
            });

            it('allows to unsubscribe all handlers from topic', async function () {
                await wampy.unsubscribe('subscribe.topic9-undefined');
                expect(wampy.getOpStatus().code).to.be.equal(SUCCESS.code);
            });

            it('receives error when trying to unsubscribe from non existent subscription', async function () {
                try {
                    await wampy.unsubscribe('subscription.id.non-exists');
                } catch (e) {
                    expect(e).to.be.instanceOf(Errors.NonExistUnsubscribeError);
                }
                expect(wampy.getOpStatus().error.message).to.be.equal(WAMP_ERROR_MSG.NON_EXIST_UNSUBSCRIBE);
            });

            it('fires error callback if error occurred during subscribing', async function () {
                try {
                    await wampy.subscribe('subscribe.topic10', function (e) { });
                } catch (e) {
                    expect(e).to.be.instanceOf(Errors.SubscribeError);
                }
            });

            it('fires error callback if error occurred during unsubscribing', async function () {
                try {
                    await wampy.unsubscribe('subscribe.topic3-undefined');
                } catch (e) {
                    expect(e).to.be.instanceOf(Errors.UnsubscribeError);
                }
            });

            it('fires error callback if error occurred during publishing', async function () {
                try {
                    await wampy.publish('subscribe.topic4');
                } catch (e) {
                    expect(e).to.be.instanceOf(Errors.PublishError);
                }
            });

        });

        describe('RPC module', function () {

            before(async function () {
                await wampy.options({
                    onReconnect  : null,
                    onError      : null
                }).disconnect();
                await wampy.connect();
            });

            it('disallows to call rpc if server does not provide DEALER role', async function () {
                try {
                    await wampy.call('call.rpc1', 'payload', function (e) {});
                } catch (e) {
                    expect(e).to.be.instanceOf(Errors.NoDealerError);
                }
            });

            it('disallows to cancel rpc if server does not provide DEALER role', async function () {
                try {
                    await wampy.cancel(1234567);
                } catch (e) {
                    expect(e).to.be.instanceOf(Errors.NoDealerError);
                }
            });

            it('disallows to register rpc if server does not provide DEALER role', async function () {
                try {
                    await wampy.register('call.rpc2', function (e) { });
                } catch (e) {
                    expect(e).to.be.instanceOf(Errors.NoDealerError);
                }
            });

            it('disallows to unregister rpc if server does not provide DEALER role', async function () {
                try {
                    await wampy.unregister('call.rpc3', function (e) { });
                } catch (e) {
                    expect(e).to.be.instanceOf(Errors.NoDealerError);
                }
            });

            it('disallows to register RPC with invalid URI', function (done) {
                wampy.options({
                    onClose: function () {
                        setTimeout(async function () {
                            await wampy.connect();

                            try {
                                await wampy.register('qwe.asd.zxc.', function (e) {});
                            } catch (e) {
                                expect(e).to.be.instanceOf(Errors.UriError);
                            }

                            try {
                                await wampy.register('qwe.asd..zxc', function (e) {});
                            } catch (e) {
                                expect(e).to.be.instanceOf(Errors.UriError);
                            }

                            try {
                                await wampy.register('qq,ww,ee', function (e) {});
                            } catch (e) {
                                expect(e).to.be.instanceOf(Errors.UriError);
                            }

                            try {
                                await wampy.register('qq:www:ee', function (e) {});
                            } catch (e) {
                                expect(e).to.be.instanceOf(Errors.UriError);
                            }

                            done();

                        }, 1);
                    }
                }).disconnect();
            });

            it('checks for valid advanced options during RPC registration', function () {
                try {
                    wampy.register(
                        'qqq.www.eee',
                        function (e) {},
                        {
                            match: 'invalidoption',
                            invoke: 'single'
                        }
                    );
                } catch (e) {
                    expect(e).to.be.instanceOf(Errors.InvalidParamError);
                }
                expect(wampy.getOpStatus().error.message).to.be.equal(WAMP_ERROR_MSG.INVALID_PARAM);

                try {
                    wampy.register(
                        'qqq.www.eee',
                        function (e) {},
                        {
                            match: 'prefix',
                            invoke: 'invalidoption'
                        }
                    );
                } catch (e) {
                    expect(e).to.be.instanceOf(Errors.InvalidParamError);
                }
                expect(wampy.getOpStatus().error.message).to.be.equal(WAMP_ERROR_MSG.INVALID_PARAM);

                try {
                    wampy.register(
                        'qqq.www.eee',
                        function (e) {},
                        'string instead of object'
                    );
                } catch (e) {
                    expect(e).to.be.instanceOf(Errors.InvalidParamError);
                }
                expect(wampy.getOpStatus().error.message).to.be.equal(WAMP_ERROR_MSG.INVALID_PARAM);
            });

            it('allows to register RPC', async function () {
                return wampy.register('register.rpc1', function (e) {});
            });

            it('allows to register prefix-based RPC', async function () {
                return wampy.register('register.prefix', function (e) {}, { match: 'prefix' });
            });

            it('allows to register wildcard-based RPC', async function () {
                return wampy.register('register..wildcard', function (e) {}, { match: 'wildcard' });
            });

            it('allows to specify invocation policy during RPC registration', async function () {
                return wampy.register('register.invocation.policy', function (e) {}, { invoke: 'roundrobin' });
            });

            it('disallows to register RPC with same name', async function () {
                try {
                    await wampy.register('register.rpc1', function (e) {});
                } catch (e) {
                    expect(e).to.be.instanceOf(Errors.RPCAlreadyRegisteredError);
                }
                expect(wampy.getOpStatus().error.message).to.be.equal(WAMP_ERROR_MSG.RPC_ALREADY_REGISTERED);
            });

            it('disallows to call RPC with invalid URI', async function () {
                try {
                    await wampy.call('qwe.asd.zxc.', 'payload', function (e) {});
                } catch (e) {
                    expect(e).to.be.instanceOf(Errors.UriError);
                }

                try {
                    await wampy.call('qwe.asd..zxc', 'payload', function (e) {});
                } catch (e) {
                    expect(e).to.be.instanceOf(Errors.UriError);
                }

                try {
                    await wampy.call('qq,ww,ee', 'payload', function (e) {});
                } catch (e) {
                    expect(e).to.be.instanceOf(Errors.UriError);
                }

                try {
                    await wampy.call('qq:www:ee', 'payload', function (e) {});
                } catch (e) {
                    expect(e).to.be.instanceOf(Errors.UriError);
                }
            });

            it('checks for valid advanced options on calling RPC', async function () {
                try {
                    await wampy.call(
                        'qqq.www.eee',
                        'payload',
                        'string instead of object'
                    );
                } catch (e) {
                    expect(e).to.be.instanceOf(Errors.InvalidParamError);
                }

                try {
                    await wampy.call(
                        'qqq.www.eee',
                        'payload',
                        123
                    );
                } catch (e) {
                    expect(e).to.be.instanceOf(Errors.InvalidParamError);
                }

                try {
                    await wampy.call(
                        'qqq.www.eee',
                        'payload',
                        function () {
                        }
                    );
                } catch (e) {
                    expect(e).to.be.instanceOf(Errors.InvalidParamError);
                }

                try {
                    await wampy.call(
                        'qqq.www.eee',
                        'payload',
                        {
                            timeout: 'string instead of number'
                        }
                    );
                } catch (e) {
                    expect(e).to.be.instanceOf(Errors.InvalidParamError);
                }

                try {
                    await wampy.call(
                        'qqq.www.eee',
                        'payload',
                        {
                            timeout: {}
                        }
                    );
                } catch (e) {
                    expect(e).to.be.instanceOf(Errors.InvalidParamError);
                }

                try {
                    await wampy.call(
                        'qqq.www.eee',
                        'payload',
                        {
                            timeout: true
                        }
                    );
                } catch (e) {
                    expect(e).to.be.instanceOf(Errors.InvalidParamError);
                }

                try {
                    await wampy.call(
                        'qqq.www.eee',
                        'payload',
                        {
                            progress_callback: true
                        }
                    );
                } catch (e) {
                    expect(e).to.be.instanceOf(Errors.InvalidParamError);
                }

                try {
                    await wampy.call(
                        'qqq.www.eee',
                        'payload',
                        {
                            progress_callback: 'not a function'
                        }
                    );
                } catch (e) {
                    expect(e).to.be.instanceOf(Errors.InvalidParamError);
                }
            });

            it('disallows to unregister rpc if there is no such registration', async function () {
                try {
                    await wampy.unregister('call.rpc4', function (e) {});
                } catch (e) {
                    expect(e).to.be.instanceOf(Errors.NonExistRPCUnregistrationError);
                }
                expect(wampy.getOpStatus().error.message).to.be.equal(WAMP_ERROR_MSG.NON_EXIST_RPC_UNREG);
            });

            it('allows to call RPC without payload', async function () {
                let res = await wampy.call('call.rpc1');
                expect(res).to.be.an('object');
                expect(res.argsList).to.be.undefined;
                expect(res.argsDict).to.be.undefined;
            });

            it('allows to call RPC with int payload', async function () {
                let res = await wampy.call('call.rpc2', 25);
                expect(res).to.be.an('object');
                expect(res.argsList).to.be.an('array');
                expect(res.argsDict).to.be.undefined;
                expect(res.argsList[0]).to.be.equal(25);
            });

            it('allows to call RPC with string payload', async function () {
                let res = await wampy.call('call.rpc3', 'payload');
                expect(res).to.be.an('object');
                expect(res.argsList).to.be.an('array');
                expect(res.argsDict).to.be.undefined;
                expect(res.argsList[0]).to.be.equal('payload');
            });

            it('allows to call RPC with array payload', async function () {
                let res = await wampy.call('call.rpc4', [1, 2, 3, 4, 5]);
                expect(res).to.be.an('object');
                expect(res.argsList).to.be.an('array');
                expect(res.argsDict).to.be.undefined;
                expect(res.argsList[0]).to.be.equal(1);
                expect(res.argsList[4]).to.be.equal(5);
            });

            it('allows to call RPC with hash-table payload', async function () {
                let payload = { key1: 100, key2: 'string-key' }, res;

                res = await wampy.call('call.rpc5', payload);
                expect(res).to.be.an('object');
                expect(res.argsList).to.be.an('array');
                expect(res.argsList).to.have.lengthOf(0);
                expect(res.argsDict).to.be.an('object');
                expect(res.argsDict).to.be.deep.equal(payload);

                res = await wampy.call('call.rpc5', { argsDict: payload });
                expect(res).to.be.an('object');
                expect(res.argsList).to.be.an('array');
                expect(res.argsList).to.have.lengthOf(0);
                expect(res.argsDict).to.be.an('object');
                expect(res.argsDict).to.be.deep.equal(payload);
            });

            it('allows to call RPC with both array and hash-table payload', async function () {
                let dictpayload = { key1: 100, key2: 'string-key' },
                    payload = { argsList: [1, 2, 3, 4, 5], argsDict: dictpayload };

                let res = await wampy.call('call.rpc5', payload);
                expect(res).to.be.an('object');
                expect(res.argsList).to.be.an('array');
                expect(res.argsList[0]).to.be.equal(1);
                expect(res.argsList[4]).to.be.equal(5);
                expect(res.argsDict).to.be.an('object');
                expect(res.argsDict).to.be.deep.equal(dictpayload);
            });

            it('disallows to call RPC with invalid payload using unified payload format', async function () {
                let payload = { argsList: 'not an array', argsDict: {} };
                try {
                    await wampy.call('call.rpc.fail', payload);
                } catch (e) {
                    expect(e).to.be.instanceOf(Errors.InvalidParamError);
                }
                expect(wampy.getOpStatus().error.message).to.be.equal(WAMP_ERROR_MSG.INVALID_PARAM);

                payload = { argsList: [123], argsDict: 'not an object' };
                try {
                    await wampy.call('call.rpc.fail', payload);
                } catch (e) {
                    expect(e).to.be.instanceOf(Errors.InvalidParamError);
                }
                expect(wampy.getOpStatus().error.message).to.be.equal(WAMP_ERROR_MSG.INVALID_PARAM);
            });

            it('allows to call RPC with different advanced options', async function () {
                let res = await wampy.call('call.rpc6', 'payload', {
                    disclose_me: true,
                    receive_progress: false,
                    timeout: 5000
                });
                expect(res).to.be.an('object');
                expect(res.argsList).to.be.an('array');
                expect(res.argsDict).to.be.undefined;
                expect(res.argsList[0]).to.be.equal('payload');
            });

            it('allows to call RPC with progressive result receiving', async function () {
                let progress = false;
                let res = await wampy.call(
                    'call.rpc7',
                    'payload',
                    {
                        progress_callback: function (e) {
                            expect(e).to.be.an('object');
                            expect(e.argsList).to.be.an('array');
                            expect(e.argsDict).to.be.undefined;
                            progress = true;
                        }
                    }
                );
                expect(res.argsList[0]).to.be.equal(100);
                expect(progress).to.be.true;
            });

            it('checks options during canceling RPC invocation', function (done) {
                let reqId;

                wampy.call(
                    'call.rpc8',
                    'payload',
                    {
                        progress_callback: function (res) {
                            expect(res).to.be.an('object');
                            expect(res.argsList).to.be.an('array');

                            try {
                                wampy.cancel(reqId, { mode: 'falseoption' });
                            } catch (e) {
                                expect(e).to.be.instanceOf(Errors.InvalidParamError);
                            }

                            try {
                                wampy.cancel(reqId, 'string_instead_of_object');
                            } catch (e) {
                                expect(e).to.be.instanceOf(Errors.InvalidParamError);
                            }

                            done();
                        }
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
                        progress_callback: function () {
                            wampy.cancel(reqId, { mode: 'kill' });
                        }
                    }
                ).catch((e) => {
                    done();
                });
                reqId = wampy.getOpStatus().reqId;
            });

            it('allows to unregister RPC', async function () {
                return wampy.unregister('register.rpc1');
            });

            it('allows to invoke asynchronous RPC without value', async function () {
                await wampy.register('register.rpc3', function (e) {
                    return new Promise(function (resolve, reject) {
                        setTimeout(function () {
                            resolve();
                        }, 1);
                    });
                });
                let res = await wampy.call(
                    'register.rpc3',
                    null,
                    { exclude_me: false }
                );
                expect(res).to.be.an('object');
                expect(res.argsList).to.be.undefined;
                expect(res.argsDict).to.be.undefined;
            });

            it('allows to invoke asynchronous RPC without value but with extra options', async function () {
                await wampy.register('register.rpc33', function (e) {
                    return new Promise(function (resolve, reject) {
                        setTimeout(function () {
                            resolve({ options: { extra: true } });
                        }, 1);
                    });
                });
                let res = await wampy.call(
                    'register.rpc33',
                    null,
                    { disclose_me: false }
                );
                expect(res).to.be.an('object');
                expect(res.details).to.be.an('object');
                expect(res.details.extra).to.be.true;
                expect(res.argsList).to.be.undefined;
                expect(res.argsDict).to.be.undefined;
            });

            it('allows to invoke pattern-based RPC providing original uri in options', async function () {
                await wampy.register('register.prefixbased', function (e) {
                    return new Promise(function (resolve, reject) {
                        setTimeout(function () {
                            expect(e.details).to.have.property('topic', 'register.prefixbased.maiden');
                            resolve();
                        }, 1);
                    });
                }, { match: 'prefix' });
                let res = await wampy.call('register.prefixbased.maiden');
                expect(res).to.be.an('object');
                expect(res.details).to.be.an('object');
                expect(res.argsList).to.be.undefined;
                expect(res.argsDict).to.be.undefined;
            });

            it('allows to invoke asynchronous RPC with single value', async function () {
                await wampy.register('register.rpc4', function (e) {
                    return new Promise(function (resolve, reject) {
                        setTimeout(function () {
                            resolve({ options: {}, argsList: [100] });
                        }, 1);
                    });
                });
                let res = await wampy.call(
                    'register.rpc4',
                    100
                );
                expect(res).to.be.an('object');
                expect(res.argsList).to.be.an('array');
                expect(res.argsDict).to.be.undefined;
                expect(res.argsList[0]).to.be.equal(100);
            });

            it('allows to invoke asynchronous RPC with array value', async function () {
                await wampy.register('register.rpc5', function (e) {
                    return new Promise(function (resolve, reject) {
                        setTimeout(function () {
                            resolve({ options: {}, argsList: [1, 2, 3, 4, 5] });
                        }, 1);
                    });
                });
                let res = await wampy.call(
                    'register.rpc5',
                    [1, 2, 3, 4, 5]
                );
                expect(res).to.be.an('object');
                expect(res.argsList).to.be.an('array');
                expect(res.argsDict).to.be.undefined;
                expect(res.argsList[0]).to.be.equal(1);
                expect(res.argsList[4]).to.be.equal(5);
            });

            it('allows to invoke asynchronous RPC with hash-table value', async function () {
                let payload = { key1: 100, key2: 'string-key' };
                await wampy.register('register.rpc6', function (e) {
                    return new Promise(function (resolve, reject) {
                        setTimeout(function () {
                            resolve({ options: {}, argsDict: payload });
                        }, 1);
                    });
                });
                let res = await wampy.call(
                    'register.rpc6',
                    payload
                );
                expect(res).to.be.an('object');
                expect(res.argsList).to.be.an('array');
                expect(res.argsList).to.have.lengthOf(0);
                expect(res.argsDict).to.be.an('object');
                expect(res.argsDict).to.be.deep.equal(payload);
            });

            it('allows to return progressive results from asynchronous RPC', async function () {
                let payload = 1;
                let progress = false;
                await wampy.register('register.rpc61', function (e) {

                    return new Promise(function (resolve, reject) {
                        for (let i = 1; i <= 5; i++) {
                            (function (j, p) {
                                setTimeout(function () {
                                    e.result_handler({ options: { progress: p }, argsList: [j] });
                                }, 10 * j);
                            }(i, i < 5));
                        }

                        setTimeout(function () {
                            resolve({ options: { progress: true }, argsList: [0] });
                        }, 1);
                    });
                });
                let res = await wampy.call(
                    'register.rpc61',
                    payload,
                    {
                        progress_callback: function () {
                            progress = true;
                        }
                    }
                );
                expect(res).to.be.an('object');
                expect(res.argsList).to.be.an('array');
                expect(res.argsList).to.have.lengthOf(1);
                expect(res.argsList[0]).to.be.equal(5);
                expect(progress).to.be.true;
                expect(res.details.progress).to.be.false;
            });

            it('calls error handler if asynchronous RPC was rejected', async function () {
                await wampy.register('register.rpc7', function (e) {
                    return new Promise(function (resolve, reject) {
                        setTimeout(function () {
                            reject('Rejecting promise rpc');
                        }, 1);
                    });
                });

                try {
                    await wampy.call('register.rpc7', 100);
                } catch (e) {
                    expect(e).to.be.instanceOf(Errors.CallError);
                }
            });

            it('calls error handler if asynchronous RPC raised exception', async function () {
                await wampy.register('register.rpc77', function (e) {
                    throw new Error('Raised exception in RPC');
                });

                try {
                    await wampy.call('register.rpc77', 100);
                } catch (e) {
                    expect(e).to.be.instanceOf(Errors.CallError);
                }
            });

            it('calls error handler with custom data if asynchronous RPC raised exception', async function () {
                let definedUri = 'app.error.custom_invocation_exception',
                    definedDetails = { key1: 'key1', key2: true, key3: 25 },
                    definedArgsList = [1, 2, 3, 4, 5],
                    definedArgsDict = { key1: 'key1', key2: true, key3: 25 };

                await wampy.register('register.rpc88', function (e) {
                    let UserException = function () {
                        this.error = definedUri;
                        this.details = definedDetails;
                        this.argsList = definedArgsList;
                        this.argsDict = definedArgsDict;
                    };

                    throw new UserException();
                });

                try {
                    await wampy.call('register.rpc88', 100);
                } catch (e) {
                    expect(e).to.be.instanceOf(Errors.CallError);
                    expect(e.errorUri).to.be.equal(definedUri);
                    expect(e.details).to.be.deep.equal(definedDetails);
                    expect(e.argsList).to.be.an('array');
                    expect(e.argsList[0]).to.be.equal(1);
                    expect(e.argsDict).to.be.deep.equal(definedArgsDict);
                }

                await wampy.register('register.rpc99', function (e) {
                    let UserException = function () {
                        this.error = definedUri;
                        // no details
                        // no args list, only args dict
                        this.argsDict = definedArgsDict;
                    };

                    throw new UserException();
                });

                try {
                    await wampy.call('register.rpc99', 100);
                } catch (e) {
                    expect(e).to.be.instanceOf(Errors.CallError);
                    expect(e.errorUri).to.be.equal(definedUri);
                    expect(e.details).to.be.deep.equal({});
                    expect(e.argsList).to.be.an('array');
                    expect(e.argsList).to.have.lengthOf(0);
                    expect(e.argsDict).to.be.deep.equal(definedArgsDict);
                }
            });

            it('calls error handler on trying to call nonexistent RPC', async function () {
                try {
                    await wampy.call('nonexistent.rpc', 100);
                } catch (e) {
                    expect(e).to.be.instanceOf(Errors.CallError);
                }
            });

            it('calls error handler on trying to unregister non existent RPC', function () {
                try {
                    wampy.unregister('register.nonexistent');
                } catch (e) {
                    expect(e).to.be.instanceOf(Errors.NonExistRPCUnregistrationError);
                }
            });

            it('disallows to unregister RPC with invalid URI', function () {
                try {
                    wampy.unregister('q:w:e');
                } catch (e) {
                    expect(e).to.be.instanceOf(Errors.UriError);
                }
            });

            it('disallows to register RPC without providing rpc itself', function () {
                try {
                    wampy.register('register.rpc8');
                } catch (e) {
                    expect(e).to.be.instanceOf(Errors.NoCallbackError);
                }
            });

            it('disallows to register RPC with the same name', async function () {
                await wampy.register('register.rpc9', function (e) {});

                try {
                    await wampy.register('register.rpc9', function (e) {});
                } catch (e) {
                    expect(e).to.be.instanceOf(Errors.RPCAlreadyRegisteredError);
                }
            });

            it('disallows to cancel non existent rpc invocation', function () {
                try {
                    wampy.cancel(1234567);
                } catch (e) {
                    expect(e).to.be.instanceOf(Errors.NonExistRPCReqIdError);
                }
            });

            it('fires error callback if error occurred during registering', async function () {
                try {
                    await wampy.register('call.rpc10', function (e) {});
                } catch (e) {
                    expect(e).to.be.instanceOf(Errors.RegisterError);
                }
            });

            it('fires error callback if error occurred during unregistering', async function () {
                try {
                    await wampy.unregister('register.rpc9');
                } catch (e) {
                    expect(e).to.be.instanceOf(Errors.UnregisterError);
                }
            });

            it('fires error handler if error occurred during RPC call', async function () {
                try {
                    await wampy.call('call.rpc1');
                } catch (e) {
                    expect(e).to.be.instanceOf(Errors.CallError);
                }

                try {
                    await wampy.call('call.rpc1', [1, 2, 3, 4, 5]);
                } catch (e) {
                    expect(e).to.be.instanceOf(Errors.CallError);
                    expect(e.errorUri).to.be.equal('call.error');
                    expect(e.argsList).to.be.an('array');
                    expect(e.argsList[0]).to.be.equal(1);
                    expect(e.argsList[4]).to.be.equal(5);
                    expect(e.argsList).to.have.lengthOf(5);
                    expect(e.argsDict).to.be.undefined;
                }

                try {
                    await wampy.call('call.rpc1', { k1: 1, k2: 2 });
                } catch (e) {
                    expect(e).to.be.instanceOf(Errors.CallError);
                    expect(e.errorUri).to.be.equal('call.error');
                    expect(e.argsList).to.be.an('array');
                    expect(e.argsList).to.have.lengthOf(0);
                    expect(e.argsDict).to.be.deep.equal({ k1: 1, k2: 2 });
                }
            });

        });

        describe('Payload PassThru Mode', function () {

            if (name === 'JSON Serializer' || name === 'MsgPack Serializer w/ Blob') {
                return;
            }

            before(async function () {
                await wampy.options({
                    payloadSerializers: {
                        json: new JsonSerializer(),
                        msgpack: new MsgpackSerializer(),
                        cbor: new CborSerializer()
                    },
                    onError: null,
                    onReconnect: null,
                    onClose: null
                }).disconnect();
                await wampy.connect();
            });

            it('disallows to publish event if server does not support PPT Mode', async function () {
                try {
                    await wampy.publish('qwe.asd.zxc',
                        25,
                        {
                            exclude_me: false,
                            ppt_scheme: 'x_custom_scheme'
                        }
                    );
                } catch (e) {
                    expect(e).to.be.instanceOf(Errors.PPTNotSupportedError);
                }
            });

            it('disallows to call rpc if server does not support PPT Mode', async function () {
                try {
                    await wampy.call('call.rpc1', 'payload', { ppt_scheme: 'x_custom_scheme' });
                } catch (e) {
                    expect(e).to.be.instanceOf(Errors.PPTNotSupportedError);
                }

                // To enable ppt mode on server for future tests
                await wampy.disconnect();
                await wampy.connect();
            });

            it('disallows to call RPC with invalid ppt serializer', async function () {
                try {
                    await wampy.call('rpc.call', 25, { ppt_scheme: 'x_custom', ppt_serializer: 'invalid_serializer' });
                } catch (e) {
                    expect(e).to.be.instanceOf(Errors.PPTSerializerInvalidError);
                }
            });

            it('disallows to publish with invalid ppt serializer', async function () {
                try {
                    await wampy.publish('qwe.asd.zxc', 25, { ppt_scheme: 'x_custom', ppt_serializer: 'invalid_serializer' });
                } catch (e) {
                    expect(e).to.be.instanceOf(Errors.PPTSerializerInvalidError);
                }
            });

            it('disallows to publish event if PPT Scheme is incorrect', async function () {
                try {
                    await wampy.publish('qwe.asd.zxc', 25, {
                        exclude_me: false, ppt_scheme: 'invalid_scheme'
                    });
                } catch (e) {
                    expect(e).to.be.instanceOf(Errors.PPTInvalidSchemeError);
                }
            });

            it('disallows to call rpc if PPT Scheme is incorrect', async function () {
                try {
                    await wampy.call('call.rpc1', 'payload', { ppt_scheme: 'invalid_scheme' });
                } catch (e) {
                    expect(e).to.be.instanceOf(Errors.PPTInvalidSchemeError);
                }
            });

            it('allows to publish event with int payload in ppt mode (custom scheme, native serializer)', function (done) {
                wampy.subscribe('subscribe.topic4', function (e) {
                    expect(e).to.be.an('object');
                    expect(e.argsList).to.be.an('array');
                    expect(e.argsDict).to.be.undefined;
                    expect(e.argsList[0]).to.be.equal(25);
                    expect(e.details).to.be.an('object');
                    expect(e.details.ppt_scheme).to.be.equal('x_custom_scheme');

                    done();
                }).then(() => {
                    wampy.publish('subscribe.topic4',
                        25,
                        {
                            exclude_me: false,
                            ppt_scheme: 'x_custom_scheme'
                        });
                });
                expect(wampy.getOpStatus().code).to.be.equal(SUCCESS.code);
            });

            it('allows to publish event with string payload in ppt mode (custom scheme, native serializer)', function (done) {
                wampy.subscribe('subscribe.topic5', function (e) {
                    expect(e).to.be.an('object');
                    expect(e.argsList).to.be.an('array');
                    expect(e.argsDict).to.be.undefined;
                    expect(e.argsList[0]).to.be.equal('payload');
                    expect(e.details).to.be.an('object');
                    expect(e.details.ppt_scheme).to.be.equal('x_custom_scheme');

                    done();
                }).then(() => {
                    wampy.publish('subscribe.topic5',
                        'payload',
                        {
                            exclude_me: false,
                            ppt_scheme: 'x_custom_scheme',
                        });
                });
                expect(wampy.getOpStatus().code).to.be.equal(SUCCESS.code);
            });

            it('allows to publish event with array payload in ppt mode (custom scheme, native serializer)', function (done) {
                wampy.subscribe('subscribe.topic6', function (e) {
                    expect(e).to.be.an('object');
                    expect(e.argsList).to.be.an('array');
                    expect(e.argsDict).to.be.undefined;
                    expect(e.argsList[0]).to.be.equal(1);
                    expect(e.argsList[4]).to.be.equal(5);
                    expect(e.details).to.be.an('object');
                    expect(e.details.ppt_scheme).to.be.equal('x_custom_scheme');

                    done();
                }).then(() => {
                    wampy.publish('subscribe.topic6',
                        [1, 2, 3, 4, 5],
                        {
                            exclude_me: false,
                            ppt_scheme: 'x_custom_scheme'
                        });
                });
                expect(wampy.getOpStatus().code).to.be.equal(SUCCESS.code);
            });

            it('allows to publish event with hash-table payload in ppt mode (custom scheme, native serializer)', function (done) {
                let payload = { key1: 100, key2: 'string-key' };

                wampy.subscribe('subscribe.topic7', function (e) {
                    expect(e).to.be.an('object');
                    expect(e.argsList).to.be.an('array');
                    expect(e.argsList).to.have.lengthOf(0);
                    expect(e.argsDict).to.be.an('object');
                    expect(e.argsDict).to.be.deep.equal(payload);
                    expect(e.details).to.be.an('object');
                    expect(e.details.ppt_scheme).to.be.equal('x_custom_scheme');

                    done();
                }).then(() => {
                    wampy.publish('subscribe.topic7',
                        { argsDict: payload },
                        {
                            exclude_me: false,
                            ppt_scheme: 'x_custom_scheme'
                        });
                });
                expect(wampy.getOpStatus().code).to.be.equal(SUCCESS.code);
            });

            it('allows to publish event with both array and hash-table payload in ppt mode (custom scheme, native serializer)', function (done) {
                let dictpayload = { key1: 100, key2: 'string-key' },
                    payload = { argsList: [1, 2, 3, 4, 5], argsDict: dictpayload };

                wampy.subscribe('subscribe.topic77', function (e) {
                    expect(e).to.be.an('object');
                    expect(e.argsList).to.be.an('array');
                    expect(e.argsList[0]).to.be.equal(1);
                    expect(e.argsList[4]).to.be.equal(5);
                    expect(e.argsDict).to.be.an('object');
                    expect(e.argsDict).to.be.deep.equal(dictpayload);
                    expect(e.details).to.be.an('object');
                    expect(e.details.ppt_scheme).to.be.equal('x_custom_scheme');

                    done();
                }).then(() => {
                    wampy.publish('subscribe.topic77',
                        payload,
                        {
                            exclude_me: false,
                            ppt_scheme: 'x_custom_scheme'
                        });
                });
                expect(wampy.getOpStatus().code).to.be.equal(SUCCESS.code);
            });

            it('allows to call RPC with int payload in ppt mode (custom scheme, native serializer)', async function () {
                let res = await wampy.call('call.rpc2', 25, { ppt_scheme: 'x_custom_scheme' });
                expect(res).to.be.an('object');
                expect(res.argsList).to.be.an('array');
                expect(res.argsDict).to.be.undefined;
                expect(res.argsList[0]).to.be.equal(25);
                expect(res.details).to.be.an('object');
                expect(res.details.ppt_scheme).to.be.equal('x_custom_scheme');
            });

            it('allows to call RPC with string payload in ppt mode (custom scheme, native serializer)', async function () {
                let res = await wampy.call('call.rpc3', 'payload', { ppt_scheme: 'x_custom_scheme' });
                expect(res).to.be.an('object');
                expect(res.argsList).to.be.an('array');
                expect(res.argsDict).to.be.undefined;
                expect(res.argsList[0]).to.be.equal('payload');
                expect(res.details).to.be.an('object');
                expect(res.details.ppt_scheme).to.be.equal('x_custom_scheme');
            });

            it('allows to call RPC with array payload in ppt mode (custom scheme, native serializer)', async function () {
                let res = await wampy.call('call.rpc4', [1, 2, 3, 4, 5], { ppt_scheme: 'x_custom_scheme' });
                expect(res).to.be.an('object');
                expect(res.argsList).to.be.an('array');
                expect(res.argsDict).to.be.undefined;
                expect(res.argsList[0]).to.be.equal(1);
                expect(res.argsList[4]).to.be.equal(5);
                expect(res.details).to.be.an('object');
                expect(res.details.ppt_scheme).to.be.equal('x_custom_scheme');
            });

            it('allows to call RPC with hash-table payload in ppt mode (custom scheme, native serializer)', async function () {
                let payload = { key1: 100, key2: 'string-key' }, res;

                res = await wampy.call('call.rpc5', payload, { ppt_scheme: 'x_custom_scheme' });
                expect(res).to.be.an('object');
                expect(res.argsList).to.be.an('array');
                expect(res.argsList).to.have.lengthOf(0);
                expect(res.argsDict).to.be.an('object');
                expect(res.argsDict).to.be.deep.equal(payload);
                expect(res.details).to.be.an('object');
                expect(res.details.ppt_scheme).to.be.equal('x_custom_scheme');

                res = await wampy.call('call.rpc5', { argsDict: payload }, { ppt_scheme: 'x_custom_scheme' });
                expect(res).to.be.an('object');
                expect(res.argsList).to.be.an('array');
                expect(res.argsList).to.have.lengthOf(0);
                expect(res.argsDict).to.be.an('object');
                expect(res.argsDict).to.be.deep.equal(payload);
                expect(res.details).to.be.an('object');
                expect(res.details.ppt_scheme).to.be.equal('x_custom_scheme');
            });

            it('allows to call RPC with both array and hash-table payload in ppt mode (custom scheme, native serializer)', async function () {
                let dictpayload = { key1: 100, key2: 'string-key' },
                    payload = { argsList: [1, 2, 3, 4, 5], argsDict: dictpayload };

                let res = await wampy.call('call.rpc5', payload, { ppt_scheme: 'x_custom_scheme' });
                expect(res).to.be.an('object');
                expect(res.argsList).to.be.an('array');
                expect(res.argsList[0]).to.be.equal(1);
                expect(res.argsList[4]).to.be.equal(5);
                expect(res.argsDict).to.be.an('object');
                expect(res.argsDict).to.be.deep.equal(dictpayload);
                expect(res.details).to.be.an('object');
                expect(res.details.ppt_scheme).to.be.equal('x_custom_scheme');
            });

            it('allows to publish event with int payload in ppt mode (custom scheme, cbor serializer)', function (done) {
                wampy.subscribe('subscribe.topic4.cbor', function (e) {
                    expect(e).to.be.an('object');
                    expect(e.argsList).to.be.an('array');
                    expect(e.argsDict).to.be.undefined;
                    expect(e.argsList[0]).to.be.equal(25);
                    expect(e.details).to.be.an('object');
                    expect(e.details.ppt_scheme).to.be.equal('x_custom_scheme');
                    expect(e.details.ppt_serializer).to.be.equal('cbor');

                    done();
                }).then(() => {
                    wampy.publish('subscribe.topic4.cbor',
                        25,
                        {
                            exclude_me: false,
                            ppt_scheme: 'x_custom_scheme',
                            ppt_serializer: 'cbor'
                        });
                });
                expect(wampy.getOpStatus().code).to.be.equal(SUCCESS.code);
            });

            it('allows to publish event with string payload in ppt mode (custom scheme, cbor serializer)', function (done) {
                wampy.subscribe('subscribe.topic5.cbor', function (e) {
                    expect(e).to.be.an('object');
                    expect(e.argsList).to.be.an('array');
                    expect(e.argsDict).to.be.undefined;
                    expect(e.argsList[0]).to.be.equal('payload');
                    expect(e.details).to.be.an('object');
                    expect(e.details.ppt_scheme).to.be.equal('x_custom_scheme');
                    expect(e.details.ppt_serializer).to.be.equal('cbor');

                    done();
                }).then(() => {
                    wampy.publish('subscribe.topic5.cbor',
                        'payload',
                        {
                            exclude_me: false,
                            ppt_scheme: 'x_custom_scheme',
                            ppt_serializer: 'cbor'
                        });
                });
                expect(wampy.getOpStatus().code).to.be.equal(SUCCESS.code);
            });

            it('allows to publish event with array payload in ppt mode (custom scheme, cbor serializer)', function (done) {
                wampy.subscribe('subscribe.topic6.cbor', function (e) {
                    expect(e).to.be.an('object');
                    expect(e.argsList).to.be.an('array');
                    expect(e.argsDict).to.be.undefined;
                    expect(e.argsList[0]).to.be.equal(1);
                    expect(e.argsList[4]).to.be.equal(5);
                    expect(e.details).to.be.an('object');
                    expect(e.details.ppt_scheme).to.be.equal('x_custom_scheme');
                    expect(e.details.ppt_serializer).to.be.equal('cbor');

                    done();
                }).then(() => {
                    wampy.publish('subscribe.topic6.cbor',
                        [1, 2, 3, 4, 5],
                        {
                            exclude_me: false,
                            ppt_scheme: 'x_custom_scheme',
                            ppt_serializer: 'cbor'
                        });
                });
                expect(wampy.getOpStatus().code).to.be.equal(SUCCESS.code);
            });

            it('allows to publish event with hash-table payload in ppt mode (custom scheme, cbor serializer)', function (done) {
                let payload = { key1: 100, key2: 'string-key' };

                wampy.subscribe('subscribe.topic7.cbor', function (e) {
                    expect(e).to.be.an('object');
                    expect(e.argsList).to.be.an('array');
                    expect(e.argsList).to.have.lengthOf(0);
                    expect(e.argsDict).to.be.an('object');
                    expect(e.argsDict).to.be.deep.equal(payload);
                    expect(e.details).to.be.an('object');
                    expect(e.details.ppt_scheme).to.be.equal('x_custom_scheme');
                    expect(e.details.ppt_serializer).to.be.equal('cbor');

                    done();
                }).then(() => {
                    wampy.publish('subscribe.topic7.cbor',
                        { argsDict: payload },
                        {
                            exclude_me: false,
                            ppt_scheme: 'x_custom_scheme',
                            ppt_serializer: 'cbor'
                        });
                });
                expect(wampy.getOpStatus().code).to.be.equal(SUCCESS.code);
            });

            it('allows to publish event with both array and hash-table payload in ppt mode (custom scheme, cbor serializer)', function (done) {
                let dictpayload = { key1: 100, key2: 'string-key' },
                    payload = { argsList: [1, 2, 3, 4, 5], argsDict: dictpayload };

                wampy.subscribe('subscribe.topic8.cbor', function (e) {
                    expect(e).to.be.an('object');
                    expect(e.argsList).to.be.an('array');
                    expect(e.argsList[0]).to.be.equal(1);
                    expect(e.argsList[4]).to.be.equal(5);
                    expect(e.argsDict).to.be.an('object');
                    expect(e.argsDict).to.be.deep.equal(dictpayload);
                    expect(e.details).to.be.an('object');
                    expect(e.details.ppt_scheme).to.be.equal('x_custom_scheme');
                    expect(e.details.ppt_serializer).to.be.equal('cbor');

                    done();
                }).then(() => {
                    wampy.publish('subscribe.topic8.cbor',
                        payload,
                        {
                            exclude_me: false,
                            ppt_scheme: 'x_custom_scheme',
                            ppt_serializer: 'cbor'
                        });
                });
                expect(wampy.getOpStatus().code).to.be.equal(SUCCESS.code);
            });

            it('allows to call RPC with int payload in ppt mode (custom scheme, cbor serializer)', async function () {
                let res = await wampy.call('call.rpc2', 25, { ppt_scheme: 'x_custom_scheme', ppt_serializer: 'cbor' });
                expect(res).to.be.an('object');
                expect(res.argsList).to.be.an('array');
                expect(res.argsDict).to.be.undefined;
                expect(res.argsList[0]).to.be.equal(25);
                expect(res.details).to.be.an('object');
                expect(res.details.ppt_scheme).to.be.equal('x_custom_scheme');
                expect(res.details.ppt_serializer).to.be.equal('cbor');
            });

            it('allows to call RPC with string payload in ppt mode (custom scheme, cbor serializer)', async function () {
                let res = await wampy.call('call.rpc3', 'payload', { ppt_scheme: 'x_custom_scheme', ppt_serializer: 'cbor' });
                expect(res).to.be.an('object');
                expect(res.argsList).to.be.an('array');
                expect(res.argsDict).to.be.undefined;
                expect(res.argsList[0]).to.be.equal('payload');
                expect(res.details).to.be.an('object');
                expect(res.details.ppt_scheme).to.be.equal('x_custom_scheme');
                expect(res.details.ppt_serializer).to.be.equal('cbor');
            });

            it('allows to call RPC with array payload in ppt mode (custom scheme, cbor serializer)', async function () {
                let res = await wampy.call('call.rpc4', [1, 2, 3, 4, 5], { ppt_scheme: 'x_custom_scheme', ppt_serializer: 'cbor' });
                expect(res).to.be.an('object');
                expect(res.argsList).to.be.an('array');
                expect(res.argsDict).to.be.undefined;
                expect(res.argsList[0]).to.be.equal(1);
                expect(res.argsList[4]).to.be.equal(5);
                expect(res.details).to.be.an('object');
                expect(res.details.ppt_scheme).to.be.equal('x_custom_scheme');
                expect(res.details.ppt_serializer).to.be.equal('cbor');
            });

            it('allows to call RPC with hash-table payload in ppt mode (custom scheme, cbor serializer)', async function () {
                let payload = { key1: 100, key2: 'string-key' }, res;

                res = await wampy.call('call.rpc5', payload, { ppt_scheme: 'x_custom_scheme', ppt_serializer: 'cbor' });
                expect(res).to.be.an('object');
                expect(res.argsList).to.be.an('array');
                expect(res.argsList).to.have.lengthOf(0);
                expect(res.argsDict).to.be.an('object');
                expect(res.argsDict).to.be.deep.equal(payload);
                expect(res.details).to.be.an('object');
                expect(res.details.ppt_scheme).to.be.equal('x_custom_scheme');
                expect(res.details.ppt_serializer).to.be.equal('cbor');

                res = await wampy.call('call.rpc5', { argsDict: payload }, { ppt_scheme: 'x_custom_scheme', ppt_serializer: 'cbor' });
                expect(res).to.be.an('object');
                expect(res.argsList).to.be.an('array');
                expect(res.argsList).to.have.lengthOf(0);
                expect(res.argsDict).to.be.an('object');
                expect(res.argsDict).to.be.deep.equal(payload);
                expect(res.details).to.be.an('object');
                expect(res.details.ppt_scheme).to.be.equal('x_custom_scheme');
                expect(res.details.ppt_serializer).to.be.equal('cbor');
            });

            it('allows to call RPC with both array and hash-table payload in ppt mode (custom scheme, cbor serializer)', async function () {
                let dictpayload = { key1: 100, key2: 'string-key' },
                    payload = { argsList: [1, 2, 3, 4, 5], argsDict: dictpayload };

                let res = await wampy.call('call.rpc5', payload, { ppt_scheme: 'x_custom_scheme', ppt_serializer: 'cbor' });
                expect(res).to.be.an('object');
                expect(res.argsList).to.be.an('array');
                expect(res.argsList[0]).to.be.equal(1);
                expect(res.argsList[4]).to.be.equal(5);
                expect(res.argsDict).to.be.an('object');
                expect(res.argsDict).to.be.deep.equal(dictpayload);
                expect(res.details).to.be.an('object');
                expect(res.details.ppt_scheme).to.be.equal('x_custom_scheme');
                expect(res.details.ppt_serializer).to.be.equal('cbor');
            });

            it('allows to publish event with int payload in ppt mode (custom scheme, msgpack serializer)', function (done) {
                wampy.subscribe('subscribe.topic4.msgpack', function (e) {
                    expect(e).to.be.an('object');
                    expect(e.argsList).to.be.an('array');
                    expect(e.argsDict).to.be.undefined;
                    expect(e.argsList[0]).to.be.equal(25);
                    expect(e.details).to.be.an('object');
                    expect(e.details.ppt_scheme).to.be.equal('x_custom_scheme');
                    expect(e.details.ppt_serializer).to.be.equal('msgpack');

                    done();
                }).then(() => {
                    wampy.publish('subscribe.topic4.msgpack',
                        25,
                        {
                            exclude_me: false,
                            ppt_scheme: 'x_custom_scheme',
                            ppt_serializer: 'msgpack'
                        });
                });
                expect(wampy.getOpStatus().code).to.be.equal(SUCCESS.code);
            });

            it('allows to publish event with string payload in ppt mode (custom scheme, msgpack serializer)', function (done) {
                wampy.subscribe('subscribe.topic5.msgpack', function (e) {
                    expect(e).to.be.an('object');
                    expect(e.argsList).to.be.an('array');
                    expect(e.argsDict).to.be.undefined;
                    expect(e.argsList[0]).to.be.equal('payload');
                    expect(e.details).to.be.an('object');
                    expect(e.details.ppt_scheme).to.be.equal('x_custom_scheme');
                    expect(e.details.ppt_serializer).to.be.equal('msgpack');

                    done();
                }).then(() => {
                    wampy.publish('subscribe.topic5.msgpack',
                        'payload',
                        {
                            exclude_me: false,
                            ppt_scheme: 'x_custom_scheme',
                            ppt_serializer: 'msgpack'
                        });
                });
                expect(wampy.getOpStatus().code).to.be.equal(SUCCESS.code);
            });

            it('allows to publish event with array payload in ppt mode (custom scheme, msgpack serializer)', function (done) {
                wampy.subscribe('subscribe.topic6.msgpack', function (e) {
                    expect(e).to.be.an('object');
                    expect(e.argsList).to.be.an('array');
                    expect(e.argsDict).to.be.undefined;
                    expect(e.argsList[0]).to.be.equal(1);
                    expect(e.argsList[4]).to.be.equal(5);
                    expect(e.details).to.be.an('object');
                    expect(e.details.ppt_scheme).to.be.equal('x_custom_scheme');
                    expect(e.details.ppt_serializer).to.be.equal('msgpack');

                    done();
                }).then(() => {
                    wampy.publish('subscribe.topic6.msgpack',
                        [1, 2, 3, 4, 5],
                        {
                            exclude_me: false,
                            ppt_scheme: 'x_custom_scheme',
                            ppt_serializer: 'msgpack'
                        });
                });
                expect(wampy.getOpStatus().code).to.be.equal(SUCCESS.code);
            });

            it('allows to publish event with hash-table payload in ppt mode (custom scheme, msgpack serializer)', function (done) {
                let payload = { key1: 100, key2: 'string-key' };

                wampy.subscribe('subscribe.topic7.msgpack', function (e) {
                    expect(e).to.be.an('object');
                    expect(e.argsList).to.be.an('array');
                    expect(e.argsList).to.have.lengthOf(0);
                    expect(e.argsDict).to.be.an('object');
                    expect(e.argsDict).to.be.deep.equal(payload);
                    expect(e.details).to.be.an('object');
                    expect(e.details.ppt_scheme).to.be.equal('x_custom_scheme');
                    expect(e.details.ppt_serializer).to.be.equal('msgpack');

                    done();
                }).then(() => {
                    wampy.publish('subscribe.topic7.msgpack',
                        { argsDict: payload },
                        {
                            exclude_me: false,
                            ppt_scheme: 'x_custom_scheme',
                            ppt_serializer: 'msgpack'
                        });
                });
                expect(wampy.getOpStatus().code).to.be.equal(SUCCESS.code);
            });

            it('allows to publish event with both array and hash-table payload in ppt mode (custom scheme, msgpack serializer)', function (done) {
                let dictpayload = { key1: 100, key2: 'string-key' },
                    payload = { argsList: [1, 2, 3, 4, 5], argsDict: dictpayload };

                wampy.subscribe('subscribe.topic8.msgpack', function (e) {
                    expect(e).to.be.an('object');
                    expect(e.argsList).to.be.an('array');
                    expect(e.argsList[0]).to.be.equal(1);
                    expect(e.argsList[4]).to.be.equal(5);
                    expect(e.argsDict).to.be.an('object');
                    expect(e.argsDict).to.be.deep.equal(dictpayload);
                    expect(e.details).to.be.an('object');
                    expect(e.details.ppt_scheme).to.be.equal('x_custom_scheme');
                    expect(e.details.ppt_serializer).to.be.equal('msgpack');

                    done();
                }).then(() => {
                    wampy.publish('subscribe.topic8.msgpack',
                        payload,
                        {
                            exclude_me: false,
                            ppt_scheme: 'x_custom_scheme',
                            ppt_serializer: 'msgpack'
                        });
                });
                expect(wampy.getOpStatus().code).to.be.equal(SUCCESS.code);
            });

            it('allows to call RPC with int payload in ppt mode (custom scheme, msgpack serializer)', async function () {
                let res = await wampy.call('call.rpc2', 25, { ppt_scheme: 'x_custom_scheme', ppt_serializer: 'msgpack' });
                expect(res).to.be.an('object');
                expect(res.argsList).to.be.an('array');
                expect(res.argsDict).to.be.undefined;
                expect(res.argsList[0]).to.be.equal(25);
                expect(res.details).to.be.an('object');
                expect(res.details.ppt_scheme).to.be.equal('x_custom_scheme');
                expect(res.details.ppt_serializer).to.be.equal('msgpack');
            });

            it('allows to call RPC with string payload in ppt mode (custom scheme, msgpack serializer)', async function () {
                let res = await wampy.call('call.rpc3', 'payload', { ppt_scheme: 'x_custom_scheme', ppt_serializer: 'msgpack' });
                expect(res).to.be.an('object');
                expect(res.argsList).to.be.an('array');
                expect(res.argsDict).to.be.undefined;
                expect(res.argsList[0]).to.be.equal('payload');
                expect(res.details).to.be.an('object');
                expect(res.details.ppt_scheme).to.be.equal('x_custom_scheme');
                expect(res.details.ppt_serializer).to.be.equal('msgpack');
            });

            it('allows to call RPC with array payload in ppt mode (custom scheme, msgpack serializer)', async function () {
                let res = await wampy.call('call.rpc4', [1, 2, 3, 4, 5], { ppt_scheme: 'x_custom_scheme', ppt_serializer: 'msgpack' });
                expect(res).to.be.an('object');
                expect(res.argsList).to.be.an('array');
                expect(res.argsDict).to.be.undefined;
                expect(res.argsList[0]).to.be.equal(1);
                expect(res.argsList[4]).to.be.equal(5);
                expect(res.details).to.be.an('object');
                expect(res.details.ppt_scheme).to.be.equal('x_custom_scheme');
                expect(res.details.ppt_serializer).to.be.equal('msgpack');
            });

            it('allows to call RPC with hash-table payload in ppt mode (custom scheme, msgpack serializer)', async function () {
                let payload = { key1: 100, key2: 'string-key' }, res;

                res = await wampy.call('call.rpc5', payload, { ppt_scheme: 'x_custom_scheme', ppt_serializer: 'msgpack' });
                expect(res).to.be.an('object');
                expect(res.argsList).to.be.an('array');
                expect(res.argsList).to.have.lengthOf(0);
                expect(res.argsDict).to.be.an('object');
                expect(res.argsDict).to.be.deep.equal(payload);
                expect(res.details).to.be.an('object');
                expect(res.details.ppt_scheme).to.be.equal('x_custom_scheme');
                expect(res.details.ppt_serializer).to.be.equal('msgpack');

                res = await wampy.call('call.rpc5', { argsDict: payload }, { ppt_scheme: 'x_custom_scheme', ppt_serializer: 'msgpack' });
                expect(res).to.be.an('object');
                expect(res.argsList).to.be.an('array');
                expect(res.argsList).to.have.lengthOf(0);
                expect(res.argsDict).to.be.an('object');
                expect(res.argsDict).to.be.deep.equal(payload);
                expect(res.details).to.be.an('object');
                expect(res.details.ppt_scheme).to.be.equal('x_custom_scheme');
                expect(res.details.ppt_serializer).to.be.equal('msgpack');
            });

            it('allows to call RPC with both array and hash-table payload in ppt mode (custom scheme, msgpack serializer)', async function () {
                let dictpayload = { key1: 100, key2: 'string-key' },
                    payload = { argsList: [1, 2, 3, 4, 5], argsDict: dictpayload };

                let res = await wampy.call('call.rpc5', payload, { ppt_scheme: 'x_custom_scheme', ppt_serializer: 'msgpack' });
                expect(res).to.be.an('object');
                expect(res.argsList).to.be.an('array');
                expect(res.argsList[0]).to.be.equal(1);
                expect(res.argsList[4]).to.be.equal(5);
                expect(res.argsDict).to.be.an('object');
                expect(res.argsDict).to.be.deep.equal(dictpayload);
                expect(res.details).to.be.an('object');
                expect(res.details.ppt_scheme).to.be.equal('x_custom_scheme');
                expect(res.details.ppt_serializer).to.be.equal('msgpack');
            });

            it('doesn\'t fail if event in ppt mode was received, while ppt serializer is not supported', function (done) {
                wampy.options({
                    payloadSerializers: {
                        json: new JsonSerializer(),
                    }
                }).subscribe('subscribe.topic.ppt.no.srzlr', function () {
                    // Bad event is omitted and the next one is received
                    done();
                });
            });

            it('doesn\'t fail if event in ppt mode was received, while payload decode fails', function (done) {
                wampy.options({
                    payloadSerializers: {
                        json: new JsonSerializer(),
                        cbor: new CborSerializer()
                    }
                }).subscribe('subscribe.topic.ppt.srzlr.fails', function () {
                    // Bad event is omitted and the next one is received
                    done();
                });
            });

            it('calls error handler if RPC Result is in ppt mode, while ppt serializer is not supported', async function () {
                await wampy.options({
                    payloadSerializers: {
                        json: new JsonSerializer()
                    }
                }).register('register.rpc.ppt.no.srlzr', function () {});

                try {
                    await wampy.call('register.rpc.ppt.no.srlzr', 100);
                } catch (e) {
                    expect(e).to.be.instanceOf(Errors.CallError);
                    expect(e.argsList[0]).to.be.equal(WAMP_ERROR_MSG.PPT_SRLZ_INVALID);
                }
            });

            it('calls error handler if RPC Result is in ppt mode, while ppt decoding fails', async function () {
                await wampy.options({
                    payloadSerializers: {
                        json: new JsonSerializer(),
                        cbor: new CborSerializer()
                    }
                }).register('register.rpc.ppt.srlzr.fail', function () {});

                try {
                    await wampy.call('register.rpc.ppt.srlzr.fail', 100);
                } catch (e) {
                    expect(e).to.be.instanceOf(Errors.CallError);
                    expect(e.argsList[0]).to.be.equal(WAMP_ERROR_MSG.PPT_SRLZ_ERR);
                }
            });

            it('calls error handler if RPC Invocation is in ppt mode, while ppt serializer is not supported', async function () {
                await wampy.options({
                    payloadSerializers: {
                        json: new JsonSerializer()
                    }
                }).register('register.rpc.ppt.invoke.no.srlzr', function () {});

                try {
                    await wampy.call('register.rpc.ppt.invoke.no.srlzr', 100);
                } catch (e) {
                    expect(e).to.be.instanceOf(Errors.CallError);
                    expect(e.argsList[0]).to.be.equal(WAMP_ERROR_MSG.PPT_SRLZ_INVALID);
                }
            });

            it('calls error handler if RPC Invocation is in ppt mode, while ppt decoding fails', async function () {
                await wampy.options({
                    payloadSerializers: {
                        json: new JsonSerializer(),
                        cbor: new CborSerializer()
                    }
                }).register('register.rpc.ppt.invoke.srlzr.fail', function () {});

                try {
                    await wampy.call('register.rpc.ppt.invoke.srlzr.fail', 100);
                } catch (e) {
                    expect(e).to.be.instanceOf(Errors.CallError);
                    expect(e.argsList[0]).to.be.equal(WAMP_ERROR_MSG.PPT_SRLZ_ERR);
                }
            });

            it('calls error handler if RPC YIELD is sent with wrong ppt_scheme', async function () {
                await wampy.options({
                    payloadSerializers: {
                        json: new JsonSerializer(),
                        cbor: new CborSerializer(),
                        msgpack: new MsgpackSerializer(),
                    }
                }).register('register.rpc.ppt.yield.invalid.scheme', function () {
                    return {
                        argsList: [100],
                        options : { ppt_scheme: 'invalid_scheme', ppt_serializer: 'cbor' }
                    };
                });

                try {
                    await wampy.call('register.rpc.ppt.yield.invalid.scheme', 100);
                } catch (e) {
                    expect(e).to.be.instanceOf(Errors.CallError);
                    expect(e.argsList[0]).to.be.equal(WAMP_ERROR_MSG.PPT_INVALID_SCHEME);
                }
            });

            it('calls error handler if RPC YIELD results PPT packing fails', async function () {
                await wampy.options({
                    payloadSerializers: {
                        json: new JsonSerializer(),
                        cbor: new CborSerializer(),
                        msgpack: new MsgpackSerializer(),
                    }
                }).register('register.rpc.ppt.yield.srzl.fails', function () {
                    let a = {}, b = {};
                    a.b = b;
                    b.a = a;

                    return {
                        argsList: [100],
                        argsDict: { a, b },
                        options : { ppt_scheme: 'x_custom_scheme', ppt_serializer: 'json' }
                    };
                });

                try {
                    await wampy.call('register.rpc.ppt.yield.srzl.fails', 100);
                } catch (e) {
                    expect(e).to.be.instanceOf(Errors.CallError);
                    expect(e.argsList[0]).to.be.equal(WAMP_ERROR_MSG.PPT_SRLZ_ERR);
                }
            });

            it('calls error handler if RPC YIELD results PPT serializer is not supported', async function () {
                await wampy.options({
                    payloadSerializers: {
                        json: new JsonSerializer(),
                        cbor: new CborSerializer()
                    }
                }).register('register.rpc.ppt.yield.srzl.not.supported', function () {
                    return {
                        argsList: [100],
                        options : { ppt_scheme: 'x_custom_scheme', ppt_serializer: 'msgpack' }
                    };
                });

                try {
                    await wampy.call('register.rpc.ppt.yield.srzl.not.supported', 100);
                } catch (e) {
                    expect(e).to.be.instanceOf(Errors.CallError);
                    expect(e.argsList[0]).to.be.equal(WAMP_ERROR_MSG.PPT_SRLZ_INVALID);
                }
            });

            it('allows to receive RPC Invocation in ppt mode', async function () {
                await wampy.options({
                    payloadSerializers: {
                        json: new JsonSerializer(),
                        msgpack: new MsgpackSerializer(),
                        cbor: new CborSerializer()
                    }
                }).register('register.rpc.ppt.invoke', function () {
                    return {
                        argsList: [100],
                        options : { ppt_scheme: 'x_custom_scheme', ppt_serializer: 'msgpack' }
                    };
                });

                return wampy.call('register.rpc.ppt.invoke', 100);
            });

            it('doesn\'t fail if event in ppt mode was received, while broker didn\'t announce it', function (done) {
                wampy.options({
                    payloadSerializers: {
                        json: new JsonSerializer(),
                        msgpack: new MsgpackSerializer(),
                        cbor: new CborSerializer()
                    },
                    onClose: function () {
                        setTimeout(async function () {
                            await wampy.connect();
                            await wampy.subscribe('subscribe.topic.noppt', function () {
                                // Bad event is omitted and the next one is received
                                done();
                            });
                        }, 1);
                    }
                }).disconnect();
            });

            it('calls error handler if RPC Result in ppt mode was received, while dealer didn\'t announce it', async function () {
                await wampy.options({
                    payloadSerializers: {
                        json: new JsonSerializer(),
                        msgpack: new MsgpackSerializer(),
                        cbor: new CborSerializer()
                    }
                }).register('register.rpc.no.ppt', function () {});

                try {
                    await wampy.call('register.rpc.no.ppt', 100);
                } catch (e) {
                    expect(e).to.be.instanceOf(Errors.CallError);
                    expect(e.argsList[0]).to.be.equal(WAMP_ERROR_MSG.PPT_NOT_SUPPORTED);
                }
            });

            it('aborts connection when receiving invocation in ppt mode, while dealer didn\'t announce it', function (done) {
                // This case should not happen at all, but for safety
                wampy.options({
                    autoReconnect: false,
                    payloadSerializers: {
                        json: new JsonSerializer(),
                        msgpack: new MsgpackSerializer(),
                        cbor: new CborSerializer()
                    },
                    onError: function () {
                        done();
                    },
                    onClose: null
                }).register('register.rpc.ppt.no.dealer.fail', function () {}).then(() => {
                    wampy.call('register.rpc.ppt.no.dealer.fail', 100);
                });
            });

            it('aborts connection if RPC YIELD is in ppt mode, while dealer didn\'t announce it', function (done) {
                wampy.options({
                    autoReconnect: false,
                    payloadSerializers: {
                        json: new JsonSerializer(),
                        cbor: new CborSerializer(),
                        msgpack: new MsgpackSerializer(),
                    },
                    onError: function () {
                        done();
                    },
                    onClose: null
                }).connect().then(() => {
                    wampy.register('register.rpc.ppt.yield.noppt', function () {
                        return {
                            argsList: [100],
                            options : { ppt_scheme: 'x_custom_scheme', ppt_serializer: 'msgpack' }
                        };
                    }).then(() => {
                        wampy.call('register.rpc.ppt.yield.noppt', 100);
                    });
                });
            });
        });
    });
});
