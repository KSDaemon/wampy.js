const isNode = typeof process === 'object' &&
    Object.prototype.toString.call(process) === '[object process]';

if (!isNode) {
    require('core-js/es6');
}

import {expect} from 'chai';
import {MsgpackSerializer} from './../src/serializers/MsgpackSerializer';
import {JsonSerializer} from './../src/serializers/JsonSerializer';
import {Wampy} from './../src/wampy';
import {w3cwebsocket} from 'websocket';


describe('Wampy.js with Crossbar', () => {

    it('Works with Json serializer', function (done) {
        const server = new Wampy('ws://localhost:8888/test', {
            realm: 'realm1',
            serializer: new JsonSerializer(),
            ws: w3cwebsocket,
            onConnect: () => {
                server.register('sayhello', () => {
                    return { argsList: 'hello' };
                });
            }
        });


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
    });

    it('works with Msgpack serialization', done => {

        const server = new Wampy('ws://localhost:8888/test', {
            realm: 'realm1',
            serializer: new MsgpackSerializer(),
            ws: w3cwebsocket,
            onConnect: () => {
                server.register('sayhello', () => {
                    return { argsList: 'hello' };
                });
            }
        });

        const client = new Wampy('ws://localhost:8888/test', {
            realm: 'realm1',
            serializer: new MsgpackSerializer(),
            ws: w3cwebsocket,
            onConnect: () => {
                client.call('sayhello', [], result => {
                    expect(result.argsList.shift()).to.equal('hello');
                    done();
                });
            }
        });

    });
});