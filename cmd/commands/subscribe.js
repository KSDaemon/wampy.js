import { helpOptions } from '../common_options.js';

const command = 'subscribe <topicURI> [options] [payload]';
const description = 'Subscribe to a WAMP Events topic';
const aliases = ['sub'];

const builder = function (yargs) {
    helpOptions(yargs);
    return yargs
        .option('match', {
            alias: 'm',
            description : 'Topic URI Matching policy',
            type        : 'string',
            choices    : ['exact', 'prefix', 'wildcard'],
            default    : 'exact'
        })
        .example([
            ['$0 subscribe get.system.updates'],
            ['$0 subscribe user. -m prefix'],
            ['$0 subscribe "updates..status" --match wildcard'],
        ]);
};

const handler = function (argv) {
    console.log(argv);
};

export default { command, description, aliases, builder, handler };
