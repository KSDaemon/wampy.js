import { expect } from 'chai';
import { Wampy } from '../src/wampy.js';
import { WAMP_MSG_SPEC } from '../src/constants.js';
import * as Errors from '../src/errors.js';
import { JsonSerializer } from '../src/serializers/json-serializer.js';
import { MsgpackSerializer } from '../src/serializers/msgpack-serializer.js';
import { CborSerializer } from '../src/serializers/cbor-serializer.js';
import type { Serializer } from '../src/serializers/serializer.js';
import type { CallResult, WampyCache } from '../src/types.js';

const topic = 'com.myapp.topic';
const requestCases = [
    { name: 'SUBSCRIBE', request: WAMP_MSG_SPEC.SUBSCRIBE, response: WAMP_MSG_SPEC.SUBSCRIBED,
        expected: { topic, subscriptionId: 201 }, error: Errors.SubscribeError },
    { name: 'UNSUBSCRIBE', request: WAMP_MSG_SPEC.UNSUBSCRIBE, response: WAMP_MSG_SPEC.UNSUBSCRIBED,
        expected: { topic }, error: Errors.UnsubscribeError },
    { name: 'PUBLISH', request: WAMP_MSG_SPEC.PUBLISH, response: WAMP_MSG_SPEC.PUBLISHED,
        expected: { topic, publicationId: 201 }, error: Errors.PublishError },
    { name: 'REGISTER', request: WAMP_MSG_SPEC.REGISTER, response: WAMP_MSG_SPEC.REGISTERED,
        expected: { topic, registrationId: 201 }, error: Errors.RegisterError },
    { name: 'UNREGISTER', request: WAMP_MSG_SPEC.UNREGISTER, response: WAMP_MSG_SPEC.UNREGISTERED,
        expected: { topic }, error: Errors.UnregisterError },
    { name: 'CALL', request: WAMP_MSG_SPEC.CALL, response: WAMP_MSG_SPEC.RESULT,
        expected: { details: {}, argsList: ['result'], argsDict: undefined }, error: Errors.CallError }
];

function sessionClient (serializer: Serializer): Wampy {
    const client = new Wampy({ realm: 'realm1', serializer });
    const { _cache } = client as unknown as { _cache: WampyCache };
    _cache.sessionId = 123;
    _cache.server_wamp_features = {
        roles: {
            broker: { features: {} },
            dealer: { features: { progressive_call_results: true } }
        }
    };
    return client;
}

function lastRequest (client: Wampy, serializer: Serializer): unknown[] {
    const { _wsQueue } = client as unknown as { _wsQueue: Array<string | ArrayBuffer | Uint8Array> };
    return serializer.decode(_wsQueue.at(-1)!) as unknown[];
}

async function receive (client: Wampy, serializer: Serializer, message: unknown[]): Promise<void> {
    await client._wsOnMessage({ data: serializer.encode(message) } as MessageEvent);
}

function successReply (messageType: number, requestId: number): unknown[] {
    if (messageType === WAMP_MSG_SPEC.RESULT) {
        return [messageType, requestId, {}, ['result']];
    }
    if (messageType === WAMP_MSG_SPEC.UNSUBSCRIBED || messageType === WAMP_MSG_SPEC.UNREGISTERED) {
        return [messageType, requestId];
    }
    return [messageType, requestId, 201];
}

function observe (operation: Promise<unknown>) {
    const results: unknown[] = [];
    const errors: unknown[] = [];
    const done = operation
        .then(result => { results.push(result); })
        .catch(error => { errors.push(error); });
    return { results, errors, done };
}

async function startRequest (client: Wampy, serializer: Serializer, requestType: number) {
    let operation: Promise<unknown>;
    switch (requestType) {
        case WAMP_MSG_SPEC.SUBSCRIBE:
            operation = client.subscribe(topic, () => {});
            break;
        case WAMP_MSG_SPEC.UNSUBSCRIBE: {
            const subscription = client.subscribe(topic, () => {});
            await receive(client, serializer, [WAMP_MSG_SPEC.SUBSCRIBED, lastRequest(client, serializer)[1], 101]);
            await subscription;
            operation = client.unsubscribe(101);
            break;
        }
        case WAMP_MSG_SPEC.PUBLISH:
            operation = client.publish(topic, ['payload'], { acknowledge: true });
            break;
        case WAMP_MSG_SPEC.REGISTER:
            operation = client.register(topic, () => {});
            break;
        case WAMP_MSG_SPEC.UNREGISTER: {
            const registration = client.register(topic, () => {});
            await receive(client, serializer, [WAMP_MSG_SPEC.REGISTERED, lastRequest(client, serializer)[1], 102]);
            await registration;
            operation = client.unregister(topic);
            break;
        }
        case WAMP_MSG_SPEC.CALL:
            operation = client.call(topic);
            break;
        default:
            throw new Error(`Unsupported test request type: ${requestType}`);
    }
    const observed = observe(operation);
    const request = lastRequest(client, serializer);
    expect(request[0]).to.equal(requestType);
    return { ...observed, requestId: request[1] as number };
}

for (const SerializerClass of [JsonSerializer, MsgpackSerializer, CborSerializer]) {
    describe(`Wampy.js request correlation (${SerializerClass.name})`, function () {
        let client: Wampy;
        let serializer: Serializer;

        beforeEach(function () {
            serializer = new SerializerClass();
            client = sessionClient(serializer);
        });

        for (const testCase of requestCases) {
            it(`ignores unknown ${testCase.name} reply IDs without losing the pending request`, async function () {
                const pending = await startRequest(client, serializer, testCase.request);

                await receive(client, serializer, successReply(testCase.response, 999));
                expect(pending.results).to.deep.equal([]);
                expect(pending.errors).to.deep.equal([]);

                await receive(client, serializer, successReply(testCase.response, pending.requestId));
                await pending.done;
                expect(pending.results).to.have.lengthOf(1);
                expect(pending.results[0]).to.deep.include(testCase.expected);
                expect(pending.errors).to.deep.equal([]);
            });

            it(`ignores duplicate ${testCase.name} replies without affecting a later request`, async function () {
                const completed = await startRequest(client, serializer, testCase.request);
                await receive(client, serializer, successReply(testCase.response, completed.requestId));
                await completed.done;
                const later = await startRequest(client, serializer, WAMP_MSG_SPEC.CALL);

                await receive(client, serializer, successReply(testCase.response, completed.requestId));
                expect(completed.results).to.have.lengthOf(1);
                expect(later.results).to.deep.equal([]);
                expect(later.errors).to.deep.equal([]);

                await receive(client, serializer, successReply(WAMP_MSG_SPEC.RESULT, later.requestId));
                await later.done;
                expect(later.results).to.deep.equal([{ details: {}, argsList: ['result'], argsDict: undefined }]);
            });

            it(`ignores unknown ERROR IDs for ${testCase.name} and rejects only the matching request`, async function () {
                const pending = await startRequest(client, serializer, testCase.request);

                await receive(client, serializer, [WAMP_MSG_SPEC.ERROR, testCase.request, 999, {}, 'com.myapp.failed']);
                expect(pending.results).to.deep.equal([]);
                expect(pending.errors).to.deep.equal([]);

                const errorReply = [WAMP_MSG_SPEC.ERROR, testCase.request, pending.requestId, {}, 'com.myapp.failed'];
                await receive(client, serializer, errorReply);
                await pending.done;
                expect(pending.results).to.deep.equal([]);
                expect(pending.errors).to.have.lengthOf(1);
                expect(pending.errors[0]).to.be.instanceOf(testCase.error);
                expect(pending.errors[0]).to.include({ errorUri: 'com.myapp.failed' });

                await receive(client, serializer, errorReply);
                expect(pending.errors).to.have.lengthOf(1);
            });

            it(`ignores success replies of other types for a pending ${testCase.name}`, async function () {
                const pending = await startRequest(client, serializer, testCase.request);

                for (const other of requestCases) {
                    if (other.request === testCase.request) {
                        continue;
                    }
                    await receive(client, serializer, successReply(other.response, pending.requestId));
                    expect(pending.results, other.name).to.deep.equal([]);
                    expect(pending.errors, other.name).to.deep.equal([]);
                }

                await receive(client, serializer, successReply(testCase.response, pending.requestId));
                await pending.done;
                expect(pending.results).to.have.lengthOf(1);
                expect(pending.results[0]).to.deep.include(testCase.expected);
                expect(pending.errors).to.deep.equal([]);
            });

            it(`ignores ERRORs naming other request types for a pending ${testCase.name}`, async function () {
                const pending = await startRequest(client, serializer, testCase.request);

                for (const other of requestCases) {
                    if (other.request === testCase.request) {
                        continue;
                    }
                    await receive(client, serializer, [
                        WAMP_MSG_SPEC.ERROR, other.request, pending.requestId, {}, 'com.myapp.wrong_type'
                    ]);
                    expect(pending.results, other.name).to.deep.equal([]);
                    expect(pending.errors, other.name).to.deep.equal([]);
                }

                await receive(client, serializer, [WAMP_MSG_SPEC.ERROR, testCase.request, pending.requestId, {}, 'com.myapp.failed']);
                await pending.done;
                expect(pending.results).to.deep.equal([]);
                expect(pending.errors).to.have.lengthOf(1);
                expect(pending.errors[0]).to.be.instanceOf(testCase.error);
                expect(pending.errors[0]).to.include({ errorUri: 'com.myapp.failed' });
            });
        }

        it('correlates mixed concurrent requests without consuming another operation on mismatched replies', async function () {
            const subscription = await startRequest(client, serializer, WAMP_MSG_SPEC.SUBSCRIBE);
            const publication = await startRequest(client, serializer, WAMP_MSG_SPEC.PUBLISH);
            const call = await startRequest(client, serializer, WAMP_MSG_SPEC.CALL);

            await receive(client, serializer, [WAMP_MSG_SPEC.PUBLISHED, subscription.requestId, 301]);
            await receive(client, serializer, [WAMP_MSG_SPEC.ERROR, WAMP_MSG_SPEC.SUBSCRIBE, publication.requestId, {}, 'com.myapp.wrong_type']);
            await receive(client, serializer, [WAMP_MSG_SPEC.RESULT, call.requestId, {}, ['call']]);
            await call.done;
            expect(subscription.results).to.deep.equal([]);
            expect(subscription.errors).to.deep.equal([]);
            expect(publication.results).to.deep.equal([]);
            expect(publication.errors).to.deep.equal([]);
            expect(call.results).to.deep.equal([{ details: {}, argsList: ['call'], argsDict: undefined }]);

            await receive(client, serializer, [WAMP_MSG_SPEC.PUBLISHED, publication.requestId, 302]);
            await publication.done;
            expect(publication.results).to.deep.equal([{ topic, requestId: publication.requestId, publicationId: 302 }]);
            expect(subscription.results).to.deep.equal([]);

            await receive(client, serializer, [WAMP_MSG_SPEC.SUBSCRIBED, subscription.requestId, 303]);
            await subscription.done;
            expect(subscription.results).to.deep.equal([{
                topic, requestId: subscription.requestId, subscriptionId: 303, subscriptionKey: topic
            }]);

            const events: unknown[] = [];
            await client.subscribe(topic, event => { events.push(event); });
            await receive(client, serializer, [WAMP_MSG_SPEC.EVENT, 303, 401, {}, ['event']]);
            expect(events).to.deep.equal([{ details: {}, argsList: ['event'], argsDict: undefined }]);
        });

        it('correlates concurrent calls whose results arrive in reverse order', async function () {
            const first = await startRequest(client, serializer, WAMP_MSG_SPEC.CALL);
            const second = await startRequest(client, serializer, WAMP_MSG_SPEC.CALL);

            await receive(client, serializer, [WAMP_MSG_SPEC.RESULT, second.requestId, {}, ['second']]);
            await second.done;
            expect(first.results).to.deep.equal([]);
            expect(second.results).to.deep.equal([{ details: {}, argsList: ['second'], argsDict: undefined }]);

            await receive(client, serializer, [WAMP_MSG_SPEC.RESULT, first.requestId, {}, ['first']]);
            await first.done;
            expect(first.results).to.deep.equal([{ details: {}, argsList: ['first'], argsDict: undefined }]);
            expect(first.errors).to.deep.equal([]);
            expect(second.errors).to.deep.equal([]);
        });

        it('keeps a progressive call pending until its final result and ignores later results', async function () {
            const progress: CallResult[] = [];
            const pending = observe(client.call(topic, undefined, {
                progress_callback: result => { progress.push(result); }
            }));
            const requestId = lastRequest(client, serializer)[1];

            await receive(client, serializer, [WAMP_MSG_SPEC.RESULT, 999, { progress: true }, ['unknown']]);
            await receive(client, serializer, [WAMP_MSG_SPEC.RESULT, requestId, { progress: true }, ['first']]);
            await receive(client, serializer, [WAMP_MSG_SPEC.RESULT, requestId, { progress: true }, ['second']]);
            expect(progress).to.deep.equal([
                { details: { progress: true }, argsList: ['first'], argsDict: undefined },
                { details: { progress: true }, argsList: ['second'], argsDict: undefined }
            ]);
            expect(pending.results).to.deep.equal([]);
            expect(pending.errors).to.deep.equal([]);

            await receive(client, serializer, [WAMP_MSG_SPEC.RESULT, requestId, {}, ['final']]);
            await pending.done;
            await receive(client, serializer, [WAMP_MSG_SPEC.RESULT, requestId, { progress: true }, ['late']]);
            expect(progress).to.have.lengthOf(2);
            expect(pending.results).to.deep.equal([{ details: {}, argsList: ['final'], argsDict: undefined }]);
            expect(pending.errors).to.deep.equal([]);
        });
    });
}
