import { expect } from 'chai';
import { execSync } from 'node:child_process';

/**
 * Programmatically set arguments and execute the CLI script
 *
 * @param {...string} args - positional and option arguments for the command to run
 */
async function runCommand (...args) {
    const cmdArgs = [
        'node', // Not used but a value is required at this index in the array
        'cmd/cli.js', // Not used but a value is required at this index in the array
        ...args,
    ];

    const res = execSync(cmdArgs.join(' ')).toString();

    // Require the yargs CLI script
    return res;
}

describe('Wampy real CLI show help test suite', function () {

    it('should show general help', async function () {
        const stdout = await runCommand('-h');
        expect(stdout).to.contain('To get information about command options just type: wampy <command> -h');
    });

    it('should show a subscribe command help', async function () {
        const stdout = await runCommand('subscribe', '-h');
        expect(stdout).to.contain('Subscribe to a WAMP Events topic');
        expect(stdout).to.contain('cli.js subscribe "updates..status" --match wildcard');
    });

    it('should show a publish command help', async function () {
        const stdout = await runCommand('publish', '-h');
        expect(stdout).to.contain('Publish a WAMP Event to topic');
        expect(stdout).to.contain('cli.js publish user.updated -d -k.nickname KSDaemon -k.email="email@example.com"');
    });

    it('should show a register command help', async function () {
        const stdout = await runCommand('register', '-h');
        expect(stdout).to.contain('Register a WAMP Procedure');
        expect(stdout).to.contain('cli.js register "updates..status" --match wildcard');
    });

    it('should show a call command help', async function () {
        const stdout = await runCommand('call', '-h');
        expect(stdout).to.contain('Make a WAMP Remote Procedure Call');
        expect(stdout).to.contain('cli.js call update.user -d -k.nickname KSDaemon -k.email="email@example.com"');
    });
});
