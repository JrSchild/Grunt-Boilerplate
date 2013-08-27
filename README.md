## Grunt Boilerplate

A Grunt Boilerplate-project including all necessary settings to jumpstart your project. It is able to generate all your javascript and css files as well as the corresponding Source-Map files.

Start by cd-ing to the build folder.

> If your .sh files are not executable from the terminal, make it so:
>     chmod +x *.sh

When running the build scripts for the first time, run install.sh first.

To watch the theme files and trigger a live reload: run watch.sh.
To build and minify the assets, run build.sh.

### Concatenating javascript files

All values in the variable 'jsTargets' will be concatenated to it's variable-key.

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

Will produce two js files as well as their Source Map files.

### Compiling sass/scss files

Sass files can't currently be concatenated due to the incompatibility of SourceMaps. For now, we recommend to have a 'head'-file that includes all necessary dependencies. Define your files like so:

	var cssTargets = {
		'styles': 'sass/styles.scss',
		'admin': 'sass/admin.scss'
	};

#### Compiling with Compass

If you choose to use compass, change the variable:

    var CSSCompiler = 'sass';

to 'compass'. The compiler is already included in your dependencies, so you don't need to do that yourself. It currently doesn't support SourceMaps so if you choose to use compass the map files will not be generated.

* * * * * * * * * *

Feel free to use this code and update it to your own use.