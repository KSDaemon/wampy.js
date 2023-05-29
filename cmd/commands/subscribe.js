import cj from 'color-json';
import { helpOptions } from '../commonOptions.js';
import { getWampySession } from '../wampyHelpers.js';
import { logger } from '../logger.js';

const command = 'subscribe <topicURI>';
const description = 'Subscribe to a WAMP Events topic';
const aliases = ['sub'];

const builder = function (yargs) {
    helpOptions(yargs);
    return yargs
        .positional('topicURI', {
            description: 'WAMP Topic URI to subscribe to',
            required: true,
            type: 'string'
        })
        .option('match', {
            alias      : 'm',
            description: 'Topic URI Matching policy',
            type       : 'string',
            choices    : ['exact', 'prefix', 'wildcard'],
            default    : 'exact'
        })
        .example([
            ['$0 subscribe get.system.updates'],
            ['$0 subscribe user. -m prefix'],
            ['$0 subscribe "updates..status" --match wildcard'],
        ]);
};

const handler = async function (argv) {
    const wampy = await getWampySession(argv);

    try {
        const res = await wampy.subscribe(argv.topicURI,
            function (eventData) {
                logger('Received topic event:\n', cj(eventData));
            },
            { match: argv.match }
        );
        logger('Successfully subscribed to topic: \n', cj(res));

    } catch (e) {
        logger('Subscription error:' + e);
    }
};

export default { command, description, aliases, builder, handler };
