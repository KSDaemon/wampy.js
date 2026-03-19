module.exports = function karmaConfig(config) {

    config.set({
        basePath: '',
        frameworks: ['mocha'],
        exclude: [],
        files: [{
            pattern: 'test/wampy-common-test.ts',
            watched: false
        }],
        preprocessors: {
            'test/**/*.ts': ['esbuild']
        },

        esbuild: {
            format: 'esm',
            target: 'es2020',
            bundle: true,
            platform: 'browser',
            define: {
                'process.env.NODE_ENV': '"test"'
            },
            // Do not externalize any packages — bundle everything for the browser
            external: []
        },
        coverageReporter: {
            dir: 'coverage/',
            reporters: [
                { type: 'text-summary' },
                { type: 'json' },
                { type: 'html' }
            ]
        },
        reporters: ['mocha', 'coverage'],
        port: 9876,
        colors: true,
        browserNoActivityTimeout: 60000,
        logLevel: config.LOG_INFO,
        autoWatch: false,
        browsers: ['HeadlessChrome'],
        customLaunchers:{
            HeadlessChrome:{
                base: 'ChromeHeadless',
                flags: [
                    '--no-sandbox',
                    '--disable-web-security',
                    '--disable-gpu'
                ]
            }
        },
        singleRun: true
    });
};
