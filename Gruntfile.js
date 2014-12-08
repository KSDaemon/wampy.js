module.exports = function(grunt) {
	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		uglify: {
			options: {
				compress: {
					drop_console: true
				},
				preserveComments: 'some'
			},
			default: {
				files: {
					'build/wampy.min.js': ['src/wampy.js'],
					'build/msgpack.min.js': ['src/msgpack/src/msgpack.js']
				}
			}
		},
		jshint: {
			options: {
				jshintrc: 'jshintrc.json'
			},
			default: {
				src: 'src/wampy.js'
			}
		},
		concat: {
			wampy: {
				src: ['build/jdataview.min.js', 'build/msgpack.min.js', 'build/wampy.min.js'],
				dest: 'build/wampy-all.min.js'
			}
		},
		copy: {
			main: {
				files: [
					{
						src: ['src/jdataview/dist/browser/jdataview.js'],
						dest: 'build/jdataview.min.js'
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
