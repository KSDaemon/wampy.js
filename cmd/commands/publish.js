const command = 'publish <topicURI> [options] [payload]';
const description = 'Publish a WAMP Event to topic';
const aliases = ['pub'];

const builder = function (yargs) {
    return yargs;
};

const handler = function (argv) {

};

export default { command, description, aliases, builder, handler };
