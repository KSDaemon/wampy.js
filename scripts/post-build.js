/**
 * Post-build script: creates browser.zip from dist/browser/ contents
 */
import { createWriteStream, readdirSync, existsSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { execSync } from 'node:child_process';

const distDir = resolve('dist');
const browserDir = join(distDir, 'browser');
const zipPath = join(distDir, 'browser.zip');

if (!existsSync(browserDir)) {
    console.error('dist/browser/ does not exist, skipping zip creation');
    process.exit(0);
}

const files = readdirSync(browserDir);
console.log('Browser bundle files:', files);

// Use system zip command (available on macOS and Linux)
execSync(`zip -j "${zipPath}" "${browserDir}"/*`, { stdio: 'inherit' });
console.log(`Created ${zipPath}`);
