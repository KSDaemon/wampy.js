import { expect } from 'chai';
import websocket from 'websocket';
import { JsonSerializer } from '../src/serializers/json-serializer.js';
import { MsgpackSerializer } from '../src/serializers/msgpack-serializer.js';
import { Wampy } from './../src/wampy.js';
import type { WampyOptions } from '../src/types.js';

const defaultOptions: Partial<WampyOptions> = { realm: 'realm1', ws: websocket.w3cwebsocket as unknown as WampyOptions['ws'] };

describe('Wampy.js with Crossbar', function () {
    this.timeout(10000);

    const testUrl = 'ws://localhost:8888/test';

    const jsonSerializerOptions: Partial<WampyOptions> = { ...defaultOptions, serializer: new JsonSerializer() };
    const msgpackSerializerOptions: Partial<WampyOptions> = { ...defaultOptions, serializer: new MsgpackSerializer() };

    it('Works with Json serializer', async function () {
        const wampy = new Wampy(testUrl, jsonSerializerOptions as WampyOptions);

        await wampy.connect();
        await wampy.register('sayhello.test', () => { return { argsList: ['hello'] }; });

        const client = new Wampy(testUrl, jsonSerializerOptions as WampyOptions);

        await client.connect();
        const result = await client.call('sayhello.test', []);

        expect(result.argsList!.shift()).to.equal('hello');
    });

    it('works with Msgpack serialization', async function () {
        const wampy = new Wampy(testUrl, msgpackSerializerOptions as WampyOptions);

        await wampy.connect();
        await wampy.register('sayhello2', () => { return { argsList: ['hello'] }; });

        const client = new Wampy(testUrl, msgpackSerializerOptions as WampyOptions);

        await client.connect();
        const result = await client.call('sayhello2', []);

        expect(result.argsList!.shift()).to.equal('hello');
    });
});
