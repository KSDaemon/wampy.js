import { expect } from 'chai';
import { Wampy } from '../src/wampy.js';
import { JsonSerializer } from '../src/serializers/json-serializer.js';
import { MsgpackSerializer } from '../src/serializers/msgpack-serializer.js';
import { CborSerializer } from '../src/serializers/cbor-serializer.js';
import { WAMP_MSG_SPEC } from '../src/constants.js';
import type { Serializer } from '../src/serializers/serializer.js';
import type { EventData, InvocationData, WampyCache, WampyOptions } from '../src/types.js';

function sessionClient (serializer: Serializer, uriValidation: WampyOptions['uriValidation']): Wampy {
    const client = new Wampy({ realm: 'realm1', serializer, uriValidation });
    // Isolate client-side dispatch from network setup and router-side pattern matching.
    const { _cache } = client as unknown as { _cache: WampyCache };
    _cache.sessionId = 123;
    _cache.server_wamp_features = {
        roles: {
            broker: { features: { pattern_based_subscription: true } },
            dealer: { features: { pattern_based_registration: true } }
        }
    };
    return client;
}

function sentMessages (client: Wampy, serializer: Serializer): unknown[][] {
    const { _wsQueue } = client as unknown as { _wsQueue: Array<string | ArrayBuffer | Uint8Array> };
    return _wsQueue.map(message => serializer.decode(message) as unknown[]);
}

async function receive (client: Wampy, serializer: Serializer, message: unknown[]): Promise<void> {
    await client._wsOnMessage({ data: serializer.encode(message) } as MessageEvent);
}

async function confirmRequest (
    client: Wampy, serializer: Serializer, operation: Promise<unknown>, messageType: number, id: number
): Promise<void> {
    await Promise.race([operation, Promise.resolve()]);
    const request = sentMessages(client, serializer).at(-1)!;
    await receive(client, serializer, [messageType, request[1], id]);
    await operation;
}

const patterns = [
    { match: 'wildcard', pattern: 'com.myapp..update', concrete: ['com.myapp.one.update', 'com.myapp.two.update'] },
    { match: 'wildcard', pattern: '.myapp.update', concrete: ['com.myapp.update', 'org.myapp.update'] },
    { match: 'wildcard', pattern: 'com.myapp.', concrete: ['com.myapp.one', 'com.myapp.two'] },
    { match: 'wildcard', pattern: 'a1...d4', concrete: ['a1.b2.c3.d4', 'a1.x2.y3.d4'] },
    { match: 'wildcard', pattern: 'a1....e5', concrete: ['a1.b2.c3.d4.e5', 'a1.x2.y3.z4.e5'] },
    { match: 'wildcard', pattern: 'a1..c3.d4..f6', concrete: ['a1.b2.c3.d4.e5.f6', 'a1.x2.c3.d4.y5.f6'] },
    { match: 'wildcard', pattern: 'a1..c3..e5..g7', concrete: ['a1.b2.c3.d4.e5.f6.g7', 'a1.x2.c3.y4.e5.z6.g7'] },
    { match: 'wildcard', pattern: '.a1..c3.', concrete: ['x.a1.b2.c3.d4', 'y.a1.e2.c3.f4'] },
    { match: 'wildcard', pattern: '..myapp.update', concrete: ['com.one.myapp.update', 'org.two.myapp.update'] },
    { match: 'wildcard', pattern: 'com.myapp..', concrete: ['com.myapp.one.update', 'com.myapp.two.status'] },
    { match: 'wildcard', pattern: '', concrete: ['one', 'two'] },
    { match: 'wildcard', pattern: '.', concrete: ['one.update', 'two.status'] },
    { match: 'wildcard', pattern: '..', concrete: ['com.one.update', 'org.two.status'] },
    { match: 'wildcard', pattern: '...', concrete: ['com.myapp.one.update', 'org.myapp.two.status'] },
    { match: 'prefix', pattern: '', concrete: ['com.myapp.update', 'org.other.topic'] },
    { match: 'prefix', pattern: 'com.myapp.', concrete: ['com.myapp.update', 'com.myapp.topic.status'] }
] as const;

for (const SerializerClass of [JsonSerializer, MsgpackSerializer, CborSerializer]) {
    for (const uriValidation of ['strict', 'loose'] as const) {
        describe(`Wampy.js pattern dispatch (${SerializerClass.name}, ${uriValidation})`, function () {
            let client: Wampy;
            let serializer: Serializer;

            beforeEach(function () {
                serializer = new SerializerClass();
                client = sessionClient(serializer, uriValidation);
            });

            for (const { match, pattern, concrete } of patterns) {
                it(`dispatches EVENTs for ${match} ${JSON.stringify(pattern)} by subscription ID`, async function () {
                    const events: EventData[] = [];
                    const otherEvents: EventData[] = [];
                    const subscription = client.subscribe(pattern, event => { events.push(event); }, { match });
                    await confirmRequest(client, serializer, subscription, WAMP_MSG_SPEC.SUBSCRIBED, 201);
                    expect(await subscription).to.include({ topic: pattern, subscriptionId: 201 });

                    const other = client.subscribe(concrete[0], event => { otherEvents.push(event); });
                    await confirmRequest(client, serializer, other, WAMP_MSG_SPEC.SUBSCRIBED, 202);

                    await receive(client, serializer, [WAMP_MSG_SPEC.EVENT, 999, 300, { topic: concrete[0] }, ['ignored']]);
                    await receive(client, serializer, [WAMP_MSG_SPEC.EVENT, 201, 301, { topic: concrete[0] }, ['first'], { value: 1 }]);
                    await receive(client, serializer, [WAMP_MSG_SPEC.EVENT, 201, 302, { topic: concrete[1] }, ['second'], { value: 2 }]);
                    expect(events).to.deep.equal([
                        { details: { topic: concrete[0] }, argsList: ['first'], argsDict: { value: 1 } },
                        { details: { topic: concrete[1] }, argsList: ['second'], argsDict: { value: 2 } }
                    ]);
                    expect(otherEvents).to.have.lengthOf(0);

                    await receive(client, serializer, [WAMP_MSG_SPEC.EVENT, 202, 303, {}, ['exact']]);
                    expect(otherEvents).to.deep.equal([{ details: {}, argsList: ['exact'], argsDict: undefined }]);
                    expect(events).to.have.lengthOf(2);
                });

                it(`dispatches INVOCATIONs for ${match} ${JSON.stringify(pattern)} and sends YIELDs`, async function () {
                    const invocations: InvocationData[] = [];
                    let otherCalls = 0;
                    const registration = client.register(pattern, invocation => {
                        invocations.push(invocation);
                        return { argsList: ['handled'], argsDict: { pattern } };
                    }, { match });
                    await confirmRequest(client, serializer, registration, WAMP_MSG_SPEC.REGISTERED, 101);
                    expect(await registration).to.include({ topic: pattern, registrationId: 101 });

                    const other = client.register(concrete[0], () => {
                        otherCalls++;
                        return { argsList: ['exact'] };
                    });
                    await confirmRequest(client, serializer, other, WAMP_MSG_SPEC.REGISTERED, 102);

                    await receive(client, serializer, [WAMP_MSG_SPEC.INVOCATION, 401, 101, { procedure: concrete[0] }, ['first'], { value: 1 }]);
                    await receive(client, serializer, [WAMP_MSG_SPEC.INVOCATION, 402, 101, { procedure: concrete[1] }, ['second'], { value: 2 }]);
                    expect(invocations.map(({ details, argsList, argsDict }) => ({ details, argsList, argsDict }))).to.deep.equal([
                        { details: { procedure: concrete[0] }, argsList: ['first'], argsDict: { value: 1 } },
                        { details: { procedure: concrete[1] }, argsList: ['second'], argsDict: { value: 2 } }
                    ]);
                    expect(otherCalls).to.equal(0);
                    expect(sentMessages(client, serializer).slice(2)).to.deep.equal([
                        [WAMP_MSG_SPEC.YIELD, 401, {}, ['handled'], { pattern }],
                        [WAMP_MSG_SPEC.YIELD, 402, {}, ['handled'], { pattern }]
                    ]);

                    await receive(client, serializer, [WAMP_MSG_SPEC.INVOCATION, 403, 102, {}, ['exact']]);
                    expect(otherCalls).to.equal(1);
                    expect(invocations).to.have.lengthOf(2);
                    expect(sentMessages(client, serializer).at(-1)).to.deep.equal([WAMP_MSG_SPEC.YIELD, 403, {}, ['exact']]);
                });
            }
        });
    }
}
