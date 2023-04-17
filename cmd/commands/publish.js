import { helpOptions, payloadArgs, pptArgs } from '../commonOptions.js';

const command = 'publish <topicURI> [options] [payload]';
const description = 'Publish a WAMP Event to topic';
const aliases = ['pub'];

const builder = function (yargs) {
    pptArgs(yargs);
    payloadArgs(yargs);
    helpOptions(yargs);
    return yargs
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
    console.log(argv);
};

export default { command, description, aliases, builder, handler };
