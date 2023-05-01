import cj from 'color-json';
import { helpOptions, payloadArgs, pptArgs } from '../commonOptions.js';
import { fillPPTOptions, getWampySession } from '../wampyHelpers.js';
import { logger } from '../logger.js';

const command = 'publish <topicURI>';
const description = 'Publish a WAMP Event to topic';
const aliases = ['pub'];

const builder = function (yargs) {
    pptArgs(yargs);
    payloadArgs(yargs);
    helpOptions(yargs);
    return yargs
        .positional('topicURI', {
            description: 'WAMP Topic URI to publish event to',
            required: true,
            type: 'string'
        })
        .option('exclude', {
            alias: 'e',
            description : 'WAMP session id(s) that won\'t receive a published event, even though they may be subscribed',
            type        : 'array'
        })
        .option('exclude_authid', {
            alias: 'ea',
            description : 'Authentication id(s) that won\'t receive a published event, even though they may be subscribed',
            type        : 'array'
        })
        .option('exclude_authrole', {
            alias: 'er',
            description : 'Authentication role(s) that won\'t receive a published event, even though they may be subscribed',
            type        : 'array'
        })
        .option('eligible', {
            alias: 'l',
            description : 'WAMP session id(s) that are allowed to receive a published event',
            type        : 'array'
        })
        .option('eligible_authid', {
            alias: 'la',
            description : 'Authentication id(s) that are allowed to receive a published event',
            type        : 'array'
        })
        .option('eligible_authrole', {
            alias: 'lr',
            description : 'Authentication role(s) that are allowed to receive a published event',
            type        : 'array'
        })
        .option('disclose_me', {
            alias: 'd',
            description : 'flag of disclosure of publisher identity (its WAMP session ID) to receivers of a published event',
            type        : 'boolean'
        })
        .example([
            ['$0 publish get.system.updates'],
            ['$0 publish message.channel -a "This is a new message to the topic"'],
            ['$0 publish user.updated -d -k.nickname KSDaemon -k.email="email@example.com"'],
        ]);
};

const handler = async function (argv) {
    const wampy = await getWampySession(argv);

    console.log(argv);
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
        if (argv.exclude) {
            advanceOpts.exclude = argv.exclude;
        }
        if (argv.exclude_authid) {
            advanceOpts.exclude_authid = argv.exclude_authid;
        }
        if (argv.exclude_authrole) {
            advanceOpts.exclude_authrole = argv.exclude_authrole;
        }
        if (argv.eligible) {
            advanceOpts.eligible = argv.eligible;
        }
        if (argv.eligible_authid) {
            advanceOpts.eligible_authid = argv.eligible_authid;
        }
        if (argv.eligible_authrole) {
            advanceOpts.eligible_authrole = argv.eligible_authrole;
        }
        if (argv.disclose_me) {
            advanceOpts.disclose_me = argv.disclose_me;
        }

        const res = await wampy.publish(argv.topicURI,
            hasPayload ? payload : null,
            advanceOpts
        );
        logger('Successfully published to topic: \n' + cj(res));

    } catch (e) {
        logger('Subscription error:' + e);
    }

    await wampy.disconnect();
};

export default { command, description, aliases, builder, handler };
