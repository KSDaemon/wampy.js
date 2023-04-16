#!/usr/bin/env node

import { hideBin } from 'yargs/helpers';
import yargs from 'yargs/yargs';

import callCmd from './commands/call.js';
import publishCmd from './commands/publish.js';
import registerCmd from './commands/register.js';
import subscribeCmd from './commands/subscribe.js';

const argv = yargs(hideBin(process.argv))
    .config()
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
    .argv;
