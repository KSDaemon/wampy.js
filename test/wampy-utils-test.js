/**
 * Project: wampy.js
 * User: KSDaemon
 * Date: 22.06.17
 */

const isNode = typeof process === 'object' &&
    Object.prototype.toString.call(process) === '[object process]';

import { expect } from 'chai';
import * as utils  from './../src/utils.js';
let getWebSocket = utils.getWebSocket;

function getPseudoBrowserWebSocket (wampy = {}) {
    return utils.getWebSocket({ ...wampy, isBrowserMock: true });
}

describe('Wampy.js Utils submodule', function () {
    this.timeout(0);

    describe('In node environment', function () {
        if (!isNode) {
            return;
        }

        it('disallows to create websocket object without providing url', function () {
            expect(getWebSocket()).to.be.null;
        });

        it('disallows to create websocket object without providing full qualified url', function () {
            expect(getWebSocket({ url: '/just/path' })).to.be.null;
            expect(getWebSocket({ url: 'example.com/' })).to.be.null;
            expect(getWebSocket({ url: 'example.com:3128/just/path' })).to.be.null;
        });

        it('disallows to create websocket instance without providing websocket class object', function () {
            const optionsWithoutWsClass = { url:'ws://example.com/ws/path', protocols: ['wamp.2.json'] };

            expect(getWebSocket(optionsWithoutWsClass)).to.be.null;

            const wsClass = function (url) { this.name = 'UserWebSocket'; this.url = url; };
            const optionsWithWsClass = { ...optionsWithoutWsClass, options: { ws: wsClass } };

            expect(getWebSocket(optionsWithWsClass)).to.be.instanceOf(wsClass);
        });
    });

    describe('In pseudo-browser environment (node-mock)', function () {
        if (!isNode) {
            return;
        }

        before(function () {
            getWebSocket = getPseudoBrowserWebSocket;
            global.window = { WebSocket: function (url) { this.name = 'WebSocket'; this.url = url; } };
        });

        it('allows to create websocket object without providing url', function () {
            global.window.location = { port: '', hostname: 'localhost', protocol: 'http:' };
            let ws = getWebSocket();
            expect(ws.name).to.be.equal('WebSocket');
            expect(ws.url).to.be.equal('ws://localhost/ws');

            global.window.location = { port: '8888', hostname: 'localhost', protocol: 'http:' };
            ws = getWebSocket();
            expect(ws.name).to.be.equal('WebSocket');
            expect(ws.url).to.be.equal('ws://localhost:8888/ws');

            global.window.location = { port: '', hostname: 'localhost', protocol: 'https:' };
            ws = getWebSocket();
            expect(ws.name).to.be.equal('WebSocket');
            expect(ws.url).to.be.equal('wss://localhost/ws');

            global.window.location = { port: '1234', hostname: 'localhost', protocol: 'https:' };
            ws = getWebSocket();
            expect(ws.name).to.be.equal('WebSocket');
            expect(ws.url).to.be.equal('wss://localhost:1234/ws');
        });

        it('allows to create websocket object with just path in url', function () {
            global.window.location = { port: '', hostname: 'localhost', protocol: 'http:' };
            let ws = getWebSocket({ url: '/websocket/wamp' });
            expect(ws.name).to.be.equal('WebSocket');
            expect(ws.url).to.be.equal('ws://localhost/websocket/wamp');

            global.window.location = { port: '8888', hostname: 'localhost', protocol: 'http:' };
            ws = getWebSocket({ url:'/websocket/wamp' });
            expect(ws.name).to.be.equal('WebSocket');
            expect(ws.url).to.be.equal('ws://localhost:8888/websocket/wamp');

            global.window.location = { port: '', hostname: 'localhost', protocol: 'https:' };
            ws = getWebSocket({ url:'/websocket/wamp' });
            expect(ws.name).to.be.equal('WebSocket');
            expect(ws.url).to.be.equal('wss://localhost/websocket/wamp');

            global.window.location = { port: '1234', hostname: 'localhost', protocol: 'https:' };
            ws = getWebSocket({ url:'/websocket/wamp' });
            expect(ws.name).to.be.equal('WebSocket');
            expect(ws.url).to.be.equal('wss://localhost:1234/websocket/wamp');
        });

        it('allows to create websocket object with domain+path url', function () {
            global.window.location = { port: '', hostname: 'localhost', protocol: 'http:' };
            let ws = getWebSocket({ url:'example.com/websocket/wamp' });
            expect(ws.name).to.be.equal('WebSocket');
            expect(ws.url).to.be.equal('ws://example.com/websocket/wamp');

            global.window.location = { port: '8888', hostname: 'localhost', protocol: 'http:' };
            ws = getWebSocket({ url:'example.com/websocket/wamp' });
            expect(ws.name).to.be.equal('WebSocket');
            expect(ws.url).to.be.equal('ws://example.com/websocket/wamp');

            global.window.location = { port: '', hostname: 'localhost', protocol: 'https:' };
            ws = getWebSocket({ url:'example.com/websocket/wamp' });
            expect(ws.name).to.be.equal('WebSocket');
            expect(ws.url).to.be.equal('wss://example.com/websocket/wamp');

            global.window.location = { port: '1234', hostname: 'localhost', protocol: 'https:' };
            ws = getWebSocket({ url:'example.com/websocket/wamp' });
            expect(ws.name).to.be.equal('WebSocket');
            expect(ws.url).to.be.equal('wss://example.com/websocket/wamp');
        });

        it('allows to create websocket object with full qualified url', function () {
            global.window.location = { port: '', hostname: 'localhost', protocol: 'http:' };
            let ws = getWebSocket({ url:'ws://example.com/websocket/wamp' });
            expect(ws.name).to.be.equal('WebSocket');
            expect(ws.url).to.be.equal('ws://example.com/websocket/wamp');

            global.window.location = { port: '8888', hostname: 'localhost', protocol: 'http:' };
            ws = getWebSocket({ url:'ws://example.com/websocket/wamp' });
            expect(ws.name).to.be.equal('WebSocket');
            expect(ws.url).to.be.equal('ws://example.com/websocket/wamp');

            global.window.location = { port: '', hostname: 'localhost', protocol: 'https:' };
            ws = getWebSocket({ url:'ws://example.com/websocket/wamp' });
            expect(ws.name).to.be.equal('WebSocket');
            expect(ws.url).to.be.equal('ws://example.com/websocket/wamp');

            global.window.location = { port: '1234', hostname: 'localhost', protocol: 'https:' };
            ws = getWebSocket({ url:'ws://example.com/websocket/wamp' });
            expect(ws.name).to.be.equal('WebSocket');
            expect(ws.url).to.be.equal('ws://example.com/websocket/wamp');

            global.window.location = { port: '', hostname: 'localhost', protocol: 'http:' };
            ws = getWebSocket({ url:'wss://example.com/websocket/wamp' });
            expect(ws.name).to.be.equal('WebSocket');
            expect(ws.url).to.be.equal('wss://example.com/websocket/wamp');

            global.window.location = { port: '8888', hostname: 'localhost', protocol: 'http:' };
            ws = getWebSocket({ url:'wss://example.com/websocket/wamp' });
            expect(ws.name).to.be.equal('WebSocket');
            expect(ws.url).to.be.equal('wss://example.com/websocket/wamp');

            global.window.location = { port: '', hostname: 'localhost', protocol: 'https:' };
            ws = getWebSocket({ url:'wss://example.com/websocket/wamp' });
            expect(ws.name).to.be.equal('WebSocket');
            expect(ws.url).to.be.equal('wss://example.com/websocket/wamp');

            global.window.location = { port: '1234', hostname: 'localhost', protocol: 'https:' };
            ws = getWebSocket({ url:'wss://example.com/websocket/wamp' });
            expect(ws.name).to.be.equal('WebSocket');
            expect(ws.url).to.be.equal('wss://example.com/websocket/wamp');

            // Test for returning MozWebSocket in old firefoxes
            delete global.window.WebSocket;
            global.window.MozWebSocket = function (url) { this.name = 'MozWebSocket'; this.url = url; };
            ws = getWebSocket({ url:'wss://example.com/websocket/wamp' });
            expect(ws.name).to.be.equal('MozWebSocket');
            expect(ws.url).to.be.equal('wss://example.com/websocket/wamp');
            delete global.window.MozWebSocket;
            global.window.WebSocket = function (url) { this.name = 'WebSocket'; this.url = url; };
        });

        it('disallows to create websocket instance if WebSocket object is not available in window', function () {
            delete global.window.WebSocket;
            expect(getWebSocket({ url:'ws://example.com/ws/path' })).to.be.null;
            global.window.WebSocket = function (url) { this.name = 'WebSocket'; this.url = url; };
        });

        after(function () {
            delete global.window;
        });
    });

    describe('In browser environment (real)', () => {
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
