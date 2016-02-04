module.exports = function (grunt) {
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
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

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-copy');

    grunt.registerTask('test', ['jshint']);
    grunt.registerTask('default', ['uglify', 'copy', 'concat']);
};
