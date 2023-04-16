const command = 'subscribe <topicURI> [options] [payload]';
const description = 'Subscribe to a WAMP Events topic';
const aliases = ['sub'];

const builder = function (yargs) {
    return yargs;
};

const handler = function (argv) {

};

export default { command, description, aliases, builder, handler };
