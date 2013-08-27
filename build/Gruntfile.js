/**
 * Useful recourse when working with sourcemaps, sass and Grunt:
 * https://medium.com/what-i-learned-building/b4daab987fb0
 * http://benfrain.com/add-sass-compass-debug-info-for-chrome-web-developer-tools/
 * 
 */
module.exports = function(grunt) {

	/*
	|--------------------------------------------------------------------------
	| Files to concat and minify/uglify
	|--------------------------------------------------------------------------
	|
	| Below are two object of targets. The key of the object will be the 
	| filename and the items in the array will be concatenated and 
	| minified. Leave off the extension, it will automatically work. It 
	| shouldn't matter if you pick the minified version or the regular version.
	|
	*/
	var jsTargets = {
		'scripts-head': [
			'js/file1.js',
			'js/file2.js'
		],
		'scripts-footer': [
			'js/file3.js',
			'js/file4.js',
			'js/file5.js'
		]
	};

	var cssTargets = {
		'styles': 'sass/styles.scss',
		'admin': 'sass/admin.scss'
	};


	/*
	|--------------------------------------------------------------------------
	| Paths to files
	|--------------------------------------------------------------------------
	|
	| You shouldn't have to edit this, unless you want to change a path to
	| match your workflow. Paths are relative to this file.
	|
	*/

	// The public paths
	var publicPath = '../compiled/';
	var publicCSSPath = publicPath + 'css/';
	var publicJSPath = publicPath + 'js/';

	// The app paths
	var appPath = '../../';
	var themePath = appPath;

	// Source paths
	var assetsPath = '../';
	var assetsJSPath = assetsPath + 'js/';
	var assetsCSSPath = assetsPath + 'css/';
	var assetsSASSPath = assetsPath + 'sass/';

	// Build paths
	var buildPath = assetsPath + 'build/';
	var tempPath = buildPath + '.temp/';
	var jsTempPath = tempPath + 'js/';
	var cssTempPath = tempPath + 'css/';
	var jsConcatPath = publicJSPath;
	var cssConcatPath = publicCSSPath;
	
	
	/*
	|--------------------------------------------------------------------------
	| Use the compass or sass compiler.
	|--------------------------------------------------------------------------
	|
	| The compass compiler currently doesn't have support for SourceMaps. Either
	| use 'compass' || 'sass'. With the latter the Source Map files will be
	| automatically generated.
	|
	*/
	var CSSCompiler = 'sass';


	/*
	|--------------------------------------------------------------------------
	| Include grunt plugins
	|--------------------------------------------------------------------------
	|
	| These plugins should match the items in package.json
	|
	*/
	grunt.loadNpmTasks('grunt-notify');
	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-compass');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-concat-sourcemap');
	grunt.loadNpmTasks('grunt-growl');


	/*
	|--------------------------------------------------------------------------
	| Format settings
	|--------------------------------------------------------------------------
	|
	| Using these settings, create the configuration objects for Grunt to chew on.
	|
	*/


	/**
	 * Replace the paths like sass/bla.scss with css/bla.css
	 * 
	 * @param  {string} path
	 * @param {object} options, a list of options in an object
	 *		extension {string}
	 *		path {string} path to target
	 *		minify {boolean}
	 *			default: false, prepend 'min' to extension or not
	 *		filename {function}, function to return new path to filename
	 *			default: assetsPath + path
	 * @return {string}
	 * 
	 */
	function prepareTargets(targets, options) {

		var target = null;
		var filename = '';
		var targetFilename = '';
		var newTargets = {};
		var extension = (options.minify ? '.min.' : '.') + options.extension;
		var filename = function(path) {
			return options.filename ? options.filename(path) : assetsPath + path;
		}

		// Loop through all targets and their files and do the replacement
		for(var key in targets) {

			// Shortcut the vars
			targetFilename = options.path + key + extension;
			target = targets[key];

			if (typeof target === 'string') {
				newTargets[targetFilename] = filename(target);
			} else {
				// Build a new array containing the files
				newTargets[targetFilename] = [];
				for (var i = 0; i < target.length; i++) {
	
					// Convert the sass paths to temp paths
					newTargets[targetFilename][i] = filename(target[i]);
				}
			}
		}
		return newTargets;
	}

	/**
	 * Prepare paths to a minification path
	 * 
	 */
	function prepareMinificationTargets(targets, options) {
		var newTargets = {};

		// Loop through all targets
		for (var key in targets) {
			newTargets[key.replace('.' + options.extension, '.min.' + options.extension)] = [key];
		}
		return newTargets;
	}

	// Prepare SCSS and JS files 
	var cssFileTargets = prepareTargets(cssTargets, {
		'extension': 'css',
		'path': cssConcatPath
	});
	var jsFileTargets = prepareTargets(jsTargets, {
		'extension': 'js',
		'path': jsConcatPath
	});
	var jsFileMinTargets = prepareMinificationTargets(jsFileTargets, {extension: 'js'});
	var cssFileMinTargets = prepareMinificationTargets(cssFileTargets, {extension: 'css'});


	/*
	|--------------------------------------------------------------------------
	| Init the build config
	|--------------------------------------------------------------------------
	|
	| This is where grunt actually does it's magic
	|
	*/
	grunt.initConfig({
		
		/**
		 * Configure the targets for sass. It converts all files in the 
		 * stylesDir, whether we need them or not.
		 * 
		 * @type {Object}
		 */
		sass: {
			dist: {
				files: cssFileTargets,
				options: {
					sourcemap: 'true'
				}
			},
			dev: {
				files: cssFileTargets,
				options: {
					sourcemap: 'true'
				}
			}
		},

		/**
		 * Configure the targets for compass. It converts all files in the 
		 * stylesDir, whether we need them or not.
		 * 
		 * @type {Object}
		 */
		compass: {
			dist: {
				options: {
					sassDir: assetsSASSPath,
					cssDir: cssTempPath,
					// config: 'config-dist.rb',
					raw: 'debug_info = false\n'
				}
			},
			dev: {
				options: {
					sassDir: assetsSASSPath,
					cssDir: cssTempPath,
					config: 'config.rb'
				}
			}
		},
		

		/**
		 * This is where the selected files are concatenated
		 * 
		 * @type {Object}
		 */
		concat_sourcemap: {
			dev: {
				options: {
					separator: ';\n\n',
					sourceRoot: '../'
				},
				files: jsFileTargets
			}
		},

		/*
		 * CSS minification configuration
		 * 
		 * @type {Object}
		 */
		cssmin: {
			all: {
				options: {
					banner: '/* Build with Sugarfree assets package */'
				},
				files: cssFileMinTargets
			}
		},

		/**
		 * Uglify the JS files
		 * 
		 * @type {Object}
		 */
		uglify: {
			all: {
				files: jsFileMinTargets
			}
		},

		/**
		 * Notifications for when tasks have completed.
		 * 
		 * @type {Object}
		 */
		notify: {
			success : {
				options: {
					title : 'Hoorah!',
					message : 'The files are updated again.'
				}
			}
		},
		growl : {
			myMessage : {
				message : "Hoorah!",
				title : "The files are updated again."
			}
		},
		

		/**
		 * Finally, tell grunt what to do when certain files change.
		 * We're assuming that you dont want minification when watching.
		 * 
		 * @type {Object}
		 */
		watch: {
			options: {
				livereload: true
			},
			// If the gruntfile itself changes, update all
			grunt: {
				files: ['Gruntfile.js'],
				tasks: [CSSCompiler + ':dev', 'concat_sourcemap:dev', 'growl:myMessage', 'notify:success']
			},

			// What to do when JS files change
			js: {
				files: [assetsJSPath + '**/*.js'],
				tasks: ['concat_sourcemap:dev', 'growl:myMessage', 'notify:success']
			},

			// What to do when CSS files change
			//css: {
			//	files: [assetsCSSPath + '**/*.css'],
			//	tasks: ['concat:css', 'notify:success']
			//},

			// What to do when SASS files change
			sass: {
				files: [assetsSASSPath + '**/*.scss', buildPath + 'config.rb'],
				tasks: [CSSCompiler + ':dev', 'growl:myMessage', 'notify:success'],
			},

			// Refresh page when views change
			app: {
				files: [themePath + '**/*.php'],
				tasks: ['growl:myMessage', 'notify:success']
			}
		}
	});



	/*
	|--------------------------------------------------------------------------
	| Setup the tasks
	|--------------------------------------------------------------------------
	|
	| This task is done when grunt is called without parameters.
	|
	*/
	grunt.registerTask('build', 'Build all assets.', function() {

		// Validate the environment
		if (grunt.option('minify')) {
			grunt.task.run(
				CSSCompiler + ':dist',
				'concat_sourcemap:dev',
				'cssmin:all',
				'uglify:all',
				'growl:myMessage',
				'notify:success'
			);

		} else {
			grunt.task.run(
				CSSCompiler + ':dist',
				'concat_sourcemap:dev',
				'growl:myMessage',
				'notify:success'
			);
		}
	});


	/**
	 * Register the default task
	 * 
	 * @param  {string} environment
	 * @return {void}
	 */
	grunt.registerTask('default', function() {
		grunt.task.run('build');
	});


	grunt.registerTask('listen', function() {
		grunt.task.run('watch');
	});
};
