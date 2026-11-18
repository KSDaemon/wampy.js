import { expect } from 'chai';
import { Wampy } from '../src/wampy.js';
import { UriError } from '../src/errors.js';

function queuedMessages (client: Wampy): unknown[][] {
    const { _wsQueue } = client as unknown as { _wsQueue: string[] };
    return _wsQueue.map(message => JSON.parse(message) as unknown[]);
}

async function expectQueued (
    client: Wampy, operation: Promise<unknown>, messageType: number, uri: string, match?: string
): Promise<void> {
    await Promise.race([operation, Promise.resolve()]);
    const messages = queuedMessages(client);
    expect(messages).to.have.lengthOf(1);
    expect(messages[0][0]).to.equal(messageType);
    expect(messages[0][1]).to.be.a('number');
    expect(messages[0][2]).to.deep.equal(match ? { match } : {});
    expect(messages[0][3]).to.equal(uri);
}

async function expectUriError (client: Wampy, operation: Promise<unknown>): Promise<void> {
    let error: unknown;
    try {
        await Promise.race([operation, Promise.resolve()]);
    } catch (e) {
        error = e;
    }
    expect(error).to.be.instanceOf(UriError);
    expect(queuedMessages(client)).to.have.lengthOf(0);
}

const wildcardUris = [
    'com.myapp..update',
    '.myapp.update',
    'com.myapp.',
    'a1...d4',
    'a1....e5',
    'a1..c3.d4..f6',
    'a1..c3..e5..g7',
    '.a1..c3.',
    '..myapp.update',
    'com.myapp..',
    '',
    '.',
    '..',
    '...'
];
const invalidUris = ['com.my app.update', 'com.my\tapp.update', 'com.my\napp.update', 'com.myapp.#'];

for (const uriValidation of ['strict', 'loose'] as const) {
    describe(`Wampy.js URI validation (${uriValidation})`, function () {
        let client: Wampy;

        beforeEach(function () {
            client = new Wampy({ realm: 'realm1', uriValidation });
        });

        for (const method of ['subscribe', 'register'] as const) {
            describe(`${method} patterns`, function () {
                for (const uri of wildcardUris) {
                    it(`allows wildcard URI ${JSON.stringify(uri)}`, async function () {
                        await expectQueued(client, client[method](uri, () => {}, { match: 'wildcard' }),
                            method === 'subscribe' ? 32 : 64, uri, 'wildcard');
                    });
                }

                for (const uri of ['', 'com.myapp.', 'com.myapp']) {
                    it(`allows prefix URI ${JSON.stringify(uri)}`, async function () {
                        await expectQueued(client, client[method](uri, () => {}, { match: 'prefix' }),
                            method === 'subscribe' ? 32 : 64, uri, 'prefix');
                    });
                }

                for (const match of ['wildcard', 'prefix'] as const) {
                    for (const uri of invalidUris) {
                        it(`rejects ${match} URI ${JSON.stringify(uri)}`, async function () {
                            await expectUriError(client, client[method](uri, () => {}, { match }));
                        });
                    }

                    for (const uri of ['com.my-app.update', 'com.my/app.update']) {
                        it(`${uriValidation === 'loose' ? 'allows' : 'rejects'} ${match} URI ${JSON.stringify(uri)}`, async function () {
                            const operation = client[method](uri, () => {}, { match });
                            if (uriValidation === 'loose') {
                                await expectQueued(client, operation, method === 'subscribe' ? 32 : 64, uri, match);
                            } else {
                                await expectUriError(client, operation);
                            }
                        });
                    }

                    it(`preserves uppercase letters and underscores in ${match} URIs`, async function () {
                        const uri = 'Com.My_app.Update1';
                        await expectQueued(client, client[method](uri, () => {}, { match }),
                            method === 'subscribe' ? 32 : 64, uri, match);
                    });
                }
            });
        }

        for (const uri of wildcardUris) {
            it(`rejects non-concrete URI ${JSON.stringify(uri)} without a subscription match policy`, async function () {
                await expectUriError(client, client.subscribe(uri, () => {}));
            });

            it(`rejects non-concrete URI ${JSON.stringify(uri)} with exact subscription matching`, async function () {
                await expectUriError(client, client.subscribe(uri, () => {}, { match: 'exact' }));
            });

            it(`rejects non-concrete URI ${JSON.stringify(uri)} without a registration match policy`, async function () {
                await expectUriError(client, client.register(uri, () => {}));
            });

            it(`rejects non-concrete publication URI ${JSON.stringify(uri)}`, async function () {
                await expectUriError(client, client.publish(uri));
            });

            it(`rejects non-concrete call URI ${JSON.stringify(uri)}`, async function () {
                await expectUriError(client, client.call(uri));
            });
        }

        for (const match of ['wildcard', 'prefix'] as const) {
            it(`rejects reserved application URI with ${match} registration matching`, async function () {
                await expectUriError(client, client.register('wamp.myapp.update', () => {}, { match }));
            });

            it(`allows meta API URI with ${match} subscription matching`, async function () {
                await expectQueued(client, client.subscribe('wamp.session.on_join', () => {}, { match }),
                    32, 'wamp.session.on_join', match);
            });
        }
    });
}
