import cj from 'color-json';
import { helpOptions } from '../common-options.js';
import { getWampySession } from '../wampy-helpers.js';
import { logger } from '../logger.js';

const command = 'register <rpcURI>';
const description = 'Register a WAMP Procedure';
const aliases = ['reg'];

const builder = function (yargs) {
    helpOptions(yargs);
    return yargs
        .positional('rpcURI', {
            description: 'WAMP Procedure URI to register',
            required   : true,
            type       : 'string'
        })
        .option('match', {
            alias      : 'm',
            description: 'URI Matching policy',
            type       : 'string',
            choices    : ['exact', 'prefix', 'wildcard'],
            default    : 'exact'
        })
        .option('invoke', {
            alias      : 'i',
            description: 'Invocation policy',
            type       : 'string',
            choices    : ['single', 'roundrobin', 'random', 'first', 'last'],
            default    : 'single'
        })
        .option('mirror', {
            alias      : 'o',
            description: 'Return the invocation payload back to caller as result',
            type       : 'boolean'
        })
        .example([
            ['$0 register get.system.updates'],
            ['$0 register user. -m prefix'],
            ['$0 register "updates..status" --match wildcard'],
        ]);
};

const handler = async function (argv) {
    const wampy = await getWampySession(argv);

    try {
        const res = await wampy.register(argv.rpcURI,
            function (eventData) {
                logger('Received call invocation: \n',
                    cj({
                        details : eventData.details,
                        argsList: eventData.argsList,
                        argsDict: eventData.argsDict
                    }));

                if (argv.mirror) {
                    return {
                        argsList: eventData.argsList,
                        argsDict: eventData.argsDict
                    };
                }
            },
            { match: argv.match, invoke: argv.invoke }
        );
        logger('Successfully registered procedure: \n', cj(res));

    } catch (e) {
        logger('Registration error:' + e);
    }
};

export default { command, description, aliases, builder, handler };
