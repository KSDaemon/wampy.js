export const payloadArgs = function (yargs) {
    return yargs
        .option('argsList', {
            alias      : ['a'],
            description: 'Message positional (list) payload\n' +
                'You can pass multiple values after key:\n' +
                '--args 1 2 3 ==> [1, 2, 3]\n' +
                '-a 100 string ==> [100, "string"]',
            type       : 'array'
        })
        .option('argsDict', {
            alias      : ['k'],
            description: 'Message Key-value (dictionary) payload\n' +
                'To specify values use dot notation (any level deep):\n' +
                '--argsDict.key1 125 ==> { key1: 125}\n' +
                '-k.key1 250 -k.key2 my-string ==>\n{ key1: 250, key2: "my-string" }\n' +
                '-k.rootKey true -k.innerObj.key1 cool ==>\n{ rootKey: true, innerObj: { key1: "cool" }}\n'
        });
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
        });
};

export const helpOptions = function (yargs) {
    return yargs
        .help()
        .alias('help', 'h').argv;
};
