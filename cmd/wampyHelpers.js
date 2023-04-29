import { Wampy } from '../src/wampy.js';
import { CborSerializer } from '../src/serializers/CborSerializer.js';
import { MsgpackSerializer } from '../src/serializers/MsgpackSerializer.js';
import { JsonSerializer } from '../src/serializers/JsonSerializer.js';
import * as wampyCra from 'wampy-cra';
import * as wampyCS from 'wampy-cryptosign';
import WebSocket from 'ws';
import { logger } from './logger.js';

function prepareOptions (argv) {
    const options = {
        debug             : argv.debug,
        autoReconnect     : !argv.noReconnect,
        reconnectInterval : argv.reconnectInterval,
        maxRetries        : argv.maxRetries,
        realm             : argv.realm,
        uriValidation     : argv.uriValidation,
        ws                : WebSocket,
        payloadSerializers: {
            json   : JsonSerializer,
            cbor   : CborSerializer,
            msgpack: MsgpackSerializer
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
            options.authPlugins.ticket = (function (userPassword) {
                return function () {
                    return userPassword;
                };
            }(argv.ticket));
        }

        if (argv.secret) {
            options.authmethods.push('wampcra');
            options.authPlugins.wampcra = wampyCra.sign(argv.secret);
        }

        if (argv.privateKey) {
            options.authmethods.push('cryptosign');
            options.authPlugins.cryptosign = wampyCS.sign(argv.privateKey);
            options.authextra = {
                pubkey: '' //TODO Derive public key from private
            };
        }
        options.authMode = 'auto';
    }

    if (argv.debug) {
        options.onClose = function () {
            logger('Connection closing!');
        };
        options.onError = function (e) {
            logger('Breakdown happened', e);
        };
        options.onReconnect = function () {
            logger('Reconnecting...');
        };
        options.onReconnectSuccess = function (welcomeDetails) {
            logger('Reconnection succeeded. Details:', welcomeDetails);
        };
    }

    return options;
}

export const getWampySession = async function (argv) {
    const wampy = new Wampy(argv.url, prepareOptions(argv));

    try {
        await wampy.connect();
    } catch (error) {
        logger('connection failed', error);
        throw new Error('Can\'t connect to server!');
    }
    logger(`Connected to router at ${argv.url}`);

    return wampy;
};
