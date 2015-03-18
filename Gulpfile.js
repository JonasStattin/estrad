(function () {
	"use strict";

	var
		gulp      = require("gulp"),
		jshint    = require("gulp-jshint"),
		jhStylish = require("jshint-stylish"),
		chokidar  = require("glob-chokidar"),
		chalk     = require("chalk"),
		fs        = require("fs"),
		jshintrc  = JSON.parse(fs.readFileSync("./.jshintrc", "utf-8")),
		paths     = {
			js: {
				listen: ["*.js", "lib/**/*.js", "tasks/**/*.js"]
			}
		};

	require("./gulpfile-extend")(gulp, {
		dir: {
			src: 'src'
		},
		css: {
			watch: true,
			paths: {
				src: [
					'css/*.css'
				],
				listen: [
					'css/**/*.css'
				],
				dest: 'css/main.css'
			}
		}
	});

	gulp.task("jswatch", function() {
		chokidar(paths.js.listen, function(ev, path) {
			console.log("[" + chalk.green("glob-chokidar") + "] File event '" + chalk.cyan(ev) + "' in file: " + chalk.magenta(path));

			gulp.src(path)
				.pipe(jshint(jshintrc))
				.pipe(jshint.reporter(jhStylish));
		});
	});

	gulp.task("watch", ["jswatch"]);

	gulp.task("default", ["watch"]);

	gulp.task("test", ["estrad"]);
	gulp.task("test-build", ["estrad-build"]);

})();