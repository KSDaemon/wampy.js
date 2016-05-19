module.exports = function (grunt) {

    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        babel: {
            options: {
                sourceMap: true,
                presets: ['es2015']
            },
            dist: {
                files: {
                    'build/wampy.js': 'src/wampy.js'
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
            default: {
                files: {
                    'build/wampy.min.js': ['build/wampy.js']
                }
            }
        },
        concat: {
            wampy: {
                src: ['build/msgpack5.min.js', 'build/wampy.min.js'],
                dest: 'build/wampy-all.min.js'
            }
        },
        copy: {
            main: {
                files: [
                    {
                        src: ['node_modules/msgpack5/dist/msgpack5.min.js'],
                        dest: 'build/msgpack5.min.js'
                    }
                ]
            }
        }
    });

    grunt.registerTask('default', ['babel', 'uglify', 'copy', 'concat']);
};
