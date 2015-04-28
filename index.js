(function() {
	"use strict";
	var
		chalk = require("chalk"),
		url = require("url"),
		express = require("express"),
		app = express(),
		proxy = require("./lib/proxy"),
		helper = require('./lib/helper'),
		partials = require("estrad-template"),
		minimist = require('minimist'),
		fs = require("fs"),
		argv = minimist(process.argv.splice(2)),
		port = argv.port;

	/**
	 * Handle proxy requests
	 */
	if(argv.proxy) {
		app.use(function(req, res, next) {
			proxy.getProxyUrl(req, function(err, proxyUrl) {
				if(err) return next();

				proxy.web(req, res, {target: proxyUrl});
			});
		});
	}

	/**
	 * Handle requests for HTML files
	 * These files will be templated
	 */
	app.get('/', handler);
	app.get('*.html', handler);

	/**
	 * Bootstrap require.config.paths for JS files in modules/
	 */
	if(argv.requirejs) {
		app.get('/' + argv.jspaths.split(','), function(req, res) {
			helper.readContentIfExists(url.parse(req.url).pathname, function(err, data) {
				if(err) {
					res.writeHead(404, 'Not Found');
					res.end('Not found');
					return;
				}

				helper.readContentIfExists('/js/modulesPaths.js', function(err, paths) {
					if(err) {
						res.writeHead(200);
						res.end(data);
						return;
					}

					res.writeHead(200);
					res.end(paths + data);
				});
			});
		});
	}

	/**
	 * Handle requests for static files
	 */
	app.use(express.static(process.cwd() + '/' + argv.src + '/'));

	/**
	 * Accept requests
	 */
	app.listen(port);
	console.log("[" + chalk.green("estrad-server") + "] Server started at: " + chalk.magenta("http://localhost:" + port));

	/**
	 * HTML file handler
	 */
	function handler(req, res) {
		var 
			pathname = url.parse(req.url).pathname;

		if(pathname === "/") pathname = "/index.html";

		pathname = argv.src + pathname;

		fs.exists(process.cwd() + '/' + pathname, function(exists) {
			if(!exists) {
				res.writeHead(404, 'Not Found');
				res.end('Not found');
				return;
			}

			console.log("[" + chalk.green("estrad-server") + "] Request: " + chalk.magenta(pathname));

			partials(pathname, { folder: argv.modules }, function(err, content) {
				if(err) {
					res.writeHead(500, "server error");
					res.end();
					console.log("[" + chalk.red("estrad-server") + "] " + err);
					return;
				}

				res.writeHead(200, {"Content-Type": "text/html"});
				res.end(content);
			});
		});
	}
})();