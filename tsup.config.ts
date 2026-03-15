import { defineConfig } from 'tsup';

/**
 * tsup configuration for wampy.js
 *
 * Produces:
 *   dist/esm/    — ESM modules with .js extension
 *   dist/cjs/    — CJS modules with .cjs extension
 *   dist/browser/ — IIFE browser bundles (wampy.js, wampy-all.js + minified)
 *
 * Post-build (scripts/post-build.js) creates dist/browser.zip
 */

const commonExternal = [
    'cbor-x',
    'msgpackr',
    'tweetnacl',
    'websocket',
    'ws',
    'yargs',
    'yargs/helpers',
    'yargs/yargs',
    'color-json',
    'node:crypto',
];

const esmEntries = {
    'wampy': 'src/wampy.ts',
    'constants': 'src/constants.ts',
    'errors': 'src/errors.ts',
    'utils': 'src/utils.ts',
    'serializers/json-serializer': 'src/serializers/json-serializer.ts',
    'serializers/cbor-serializer': 'src/serializers/cbor-serializer.ts',
    'serializers/msgpack-serializer': 'src/serializers/msgpack-serializer.ts',
    'auth/wampcra/wampy-cra': 'src/auth/wampcra/wampy-cra.ts',
    'auth/cryptosign/wampy-cryptosign': 'src/auth/cryptosign/wampy-cryptosign.ts',
};

// CJS entries: exclude wampy-cra which uses top-level await (incompatible with CJS)
const cjsEntries = {
    'wampy': 'src/wampy.ts',
    'constants': 'src/constants.ts',
    'errors': 'src/errors.ts',
    'utils': 'src/utils.ts',
    'serializers/json-serializer': 'src/serializers/json-serializer.ts',
    'serializers/cbor-serializer': 'src/serializers/cbor-serializer.ts',
    'serializers/msgpack-serializer': 'src/serializers/msgpack-serializer.ts',
    'auth/cryptosign/wampy-cryptosign': 'src/auth/cryptosign/wampy-cryptosign.ts',
};

export default defineConfig([
    // CLI build (ESM, bundled — shebang preserved from source)
    {
        entry: { 'cli': 'cmd/cli.ts' },
        format: ['esm'],
        outDir: 'dist/cli',
        dts: false,
        sourcemap: false,
        splitting: false,
        clean: false,
        external: commonExternal,
        outExtension: () => ({ js: '.js' }),
    },
    // ESM build
    {
        entry: esmEntries,
        format: ['esm'],
        outDir: 'dist/esm',
        dts: true,
        sourcemap: true,
        splitting: false,
        clean: false,
        external: commonExternal,
        outExtension: () => ({ js: '.js', dts: '.d.ts' }),
    },
    // CJS build (without wampy-cra due to top-level await)
    {
        entry: cjsEntries,
        format: ['cjs'],
        outDir: 'dist/cjs',
        dts: false,
        sourcemap: true,
        splitting: false,
        clean: false,
        external: commonExternal,
        outExtension: () => ({ js: '.cjs' }),
    },
    // CJS build for wampy-cra: uses ESM format since it needs top-level await
    // Consumers using require() for this module should use dynamic import
    {
        entry: { 'auth/wampcra/wampy-cra': 'src/auth/wampcra/wampy-cra.ts' },
        format: ['esm'],
        outDir: 'dist/cjs',
        dts: false,
        sourcemap: true,
        splitting: false,
        clean: false,
        external: commonExternal,
        outExtension: () => ({ js: '.mjs' }),
    },
    // Browser IIFE: wampy.js (single — sets globalThis.Wampy)
    {
        entry: { 'wampy': 'src/wampy-single-4-browser.ts' },
        format: ['iife'],
        outDir: 'dist/browser',
        globalName: '__wampy_single__',
        platform: 'browser',
        sourcemap: true,
        splitting: false,
        clean: false,
        noExternal: [/.*/],
        outExtension: () => ({ js: '.js' }),
        minify: false,
        banner: {
            js: '/* wampy.js browser bundle - https://github.com/KSDaemon/wampy.js */',
        },
    },
    // Browser IIFE: wampy-all.js (all serializers + auth)
    {
        entry: { 'wampy-all': 'src/wampy-all-4-browser.ts' },
        format: ['iife'],
        outDir: 'dist/browser',
        globalName: '__wampy_all__',
        platform: 'browser',
        sourcemap: true,
        splitting: false,
        clean: false,
        noExternal: [/.*/],
        outExtension: () => ({ js: '.js' }),
        minify: false,
        banner: {
            js: '/* wampy-all.js browser bundle - https://github.com/KSDaemon/wampy.js */',
        },
    },
    // Browser IIFE: wampy.min.js (minified single)
    {
        entry: { 'wampy.min': 'src/wampy-single-4-browser.ts' },
        format: ['iife'],
        outDir: 'dist/browser',
        globalName: '__wampy_single_min__',
        platform: 'browser',
        sourcemap: true,
        splitting: false,
        clean: false,
        noExternal: [/.*/],
        outExtension: () => ({ js: '.js' }),
        minify: true,
        esbuildOptions(options) {
            options.drop = ['console'];
        },
    },
    // Browser IIFE: wampy-all.min.js (minified all)
    {
        entry: { 'wampy-all.min': 'src/wampy-all-4-browser.ts' },
        format: ['iife'],
        outDir: 'dist/browser',
        globalName: '__wampy_all_min__',
        platform: 'browser',
        sourcemap: true,
        splitting: false,
        clean: false,
        noExternal: [/.*/],
        outExtension: () => ({ js: '.js' }),
        minify: true,
        esbuildOptions(options) {
            options.drop = ['console'];
        },
    },
]);
