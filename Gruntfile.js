module.exports = function (grunt) {
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: {
                compress: {
                    drop_console: true
                },
                preserveComments: 'some',
                sourceMap: true
            },
            default: {
                files: {
                    'build/wampy.min.js': ['src/wampy.js']
                }
            }
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            default: {
                src: 'src/wampy.js'
            }
        },
        concat: {
            wampy: {
                src: ['build/msgpack.min.js', 'build/wampy.min.js'],
                dest: 'build/wampy-all.min.js'
            }
        },
        copy: {
            main: {
                files: [
                    {
                        src: ['node_modules/msgpack-lite/dist/msgpack.min.js'],
                        dest: 'build/msgpack.min.js'
                    }
                ]
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-copy');

    grunt.registerTask('test', ['jshint']);
    grunt.registerTask('default', ['uglify', 'copy', 'concat']);
};
