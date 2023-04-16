const command = 'call <rpcURI> [options] [payload]';
const description = 'Make a WAMP Remote Procedure Call';

const builder = function (yargs) {
    return yargs;
};

const handler = function (argv) {

};

export default { command, description, builder, handler };
