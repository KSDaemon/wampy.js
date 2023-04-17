import { helpOptions } from '../commonOptions.js';

const command = 'register <rpcURI> [options] [payload]';
const description = 'Register a WAMP Procedure';
const aliases = ['reg'];

const builder = function (yargs) {
    helpOptions(yargs);
    return yargs
        .option('match', {
            alias: 'm',
            description : 'URI Matching policy',
            type        : 'string',
            choices    : ['exact', 'prefix', 'wildcard'],
            default    : 'exact'
        })
        .option('invoke', {
            alias: 'i',
            description : 'Invocation policy',
            type        : 'string',
            choices    : ['single', 'roundrobin', 'random', 'first', 'last'],
            default    : 'single'
        })
        .option('mirror', {
            alias: 'o',
            description : 'Return the invocation payload back to caller as result',
            type        : 'boolean'
        })
        .example([
            ['$0 register get.system.updates'],
            ['$0 register user. -m prefix'],
            ['$0 register "updates..status" --match wildcard'],
        ]);
};

const handler = function (argv) {
    console.log(argv);
};

export default { command, description, aliases, builder, handler };
