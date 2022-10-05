
/**
 * Project: wampy.js
 * User: KSDaemon
 * Date: 13.06.17
 */
import { expect } from 'chai';
import { WebSocket, setProtocol as wsSetProtocol } from './fake-ws-set-protocol.js';
import { Wampy } from './../src/wampy.js';
import { JsonSerializer } from '../src/serializers/JsonSerializer.js';
import * as Errors from '../src/errors.js';

const routerUrl = 'ws://fake.server.org/ws/';

describe('Wampy.js Serializer Handshake', function () {
    this.timeout(0);

    it('disallows to connect when server choose not available serializer', async function () {
        let wampy = new Wampy(routerUrl, {
            realm: 'AppRealm',
            ws: WebSocket,
            serializer: new JsonSerializer()
        });
        wsSetProtocol('cbor');

        try {
            await wampy.connect();
        } catch (e) {
            expect(e).to.be.instanceOf(Errors.NoSerializerAvailableError);
        }
    });
});
