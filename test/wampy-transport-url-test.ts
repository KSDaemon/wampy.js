import { expect } from 'chai';
import sinon from 'sinon';
import { getWebSocket } from '../src/utils.js';
import { Wampy } from '../src/wampy.js';
import { NoWsOrUrlError } from '../src/errors.js';
import { isNode, WAMP_MSG_SPEC } from '../src/constants.js';
import type { WampyOptions, WebSocketConstructor } from '../src/types.js';

class TransportAdapter {
    static instances: TransportAdapter[] = [];
    url: string;
    protocol = 'wamp.2.json';
    readyState = 1;
    onopen: (() => void) | null = null;
    onclose: (() => void) | null = null;
    onmessage: ((event: { data: string }) => void) | null = null;

    constructor (url: string) {
        this.url = url;
        TransportAdapter.instances.push(this);
        queueMicrotask(() => this.onopen?.());
    }

    send (data: string): void {
        const message = JSON.parse(data) as unknown[];
        const response = message[0] === WAMP_MSG_SPEC.HELLO
            ? [WAMP_MSG_SPEC.WELCOME, 123, { roles: { broker: {}, dealer: {} } }]
            : [WAMP_MSG_SPEC.GOODBYE, {}, 'wamp.close.normal'];
        queueMicrotask(() => this.onmessage?.({ data: JSON.stringify(response) }));
    }

    close (): void {
        this.readyState = 3;
        this.onclose?.();
    }
}

describe('Transport URL mode', function () {
    const clients: Wampy[] = [];

    afterEach(async function () {
        for (const client of clients.splice(0)) {
            client.setOptions({ autoReconnect: false });
            await client.disconnect();
        }
        sinon.restore();
        TransportAdapter.instances = [];
    });

    // Capture the transport boundary without imposing a WebSocket URL grammar.
    for (const isBrowserMock of [false, true]) {
        describe(isBrowserMock ? 'browser URL handling' : 'current environment URL handling', function () {
            for (const url of ['custom://router/path', '/relative/path', 'host/path', '', undefined]) {
                it(`passes ${JSON.stringify(url)} unchanged in passthrough mode`, function () {
                    const ws = sinon.spy();
                    getWebSocket({
                        url,
                        isBrowserMock,
                        options: { ws: ws as unknown as WebSocketConstructor, transportUrlMode: 'passthrough' }
                    });
                    expect(ws.calledOnce).to.be.true;
                    expect(ws.firstCall.args[0]).to.equal(url);
                });
            }

            it('preserves all adapter constructor arguments in passthrough mode', function () {
                const ws = sinon.spy();
                const protocols = ['wamp.2.json'];
                const additionalHeaders = { Authorization: 'test' };
                const wsRequestOptions = { timeout: 100 };
                getWebSocket({
                    url: 'custom://router',
                    protocols,
                    isBrowserMock,
                    options: {
                        ws: ws as unknown as WebSocketConstructor,
                        additionalHeaders,
                        wsRequestOptions,
                        transportUrlMode: 'passthrough'
                    }
                });
                expect(ws.firstCall.args).to.deep.equal([
                    'custom://router', protocols, null, additionalHeaders, wsRequestOptions
                ]);
            });
        });
    }

    it('uses the global browser WebSocket without processing the URL in passthrough mode', function () {
        const ws = sinon.stub(globalThis, 'WebSocket');
        getWebSocket({
            url: '/relative/path',
            isBrowserMock: true,
            options: { transportUrlMode: 'passthrough' }
        });
        expect(ws.calledOnce).to.be.true;
        expect(ws.firstCall.args).to.deep.equal(['/relative/path', undefined]);
    });

    describe('browser verification', function () {
        if (isNode) { return; }

        it('keeps browser URL completion in verify mode', function () {
            const ws = sinon.spy();
            getWebSocket({
                url: '/relative/path',
                isBrowserMock: true,
                options: { ws: ws as unknown as WebSocketConstructor, transportUrlMode: 'verify' }
            });
            const scheme = globalThis.location.protocol === 'https:' ? 'wss:' : 'ws:';
            expect(ws.firstCall.args[0]).to.equal(`${scheme}//${globalThis.location.host}/relative/path`);
        });
    });

    it('defaults to verify mode', function () {
        expect(new Wampy().getOptions().transportUrlMode).to.equal('verify');
    });

    describe('Node verification', function () {
        if (!isNode) { return; }

        it('keeps requiring an explicit transport in passthrough mode', async function () {
            const client = new Wampy('ws://router/path', {
                realm: 'realm1',
                transportUrlMode: 'passthrough'
            });
            let error: unknown;
            try {
                await client.connect();
            } catch (err) {
                error = err;
            }
            expect(error).to.be.instanceOf(NoWsOrUrlError);
        });

        it('keeps rejecting relative URLs in verify mode', function () {
            const ws = sinon.spy();
            expect(getWebSocket({
                url: '/relative/path',
                options: { ws: ws as unknown as WebSocketConstructor, transportUrlMode: 'verify' }
            })).to.be.null;
            expect(ws.called).to.be.false;
        });
    });

    for (const { name, initialUrl, connectUrl, expectedUrl } of [
        { name: 'custom URL', initialUrl: 'custom://router/path', expectedUrl: 'custom://router/path' },
        { name: 'omitted URL', expectedUrl: undefined },
        { name: 'empty constructor URL', initialUrl: '', expectedUrl: '' },
        { name: 'empty connect URL', initialUrl: 'custom://old', connectUrl: '', expectedUrl: '' }
    ]) {
        it(`connects and reconnects with an unchanged ${name}`, async function () {
            const reconnected = new Promise<void>((resolve) => {
                const options: WampyOptions = {
                    realm: 'realm1',
                    ws: TransportAdapter as unknown as WampyOptions['ws'],
                    transportUrlMode: 'passthrough',
                    reconnectInterval: 1,
                    onReconnectSuccess: () => resolve()
                };
                clients.push(initialUrl === undefined ? new Wampy(options) : new Wampy(initialUrl, options));
            });
            const client = clients[0];
            await client.connect(connectUrl);
            expect(client.getSessionId()).to.equal(123);
            TransportAdapter.instances[0].close();
            await reconnected;
            expect(TransportAdapter.instances.map(({ url }) => url)).to.deep.equal([
                expectedUrl, expectedUrl
            ]);
            await client.disconnect();
        });
    }
});
