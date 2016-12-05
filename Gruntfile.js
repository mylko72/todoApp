module.exports = function(grunt){
	grunt.initConfig({
		shell: {
			first: {
				command: [
					'mkdir javascript',
					'mkdir css',
					'mkdir html'
				].join('&&')
			}
		},
		connect: {
			server: {
				options: {port:9001}
			}
		},
		watch: {
			html: {
				files: 'html/*.html',
				options: {livereload:true}
			}
		}
	});

	grunt.loadNpmTasks('grunt-shell');
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-contrib-watch');

	grunt.registerTask('first',['shell:first']);
	grunt.registerTask('webserver',['connect:server','watch:html']);
};
