/**
 * Project: wampy.js
 * User: KSDaemon
 * Date: 13.06.17
 */


const isNode = typeof process === 'object' &&
    Object.prototype.toString.call(process) === '[object process]';

const routerUrl = 'ws://fake.server.org/ws/',
    root = isNode ? global : window;

import { expect } from 'chai';
import { WebSocket, setProtocol as wsSetProtocol } from './fake-ws-set-protocol';
import { Wampy } from './../src/wampy';
import { JsonSerializer } from '../src/serializers/JsonSerializer';
import { MsgpackSerializer } from './../src/serializers/MsgpackSerializer';
import { WAMP_ERROR_MSG } from './../src/constants';

describe('Wampy.js Constructor', function () {
    this.timeout(0);

    it('disallows to connect on instantiation without websocket provided (in Node.js env)', function () {
        if (!isNode) {
            return;
        }

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

        wampy = new Wampy(routerUrl, { realm: 'AppRealm', authid: 'userid', authmethods: ['wampcra'] });
        opStatus = wampy.getOpStatus();
        expect(opStatus).to.be.deep.equal(WAMP_ERROR_MSG.NO_CRA_CB_OR_ID);

        wampy = new Wampy(routerUrl, { realm: 'AppRealm', authid: 'userid', onChallenge: function () { } });
        opStatus = wampy.getOpStatus();
        expect(opStatus).to.be.deep.equal(WAMP_ERROR_MSG.NO_CRA_CB_OR_ID);

        wampy = new Wampy(routerUrl, { realm: 'AppRealm', authmethods: ['wampcra'], onChallenge: function () { } });
        opStatus = wampy.getOpStatus();
        expect(opStatus).to.be.deep.equal(WAMP_ERROR_MSG.NO_CRA_CB_OR_ID);

        wampy = new Wampy(routerUrl, { realm: 'AppRealm', authid: 'userid' });
        opStatus = wampy.getOpStatus();
        expect(opStatus).to.be.deep.equal(WAMP_ERROR_MSG.NO_CRA_CB_OR_ID);

        wampy = new Wampy(routerUrl, { realm: 'AppRealm', authmethods: ['wampcra'] });
        opStatus = wampy.getOpStatus();
        expect(opStatus).to.be.deep.equal(WAMP_ERROR_MSG.NO_CRA_CB_OR_ID);

        wampy = new Wampy(routerUrl, { realm: 'AppRealm', onChallenge: function () { } });
        opStatus = wampy.getOpStatus();
        expect(opStatus).to.be.deep.equal(WAMP_ERROR_MSG.NO_CRA_CB_OR_ID);
    });

    it('automatically selects serializer, chosen by server', function (done) {
        let wampy = new Wampy(routerUrl, {
            realm: 'AppRealm',
            ws: WebSocket,
            serializer: new MsgpackSerializer()
        });
        wsSetProtocol('json');
        root.setTimeout(function () {
            let options = wampy.options();
            expect(options.serializer).to.be.an.instanceof(JsonSerializer);
            done();
        }, 20);

    });

    it('disallows to connect when server choose not available serializer', function (done) {
        let wampy = new Wampy(routerUrl, {
            realm: 'AppRealm',
            ws: WebSocket,
            serializer: new JsonSerializer()
        });
        wsSetProtocol('cbor');
        root.setTimeout(function () {
            let opStatus = wampy.getOpStatus();
            expect(opStatus).to.be.deep.equal(WAMP_ERROR_MSG.NO_SERIALIZER_AVAILABLE);
            done();
        }, 20);

    });
});
