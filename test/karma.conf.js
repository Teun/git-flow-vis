// Karma configuration
module.exports = function (config) {
    config.set({

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '../',


        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['mocha', 'chai'],


        //list of files / patterns to load in the browser
        files: [
            { pattern: 'node_modules/d3/d3.js' },
            { pattern: 'node_modules/moment/moment.js' },
            { pattern: 'node_modules/thenby/thenBy.min.js' },
            { pattern: 'node_modules/crypto-js/crypto-js.js' },
            { pattern: 'node_modules/lodash/lodash.js' },
            { pattern: 'lib/gitflow-visualize.js' },
            { pattern: 'test/test.data.js' },
            { pattern: 'test/test.js' }
        ],

        // Configure Mocha client
        client: {
            mocha: {
                ui: 'tdd'
            }
        },

        preprocessors: {
            // source files, that you wanna generate coverage for
            // do not include tests or libraries
            // (these files will be instrumented by Istanbul)
            'lib/gitflow-visualize.js': ['coverage']
        },

        // optionally, configure the reporter
        coverageReporter: {
            type : 'html',
            dir : 'test/coverage/'
        },

        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['spec', 'coverage' ],

        // web server port
        port: 9999,

        // enable / disable colors in the output (reporters and logs)
        colors: true,

        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_WARN,

        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: false,

        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: ['PhantomJS'],

        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: false
    });
};