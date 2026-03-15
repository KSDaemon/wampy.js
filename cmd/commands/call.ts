import cj from 'color-json';
import type { Arguments, Argv } from 'yargs';
import { helpOptions, payloadArgs, pptArgs } from '../common-options.js';
import { fillPPTOptions, getWampySession } from '../wampy-helpers.js';
import { logger } from '../logger.js';
import type { CliArgv } from '../wampy-helpers.js';
import type { CallAdvancedOptions } from '../../src/types.js';

interface CallArgv extends CliArgv {
    rpcURI: string;
    argsList?: unknown[];
    argsDict?: Record<string, unknown>;
    disclose_me?: boolean;
    progress?: boolean;
    timeout?: number;
}

const command = 'call <rpcURI>';
const description = 'Make a WAMP Remote Procedure Call';

const builder = function (yargs: Argv): Argv {
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

const handler = async function (args: Arguments): Promise<void> {
    const argv = args as unknown as CallArgv;
    const wampy = await getWampySession(argv);

    try {
        const payload: { argsList?: unknown[]; argsDict?: Record<string, unknown> } = {};
        let hasPayload = false;
        if (argv.argsList) {
            payload.argsList = argv.argsList;
            hasPayload = true;
        }
        if (argv.argsDict) {
            payload.argsDict = argv.argsDict;
            hasPayload = true;
        }

        const advanceOpts: CallAdvancedOptions = fillPPTOptions({}, argv);
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
