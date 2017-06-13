/**
 * Project: wampy.js
 * User: KSDaemon
 * Date: 13.06.17
 */

const routerUrl = 'ws://fake.server.org/ws/',
    root = (typeof process === 'object' &&
    Object.prototype.toString.call(process) === '[object process]') ?
        global : window;

import { expect } from 'chai';
import * as WebSocketModule from './fake-ws';
import { Wampy } from './../src/wampy';
import { CustomSerializer } from './CustomSerializer';
import * as WAMP_ERROR_MSG from './wamp-error-msg.json';

describe('Wampy.js Constructor', function () {
    this.timeout(0);

    it('disallows to connect on instantiation without websocket provided (in Node.js env)', function () {
        let wampy = new Wampy(routerUrl, { realm: 'AppRealm' }),
            opStatus = wampy.getOpStatus();

        expect(opStatus).to.be.deep.equal(WAMP_ERROR_MSG.NO_WS_OR_URL);
    });

    it('disallows to connect on instantiation without realm', function () {
        let wampy = new Wampy(routerUrl),
            opStatus = wampy.getOpStatus();

        expect(opStatus).to.be.deep.equal(WAMP_ERROR_MSG.NO_REALM);
    });

    it('Allows to create a wampy instance without router url and any options', function () {
        let wampy = new Wampy(),
            opStatus = wampy.getOpStatus();

        expect(opStatus.code).to.be.equal(0);
    });

    it('disallows to connect on instantiation without specifying all of [onChallenge, authid, authmethods]', function () {
        let wampy = new Wampy(routerUrl, { realm: 'AppRealm', authid: 'userid', authmethods: 'string' }),
            opStatus = wampy.getOpStatus();
        expect(opStatus).to.be.deep.equal(WAMP_ERROR_MSG.NO_CRA_CB_OR_ID);

        wampy = new Wampy(routerUrl, { realm: 'AppRealm', authid: 'userid', authmethods: ['wampcra'] }),
            opStatus = wampy.getOpStatus();
        expect(opStatus).to.be.deep.equal(WAMP_ERROR_MSG.NO_CRA_CB_OR_ID);

        wampy = new Wampy(routerUrl, {
            realm: 'AppRealm', authid: 'userid', onChallenge: function () {
            }
        }),
            opStatus = wampy.getOpStatus();
        expect(opStatus).to.be.deep.equal(WAMP_ERROR_MSG.NO_CRA_CB_OR_ID);

        wampy = new Wampy(routerUrl, {
            realm: 'AppRealm', authmethods: ['wampcra'], onChallenge: function () {
            }
        }),
            opStatus = wampy.getOpStatus();
        expect(opStatus).to.be.deep.equal(WAMP_ERROR_MSG.NO_CRA_CB_OR_ID);

        wampy = new Wampy(routerUrl, { realm: 'AppRealm', authid: 'userid' });
        opStatus = wampy.getOpStatus();
        expect(opStatus).to.be.deep.equal(WAMP_ERROR_MSG.NO_CRA_CB_OR_ID);

        wampy = new Wampy(routerUrl, { realm: 'AppRealm', authmethods: ['wampcra'] });
        opStatus = wampy.getOpStatus();
        expect(opStatus).to.be.deep.equal(WAMP_ERROR_MSG.NO_CRA_CB_OR_ID);

        wampy = new Wampy(routerUrl, {
            realm: 'AppRealm', onChallenge: function () {
            }
        });
        opStatus = wampy.getOpStatus();
        expect(opStatus).to.be.deep.equal(WAMP_ERROR_MSG.NO_CRA_CB_OR_ID);
    });

    it('throws exception when trying to use custom serializer with not supported binaryType', function () {
        // let wampy = new Wampy(routerUrl, {
        //         realm: 'AppRealm',
        //         onConnect: done('Connected to router with unsupported serializer!'),
        //         ws: WebSocketModule.WebSocket,
        //         serializer: new CustomSerializer()
        //     });


    });

});
