import { helpOptions } from '../commonOptions.js';
import { getWampySession } from '../wampyHelpers.js';
import { logger } from '../logger.js';

const command = 'subscribe <topicURI> [options]';
const description = 'Subscribe to a WAMP Events topic';
const aliases = ['sub'];

const builder = function (yargs) {
    helpOptions(yargs);
    return yargs
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

    console.log(argv);
    try {
        const res = await wampy.subscribe(argv.topicURI,
            function (eventData) {
                logger('Received topic event', eventData);
            },
            { match: argv.match }
        );
        logger('Successfully subscribed to topic: ' + res.topic);

    } catch (e) {
        logger('Subscription error:' + e);
    }

    process.on('SIGTERM', async () => {
        await wampy.disconnect();
        logger('Disconnected from router. Exiting...');
    });
    process.on('SIGINT', async () => {
        await wampy.disconnect();
        logger('Disconnected from router. Exiting...');
    });
};

export default { command, description, aliases, builder, handler };
