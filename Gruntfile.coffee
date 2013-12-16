module.exports = (grunt) ->

  # Project configuration.
	grunt.initConfig
		pkgFile: 'package.json'

		jshint:
			options:
				# Expected an assignment or function call and instead saw an expression.
				'-W030': true,
				globals:
					node: true,
					console: true,
					module: true,
					require: true
			all:
				src: ['app/client/**/*.js', 'app/server/**/*.js', 'app/*.js']

		coffeelint:
			options:
				no_tabs: {level: 'ignore'}
				indentation: {level: 'ignore'}
			dev: ['app/client/**/*.coffee', 'app/server/**/*.coffee']

		htmlhint:
			all:
				src: ['app/client/**/*.html']

	grunt.loadNpmTasks 'grunt-contrib-jshint'
	grunt.loadNpmTasks 'grunt-coffeelint'
	grunt.loadNpmTasks 'grunt-htmlhint'

	grunt.registerTask 'lint', ['coffeelint', 'jshint', 'htmlhint']
	grunt.registerTask 'test', ['lint']
	grunt.registerTask 'default', ['test']
