/**
 * Project: wampy.js
 * User: KSDaemon
 * Date: 22.06.17
 */

const isNode = typeof process === 'object' &&
    Object.prototype.toString.call(process) === '[object process]';

import { expect } from 'chai';
const utils = require('./../src/utils');
let getWebSocket = utils.getWebSocket;
const mock = require('mock-require');

describe('Wampy.js Utils submodule', function () {
    this.timeout(0);

    describe('In node enviroment', function () {

        if (!isNode) {
            return;
        }

        it('disallows to create websocket object without providing url', function () {
            expect(getWebSocket()).to.be.null;
        });

        it('disallows to create websocket object without providing full qualified url', function () {
            expect(getWebSocket('/just/path')).to.be.null;
            expect(getWebSocket('example.com/')).to.be.null;
            expect(getWebSocket('example.com:3128/just/path')).to.be.null;
        });

        it('disallows to create websocket instance without providing websocket class object', function () {
            let wsClass = function (url) { this.name = 'UserWebSocket'; this.url = url; };

            expect(getWebSocket('ws://example.com/ws/path')).to.be.null;

            let ws = getWebSocket('ws://example.com/ws/path', ['wamp.2.json'], wsClass);
            expect(ws).to.be.instanceOf(wsClass);
        });

    });

    describe('In browser enviroment (node-mock)', function () {

        if (!isNode) {
            return;
        }

        before(function () {
            mock('./../src/constants', { isNode: false });
            getWebSocket = mock.reRequire('./../src/utils').getWebSocket;
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
            let ws = getWebSocket('/websocket/wamp');
            expect(ws.name).to.be.equal('WebSocket');
            expect(ws.url).to.be.equal('ws://localhost/websocket/wamp');

            global.window.location = { port: '8888', hostname: 'localhost', protocol: 'http:' };
            ws = getWebSocket('/websocket/wamp');
            expect(ws.name).to.be.equal('WebSocket');
            expect(ws.url).to.be.equal('ws://localhost:8888/websocket/wamp');

            global.window.location = { port: '', hostname: 'localhost', protocol: 'https:' };
            ws = getWebSocket('/websocket/wamp');
            expect(ws.name).to.be.equal('WebSocket');
            expect(ws.url).to.be.equal('wss://localhost/websocket/wamp');

            global.window.location = { port: '1234', hostname: 'localhost', protocol: 'https:' };
            ws = getWebSocket('/websocket/wamp');
            expect(ws.name).to.be.equal('WebSocket');
            expect(ws.url).to.be.equal('wss://localhost:1234/websocket/wamp');
        });

        it('allows to create websocket object with domain+path url', function () {
            global.window.location = { port: '', hostname: 'localhost', protocol: 'http:' };
            let ws = getWebSocket('example.com/websocket/wamp');
            expect(ws.name).to.be.equal('WebSocket');
            expect(ws.url).to.be.equal('ws://example.com/websocket/wamp');

            global.window.location = { port: '8888', hostname: 'localhost', protocol: 'http:' };
            ws = getWebSocket('example.com/websocket/wamp');
            expect(ws.name).to.be.equal('WebSocket');
            expect(ws.url).to.be.equal('ws://example.com/websocket/wamp');

            global.window.location = { port: '', hostname: 'localhost', protocol: 'https:' };
            ws = getWebSocket('example.com/websocket/wamp');
            expect(ws.name).to.be.equal('WebSocket');
            expect(ws.url).to.be.equal('wss://example.com/websocket/wamp');

            global.window.location = { port: '1234', hostname: 'localhost', protocol: 'https:' };
            ws = getWebSocket('example.com/websocket/wamp');
            expect(ws.name).to.be.equal('WebSocket');
            expect(ws.url).to.be.equal('wss://example.com/websocket/wamp');
        });

        it('allows to create websocket object with full qualified url', function () {
            global.window.location = { port: '', hostname: 'localhost', protocol: 'http:' };
            let ws = getWebSocket('ws://example.com/websocket/wamp');
            expect(ws.name).to.be.equal('WebSocket');
            expect(ws.url).to.be.equal('ws://example.com/websocket/wamp');

            global.window.location = { port: '8888', hostname: 'localhost', protocol: 'http:' };
            ws = getWebSocket('ws://example.com/websocket/wamp');
            expect(ws.name).to.be.equal('WebSocket');
            expect(ws.url).to.be.equal('ws://example.com/websocket/wamp');

            global.window.location = { port: '', hostname: 'localhost', protocol: 'https:' };
            ws = getWebSocket('ws://example.com/websocket/wamp');
            expect(ws.name).to.be.equal('WebSocket');
            expect(ws.url).to.be.equal('ws://example.com/websocket/wamp');

            global.window.location = { port: '1234', hostname: 'localhost', protocol: 'https:' };
            ws = getWebSocket('ws://example.com/websocket/wamp');
            expect(ws.name).to.be.equal('WebSocket');
            expect(ws.url).to.be.equal('ws://example.com/websocket/wamp');

            global.window.location = { port: '', hostname: 'localhost', protocol: 'http:' };
            ws = getWebSocket('wss://example.com/websocket/wamp');
            expect(ws.name).to.be.equal('WebSocket');
            expect(ws.url).to.be.equal('wss://example.com/websocket/wamp');

            global.window.location = { port: '8888', hostname: 'localhost', protocol: 'http:' };
            ws = getWebSocket('wss://example.com/websocket/wamp');
            expect(ws.name).to.be.equal('WebSocket');
            expect(ws.url).to.be.equal('wss://example.com/websocket/wamp');

            global.window.location = { port: '', hostname: 'localhost', protocol: 'https:' };
            ws = getWebSocket('wss://example.com/websocket/wamp');
            expect(ws.name).to.be.equal('WebSocket');
            expect(ws.url).to.be.equal('wss://example.com/websocket/wamp');

            global.window.location = { port: '1234', hostname: 'localhost', protocol: 'https:' };
            ws = getWebSocket('wss://example.com/websocket/wamp');
            expect(ws.name).to.be.equal('WebSocket');
            expect(ws.url).to.be.equal('wss://example.com/websocket/wamp');

            // Test for returning MozWebSocket in old firefoxes
            delete global.window.WebSocket;
            global.window.MozWebSocket = function (url) { this.name = 'MozWebSocket'; this.url = url; };
            ws = getWebSocket('wss://example.com/websocket/wamp');
            expect(ws.name).to.be.equal('MozWebSocket');
            expect(ws.url).to.be.equal('wss://example.com/websocket/wamp');
            delete global.window.MozWebSocket;
            global.window.WebSocket = function (url) { this.name = 'WebSocket'; this.url = url; };
        });

        it('disallows to create websocket instance if WebSocket object is not available in window', function () {
            delete global.window.WebSocket;
            expect(getWebSocket('ws://example.com/ws/path')).to.be.null;
            global.window.WebSocket = function (url) { this.name = 'WebSocket'; this.url = url; };
        });

        after(function () {
            mock.stopAll();
            delete global.window;
        });

    });

    describe('In browser environment (real)', () => {

        if (isNode) {
            return;
        }

        it('allows to create websocket object without providing url', function () {
            let ws = getWebSocket();

            expect(ws.url).to.be.equal('ws://localhost:9876/ws');

        });

        it('allows to create websocket object with just path in url', function () {
            let ws = getWebSocket('/websocket/wamp');

            expect(ws.url).to.be.equal('ws://localhost:9876/websocket/wamp');
        });

        it('allows to create websocket object with domain+path url', function () {

            let ws = getWebSocket('example.com/websocket/wamp');

            expect(ws.url).to.be.equal('ws://example.com/websocket/wamp');

        });

        it('allows to create websocket object with full qualified url', function () {

            let ws = getWebSocket('ws://example.com/websocket/wamp');

            expect(ws.url).to.be.equal('ws://example.com/websocket/wamp');

            ws = getWebSocket('wss://example.com/websocket/wamp');

            expect(ws.url).to.be.equal('wss://example.com/websocket/wamp');

        });
    });

});
