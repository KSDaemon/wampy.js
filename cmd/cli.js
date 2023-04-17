#!/usr/bin/env node

import { hideBin } from 'yargs/helpers';
import yargs from 'yargs/yargs';

import callCmd from './commands/call.js';
import publishCmd from './commands/publish.js';
import registerCmd from './commands/register.js';
import subscribeCmd from './commands/subscribe.js';
import { connOptions } from './commonOptions.js';

const argv = connOptions(yargs(hideBin(process.argv)))
    .env('WAMPY')
    .completion('completion', 'Generate shell completion script')
    .version()
    .command(callCmd)
    .command(publishCmd)
    .command(registerCmd)
    .command(subscribeCmd)
    .demandCommand(1, 'You need to specify a command first')
    .recommendCommands()
    .help()
    .alias('help', 'h')
    .alias('version', 'v')
    .wrap(100)
    .config('config', 'Populate all parameters from JSON file')
    .alias('config', 'c')
    .option('verbose', {
        alias      : ['vvv', 'debug'],
        describe: 'Enable verbose logging',
        type    : 'boolean',
        default : false
    })
    .option('serializer', {
        alias      : 's',
        description: 'Serializer to use',
        type       : 'string',
        choices    : ['json', 'cbor', 'msgpack'],
        default    : 'json'
    })
    .option('uriValidation', {
        alias      : 'uv',
        description: 'URI Validation Mode',
        type       : 'string',
        choices    : ['strict', 'loose'],
        default    : 'strict'
    })
    .option('strbool', {
        alias      : 'b',
        description: 'Treat payload strings "true", "false" as boolean',
        type       : 'boolean',
        default    : false
    })
    .global(['serializer', 'strbool'])
    .group(['serializer', 'strbool'], 'Global options:')
    .epilogue(
        `Parameters may be specified after a space separator after the key or using "=" sign.
Following example are the same:

wampy -s cbor
wampy -s=cbor

wampy call uri --args 1 2 3    ==> [1, 2, 3]
wampy call uri -a 1 2 3        ==> [1, 2, 3]
wampy call uri -a=1 2 3        ==> [1, 2, 3]
wampy call uri -a 1 -a 2 -a 3  ==> [1, 2, 3]
wampy call uri -a=1 -a=2 -a=3  ==> [1, 2, 3]

Wampy also supports reading arguments from environment variables prefixed with "WAMPY_"
For example, serializer may be read from ENV like this:
WAMPY_SERIALIZER=cbor wampy call ...

Program arguments are defined in this order of precedence:
1. Command line args
2. Env vars
3. Config file/objects
4. Configured defaults

To get information about command options just type: wampy <command> -h`
    )
    .argv;
