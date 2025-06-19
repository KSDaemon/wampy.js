function convertStringToBoolean (obj) {
    for (const key in obj) {
        if (typeof obj[key] === 'object') {
            obj[key] = convertStringToBoolean(obj[key]);
        } else if (typeof obj[key] === 'string' || Object.prototype.toString.call(obj[key]) === '[object String]') {
            if (obj[key].toUpperCase() === 'TRUE') {
                obj[key] = true;
            } else if (obj[key].toUpperCase() === 'FALSE') {
                obj[key] = false;
            }
        }
    }
    return obj;
}

export const payloadArgs = function (yargs) {
    return yargs
        .option('strbool', {
            alias      : 'b',
            description: 'Treat payload strings "true", "false" as boolean',
            type       : 'boolean',
            default    : false
        })
        .option('json', {
            alias      : 'j',
            description: 'Treat payload as json-encoded strings and decode them before sending',
            type       : 'boolean',
            default    : false
        })
        .option('argsList', {
            alias      : ['a', 'args'],
            description: 'Message positional (list) payload\n' +
                'You can pass multiple values after key:\n' +
                '--argsList 1 2 3 ==> [1, 2, 3]\n' +
                '-a 100 string ==> [100, "string"]',
            type       : 'array'
        })
        .option('argsDict', {
            alias      : ['k', 'kwargs'],
            description: 'Message Key-value (dictionary) payload\n' +
                'To specify values use dot notation (any level deep):\n' +
                '--argsDict.key1 125 ==> { key1: 125}\n' +
                '-k.key1 250 -k.key2 my-string ==>\n{ key1: 250, key2: "my-string" }\n' +
                '-k.rootKey true -k.innerObj.key1 cool ==>\n{ rootKey: true, innerObj: { key1: "cool" }}\n'
        })
        // Convert all strings "true"/"false" to boolean in payload if `strbool` flag is present
        .middleware(argv => {
            if (!argv.strbool) {
                return argv;
            }

            if (argv.argsList) {
                argv.argsList = argv.argsList.map(v => {
                    if (typeof v === 'string' || Object.prototype.toString.call(v) === '[object String]') {
                        if (v.toUpperCase() === 'TRUE') {
                            return true;
                        } else if (v.toUpperCase() === 'FALSE') {
                            return false;
                        }

                        return v;
                    }
                    return v;
                });
            }

            if (argv.argsDict) {
                argv.argsDict = convertStringToBoolean(argv.argsDict);
            }

            return argv;
        })
        // Convert all payload from json-strings into JS objects if -jso-json flag is present
        .middleware(argv => {
            if (!argv.json) {
                return argv;
            }

            if (argv.argsList) {
                argv.argsList = argv.argsList.map(v => {
                    if (typeof v === 'string' || Object.prototype.toString.call(v) === '[object String]') {
                        return JSON.parse(v);
                    }
                    return v;
                });
            }

            if (argv.argsDict && (typeof argv.argsDict === 'string' || Object.prototype.toString.call(argv.argsDict) === '[object String]')) {
                argv.argsDict = JSON.parse(argv.argsDict);
            }

            return argv;
        })
        .group(['strbool', 'json', 'argsList', 'argsDict'], 'Payload options:');
};

export const pptArgs = function (yargs) {
    return yargs
        .option('ppt_scheme', {
            description: 'Identifies the Payload Schema for Payload Passthru Mode',
            type       : 'string'
        })
        .option('ppt_serializer', {
            description: 'Specifies what serializer was used to encode the payload',
            type       : 'string'
        })
        .option('ppt_cipher', {
            description: 'Specifies the cryptographic algorithm that was used to encrypt the payload',
            type       : 'string'
        })
        .option('ppt_keyid', {
            description: 'Contains the encryption key id that was used to encrypt the payload',
            type       : 'string'
        })
        .group(['ppt_scheme', 'ppt_serializer', 'ppt_cipher', 'ppt_keyid'], 'Payload Passthru Mode options:');
};

export const helpOptions = function (yargs) {
    return yargs
        .help()
        .alias('help', 'h')
        .showHelpOnFail(false, 'Specify -h (--help) for available options');
};

const connOptsKeys = ['url', 'realm', 'authid', 'secret', 'ticket', 'privateKey',
    'noReconnect', 'reconnectInterval', 'maxRetries', 'helloCustomDetails'];

export const connOptions = function (yargs) {
    return yargs
        .option('url', {
            alias: 'w',
            description : 'WAMP Router Endpoint URL',
            type        : 'string',
            demandOption: true
        })
        .option('realm', {
            alias: 'r',
            description : 'WAMP Realm to join on server',
            type        : 'string',
            demandOption: true
        })
        .option('authid', {
            alias: 'u',
            description : 'Authentication (user) id to use in challenge',
            type        : 'string'
        })
        .option('ticket', {
            alias: ['password'],
            description : 'Ticket (Password) for the Ticket Authentication methods',
            type        : 'string'
        })
        .option('secret', {
            alias: ['sc'],
            description : 'Secret (Password) for the CRA Authentication methods',
            type        : 'string'
        })
        .option('privateKey', {
            alias: ['pk'],
            description : 'Hex-encoded Private Key for Cryptosign Authentication method',
            type        : 'string'
        })
        .implies('ticket', 'authid')
        .implies('secret', 'authid')
        .implies('privateKey', 'authid')
        .option('noReconnect', {
            alias      : 'nr',
            description: 'Disable auto reconnecting',
            type       : 'boolean',
            default    : false
        })
        .option('reconnectInterval', {
            alias      : 'ri',
            description: 'Reconnect Interval (in ms)',
            type       : 'number',
            default    : 2000
        })
        .option('maxRetries', {
            alias      : 'mr',
            description: 'Maximum Retries count',
            type       : 'number',
            default    : 25
        })
        .option('helloCustomDetails', {
            alias      : 'hello',
            description: 'Custom attributes (Key-value) to send to router on hello\n' +
                'To specify values use dot notation (any level deep):\n' +
                '--hello.key1 250 --hello.key2 my-string ==>\n{ key1: 250, key2: "my-string" }\n' +
                '--hello.rootKey value1 --hello.innerObj.key1 cool ==>\n{ rootKey: "value1", innerObj: { key1: "cool" }}'
        })
        .global(connOptsKeys)
        .group(connOptsKeys, 'Connection options:');
};
