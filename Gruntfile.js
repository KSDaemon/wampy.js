module.exports = function (grunt) {

    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: {
            dist: ['dist/*'],
            browserFolder: ['dist/browser']
        },
        babel: {
            srcToDist: {
                files: [{
                    expand: true,
                    cwd: 'src/',
                    src: ['**/*.js', '!*browser.js'],
                    dest: 'dist/'
                }]
            }
        },
        browserify: {
            dist4Browser: {
                options     : {
                    transform: [['babelify', { 'presets': ['@babel/preset-env'] }]]
                },
                files  : {
                    'dist/browser/wampy.js': 'src/browser.js',
                    'dist/browser/msgpacksrlzr.js': 'src/msgpacksrlzrbrowser.js'
                }
            }
        },
        uglify: {
            options: {
                compress: {
                    drop_console: true
                },
                preserveComments: false,
                sourceMap: true
            },
            dist4Browser: {
                files: {
                    'dist/browser/wampy.min.js': ['dist/browser/wampy.js'],
                    'dist/browser/msgpacksrlzr.min.js': ['dist/browser/msgpacksrlzr.js']
                }
            }
        },
        copy: {
            msgpackToDist: {
                files: [{
                    src: ['node_modules/msgpack5/dist/msgpack5.min.js'],
                    dest: 'dist/browser/msgpack5.min.js'
                }]
            }
        },
        concat: {
            concatWampyMsgpack: {
                src: [
                    'dist/browser/msgpack5.min.js',
                    'dist/browser/msgpacksrlzr.min.js',
                    'dist/browser/wampy.min.js'
                ],
                dest: 'dist/browser/wampy-all.min.js'
            }
        },
        compress: {
            browser: {
                options: {
                    archive: 'dist/browser.zip',
                    mode: 'zip',
                    level: 9
                },
                files: [{
                    expand: true,
                    cwd   : 'dist/browser/',
                    src   : ['**/*'],
                    dest  : 'browser/'
                }]
            }
        }
    });

    grunt.registerTask('default', [
        'clean:dist', 'babel', 'browserify', 'uglify', 'copy',
        'concat', 'compress', 'clean:browserFolder']);
};
