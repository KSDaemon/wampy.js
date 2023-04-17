import { helpOptions, payloadArgs, pptArgs } from '../common_options.js';

const command = 'call <rpcURI> [options] [payload]';
const description = 'Make a WAMP Remote Procedure Call';

const builder = function (yargs) {
    pptArgs(yargs);
    payloadArgs(yargs);
    helpOptions(yargs);
    return yargs
        .option('disclose_me', {
            alias: 'd',
            description : 'Flag of disclosure of Caller identity (WAMP session ID)',
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

const handler = function (argv) {
    console.log(argv);
};

export default { command, description, builder, handler };
