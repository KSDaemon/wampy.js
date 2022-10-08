import { expect } from 'chai';
import { MsgpackSerializer } from './../src/serializers/MsgpackSerializer.js';
import { JsonSerializer } from './../src/serializers/JsonSerializer.js';
import { Wampy } from './../src/wampy.js';
import websocket from 'websocket';
const w3cwebsocket = websocket.w3cwebsocket;

describe('Wampy.js with Crossbar', function () {
    this.timeout(10000);

    it('Works with Json serializer', function (done) {

        const wampy = new Wampy('ws://localhost:8888/test', {
            realm: 'realm1',
            serializer: new JsonSerializer(),
            ws: w3cwebsocket
        });

        wampy.connect().then(() => {
            wampy.register('sayhello', {
                rpc: () => {
                    return { argsList: 'hello' };
                }
            }).then(() => {
                const client = new Wampy('ws://localhost:8888/test', {
                    realm: 'realm1',
                    serializer: new JsonSerializer(),
                    ws: w3cwebsocket
                });
                client.connect().then(() => {
                    client.call('sayhello', []).then((result) => {
                        expect(result.argsList.shift()).to.equal('hello');
                        done();
                    });

                });
            });
        });

    });

    it('works with Msgpack serialization', function (done) {

        const wampy = new Wampy('ws://localhost:8888/test', {
            realm: 'realm1',
            serializer: new MsgpackSerializer(),
            ws: w3cwebsocket
        });

        wampy.connect().then(() => {
            wampy.register('sayhello2', {
                rpc: () => {
                    return { argsList: 'hello' };
                }
            }).then(() => {
                const client = new Wampy('ws://localhost:8888/test', {
                    realm: 'realm1',
                    serializer: new MsgpackSerializer(),
                    ws: w3cwebsocket
                });
                client.connect().then(() => {
                    client.call('sayhello2', []).then((result) => {
                        expect(result.argsList.shift()).to.equal('hello');
                        done();
                    });

                });
            });
        });

    });
});
