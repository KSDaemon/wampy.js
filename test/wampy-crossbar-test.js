import { expect } from 'chai';
import { MsgpackSerializer } from './../src/serializers/MsgpackSerializer';
import { JsonSerializer } from './../src/serializers/JsonSerializer';
import { Wampy } from './../src/wampy';
import { w3cwebsocket } from 'websocket';

describe('Wampy.js with Crossbar', function () {
    this.timeout(10000);

    it('Works with Json serializer', function (done) {

        const server = new Wampy('ws://localhost:8888/test', {
            realm: 'realm1',
            serializer: new JsonSerializer(),
            ws: w3cwebsocket,
            onConnect: () => {
                server.register('sayhello', {
                    rpc: () => {
                        return { argsList: 'hello' };
                    },
                    onSuccess: () => {
                        const client = new Wampy('ws://localhost:8888/test', {
                            realm: 'realm1',
                            serializer: new JsonSerializer(),
                            ws: w3cwebsocket,
                            onConnect: () => {
                                client.call('sayhello', [], result => {
                                    expect(result.argsList.shift()).to.equal('hello');
                                    done();
                                });
                            }
                        });
                    }
                });
            }
        });

    });

    it('works with Msgpack serialization', function (done) {

        const server = new Wampy('ws://localhost:8888/test', {
            realm: 'realm1',
            serializer: new MsgpackSerializer(),
            ws: w3cwebsocket,
            onConnect: () => {
                server.register('sayhello2', {
                    rpc: () => {
                        return { argsList: 'hello' };
                    },
                    onSuccess: () => {
                        const client = new Wampy('ws://localhost:8888/test', {
                            realm: 'realm1',
                            serializer: new MsgpackSerializer(),
                            ws: w3cwebsocket,
                            onConnect: () => {
                                client.call('sayhello2', [], result => {
                                    expect(result.argsList.shift()).to.equal('hello');
                                    done();
                                });
                            }
                        });
                    }
                });
            }
        });

    });
});
