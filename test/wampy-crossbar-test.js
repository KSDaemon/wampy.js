import { expect } from 'chai';
import websocket from 'websocket';
import { JsonSerializer } from '../src/serializers/json-serializer.js';
import { MsgpackSerializer } from '../src/serializers/msgpack-serializer.js';
import { Wampy } from './../src/wampy.js';

const defaultOptions = { realm: 'realm1', ws: websocket.w3cwebsocket };

describe('Wampy.js with Crossbar', function () {
    this.timeout(10000);

    const testUrl = 'ws://localhost:8888/test';

    const jsonSerializerOptions = { ...defaultOptions, serializer: new JsonSerializer() };
    const msgpackSerializerOptions = { ...defaultOptions, serializer: new MsgpackSerializer() };

    it('Works with Json serializer', async function () {
        const wampy = new Wampy(testUrl, jsonSerializerOptions);

        await wampy.connect();
        await wampy.register('sayhello.test', () => { return { argsList: ['hello'] }; });

        const client = new Wampy(testUrl, jsonSerializerOptions);

        await client.connect();
        const result = await client.call('sayhello.test', []);

        expect(result.argsList.shift()).to.equal('hello');
    });

    it('works with Msgpack serialization', async function () {
        const wampy = new Wampy(testUrl, msgpackSerializerOptions);

        await wampy.connect();
        await wampy.register('sayhello2', () => { return { argsList: ['hello'] }; });

        const client = new Wampy(testUrl, msgpackSerializerOptions);

        await client.connect();
        const result = await client.call('sayhello2', []);

        expect(result.argsList.shift()).to.equal('hello');
    });
});
