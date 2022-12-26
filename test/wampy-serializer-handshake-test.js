import { expect } from 'chai';
import { WebSocket, setProtocol as wsSetProtocol } from './fake-ws-set-protocol.js';
import { Wampy } from './../src/wampy.js';
import { JsonSerializer } from '../src/serializers/JsonSerializer.js';
import { CborSerializer } from '../src/serializers/CborSerializer.js';
import { NoSerializerAvailableError } from '../src/errors.js';

describe('Wampy.js Serializer Handshake', function () {
    this.timeout(0);

    const testUrl = 'ws://fake.server.org/ws/';
    const wampyCommonOptions = { realm: 'AppRealm', ws: WebSocket };
    const wampyOptionsWithJsonSerializer = { ...wampyCommonOptions, serializer: new JsonSerializer() };
    const wampyOptionsWithCborSerializer = { ...wampyCommonOptions, serializer: new CborSerializer() };

    it('disallows to connect when server choose not available serializer', async () => {
        try {
            const wampy = new Wampy(testUrl, wampyOptionsWithJsonSerializer);

            wsSetProtocol('cbor');
            await wampy.connect();
        } catch (e) {
            expect(e).to.be.instanceOf(NoSerializerAvailableError);
        }
    });

    it('calls onError if provided when server choose not available serializer',  async () => {
        try {
            const wampy = new Wampy(testUrl, {
                ...wampyOptionsWithJsonSerializer,
                onError: (e) => { expect(e).to.be.instanceOf(NoSerializerAvailableError); }
            });

            wsSetProtocol('cbor');
            await wampy.connect();
        } catch (e) {
            expect(e).to.be.instanceOf(NoSerializerAvailableError);
        }
    });

    it('falls back to Json serializer if server supports only that', async () => {
        const wampy = new Wampy(testUrl, wampyOptionsWithCborSerializer);

        wsSetProtocol('json');
        await wampy.connect();

        expect(wampy.options().serializer).to.be.instanceOf(JsonSerializer);
    });
});
