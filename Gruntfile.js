module.exports = function(grunt) {
	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		uglify: {
			options: {
				compress: true,
				preserveComments: 'some'
			},
			build: {
				src: 'src/<%= pkg.srcFileName %>.js',
				dest: 'build/<%= pkg.srcFileName %>.min.js'
			}
		},
		jshint: {
			jshintrc: 'jshintrc.json'
		}
	});

	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jshint');

	grunt.registerTask('test', ['jshint']);
	grunt.registerTask('default', ['uglify']);
};
