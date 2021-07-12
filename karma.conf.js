// process.env.CHROME_BIN = require('puppeteer').executablePath();

module.exports = function (config) {

    config.set({
        basePath: '',
        frameworks: ['mocha', 'browserify'],
        exclude: [],
        files: [{
            pattern: 'test/!(wampy-crossbar)-test.js',
            watched: false
        }],
        preprocessors: {
            'test/*-test.js': ['browserify']
        },

        browserify: {
            transform: [['babelify', { 'presets': ['@babel/preset-env'] }]]
        },
        coverageReporter: {
            dir: 'coverage/',
            reporters: [
                {type: 'text-summary'},
                {type: 'json'},
                {type: 'html'}
            ]
        },
        webpackServer: {noInfo: true},
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
