module.exports = function (config) {

    config.set({
        basePath: '',
        frameworks: ['mocha', 'browserify'],
        exclude: [],
        files: [{
            pattern: 'test/*-test.js',
            watched: false
        }],
        preprocessors: {
            'test/*-test.js': ['browserify']
        },

        browserify: {
            transform: [['babelify', { 'presets': ['env'] }]]
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
        logLevel: config.LOG_INFO,
        autoWatch: false,
        browsers: ['ChromeHeadless'],
        singleRun: true
    });
};
