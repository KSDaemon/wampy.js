import { Wampy } from '../src/wampy.js';
import { CborSerializer } from '../src/serializers/cbor-serializer.js';
import { MsgpackSerializer } from '../src/serializers/msgpack-serializer.js';
import { JsonSerializer } from '../src/serializers/json-serializer.js';
import * as wampyCra from '../src/auth/wampcra/wampy-cra.js';
import * as wampyCS from '../src/auth/cryptosign/wampy-cryptosign.js';
import nacl from 'tweetnacl';
import WebSocket from 'ws';
import { logger } from './logger.js';
import type { AuthPlugin, WampyOptions } from '../src/types.js';

/** CLI argv shape expected by wampy-helpers */
interface CliArgv {
    url: string;
    realm: string;
    debug?: boolean;
    noReconnect?: boolean;
    reconnectInterval?: number;
    maxRetries?: number;
    uriValidation?: 'strict' | 'loose';
    serializer?: string;
    helloCustomDetails?: Record<string, unknown>;
    authid?: string;
    ticket?: string;
    secret?: string;
    privateKey?: string;
    ppt_scheme?: string;
    ppt_serializer?: string;
    ppt_cipher?: string;
    ppt_keyid?: string;
}

/** PPT options that can be filled from CLI argv */
interface PPTOptions {
    ppt_scheme?: string;
    ppt_serializer?: string;
    ppt_cipher?: string;
    ppt_keyid?: string;
}

function prepareOptions (argv: CliArgv): WampyOptions {
    const options: WampyOptions = {
        debug             : argv.debug,
        autoReconnect     : !argv.noReconnect,
        reconnectInterval : argv.reconnectInterval,
        maxRetries        : argv.maxRetries,
        realm             : argv.realm,
        uriValidation     : argv.uriValidation,
        ws                : WebSocket as unknown as WampyOptions['ws'],
        payloadSerializers: {
            json   : new JsonSerializer(),
            cbor   : new CborSerializer(),
            msgpack: new MsgpackSerializer()
        }
    };

    switch (argv.serializer) {
        case 'cbor':
            options.serializer = new CborSerializer();
            break;
        case 'msgpack':
            options.serializer = new MsgpackSerializer();
            break;
        default:
            options.serializer = new JsonSerializer();
            break;
    }

    if (argv.helloCustomDetails) {
        options.helloCustomDetails = argv.helloCustomDetails;
    }

    if (argv.authid) {
        options.authid = argv.authid;
        options.authmethods = [];
        options.authPlugins = {};

        if (argv.ticket) {
            options.authmethods.push('ticket');
            options.authPlugins.ticket = (function (userPassword: string) {
                return function () {
                    return userPassword;
                };
            }(argv.ticket));
        }

        if (argv.secret) {
            options.authmethods.push('wampcra');
            options.authPlugins.wampcra = wampyCra.sign(argv.secret) as unknown as AuthPlugin;
        }

        if (argv.privateKey) {
            const privateKey = wampyCS.hex2bytes(argv.privateKey);
            const keyPair = nacl.sign.keyPair.fromSeed(privateKey);
            const publicKey = keyPair.publicKey;
            const publicKeyHex = wampyCS.bytes2hex(publicKey);
            options.authmethods.push('cryptosign');
            options.authPlugins.cryptosign = wampyCS.sign(argv.privateKey) as unknown as AuthPlugin;
            options.authextra = {
                pubkey: publicKeyHex
            };
        }
        options.authMode = 'auto';
    }

    if (argv.debug) {
        options.onClose = function () {
            logger('Connection closing!');
        };
        options.onError = function (e: Error) {
            logger('Breakdown happened', e);
        };
        options.onReconnect = function () {
            logger('Reconnecting...');
        };
        options.onReconnectSuccess = function (welcomeDetails: Record<string, unknown>) {
            logger('Reconnection succeeded. Details:', welcomeDetails);
        };
    }

    return options;
}

export const getWampySession = async function (argv: CliArgv): Promise<Wampy> {
    const wampy = new Wampy(argv.url, prepareOptions(argv));

    try {
        await wampy.connect();
    } catch (error) {
        logger('connection failed', error);
        throw new Error('Can\'t connect to server!');
    }
    logger(`Connected to router at ${argv.url}`);

    process.on('SIGTERM', async () => {
        await wampy.disconnect();
        logger('Disconnected from router. Exiting...');
    });
    process.on('SIGINT', async () => {
        await wampy.disconnect();
        logger('Disconnected from router. Exiting...');
    });

    return wampy;
};

export const fillPPTOptions = function (options: PPTOptions, argv: CliArgv): PPTOptions {
    if (argv.ppt_scheme) {
        options.ppt_scheme = argv.ppt_scheme;
    }
    if (argv.ppt_serializer) {
        options.ppt_serializer = argv.ppt_serializer;
    }
    if (argv.ppt_cipher) {
        options.ppt_cipher = argv.ppt_cipher;
    }
    if (argv.ppt_keyid) {
        options.ppt_keyid = argv.ppt_keyid;
    }

    return options;
};

export type { CliArgv, PPTOptions };
