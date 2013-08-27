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
		'styles': ['sass/styles.scss'],
		'admin': ['sass/admin.scss']
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
	var publicCSSPath = publicPath + '';
	var publicJSPath = publicPath + '';

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
	| Compile sass files with compass or not.
	|--------------------------------------------------------------------------
	|
	| The compass compiler currently doesn't have support for SourceMaps. When 
	| useCompass is set to the false the sass compiler will be automatically used
	| and the corresponding map files will be generated.
	|
	*/
	var useCompass = false;


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
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-concat-sourcemap');
	
	// Deprecated
	grunt.loadNpmTasks('grunt-regarde');
	//grunt.loadNpmTasks('grunt-contrib-livereload');



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
	 * @return {string}
	 */
	function prepareTargets(targets, options) {

		var target = null;
		var filename = '';
		var targetFilename = '';
		var newTargets = {};
		var extension = (options.minify ? '.min.' : '.') + options.extension;

		// Loop through all targets and their files and do the replacement
		for(var key in targets) {

			// Shortcut the vars
			targetFilename = options.path + key + extension;
			target = targets[key];

			// Build a new array containing the files
			newTargets[targetFilename] = [];
			for(var i = 0; i < target.length; i++) {

				// Convert the sass paths to temp paths
				newTargets[targetFilename][i] = options.filename(target[i]);
			}
		}
		return newTargets;
	}

	function prepareMinificationTargets(targets, options) {
		var newTargets = {};

		// Loop through all targets
		for(var key in targets) {
			newTargets[key.replace('.' + options.extension, '.min.' + options.extension)] = [key];
		}
		return newTargets;
	}

	// Prepare CSSS and JS files 
	var cssFileTargets = prepareTargets(cssTargets, {
		'extension': 'css',
		'path': cssConcatPath,
		'minify': false,
		'filename': function (path) {
			var sassPath = assetsSASSPath.replace(assetsPath, '');
			var cssPath = cssTempPath.replace(assetsPath, '');
			path = path.replace(sassPath, cssPath);
			path = path.replace('.scss', '.css');
			path = path.replace('.sass', '.css');
			return assetsPath + path;
		}
	});
	var jsFileTargets = prepareTargets(jsTargets, {
		'extension': 'js',
		'path': jsConcatPath,
		'minify': false,
		'filename': function (path) {
			return assetsPath + path;
		}
	});
	var jsFileMinTargets = prepareMinificationTargets(jsFileTargets, {extension: 'js'});
	var cssFileMinTargets = prepareMinificationTargets(cssFileTargets, {extension: 'css'});



	/**
	 * Live reload setup
	 */
	/*var path = require('path');
	var lrSnippet = require('grunt-contrib-livereload/lib/utils').livereloadSnippet;
	var folderMount = function folderMount(connect, point) {
		return connect.static(path.resolve(point));
	};*/


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
			dev: {
				files: [{
					expand: true,
					cwd: '../sass',
					src: ['*.scss'],
					dest: '../build/.temp/css',
					ext: '.css'
				}]
			},
			options: {
				sourcemap: 'true'
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
		concat: {
			js: {
				options: {
					separator: ';'
				},
				files: jsFileTargets
			},
			css: {
				files: cssFileTargets
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
					separator: ';\n\n'
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

		/**
		 * Live reload settings
		 * 
		 * @type {Object}
		 */
		/*livereload: {
			port: 35729 // Default livereload listening port.
		},
		connect: {
			livereload: {
				options: {
					port: 9001,
					middleware: function(connect, options) {
						return [lrSnippet, folderMount(connect, options.base)];
					}
				}
			}
		},*/
		

		/**
		 * Finally, tell grunt what to do when certain files change.
		 * We're assuming that you dont want minification when watching.
		 * 
		 * @type {Object}
		 */
		watch: {
			// If the gruntfile itself changes, update all
			grunt: {
				files: ['Gruntfile.js'],
				// tasks: ['compass:dev', 'concat:css', 'concat:js', 'livereload', 'notify:success']
				tasks: ['sass:dev', 'concat:css', 'concat:js', 'notify:success']
			},

			// What to do when JS files change
			js: {
				files: [assetsJSPath + '**/*.js'],
				tasks: ['concat:js', 'concat_sourcemap:dev', 'notify:success']
			},

			// What to do when CSS files change
			css: {
				files: [assetsCSSPath + '**/*.css'],
				tasks: ['concat:css', 'notify:success']
			},

			// What to do when SASS files change
			sass: {
				files: [assetsSASSPath + '**/*.scss', buildPath + 'config.rb'],
				// tasks: ['compass:dev', 'concat:css', 'livereload', 'notify:success']
				tasks: ['sass:dev', 'concat_sourcemap:dev', 'concat:css', 'notify:success']
			},

			// Refresh page when views change
			app: {
				files: [themePath + '**/*.php'],
				tasks: ['notify:success']
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
				'compass:dist',
				'concat:css',
				'concat:js',
				'cssmin:all',
				'uglify:all',
				'notify:success'
			);

		} else {
			grunt.task.run(
				// 'compass:dev',
				'sass:dev',
				'concat:css',
				'concat:js',
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
