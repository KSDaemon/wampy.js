import cj from 'color-json';
import { helpOptions, payloadArgs, pptArgs } from '../commonOptions.js';
import { fillPPTOptions, getWampySession } from '../wampyHelpers.js';
import { logger } from '../logger.js';

const command = 'call <rpcURI>';
const description = 'Make a WAMP Remote Procedure Call';

const builder = function (yargs) {
    pptArgs(yargs);
    payloadArgs(yargs);
    helpOptions(yargs);
    return yargs
        .positional('rpcURI', {
            description: 'WAMP Procedure URI to call',
            required: true,
            type: 'string'
        })
        .option('disclose_me', {
            alias: 'd',
            description : 'Flag of disclosure of Caller identity (WAMP session ID)',
            type        : 'boolean'
        })
        .option('progress', {
            alias: 'p',
            description : 'Flag of marking a call as progressive invocation',
            type        : 'boolean'
        })
        .option('timeout', {
            alias: 't',
            description : 'Timeout (in ms) for the call to finish',
            type        : 'number'
        })
        .example([
            ['$0 call get.system.updates'],
            ['$0 call set.system.time -a `date +%s`'],
            ['$0 call get.world.statistics --timeout 5000'],
            ['$0 call update.user -d -k.nickname KSDaemon -k.email="email@example.com"'],
        ]);
};

const handler = async function (argv) {
    const wampy = await getWampySession(argv);

    try {
        const payload = {};
        let hasPayload = false;
        if (argv.argsList) {
            payload.argsList = argv.argsList;
            hasPayload = true;
        }
        if (argv.argsDict) {
            payload.argsDict = argv.argsDict;
            hasPayload = true;
        }

        const advanceOpts = fillPPTOptions({}, argv);
        if (argv.timeout) {
            advanceOpts.timeout = argv.timeout;
        }
        if (argv.disclose_me) {
            advanceOpts.disclose_me = argv.disclose_me;
        }
        if (argv.progress) {
            advanceOpts.progress_callback = function (res) {
                logger('Received intermediate call results: \n' + cj(res));
            };
        }

        const res = await wampy.call(argv.rpcURI,
            hasPayload ? payload : null,
            advanceOpts
        );
        logger(`Received ${argv.progress ? 'final ' : ''}call results: \n` + cj(res));
    } catch (e) {
        logger('Call error:' + e);
    }

    await wampy.disconnect();
};

export default { command, description, builder, handler };
