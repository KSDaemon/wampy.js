import { expect } from 'chai';
import sinon from 'sinon';
import { readFileSync, writeFileSync } from 'fs';
import emitter from 'events';

const replaceFileName = './cmd/wampyHelpers.js';
let consoleLogSpy;

async function getArgvInstance () {
    const argv = await import(`../cmd/main.js?update=${Date.now()}`);

    return argv.default.scriptName('wampy').exitProcess(false);
}

function commonArgs () {
    return ['-r', 'realm1', '-w', 'ws://127.0.0.1:8080'];
}

describe('Wampy CLI test suite', function () {
    before(() => {
        // Dirty hack 'cause there is no legal way of mocking external dependency
        let data = readFileSync(replaceFileName, { encoding: 'utf8' });
        data = data.replace('import { Wampy } from \'../src/wampy.js\';', 'import { FakeWampyMock as Wampy } from \'../test/fakeWampyMock.js\';');
        writeFileSync(replaceFileName, data, { encoding: 'utf8' });
    });

    after(() => {
        // Dirty hack 'cause there is no legal way of mocking external dependency
        let data = readFileSync(replaceFileName, { encoding: 'utf8' });
        data = data.replace('import { FakeWampyMock as Wampy } from \'../test/fakeWampyMock.js\';', 'import { Wampy } from \'../src/wampy.js\';');
        writeFileSync(replaceFileName, data, { encoding: 'utf8' });
    });

    beforeEach(() => {
        consoleLogSpy = sinon.spy(console, 'log');
    });

    afterEach(() => {
        consoleLogSpy.restore();
    });

    it('should show general help', async () => {
        const argv = await getArgvInstance();
        await argv.parse(['-h'], function (err, argv, output) {
            expect(output).to.contain('To get information about command options just type: wampy <command> -h');
        });
    });

    it('should show a subscribe command help', async () => {
        const argv = await getArgvInstance();
        await argv.parse(['subscribe', '-h'], function (err, argv, output) {
            expect(output).to.contain('Subscribe to a WAMP Events topic');
            expect(output).to.contain('subscribe "updates..status" --match wildcard');
        });
    });

    it('should subscribe to a topic', async () => {
        const argv = await getArgvInstance();
        await argv.parse([...commonArgs(), 'subscribe', 'topic.uri'], function (err, argv, output) {
            expect(consoleLogSpy.lastCall.args[0]).to.contain('Successfully subscribed to topic');
        });
    });

    it('should show a publish command help', async () => {
        const argv = await getArgvInstance();
        await argv.parse(['publish', '-h'], function (err, argv, output) {
            expect(output).to.contain('Publish a WAMP Event to topic');
            expect(output).to.contain('publish user.updated -d -k.nickname KSDaemon -k.email="email@example.com"');
        });
    });

    it('should publish to a topic', async () => {
        const argv = await getArgvInstance();
        await argv.parse([...commonArgs(), 'publish', 'topic.uri', '-e', '123', '--ea', '234', '--er', 'role',
            '-l', '654', '--la', '2355', '--lr', 'exrole', '-d',
            '-a', '100', '-k.nickname', 'KSDaemon', '-k.email="email@example.com"'],
        function (err, argv, output) {
            expect(consoleLogSpy.lastCall.args[0]).to.contain('Successfully published to topic');
        });
    });

    it('should show a register command help', async () => {
        const argv = await getArgvInstance();
        await argv.parse(['register', '-h'], function (err, argv, output) {
            expect(output).to.contain('Register a WAMP Procedure');
            expect(output).to.contain('register "updates..status" --match wildcard');
        });
    });

    it('should register an RPC handler', async () => {
        const argv = await getArgvInstance();
        await argv.parse([...commonArgs(), 'register', 'topic.uri', '--mirror'], function (err, argv, output) {
            expect(consoleLogSpy.secondCall.args[0]).to.contain('Received call invocation');
            expect(consoleLogSpy.lastCall.args[0]).to.contain('Successfully registered procedure');
        });
    });

    it('should show a call command help', async () => {
        const argv = await getArgvInstance();
        await argv.parse(['call', '-h'], function (err, argv, output) {
            expect(output).to.contain('Make a WAMP Remote Procedure Call');
            expect(output).to.contain('call update.user -d -k.nickname KSDaemon -k.email="email@example.com"');
        });
    });

    it('should call an RPC', async () => {
        const argv = await getArgvInstance();
        await argv.parse([...commonArgs(), 'call', 'topic.uri', '-b', '-d', '-p', '-t', '1000',
            '-a', '100', '-a', 'false', '-a', 'True', '-a', 'notTrueorFalse', '-k.nickname', 'KSDaemon', '-k.email="email@example.com"',
            '-k.rootbool', 'True', '-k.inner.obj.bool', 'false'],
        function (err, argv, output) {
            expect(consoleLogSpy.secondCall.args[0]).to.contain('Received intermediate call results');
            expect(consoleLogSpy.lastCall.args[0]).to.contain('Received final call results');
        });
    });

    it('should call an RPC with json-decoded payload', async () => {
        const argv = await getArgvInstance();
        await argv.parse([...commonArgs(), 'call', 'topic.uri', '-j',
            '-a', '{"kety": 100}',
            '-k', '{"key1": 125, "key2": "strings", "key3": true}'],
        function (err, argv, output) {
            expect(consoleLogSpy.lastCall.args[0]).to.contain('Received call results');
        });
    });

    it('should call an RPC with PPT options', async () => {
        const argv = await getArgvInstance();
        await argv.parse([...commonArgs(), 'call', 'topic.uri', '--ppt_scheme', 'ppt_scheme',
            '--ppt_serializer', 'ppt_serializer', '--ppt_cipher', 'ppt_cipher',
            '--ppt_keyid', 'ppt_keyid',
            '-a', '100', '-a', 'false', '-a', 'True', '-a', 'notTrueorFalse', '-k.nickname', 'KSDaemon', '-k.email="email@example.com"',
            '-k.rootbool', 'True', '-k.inner.obj.bool', 'false'],
        function (err, argv, output) {
            expect(consoleLogSpy.lastCall.args[0]).to.contain('Received call results');
        });
    });

    it('should call an RPC with cbor serializer', async () => {
        const argv = await getArgvInstance();
        await argv.parse([...commonArgs(), 'call', 'topic.uri', '--serializer', 'cbor',
            '-j', '-a', '{"kety": 100}',
            '-k', '{"key1": 125, "key2": "strings", "key3": true}'],
        function (err, argv, output) {
            expect(consoleLogSpy.lastCall.args[0]).to.contain('Received call results');
        });
    });

    it('should call an RPC with msgpack serializer', async () => {
        const argv = await getArgvInstance();
        await argv.parse([...commonArgs(), 'call', 'topic.uri', '--serializer', 'msgpack',
            '-j', '-a', '{"kety": 100}',
            '-k', '{"key1": 125, "key2": "strings", "key3": true}'],
        function (err, argv, output) {
            expect(consoleLogSpy.lastCall.args[0]).to.contain('Received call results');
        });
    });

    it('should call an RPC with custom details connect options', async () => {
        const argv = await getArgvInstance();
        await argv.parse([...commonArgs(), 'call', 'topic.uri',
            '--hello.key1', '250', '--hello.key2', 'my-string'],
        function (err, argv, output) {
            expect(consoleLogSpy.lastCall.args[0]).to.contain('Received call results');
        });
    });

    it('should call an RPC with auth provided connect options', async () => {
        const argv = await getArgvInstance();
        await argv.parse([...commonArgs(), 'call', 'topic.uri',
            '--authid', 'authid', '--ticket', 'ticket', '--secret', 'user-secret',
            '--pk', '7b2315dd53896f15b0e197fec287aa909c7434148ae50351ec6e6b5bc5a346f5',
            '-a', '125'],
        function (err, argv, output) {
            expect(consoleLogSpy.lastCall.args[0]).to.contain('Received call results');
        });
    });

    it('should print various debug messages if debug is enabled', async () => {
        emitter.setMaxListeners(15);
        const argv = await getArgvInstance();
        await argv.parse([...commonArgs(), 'call', 'topic.uri', '--debug'],
            function (err, argv, output) {
                expect(consoleLogSpy.lastCall.args[0]).to.contain('Connection closing');
            });
    });
});
