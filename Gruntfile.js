module.exports = function(grunt) {
	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		uglify: {
			options: {
				compress: true,
				preserveComments: 'some'
			},
			default: {
				files: {
					'build/wampy.min.js': ['src/wampy.js'],
					'build/msgpack.min.js': ['src/msgpack/src/msgpack.js'],
					'build/jdataview.min.js': ['src/jdataview/src/jdataview.js']
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
		}
	});

	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jshint');

	grunt.registerTask('test', ['jshint']);
	grunt.registerTask('default', ['uglify']);
};
