module.exports = function (grunt) {

    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: {
            dist: ['dist/*']
        },
        babel: {
            srcToDist: {
                files: [{
                    expand: true,
                    cwd: 'src/',
                    src: '**/*.js',
                    dest: 'dist/'
                }]
            }
        },
        uglify: {
            options: {
                compress: {
                    drop_console: true
                },
                preserveComments: false,
                sourceMap: true,
                mangle: {
                    except: ['Wampy']
                }
            },
            dist: {
                files: {
                    'dist/wampy.min.js': ['dist/**/*.js', '!dist/wampy.js', 'dist/wampy.js']
                }
            }
        },
        copy: {
            msgpackToDist: {
                files: [{
                    src: ['node_modules/msgpack5/dist/msgpack5.min.js'],
                    dest: 'dist/msgpack5.min.js'
                }]
            }
        },
        concat: {
            concatWampy: {
                src: ['dist/msgpack5.min.js', 'dist/wampy.min.js'],
                dest: 'dist/wampy-all.min.js'
            }
        }
    });

    grunt.registerTask('default', ['clean', 'babel', 'uglify', 'copy', 'concat']);
};
