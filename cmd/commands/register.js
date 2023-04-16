const command = 'register <rpcURI> [options] [payload]';
const description = 'Register a WAMP Procedure';
const aliases = ['reg'];

const builder = function (yargs) {
    return yargs;
};

const handler = function (argv) {

};

export default { command, description, aliases, builder, handler };
