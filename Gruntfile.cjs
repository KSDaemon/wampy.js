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
                    'dist/browser/serializers4browser.js': 'src/serializers4browser.js'
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
                    'dist/browser/serializers4browser.min.js': ['dist/browser/serializers4browser.js']
                }
            }
        },
        concat: {
            concatWampySerializers: {
                src: [
                    'dist/browser/serializers4browser.min.js',
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
        'clean:dist', 'babel', 'browserify', 'uglify',
        'concat', 'compress', 'clean:browserFolder']);
};
