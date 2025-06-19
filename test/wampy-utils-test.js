/**
 * Project: wampy.js
 * User: KSDaemon
 * Date: 22.06.17
 */

import { expect } from 'chai';
import * as utils  from './../src/utils.js';

const isNode = Object.prototype.toString.call(process) === '[object process]';
let getWebSocket = utils.getWebSocket;

function getPseudoBrowserWebSocket (configObject = {}) {
    return utils.getWebSocket({ ...configObject, isBrowserMock: true });
}

function ws(url) { this.name = 'UserWebSocket'; this.url = url; }

describe('Wampy.js Utils submodule', function () {
    this.timeout(0);

    describe('In node environment', function () {
        if (!isNode) {
            return;
        }

        const protocols = ['wamp.2.json'];
        const qualifiedUrl = 'ws://example.com/ws/path';

        it('disallows to create websocket object without providing a websocket class object', function () {
            expect(getWebSocket()).to.be.null;
            expect(getWebSocket({})).to.be.null;
            expect(getWebSocket({ protocols })).to.be.null;
            expect(getWebSocket({ protocols, url: qualifiedUrl })).to.be.null;
        });

        it('disallows to create websocket object without providing a fully qualified url', function () {
            expect(getWebSocket({ options: { ws } })).to.be.null;
            expect(getWebSocket({ options: { ws }, protocols })).to.be.null;
            expect(getWebSocket({ options: { ws }, protocols, url: '/just/path' })).to.be.null;
            expect(getWebSocket({ options: { ws }, protocols, url: 'example.com/' })).to.be.null;
            expect(getWebSocket({ options: { ws }, protocols, url: 'example.com:3128/just/path' })).to.be.null;
        });

        it('allows to create websocket object when ws class and fully qualified url are provided', function () {
            expect(getWebSocket({ options: { ws }, url: qualifiedUrl  })).to.be.instanceOf(ws);
            expect(getWebSocket({ options: { ws }, protocols, url: qualifiedUrl })).to.be.instanceOf(ws);
        });
    });

    describe('In pseudo-browser environment (node-mock)', function () {
        if (!isNode) {
            return;
        }

        let savedGlobalThis;

        before(function () {
            savedGlobalThis = globalThis;
            getWebSocket = getPseudoBrowserWebSocket;
            globalThis.WebSocket = function (url) { this.name = 'WebSocket'; this.url = url; };
        });

        it('allows to create websocket object without providing url', function () {
            globalThis.location = { port: '', hostname: 'localhost', protocol: 'http:' };
            let ws = getWebSocket();
            expect(ws.name).to.be.equal('WebSocket');
            expect(ws.url).to.be.equal('ws://localhost/ws');

            globalThis.location = { port: '8888', hostname: 'localhost', protocol: 'http:' };
            ws = getWebSocket();
            expect(ws.name).to.be.equal('WebSocket');
            expect(ws.url).to.be.equal('ws://localhost:8888/ws');

            globalThis.location = { port: '', hostname: 'localhost', protocol: 'https:' };
            ws = getWebSocket();
            expect(ws.name).to.be.equal('WebSocket');
            expect(ws.url).to.be.equal('wss://localhost/ws');

            globalThis.location = { port: '1234', hostname: 'localhost', protocol: 'https:' };
            ws = getWebSocket();
            expect(ws.name).to.be.equal('WebSocket');
            expect(ws.url).to.be.equal('wss://localhost:1234/ws');
        });

        it('allows to create websocket object with just path in url', function () {
            globalThis.location = { port: '', hostname: 'localhost', protocol: 'http:' };
            let ws = getWebSocket({ url: '/websocket/wamp' });
            expect(ws.name).to.be.equal('WebSocket');
            expect(ws.url).to.be.equal('ws://localhost/websocket/wamp');

            globalThis.location = { port: '8888', hostname: 'localhost', protocol: 'http:' };
            ws = getWebSocket({ url:'/websocket/wamp' });
            expect(ws.name).to.be.equal('WebSocket');
            expect(ws.url).to.be.equal('ws://localhost:8888/websocket/wamp');

            globalThis.location = { port: '', hostname: 'localhost', protocol: 'https:' };
            ws = getWebSocket({ url:'/websocket/wamp' });
            expect(ws.name).to.be.equal('WebSocket');
            expect(ws.url).to.be.equal('wss://localhost/websocket/wamp');

            globalThis.location = { port: '1234', hostname: 'localhost', protocol: 'https:' };
            ws = getWebSocket({ url:'/websocket/wamp' });
            expect(ws.name).to.be.equal('WebSocket');
            expect(ws.url).to.be.equal('wss://localhost:1234/websocket/wamp');
        });

        it('allows to create websocket object with domain+path url', function () {
            globalThis.location = { port: '', hostname: 'localhost', protocol: 'http:' };
            let ws = getWebSocket({ url:'example.com/websocket/wamp' });
            expect(ws.name).to.be.equal('WebSocket');
            expect(ws.url).to.be.equal('ws://example.com/websocket/wamp');

            globalThis.location = { port: '8888', hostname: 'localhost', protocol: 'http:' };
            ws = getWebSocket({ url:'example.com/websocket/wamp' });
            expect(ws.name).to.be.equal('WebSocket');
            expect(ws.url).to.be.equal('ws://example.com/websocket/wamp');

            globalThis.location = { port: '', hostname: 'localhost', protocol: 'https:' };
            ws = getWebSocket({ url:'example.com/websocket/wamp' });
            expect(ws.name).to.be.equal('WebSocket');
            expect(ws.url).to.be.equal('wss://example.com/websocket/wamp');

            globalThis.location = { port: '1234', hostname: 'localhost', protocol: 'https:' };
            ws = getWebSocket({ url:'example.com/websocket/wamp' });
            expect(ws.name).to.be.equal('WebSocket');
            expect(ws.url).to.be.equal('wss://example.com/websocket/wamp');
        });

        it('allows to create websocket object with full qualified url', function () {
            globalThis.location = { port: '', hostname: 'localhost', protocol: 'http:' };
            let ws = getWebSocket({ url:'ws://example.com/websocket/wamp' });
            expect(ws.name).to.be.equal('WebSocket');
            expect(ws.url).to.be.equal('ws://example.com/websocket/wamp');

            globalThis.location = { port: '8888', hostname: 'localhost', protocol: 'http:' };
            ws = getWebSocket({ url:'ws://example.com/websocket/wamp' });
            expect(ws.name).to.be.equal('WebSocket');
            expect(ws.url).to.be.equal('ws://example.com/websocket/wamp');

            globalThis.location = { port: '', hostname: 'localhost', protocol: 'https:' };
            ws = getWebSocket({ url:'ws://example.com/websocket/wamp' });
            expect(ws.name).to.be.equal('WebSocket');
            expect(ws.url).to.be.equal('ws://example.com/websocket/wamp');

            globalThis.location = { port: '1234', hostname: 'localhost', protocol: 'https:' };
            ws = getWebSocket({ url:'ws://example.com/websocket/wamp' });
            expect(ws.name).to.be.equal('WebSocket');
            expect(ws.url).to.be.equal('ws://example.com/websocket/wamp');

            globalThis.location = { port: '', hostname: 'localhost', protocol: 'http:' };
            ws = getWebSocket({ url:'wss://example.com/websocket/wamp' });
            expect(ws.name).to.be.equal('WebSocket');
            expect(ws.url).to.be.equal('wss://example.com/websocket/wamp');

            globalThis.location = { port: '8888', hostname: 'localhost', protocol: 'http:' };
            ws = getWebSocket({ url:'wss://example.com/websocket/wamp' });
            expect(ws.name).to.be.equal('WebSocket');
            expect(ws.url).to.be.equal('wss://example.com/websocket/wamp');

            globalThis.location = { port: '', hostname: 'localhost', protocol: 'https:' };
            ws = getWebSocket({ url:'wss://example.com/websocket/wamp' });
            expect(ws.name).to.be.equal('WebSocket');
            expect(ws.url).to.be.equal('wss://example.com/websocket/wamp');

            globalThis.location = { port: '1234', hostname: 'localhost', protocol: 'https:' };
            ws = getWebSocket({ url:'wss://example.com/websocket/wamp' });
            expect(ws.name).to.be.equal('WebSocket');
            expect(ws.url).to.be.equal('wss://example.com/websocket/wamp');

            // Test for returning MozWebSocket in old firefoxes
            delete globalThis.WebSocket;
            globalThis.MozWebSocket = function (url) { this.name = 'MozWebSocket'; this.url = url; };
            ws = getWebSocket({ url:'wss://example.com/websocket/wamp' });
            expect(ws.name).to.be.equal('MozWebSocket');
            expect(ws.url).to.be.equal('wss://example.com/websocket/wamp');
            delete globalThis.MozWebSocket;
            globalThis.WebSocket = function (url) { this.name = 'WebSocket'; this.url = url; };
        });

        it('disallows to create websocket instance if WebSocket object is not available in window', function () {
            delete globalThis.WebSocket;
            expect(getWebSocket({ url:'ws://example.com/ws/path' })).to.be.null;
            globalThis.WebSocket = function (url) { this.name = 'WebSocket'; this.url = url; };
        });

        after(function () {
            // eslint-disable-next-line no-global-assign
            globalThis = savedGlobalThis;
        });
    });

    describe('In browser environment (real)', function () {
        if (isNode) {
            return;
        }

        it('allows to create websocket object without providing url', function () {
            const ws = getWebSocket();

            expect(ws.url).to.be.equal('ws://localhost:9876/ws');
        });

        it('allows to create websocket object with just path in url', function () {
            const ws = getWebSocket({ url:'/websocket/wamp' });

            expect(ws.url).to.be.equal('ws://localhost:9876/websocket/wamp');
        });

        it('allows to create websocket object with domain+path url', function () {
            const ws = getWebSocket({ url:'example.com/websocket/wamp' });

            expect(ws.url).to.be.equal('ws://example.com/websocket/wamp');
        });

        it('allows to create websocket object with full qualified url', function () {
            let ws = getWebSocket({ url:'ws://example.com/websocket/wamp' });

            expect(ws.url).to.be.equal('ws://example.com/websocket/wamp');

            ws = getWebSocket({ url:'wss://example.com/websocket/wamp' });

            expect(ws.url).to.be.equal('wss://example.com/websocket/wamp');
        });
    });
});
